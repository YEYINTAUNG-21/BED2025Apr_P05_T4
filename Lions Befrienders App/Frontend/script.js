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

// Login handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async function (e) {
    e.preventDefault();
    console.log('[DEBUG] Login form submitted');

    const email = this.querySelector('[name="email"]').value;
    const password = this.querySelector('[name="password"]').value;

    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log('[DEBUG] Server response:', data);

      if (res.ok) {
        alert('Login successful!');
        localStorage.setItem('token', data.token);
        window.location.href = '/caregiver.html';
        console.log("Stored token:", data.token);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('[ERROR] Login fetch failed:', error);
    }
  };
}
// hobby groups
window.onload = async () => {
  const groupList = document.getElementById('groupList');

  try {
    const response = await fetch('http://localhost:3000/api/hobby-groups');
    const groups = await response.json();

    groupList.innerHTML = ''; 

    groups.forEach(group => {
      const card = document.createElement('a');
      card.className = 'group-card';
      card.href = `hobby-detail.html?group_id=${group.group_id}`;

      card.innerHTML = `
        <img src="Images/${group.image_url}" alt="${group.group_name}">
        <h3>${group.group_name}</h3>
        <p>${group.description}</p>
        <p>${group.members} members</p>
        <button class="join-btn">Join Group</button>
      `;

      groupList.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading groups:', error);
    groupList.innerHTML = 'Failed to load groups.';
  }
};

/* Create hobby */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createHobbyForm');
  const imageInput = document.getElementById('groupImage');
  const imagePreview = document.getElementById('imagePreview');

  // Show uploaded image in preview box
  imageInput.addEventListener('change', function () {
    const file = this.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />`;
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.innerHTML = '<span>Image</span>';
    }
  });

  // Submit the form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append('created_by_admin_id', 2); // only for testing

    const rawTime = formData.get('meetup_time');
      if (rawTime && rawTime.length === 5) {
        formData.set('meetup_time', rawTime + ':00'); 
    } 

    try {
      const response = await fetch('http://localhost:3000/api/hobby-groups', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Hobby group created successfully!');
        form.reset();
        imagePreview.innerHTML = '<span>Image</span>';
      } else {
        const error = await response.json();
        alert('Error: ' + error.message || 'Failed to create group.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong. Check the console for details.');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const emergencyBtn = document.getElementById('emergencyBtn');
  const logList = document.getElementById('logList');

  // Create: Trigger emergency
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', async () => {
      const confirmed = confirm("Are you sure this is a real emergency?");
      if (!confirmed) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/emergency-alert', {
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
          loadLogs(); // reload logs
        } else {
          alert('Failed: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        alert('Error sending emergency alert.');
        console.error(error);
      }
    });
  }

  // Read: Load logs
  async function loadLogs() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/admin/emergency-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const logs = await res.json();

      logList.innerHTML = '';

      if (!Array.isArray(logs) || logs.length === 0) {
        logList.innerHTML = '<p>No emergency logs found.</p>';
        return;
      }

      logs.forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.style.background = '#fff';
        logItem.style.border = '1px solid #ddd';
        logItem.style.padding = '15px';
        logItem.style.marginBottom = '10px';
        logItem.style.borderRadius = '8px';

        logItem.innerHTML = `
          <p><strong>Status:</strong> ${log.status}</p>
          <p><strong>Time:</strong> ${new Date(log.timestamp).toLocaleString()}</p>
          <button onclick="deleteLog(${log.log_id})" style="margin-right: 10px;">Delete</button>
          <button onclick="updateLog(${log.log_id})">Mark as Resolved</button>
        `;

        logList.appendChild(logItem);
      });
    } catch (err) {
      console.error('Error loading logs:', err);
      logList.innerHTML = '<p>Failed to load emergency logs.</p>';
    }
  }

  // Delete log
  window.deleteLog = async function (logId) {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/admin/emergency-logs/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      alert(data.message);
      loadLogs();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Update log status
  window.updateLog = async function (logId) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/admin/emergency-logs/${logId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Resolved' })
      });

      const data = await res.json();
      alert(data.message);
      loadLogs();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  loadLogs(); // Initial load
});

// js for admin dashboard
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Admin not logged in.');
    return;
  }

  try {
    const res = await fetch('/admin/emergency-logs', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const logs = await res.json();
    const tbody = document.querySelector('#logsTable tbody');

    logs.forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${log.log_id}</td>
        <td>${log.user_id}</td>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td><input type="text" value="${log.status || ''}" id="status-${log.log_id}"></td>
        <td><button onclick="updateLog(${log.log_id})">Update</button></td>
        <td><button onclick="deleteLog(${log.log_id})">Delete</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
});

async function updateLog(logId) {
  const token = localStorage.getItem('token');
  const newStatus = document.getElementById(`status-${logId}`).value;

  try {
    const res = await fetch(`/admin/emergency-logs/${logId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    alert(data.message || 'Log updated');
  } catch (error) {
    console.error('Error updating log:', error);
  }
}

async function deleteLog(logId) {
  const token = localStorage.getItem('token');
  const confirmDelete = confirm('Are you sure you want to delete this log?');

  if (!confirmDelete) return;

  try {
    const res = await fetch(`/admin/emergency-logs/${logId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    alert(data.message || 'Log deleted');
    location.reload(); // Refresh the table
  } catch (error) {
    console.error('Error deleting log:', error);
  }
}

// Show admin dashboard button if user is admin
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const adminBtn = document.getElementById('adminDashboardBtn');

  if (token && adminBtn) {
    const payload = parseJwt(token);
    if (payload?.role === 'admin') {
      adminBtn.style.display = 'inline-block';
      adminBtn.addEventListener('click', () => {
        window.location.href = '/admin-dashboard.html';
      });
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded');

  const caregiverBox = document.getElementById('caregiverBox');
  const caregiverName = document.getElementById('caregiverName');
  const caregiverPhone = document.getElementById('caregiverPhone');
  const caregiverEmail = document.getElementById('caregiverEmail');
  const editBtn = document.getElementById('editCaregiverBtn');
  const deleteBtn = document.getElementById('deleteCaregiverBtn');
  const saveBtn = document.getElementById('saveCaregiverBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const caregiverForm = document.querySelector('.caregiver-edit-fields');
  const nameInput = document.getElementById('caregiverNameInput');
  const phoneInput = document.getElementById('caregiverPhoneInput');
  const emailInput = document.getElementById('caregiverEmailInput');

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No token found, redirecting to login');
    window.location.href = 'login.html';
    return;
  }

  if (!caregiverBox || !caregiverName || !caregiverPhone || !caregiverEmail ||
      !editBtn || !deleteBtn || !saveBtn || !cancelBtn || !caregiverForm ||
      !nameInput || !phoneInput || !emailInput) {
    console.error('Some DOM elements are missing. Check your caregiver.html IDs and class.');
    return;
  }

  async function loadCaregiverInfo() {
    try {
      const res = await fetch('http://localhost:3000/user/caregiver-info', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }

      const data = await res.json();

      if (res.ok) {
        const hasCaregiver =
          data.caregiver_name || data.caregiver_phone || data.caregiver_email;

        if (!hasCaregiver) {
          // Instead of wiping caregiverBox, set placeholders:
          caregiverName.textContent = '—';
          caregiverPhone.textContent = '—';
          caregiverEmail.textContent = '—';

          // Show Edit button to allow adding caregiver info
          editBtn.style.display = 'inline-block';
          // Hide Delete button as nothing to delete
          deleteBtn.style.display = 'none';

          return;
        }

        // Show caregiver info
        caregiverName.textContent = data.caregiver_name || '—';
        caregiverPhone.textContent = data.caregiver_phone || '—';
        caregiverEmail.textContent = data.caregiver_email || '—';

        nameInput.value = data.caregiver_name || '';
        phoneInput.value = data.caregiver_phone || '';
        emailInput.value = data.caregiver_email || '';

        // Show buttons appropriately
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';

      } else {
        caregiverBox.innerHTML = `<p>${data.message || 'No caregiver found'}</p>`;
      }
    } catch (err) {
      console.error('Error fetching caregiver info:', err);
      caregiverBox.innerHTML = `<p>Error loading caregiver info</p>`;
    }
  }

  loadCaregiverInfo();

  editBtn.addEventListener('click', () => {
    caregiverForm.style.display = 'block';
    editBtn.style.display = 'none';

    // Hide display spans to avoid duplication while editing
    caregiverName.style.display = 'none';
    caregiverPhone.parentElement.style.display = 'none'; // .caregiver-phone div
    caregiverEmail.parentElement.style.display = 'none'; // .caregiver-email div

    // Show save and cancel buttons
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
  });

  cancelBtn.addEventListener('click', () => {
    caregiverForm.style.display = 'none';
    editBtn.style.display = 'inline-block';

    // Show display spans again
    caregiverName.style.display = 'block';
    caregiverPhone.parentElement.style.display = 'block';
    caregiverEmail.parentElement.style.display = 'block';

    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    // Reset input values to current display values (or empty if placeholder)
    nameInput.value = caregiverName.textContent === '—' ? '' : caregiverName.textContent;
    phoneInput.value = caregiverPhone.textContent === '—' ? '' : caregiverPhone.textContent;
    emailInput.value = caregiverEmail.textContent === '—' ? '' : caregiverEmail.textContent;
  });

  saveBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:3000/user/caregiver-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          caregiver_name: nameInput.value,
          caregiver_phone: phoneInput.value,
          caregiver_email: emailInput.value
        })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }

      const result = await res.json();

      if (res.ok) {
        alert('Caregiver info updated.');
        caregiverForm.style.display = 'none';
        editBtn.style.display = 'inline-block';

        // Show display spans again
        caregiverName.style.display = 'block';
        caregiverPhone.parentElement.style.display = 'block';
        caregiverEmail.parentElement.style.display = 'block';

        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';

        loadCaregiverInfo();
      } else {
        alert(result.message || 'Failed to update caregiver');
      }
    } catch (err) {
      console.error('Error saving caregiver info:', err);
      alert('Error occurred while saving caregiver info');
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Delete this caregiver?')) return;

    try {
      const res = await fetch('http://localhost:3000/user/caregiver-info', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
      }

      const result = await res.json();

      if (res.ok) {
        alert('Caregiver deleted.');

        // Clear inputs and hide edit form
        nameInput.value = '';
        phoneInput.value = '';
        emailInput.value = '';
        caregiverForm.style.display = 'none';

        // Reset display spans to placeholder and show
        caregiverName.textContent = '—';
        caregiverPhone.textContent = '—';
        caregiverEmail.textContent = '—';
        caregiverName.style.display = 'block';
        caregiverPhone.parentElement.style.display = 'block';
        caregiverEmail.parentElement.style.display = 'block';

        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';

        // Hide delete button as nothing to delete now
        deleteBtn.style.display = 'none';
      } else {
        alert(result.message || 'Failed to delete caregiver');
      }
    } catch (err) {
      console.error('Error deleting caregiver:', err);
      alert('Error occurred while deleting caregiver');
    }
  });
});