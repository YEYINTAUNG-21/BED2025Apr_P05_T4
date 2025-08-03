const adminLoginForm = document.getElementById('adminLoginForm');

if (adminLoginForm) {
  adminLoginForm.onsubmit = async function (e) {
    e.preventDefault();

    const employee_id = this.querySelector('[name="employee_id"]').value;
    const password = this.querySelector('[name="password"]').value;

    try {
      const res = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Admin login successful!');

        // Store token and admin info
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        localStorage.setItem('role', 'admin');

        localStorage.removeItem('loginUser');
        localStorage.removeItem('token');

        // Redirect to create event page
        window.location.href = '../HTML/index.html';
      } else {
        alert(data.message || 'Login failed.');
      }

    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };
}