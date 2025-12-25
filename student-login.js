document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginData = {
        studentName: document.getElementById('studentName').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/student/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            // Store student info in localStorage
            localStorage.setItem('studentId', data.studentId);
            localStorage.setItem('studentName', data.name);
            localStorage.setItem('studentEmail', data.email);
            // Redirect to dashboard
            window.location.href = 'student-dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server. Please make sure the server is running.');
    }
});
