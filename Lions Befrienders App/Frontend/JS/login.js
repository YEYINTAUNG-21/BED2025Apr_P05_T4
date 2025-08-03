const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async function (e) {
    e.preventDefault();

    const email = this.querySelector('[name="email"]').value;
    const password = this.querySelector('[name="password"]').value;

    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Login successful!');

          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminToken');
  
        localStorage.setItem('token', data.token);
        localStorage.setItem('loginUser', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('role', 'user');
        window.location.href = '../HTML/index.html';
      } else {
        alert(data.error || data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong during login.');
    }
  };
}