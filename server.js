const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillconnect';

console.log('Attempting to connect to MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database name:', mongoose.connection.name);
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Make sure MongoDB is running with: mongod');
    process.exit(1);
});

// Monitor connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
});

// Student Registration Route
app.post('/api/student/register', async (req, res) => {
    try {
        const { name, college, year, branch, email, phone, knownSkills, learningSkills, password } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const student = new Student({
            name,
            college,
            year,
            branch,
            email,
            phone,
            knownSkills,
            learningSkills,
            password: hashedPassword
        });

        await student.save();
        res.status(201).json({ message: 'Registration successful', studentId: student._id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Student Login Route
app.post('/api/student/login', async (req, res) => {
    try {
        const { studentName, password } = req.body;

        // Find student by name
        const student = await Student.findOne({ name: studentName });
        if (!student) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, student.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful', 
            studentId: student._id,
            name: student.name,
            email: student.email
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get student by ID
app.get('/api/student/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search students (exclude current user)
app.get('/api/students/search', async (req, res) => {
    try {
        const { studentId } = req.query;
        
        // Get all students except the current user
        const students = await Student.find({ _id: { $ne: studentId } }).select('-password');
        res.json(students);
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Teacher search by skills
app.post('/api/teacher/search', async (req, res) => {
    try {
        const { skills } = req.body;
        
        if (!skills || skills.length === 0) {
            return res.status(400).json({ message: 'Please provide at least one skill' });
        }
        
        // Find students who have any of the requested skills in their knownSkills
        const students = await Student.find({
            knownSkills: { $in: skills }
        }).select('-password');
        
        res.json(students);
    } catch (error) {
        console.error('Error searching students by skills:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
