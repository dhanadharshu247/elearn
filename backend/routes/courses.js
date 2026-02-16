const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const db = require('../utils/jsonDb');

// @route   POST /courses
// @desc    Create a new course
// @access  Private/Instructor
// @route   POST /courses
// @desc    Create a new course
// @access  Private/Instructor
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    const { title, description, price, thumbnail, content } = req.body;

    try {
        const newCourse = await Course.create({
            title,
            description,
            price,
            thumbnail,
            content,
            instructor: req.user._id,
            status: 'Draft', // Default status
            enrolledStudents: [] // Initialize empty array
        });

        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({ detail: error.message });
    }
});

// @route   GET /courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const courses = await Course.findAllPopulated();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// @route   GET /courses/my-courses
// @desc    Get logged in user courses (enrolled or created)
// @access  Private
// @route   GET /courses/my-courses
// @desc    Get logged in user courses (enrolled or created) with progress
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
    try {
        let courses;

        if (req.user.role === 'instructor') {
            courses = await Course.find({ instructor: req.user._id });
        } else {
            const allCourses = await Course.find({});
            courses = allCourses.filter(c => c.enrolledStudents && c.enrolledStudents.includes(req.user._id));
        }

        // Calculate progress for each course
        const coursesWithProgress = await Promise.all(courses.map(async course => {
            const courseQuizzes = await Quiz.find({ course: course._id });
            const totalContent = (course.content ? course.content.length : 0);
            const totalQuizzes = courseQuizzes.length;
            const totalItems = totalContent + totalQuizzes;

            let completedCount = 0;
            const userProgress = req.user.courseProgress && req.user.courseProgress[course._id];

            if (userProgress) {
                if (userProgress.completedContent) completedCount += userProgress.completedContent.length;
                if (userProgress.completedQuizzes) completedCount += userProgress.completedQuizzes.length;
            }

            const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

            return {
                ...course,
                progress,
                totalItems,
                completedItems: completedCount,
                image: course.thumbnail // Ensure frontend compatibility if needed
            };
        }));

        res.json(coursesWithProgress);
    } catch (error) {
        console.error('My-Courses Error:', error);
        res.status(500).json({ detail: error.message });
    }
});

// @route   GET /courses/my-learners
// @desc    Get all learners enrolled in instructor's courses
// @access  Private/Instructor
router.get('/my-learners', protect, authorize('instructor'), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id });
        const studentIds = new Set();
        courses.forEach(c => {
            if (c.enrolledStudents) {
                c.enrolledStudents.forEach(id => studentIds.add(id));
            }
        });

        const students = await Promise.all(Array.from(studentIds).map(async id => {
            const user = await User.findById(id);
            if (!user) return null;

            // Find courses this user is enrolled in (from the instructor's list)
            const studentCourses = courses.filter(c => c.enrolledStudents && c.enrolledStudents.includes(id));
            const courseNames = studentCourses.map(c => c.title);

            // Fetch progress and badges (mock or real calculation)
            // For now, simple mock or basic info
            return {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || user.name.charAt(0),
                progress: 0, // Calculate real progress if possible
                badges: user.badges || [], // We will store badges in User model
                courses: courseNames
            };
        }));

        res.json(students.filter(s => s !== null));
    } catch (error) {
        console.error('My-Learners Error:', error);
        res.status(500).json({ detail: error.message });
    }
});

// @route   PUT /courses/:id/status
// @desc    Update course status (Draft/Published)
// @access  Private/Instructor
router.put('/:id/status', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Check ownership
            if (course.instructor.toString() !== req.user._id.toString()) {
                return res.status(403).json({ detail: 'Not authorized' });
            }

            course.status = req.body.status;
            await Course.save(course);
            res.json(course);
        } else {
            res.status(404).json({ detail: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ detail: error.message });
    }
});

// @route   GET /courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findByIdPopulated(req.params.id);

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ detail: 'Course not found' });
        }
    } catch (error) {
        res.status(404).json({ detail: 'Course not found' });
    }
});

// @route   POST /courses/:id/enroll
// @desc    Enroll in a course
// @access  Private/Learner
router.post('/:id/enroll', protect, authorize('learner'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Check if already enrolled
            if (course.enrolledStudents.includes(req.user._id)) {
                return res.status(400).json({ detail: 'Already enrolled' });
            }

            course.enrolledStudents.push(req.user._id);
            await Course.save(course); // Use static save helper
            res.json({ message: 'Enrolled successfully' });
        } else {
            res.status(404).json({ detail: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ detail: error.message });
    }
    // @route   POST /courses/:id/progress
    // @desc    Update course progress (mark content as complete)
    // @access  Private/Learner
    router.post('/:id/progress', protect, authorize('learner'), async (req, res) => {
        const { contentId, completed } = req.body; // contentId can be index or ID
        const courseId = req.params.id;

        try {
            const user = await User.findById(req.user._id);
            if (!user.courseProgress) user.courseProgress = {};
            if (!user.courseProgress[courseId]) user.courseProgress[courseId] = { completedContent: [], completedQuizzes: [] };

            const progress = user.courseProgress[courseId];

            // Ensure arrays exist
            if (!progress.completedContent) progress.completedContent = [];
            if (!progress.completedQuizzes) progress.completedQuizzes = [];

            if (completed) {
                if (!progress.completedContent.includes(contentId)) {
                    progress.completedContent.push(contentId);
                }
            } else {
                progress.completedContent = progress.completedContent.filter(id => id !== contentId);
            }

            user.courseProgress[courseId] = progress;

            // Update DB
            db.update('users', user._id, { courseProgress: user.courseProgress });

            res.json(user.courseProgress[courseId]);
        } catch (error) {
            res.status(400).json({ detail: error.message });
        }
    });

    module.exports = router;
