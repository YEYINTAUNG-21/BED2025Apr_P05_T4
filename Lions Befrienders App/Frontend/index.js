document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html'; // or your login page
    return;
  }

  // Decode the token to get the role
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userRole = payload.role || 'user';
  const userEmail = payload.email;

  const greeting = document.getElementById('greeting');
  const adminLink = document.getElementById('adminLink');

  greeting.textContent = `Hello, ${userEmail}!`;

  if (userRole === 'admin') {
    adminLink.style.display = 'inline-block';
  }
});