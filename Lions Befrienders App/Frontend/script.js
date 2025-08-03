// Signup handler 
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.onsubmit = async function (e) {
    e.preventDefault();

    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      name: this.querySelector('[name="name"]').value,
      email: this.querySelector('[name="email"]').value,
      password: this.querySelector('[name="password"]').value
      
})
    });

    const data = await res.json();
    if (res.ok) {
      alert('Signup successful!');
      window.location.href = '/login.html';
    }
    else {
      alert(data.message || data.error);
    }
  };
} 

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
        window.location.href = '/index.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('[ERROR] Login fetch failed:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const emergencyBtn = document.getElementById('emergencyBtn');
  const logsTableBody = document.querySelector('#logsTable tbody');
  const currentPage = window.location.pathname;

  // Emergency button logic
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', async () => {
      const confirmed = confirm("Are you sure this is a real emergency?");
      if (!confirmed) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/emergency-alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });

        const data = await response.json();
        if (response.ok) {
          alert('Emergency alert sent!');
          if (currentPage.includes('admin-dashboard.html')) {
            loadLogs();
          }
        } else {
          alert('Failed: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        alert('Error sending emergency alert.');
        console.error(error);
      }
    });
  }

  // Load logs if on admin-dashboard
  if (logsTableBody && currentPage.includes('admin-dashboard.html')) {
    loadLogs();
  }

  // Load logs function
  async function loadLogs() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/admin/emergency-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const logs = await res.json();

      if (!logsTableBody) return;
      logsTableBody.innerHTML = ''; // Clear

      if (!Array.isArray(logs) || logs.length === 0) {
        logsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No emergency logs found.</td></tr>`;
        return;
      }

      logs.forEach(log => {
        const toggleLabel = log.status === 'Resolved' ? 'Mark as Pending' : 'Mark as Resolved';
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${log.log_id}</td>
          <td>${log.user_id}</td>
          <td>${new Date(log.timestamp).toLocaleString()}</td>
          <td>${log.status}</td>
          <td><button onclick="updateLog(${log.log_id}, '${log.status}')">${toggleLabel}</button></td>
          <td><button onclick="deleteLog(${log.log_id})">Delete</button></td>
        `;
        logsTableBody.appendChild(row);
      });
    } catch (err) {
      console.error('Error loading logs:', err);
      logsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Failed to load emergency logs.</td></tr>`;
    }
  }

  // Delete log
  window.deleteLog = async function (logId) {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/admin/emergency-logs/${logId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      alert(data.message);
      loadLogs();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Toggle status function
  window.updateLog = async function (logId, currentStatus) {
    const newStatus = currentStatus === 'Resolved' ? 'Pending' : 'Resolved';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/admin/emergency-logs/${logId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      alert(data.message);
      loadLogs();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };
});