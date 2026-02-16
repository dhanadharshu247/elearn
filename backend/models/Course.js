const db = require('../utils/jsonDb');
const User = require('./User'); // For populating manually if needed

class Course {
    static async create(data) {
        return db.create('courses', data);
    }

    static async find(query) {
        // Basic find, no populate chain support returned
        return db.find('courses', query);
    }

    static async findById(id) {
        return db.findById('courses', id);
    }

    // Helper to save updates (mimic mongoose instance .save)
    static async save(courseData) {
        return db.update('courses', courseData._id, courseData);
    }

    // Custom helper to find and populate instructor
    static async findAllPopulated() {
        const courses = db.findAll('courses');
        return Promise.all(courses.map(async course => {
            const instructor = await User.findById(course.instructor);
            return {
                ...course,
                instructor: instructor || { name: 'Unknown', email: '' }
            };
        }));
    }

    static async findByIdPopulated(id) {
        const course = db.findById('courses', id);
        if (!course) return null;

        const instructor = await User.findById(course.instructor);

        let enrolledStudents = [];
        if (course.enrolledStudents && course.enrolledStudents.length > 0) {
            enrolledStudents = await Promise.all(course.enrolledStudents.map(async studentId => {
                const s = await User.findById(studentId);
                return s ? { _id: s._id, name: s.name, email: s.email, avatar: s.avatar } : null;
            }));
            // Filter out nulls (deleted users)
            enrolledStudents = enrolledStudents.filter(s => s !== null);
        }

        return {
            ...course,
            instructor: instructor || { name: 'Unknown', email: '' },
            enrolledStudents
        };
    }
}

module.exports = Course;
