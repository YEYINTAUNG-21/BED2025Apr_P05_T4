// caregiver.js
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