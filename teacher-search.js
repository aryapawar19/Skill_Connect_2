document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedSkills = Array.from(document.getElementById('searchSkills').selectedOptions)
        .map(option => option.value);

    if (selectedSkills.length === 0) {
        alert('Please select at least one skill');
        return;
    }

    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<p class="loading">Searching...</p>';

    try {
        const response = await fetch('http://localhost:3000/api/teacher/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skills: selectedSkills })
        });

        const students = await response.json();

        if (response.ok) {
            displayResults(students, selectedSkills);
        } else {
            resultsContainer.innerHTML = '<p class="error">Error searching for students</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<p class="error">Error connecting to server. Please make sure the server is running.</p>';
    }
});

function displayResults(students, searchedSkills) {
    const resultsContainer = document.getElementById('searchResults');

    if (students.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No students found with the selected skills</p>';
        return;
    }

    resultsContainer.innerHTML = students.map(student => createStudentCard(student, searchedSkills)).join('');
}

function createStudentCard(student, searchedSkills) {
    // Find matching skills
    const matchingSkills = student.knownSkills.filter(skill => searchedSkills.includes(skill));
    
    // Create email and SMS content
    const skillsList = matchingSkills.join(', ');
    const emailSubject = encodeURIComponent(`Opportunity for students with ${skillsList} skills`);
    const emailBody = encodeURIComponent(`Hi ${student.name},\n\nI'm reaching out from SkillConnect regarding an opportunity that requires expertise in ${skillsList}. Your profile matches the skills we're looking for.\n\nPlease let me know if you're interested in discussing this further.\n\nBest regards`);
    const smsBody = encodeURIComponent(`Hi ${student.name}, I found your profile on SkillConnect. I have an opportunity requiring ${skillsList} skills. Are you interested?`);

    return `
        <div class="student-card">
            <div class="student-header">
                <h4>${student.name}</h4>
                <span class="year-badge">${student.year}${getYearSuffix(student.year)} Year</span>
            </div>
            <p class="branch">${student.branch}</p>
            <p class="college"><strong>College:</strong> ${student.college}</p>
            <div class="skills-section">
                <div class="skill-group">
                    <strong>Known Skills:</strong>
                    <div class="skill-tags">
                        ${student.knownSkills.map(skill => 
                            `<span class="skill-tag ${matchingSkills.includes(skill) ? 'highlighted' : ''}">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
                ${student.learningSkills.length > 0 ? `
                <div class="skill-group">
                    <strong>Currently Learning:</strong>
                    <div class="skill-tags">
                        ${student.learningSkills.map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
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
