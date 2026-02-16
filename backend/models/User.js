const db = require('../utils/jsonDb');
const bcrypt = require('bcryptjs');

class User {
    static async findById(id) {
        return db.findById('users', id);
    }

    static async findOne(query) {
        return db.findOne('users', query);
    }

    static async create(data) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        return db.create('users', { ...data, password: hashedPassword });
    }
}

// Add matchPassword method to user objects returned by find
const enhanceUser = (user) => {
    if (!user) return null;
    user.matchPassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    };
    return user;
};

// Wrap the static methods to return enhanced objects
const UserWrapper = {
    findById: async (id) => enhanceUser(await User.findById(id)),
    findOne: async (query) => enhanceUser(await User.findOne(query)),
    create: async (data) => enhanceUser(await User.create(data)),
};

module.exports = UserWrapper;
