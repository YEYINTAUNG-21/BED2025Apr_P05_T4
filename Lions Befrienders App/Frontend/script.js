// Signup handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.onsubmit = async function (e) {
    e.preventDefault();

    const res = await fetch('/signup', {
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

    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.querySelector('[name="email"]').value,
        password: this.querySelector('[name="password"]').value
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Login successful!');
      localStorage.setItem('token', data.token);
      window.location.href = '/homepage.html'; 
    } else {
      alert(data.error || 'Login failed');
    }
  };
}

// Join hobby groups
window.onload = async () => {
  const groupList = document.getElementById('groupList');

  try {
    const response = await fetch('http://localhost:3000/api/hobby-groups');
    const groups = await response.json();
    console.log('Loaded groups:', groups);

    groupList.innerHTML = ''; 

    groups.forEach(group => {
      const card = document.createElement('div');
      card.className = 'group-card';

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



