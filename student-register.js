document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        college: document.getElementById('college').value,
        year: document.getElementById('year').value,
        branch: document.getElementById('branch').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        knownSkills: Array.from(document.getElementById('knownSkills').selectedOptions).map(option => option.value),
        learningSkills: Array.from(document.getElementById('learningSkills').selectedOptions).map(option => option.value),
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/student/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login to access your account.');
            // Don't store student info - they need to login
            // Redirect to login page
            window.location.href = 'student-login.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server. Please make sure the server is running.');
    }
});
