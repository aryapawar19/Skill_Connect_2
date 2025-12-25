// Check if user is logged in
const studentId = localStorage.getItem('studentId');
const studentName = localStorage.getItem('studentName');

if (!studentId) {
    window.location.href = 'student-login.html';
}

// Display student name
document.getElementById('studentName').textContent = studentName || 'Student';

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Fetch current student data
let currentStudent = null;

async function loadCurrentStudent() {
    try {
        const response = await fetch(`http://localhost:3000/api/student/${studentId}`);
        if (response.ok) {
            currentStudent = await response.json();
            loadMatches();
        }
    } catch (error) {
        console.error('Error loading student data:', error);
    }
}

// Load matching students
async function loadMatches() {
    if (!currentStudent) return;

    try {
        // Fetch all students for matching
        const response = await fetch(`http://localhost:3000/api/students/search?studentId=${studentId}`);
        const students = await response.json();

        displayLearningMatches(students);
        displayKnownMatches(students);
        displaySimilarMatches(students);
    } catch (error) {
        console.error('Error loading matches:', error);
        document.getElementById('learningMatches').innerHTML = '<p class="error">Error loading students</p>';
        document.getElementById('knownMatches').innerHTML = '<p class="error">Error loading students</p>';
        document.getElementById('similarMatches').innerHTML = '<p class="error">Error loading students</p>';
    }
}

// Display students who know skills you're learning
function displayLearningMatches(students) {
    const container = document.getElementById('learningMatches');
    const matches = students.filter(student => 
        currentStudent.learningSkills.some(skill => student.knownSkills.includes(skill))
    );

    if (matches.length === 0) {
        container.innerHTML = '<p class="no-results">No matches found</p>';
        return;
    }

    container.innerHTML = matches.map(student => createStudentCard(student, 'learning')).join('');
}

// Display students learning skills you know
function displayKnownMatches(students) {
    const container = document.getElementById('knownMatches');
    const matches = students.filter(student => 
        currentStudent.knownSkills.some(skill => student.learningSkills.includes(skill))
    );

    if (matches.length === 0) {
        container.innerHTML = '<p class="no-results">No matches found</p>';
        return;
    }

    container.innerHTML = matches.map(student => createStudentCard(student, 'known')).join('');
}

// Display students with similar interests
function displaySimilarMatches(students) {
    const container = document.getElementById('similarMatches');
    const matches = students.filter(student => 
        currentStudent.knownSkills.some(skill => student.knownSkills.includes(skill)) ||
        currentStudent.learningSkills.some(skill => student.learningSkills.includes(skill))
    );

    if (matches.length === 0) {
        container.innerHTML = '<p class="no-results">No matches found</p>';
        return;
    }

    container.innerHTML = matches.map(student => createStudentCard(student, 'similar')).join('');
}

// Create student card HTML
function createStudentCard(student, matchType) {
    let matchingSkills = [];
    
    if (matchType === 'learning') {
        matchingSkills = student.knownSkills.filter(skill => 
            currentStudent.learningSkills.includes(skill)
        );
    } else if (matchType === 'known') {
        matchingSkills = student.learningSkills.filter(skill => 
            currentStudent.knownSkills.includes(skill)
        );
    } else {
        matchingSkills = [
            ...student.knownSkills.filter(skill => currentStudent.knownSkills.includes(skill)),
            ...student.learningSkills.filter(skill => currentStudent.learningSkills.includes(skill))
        ];
    }

    // Create email and SMS content
    const skillsList = matchingSkills.join(', ');
    const emailSubject = encodeURIComponent(`Connect on SkillConnect - ${skillsList}`);
    const emailBody = encodeURIComponent(`Hi ${student.name},\n\nI found your profile on SkillConnect and noticed we have matching interests in ${skillsList}. I'd love to connect and collaborate!\n\nBest regards,\n${currentStudent.name}`);
    const smsBody = encodeURIComponent(`Hi ${student.name}, I'm ${currentStudent.name} from SkillConnect. I'd like to connect regarding ${skillsList}. Let's collaborate!`);

    return `
        <div class="student-card">
            <div class="student-header">
                <h4>${student.name}</h4>
                <span class="year-badge">${student.year}${getYearSuffix(student.year)} Year</span>
            </div>
            <p class="branch">${student.branch}</p>
            <div class="skills-section">
                <div class="skill-group">
                    <strong>Knows:</strong>
                    <div class="skill-tags">
                        ${student.knownSkills.map(skill => 
                            `<span class="skill-tag ${matchingSkills.includes(skill) ? 'highlighted' : ''}">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="skill-group">
                    <strong>Learning:</strong>
                    <div class="skill-tags">
                        ${student.learningSkills.map(skill => 
                            `<span class="skill-tag ${matchingSkills.includes(skill) ? 'highlighted' : ''}">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            <div class="contact-info">
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${student.email}&su=${emailSubject}&body=${emailBody}" target="_blank" class="contact-btn">📧 Email</a>
                <a href="sms:${student.phone}?body=${smsBody}" class="contact-btn">📞 SMS</a>
            </div>
        </div>
    `;
}

function getYearSuffix(year) {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
}

// Initialize dashboard
loadCurrentStudent();
