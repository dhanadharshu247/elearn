const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
    const initialData = {
        users: [],
        courses: [],
        quizzes: [],
        results: []
    };
    // Ensure directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

const readDb = () => {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
};

const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const db = {
    // Generic Find
    findAll: (collection) => {
        const data = readDb();
        return data[collection] || [];
    },

    findById: (collection, id) => {
        const data = readDb();
        return data[collection].find(item => item._id === id);
    },

    findOne: (collection, query) => {
        const data = readDb();
        return data[collection].find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    },

    find: (collection, query) => {
        const data = readDb();
        if (!query || Object.keys(query).length === 0) return data[collection];

        return data[collection].filter(item => {
            return Object.keys(query).every(key => {
                // Handle array inclusion for 'enrolledStudents' or simple equality
                if (Array.isArray(item[key]) && !Array.isArray(query[key])) {
                    // Check if query value is IN the item's array (e.g. searching for student ID in enrolledStudents)
                    // But typically find({ enrolledStudents: id }) means "where enrolledStudents contains id"
                    return item[key].includes(query[key]);
                }
                return item[key] === query[key];
            });
        });
    },

    create: (collection, item) => {
        const data = readDb();
        const newItem = {
            _id: crypto.randomBytes(12).toString('hex'), // Mimic ObjectId
            createdAt: new Date().toISOString(),
            ...item
        };
        data[collection].push(newItem);
        writeDb(data);
        return newItem;
    },

    update: (collection, id, updates) => {
        const data = readDb();
        const index = data[collection].findIndex(item => item._id === id);
        if (index === -1) return null;

        data[collection][index] = { ...data[collection][index], ...updates };
        writeDb(data);
        return data[collection][index];
    },

    // Specific helper to mimic Mongoose's .save() behavior on an object
    // This is hard to mimic perfectly without classes, so we'll stick to explicit update calls in routes.
};

module.exports = db;
