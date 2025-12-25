const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    college: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    knownSkills: {
        type: [String],
        required: true
    },
    learningSkills: {
        type: [String],
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', studentSchema);
