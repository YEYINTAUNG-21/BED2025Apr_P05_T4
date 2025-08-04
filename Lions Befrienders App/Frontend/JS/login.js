const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async function (e) {
    e.preventDefault();
    console.log('[DEBUG] Login form submitted');

    const email = this.querySelector('[name="email"]').value;
    const password = this.querySelector('[name="password"]').value;

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log('[DEBUG] Server response:', data);

      if (res.ok) {
        alert('Login successful!');
        localStorage.setItem('token', data.token);
        window.location.href = '/HTML/index.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('[ERROR] Login fetch failed:', error);
    }
  }
}