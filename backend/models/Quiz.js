const db = require('../utils/jsonDb');

class Quiz {
    static async create(data) {
        return db.create('quizzes', data);
    }

    static async find(query) {
        return db.find('quizzes', query);
    }

    static async findById(id) {
        return db.findById('quizzes', id);
    }
}

module.exports = Quiz;
