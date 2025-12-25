const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillconnect';

// Sample students data
const sampleStudents = [
    {
        name: "John Doe",
        college: "ABC College",
        year: "2",
        branch: "Computer Science",
        email: "john@test.com",
        phone: "1234567890",
        knownSkills: ["JavaScript", "React", "Node.js"],
        learningSkills: ["Python", "AI/ML"],
        password: "password123"
    },
    {
        name: "Jane Smith",
        college: "ABC College", 
        year: "3",
        branch: "Information Technology",
        email: "jane@test.com",
        phone: "1234567891",
        knownSkills: ["Python", "Django", "SQL"],
        learningSkills: ["React", "Flutter"],
        password: "password123"
    },
    {
        name: "Mike Johnson",
        college: "ABC College",
        year: "1",
        branch: "Computer Science",
        email: "mike@test.com", 
        phone: "1234567892",
        knownSkills: ["HTML", "CSS", "JavaScript"],
        learningSkills: ["Node.js", "MongoDB"],
        password: "password123"
    },
    {
        name: "Sarah Wilson",
        college: "ABC College",
        year: "4", 
        branch: "Electronics",
        email: "sarah@test.com",
        phone: "1234567893",
        knownSkills: ["UI/UX Design", "Graphic Design", "HTML"],
        learningSkills: ["JavaScript", "React"],
        password: "password123"
    },
    {
        name: "Alex Brown",
        college: "ABC College",
        year: "2",
        branch: "Computer Science", 
        email: "alex@test.com",
        phone: "1234567894",
        knownSkills: ["Flutter", "Java", "C++"],
        learningSkills: ["AI/ML", "Data Science"],
        password: "password123"
    }
];

async function initializeDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');

        // Clear existing students (optional - remove if you want to keep existing data)
        console.log('Clearing existing students...');
        await Student.deleteMany({});
        console.log('✅ Existing students cleared');

        // Insert sample students
        console.log('Inserting sample students...');
        for (const studentData of sampleStudents) {
            // Hash password
            const hashedPassword = await bcrypt.hash(studentData.password, 10);
            
            // Create student with hashed password
            const student = new Student({
                ...studentData,
                password: hashedPassword
            });
            
            await student.save();
            console.log(`✅ Created student: ${student.name}`);
        }

        console.log('\n🎉 Database initialization completed!');
        console.log(`📊 Total students created: ${sampleStudents.length}`);
        
        console.log('\n📋 Sample login credentials:');
        console.log('Name: John Doe, Password: password123');
        console.log('Name: Jane Smith, Password: password123');
        console.log('Name: Mike Johnson, Password: password123');
        console.log('Name: Sarah Wilson, Password: password123');
        console.log('Name: Alex Brown, Password: password123');

        // Verify the data
        const count = await Student.countDocuments();
        console.log(`\n✅ Verification: ${count} students in database`);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📤 Database connection closed');
        process.exit(0);
    }
}

// Run the initialization
initializeDatabase();