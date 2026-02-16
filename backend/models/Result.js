const db = require('../utils/jsonDb');

class Result {
    static async create(data) {
        return db.create('results', data);
    }

    static async find(query) {
        // Query usually involves { quiz: { $in: [] } } which our simple find might not support directly
        // We might need to filter manually in the route, or enhance the wrapper.
        // For simple equality it works.
        return db.find('results', query);
    }
}

module.exports = Result;
