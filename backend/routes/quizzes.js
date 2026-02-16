const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Course = require('../models/Course');

// @route   POST /quizzes
// @desc    Create a new quiz
// @access  Private/Instructor
// @route   POST /quizzes
// @desc    Create a new quiz
// @access  Private/Instructor
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    const { title, courseId, questions } = req.body;

    try {
        // Validate course ownership
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ detail: 'Course not found' });
        }
        if (course.instructor !== req.user._id) {
            return res.status(403).json({ detail: 'Not authorized to add quiz to this course' });
        }

        const quiz = await Quiz.create({
            title,
            course: courseId,
            questions
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ detail: error.message });
    }
});

// @route   GET /quizzes/course/:courseId
// @desc    Get quizzes for a specific course
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ course: req.params.courseId });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// @route   GET /quizzes/:id
// @desc    Get quiz by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ detail: 'Quiz not found' });
        }
    } catch (error) {
        res.status(404).json({ detail: 'Quiz not found' });
    }
});

// @route   POST /quizzes/:id/submit
// @desc    Submit a quiz and get result
// @access  Private/Learner
router.post('/:id/submit', protect, authorize('learner'), async (req, res) => {
    const { answers } = req.body; // Array of selected option indices

    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ detail: 'Quiz not found' });
        }

        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctOptionIndex) {
                score++;
            }
        });

        const totalQuestions = quiz.questions.length;
        const result = await Result.create({
            user: req.user._id,
            quiz: quiz._id,
            score,
            totalQuestions
        });

        // Badge Logic
        const percentage = (score / totalQuestions) * 100;
        let badge = null;

        if (percentage >= 80) {
            badge = 'Legend';
        } else if (percentage <= 50) {
            badge = 'Newbie';
        } else {
            badge = 'Intermediate';
        }

        if (badge) {
            const User = require('../models/User');
            // We need to re-fetch user to get latest state or use what we have if we trust it
            // But we need to update potentially BOTH badges and courseProgress
            // Let's get the user object fully first
            const user = await User.findById(req.user._id);
            if (user) {
                let updates = {};
                let changed = false;

                // 1. Badge Logic
                if (!user.badges) user.badges = [];
                if (!user.badges.includes(badge)) {
                    user.badges.push(badge);
                    updates.badges = user.badges;
                    changed = true;
                }

                // 2. Progress Logic
                if (!user.courseProgress) user.courseProgress = {};
                const courseId = quiz.course;
                if (!user.courseProgress[courseId]) user.courseProgress[courseId] = { completedContent: [], completedQuizzes: [] };

                // Ensure arrays exist
                if (!user.courseProgress[courseId].completedContent) user.courseProgress[courseId].completedContent = [];
                if (!user.courseProgress[courseId].completedQuizzes) user.courseProgress[courseId].completedQuizzes = [];

                if (!user.courseProgress[courseId].completedQuizzes.includes(quiz._id)) {
                    user.courseProgress[courseId].completedQuizzes.push(quiz._id);
                    updates.courseProgress = user.courseProgress;
                    changed = true;
                }

                // Persist if changed
                if (changed) {
                    const db = require('../utils/jsonDb');
                    // We need to merge existing user data with updates to avoid overwriting partials if we were not careful
                    // But db.update merges shallowly? No, check utils/jsonDb.js
                    // db.update: data[collection][index] = { ...data[collection][index], ...updates };
                    // So it merges top-level keys. 'badges' and 'courseProgress' are top level. Safe.
                    db.update('users', user._id, updates);
                }
            }
        } else {
            // Even if no badge, we MUST update progress!
            const User = require('../models/User');
            const user = await User.findById(req.user._id);
            if (user) {
                const courseId = quiz.course;
                if (!user.courseProgress) user.courseProgress = {};
                if (!user.courseProgress[courseId]) user.courseProgress[courseId] = { completedContent: [], completedQuizzes: [] };

                if (!user.courseProgress[courseId].completedQuizzes) user.courseProgress[courseId].completedQuizzes = [];

                if (!user.courseProgress[courseId].completedQuizzes.includes(quiz._id)) {
                    user.courseProgress[courseId].completedQuizzes.push(quiz._id);
                    const db = require('../utils/jsonDb');
                    db.update('users', user._id, { courseProgress: user.courseProgress });
                }
            }
        }

        res.json(result);
    } catch (error) {
        res.status(400).json({ detail: error.message });
    }
});

// @route   GET /quizzes/results/course/:courseId
// @desc    Get results for a course (Instructor view)
// @access  Private/Instructor
router.get('/results/course/:courseId', protect, authorize('instructor'), async (req, res) => {
    try {
        // Find all quizzes in this course
        const quizzes = await Quiz.find({ course: req.params.courseId });
        const quizIds = quizzes.map(q => q._id);

        // Find results for these quizzes
        // Manual "IN" query
        const allResults = await Result.find({});
        const results = allResults.filter(r => quizIds.includes(r.quiz));

        // Manual Populate
        // We need to fetch user names and quiz titles
        const populatedResults = await Promise.all(results.map(async r => {
            const user = await require('../models/User').findById(r.user);
            const quiz = await Quiz.findById(r.quiz);
            return {
                ...r,
                user: user ? { name: user.name, email: user.email } : null,
                quiz: quiz ? { title: quiz.title } : null
            };
        }));

        res.json(populatedResults);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});


module.exports = router;
