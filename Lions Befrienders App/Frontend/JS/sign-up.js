const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.onsubmit = async function (e) {
    e.preventDefault();

    const form = new FormData(this);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();

      if (res.ok) {
        alert('Signup successful!');
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('loginUser', JSON.stringify(responseData.user));
        window.location.href = '/login.html';
      } else {
        alert(responseData.error || responseData.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong during signup.');
    }
  };
}