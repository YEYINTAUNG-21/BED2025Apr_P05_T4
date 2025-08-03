// Signup handler
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

// Login handler
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
        window.location.href = 'doctor.html';
      } else {
        alert(data.error || data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong during login.');
    }
  };
}



// Admin Login handler
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

        // Redirect to create event page
        window.location.href = 'event.html';
      } else {
        alert(data.message || 'Login failed.');
      }

    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };
}


// hobby groups
window.onload = async () => {
  const groupList = document.getElementById('groupList');

  const createBtn = document.getElementById('createGroupBtn');
  
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  
  if (!adminUser || !adminUser.admin_id) {
    if (createBtn) {
      createBtn.style.display = 'none'; //  Hide if not admin
    }
  }

  try {
    const response = await fetch('http://localhost:3000/api/hobby-groups');
    const groups = await response.json();
    console.log('Loaded groups:', groups);

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

  const admin = JSON.parse(localStorage.getItem('adminUser'));
  

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
    // formData.append('created_by_admin_id', 2); // only for testing

    formData.append('created_by_admin_id', admin.admin_id);
 

    const rawTime = formData.get('meetup_time');
      if (rawTime && rawTime.length === 5) {
        formData.set('meetup_time', rawTime + ':00'); 
    } 

    try {
      const response = await fetch('http://localhost:3000/api/hobby-groups', {
        method: 'POST',
        body: formData,
        headers:{
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
    
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


// Group detail page
document.addEventListener("DOMContentLoaded", () => {
  const groupId = new URLSearchParams(window.location.search).get("group_id");
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const adminUser = JSON.parse(localStorage.getItem("adminUser"));


  let currentMemberId = null;

  const joinBtn = document.getElementById("joinButton");
  const leaveBtn = document.getElementById("leaveButton");

  // Load group detail
  fetch(`http://localhost:3000/api/hobby-groups/${groupId}`)
    .then(res => res.json())
    .then(group => {
      console.log("Loaded group:", group); 
      document.getElementById("groupImage").src = `Images/${group.image_url}`;
      document.getElementById("groupName").textContent = group.group_name;
      document.getElementById("groupDescription").textContent = group.description;
      document.getElementById("meetupDate").textContent = new Date(group.meetup_date).toLocaleDateString();
      const rawTime = group.meetup_time;
      const timeOnly = new Date(rawTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
      });
      document.getElementById("meetupTime").textContent = timeOnly;
      document.getElementById("meetupLocation").textContent = group.meetup_location;
    });

  // Fetch and display members
  function loadMembers() {
  fetch(`http://localhost:3000/api/group-members/${groupId}`)
    .then(res => res.json())
    .then(members => {
      console.log("Fetched members:", members);

      if (!Array.isArray(members)) {
        console.error("Expected members to be an array but got:", members);
        return;
      }

      const list = document.getElementById("memberList");
      list.innerHTML = "";
      
      let currentUser = null;
      if (loginUser) {
          currentUser = members.find(m => m && m.user_id === loginUser.id);
          currentMemberId = currentUser ? currentUser.member_id : null;
      }
      
      // Toggle join/leave button
      if (adminUser) {
  // Hide join/leave buttons for Admins
          joinBtn?.classList.add("hidden");
          leaveBtn?.classList.add("hidden");
      } else if (loginUser) {
            if (currentMemberId) {
                joinBtn?.classList.add("hidden");
                leaveBtn?.classList.remove("hidden");
            } else {
                joinBtn?.classList.remove("hidden");
                leaveBtn?.classList.add("hidden");
      }
      } else {
                joinBtn?.classList.add("hidden");
                leaveBtn?.classList.add("hidden");
}


      // Show members
      members.forEach(member => {
        console.log("Rendering member:", member);
        const li = document.createElement("li");
        li.className = "member-list-item";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = member.nickname_in_group || member.full_name || "[No Name]";
        li.appendChild(nameSpan);

        // Edit button for current user
        if (!adminUser &&member.user_id === loginUser.id) { 
          const dotBtn = document.createElement("button");
          dotBtn.className = "dots-button";
          dotBtn.innerHTML = "&#8942;";
          dotBtn.onclick = () => {
            currentMemberId = member.member_id;
            document.getElementById("nicknameModal").classList.remove("hidden");
          };
          li.appendChild(dotBtn);
        }

        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Error fetching members:", err);
    });
}


  // Join group
  joinBtn.addEventListener("click", () => {

    if (!loginUser || !loginUser.id) return; 

    fetch("http://localhost:3000/api/group-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: parseInt(groupId),
        user_id: loginUser.id,
        nickname_in_group: loginUser.full_name
      })
    })
    .then(res => res.json())
    .then(() => loadMembers());
  });

  // Leave group
  leaveBtn.addEventListener("click", () => {
    if (!currentMemberId) return;
    fetch(`http://localhost:3000/api/group-members/${currentMemberId}`, {
      method: "DELETE"
    })
    .then(() => {
      currentMemberId = null;
      loadMembers();
    });
  });

  // Nickname modal: Close
  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("nicknameModal").classList.add("hidden");
  });

  // Nickname modal: Save
  document.getElementById("saveNickname").addEventListener("click", () => {
    const newNick = document.getElementById("newNickname").value;
    fetch(`http://localhost:3000/api/group-members/${currentMemberId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname_in_group: newNick })
    })
    .then(() => {
      document.getElementById("nicknameModal").classList.add("hidden");
      document.getElementById("newNickname").value = "";
      loadMembers();
    });
  });

  loadMembers(); 
});


// Events Features
window.addEventListener('load', () => {
  const pathname = window.location.pathname;

  if (pathname.endsWith('event.html')) {
    loadEventList();
  } else if (pathname.endsWith('event-detail.html')) {
    loadEventDetail();
  } else if (pathname.endsWith('create-event.html')) {
    authCheck();
    setupCreateForm();
  }
});


function authCheck() {
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('role');
  if (!token || role !== 'admin') {
    alert('You must be an admin to create events.');
    window.location.href = 'event.html';
  }
}

async function setupCreateForm() {
  const form = document.getElementById('eventForm');
  const message = document.getElementById('message');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('event_id'); // Check if editing

  if (eventId) {
    // Edit Mode – Pre-fill form
    try {
      const res = await fetch(`http://localhost:3000/api/events/${eventId}`);
      if (!res.ok) throw new Error('Failed to fetch event');
      const data = await res.json();

      document.getElementById('title').value = data.title || '';
      document.getElementById('description').value = data.description || '';
      document.getElementById('datetime').value = data.datetime ? new Date(data.datetime).toISOString().slice(0, 16) : '';
      document.getElementById('youtube_link').value = data.youtube_link || '';
      document.getElementById('submit-btn').textContent = 'Update Event';
    } catch (err) {
      console.error('Failed to load event for editing:', err);
    }
  }

  // Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const youtubeLink = document.getElementById('youtube_link')?.value.trim();
    if (!youtubeLink) {
      if (message) {
        message.style.color = 'red';
        message.textContent = 'Please enter a YouTube video link.';
      }
      return;
    }

    const data = {
      title: document.getElementById('title')?.value.trim() || '',
      description: document.getElementById('description')?.value.trim() || '',
      datetime: document.getElementById('datetime')?.value || '',
      youtube_link: youtubeLink
    };

    try {
      const url = eventId
        ? `http://localhost:3000/api/events/${eventId}`
        : 'http://localhost:3000/api/events';

      const method = eventId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        if (message) {
          message.style.color = 'green';
          message.textContent = eventId ? 'Event updated successfully!' : 'Event created successfully!';
        }
        form.reset();
      } else {
        const err = await res.json();
        if (message) {
          message.style.color = 'red';
          message.textContent = err.error || 'Failed to submit form.';
        }
      }
    } catch (err) {
      if (message) {
        message.style.color = 'red';
        message.textContent = 'Server error. Please try again later.';
      }
      console.error(err);
    }
  });
}


async function loadEventDetail() {
  const eventDetailDiv = document.getElementById('eventDetail');
  if (!eventDetailDiv) return;

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('event_id');

  if (!eventId) {
    eventDetailDiv.innerHTML = '<p>Event ID is missing in the URL.</p>';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/events/${eventId}`);
    if (!res.ok) throw new Error('Event not found');
    const event = await res.json();

    // Parse YouTube Video ID 
    let videoId = '';
    try {
      const parsedUrl = new URL(event.youtube_link);
      videoId = parsedUrl.searchParams.get('v');
    } catch (err) {
      console.error('Invalid YouTube link:', event.youtube_link);
    }

    // Render content
    document.getElementById('videoWrapper').innerHTML = videoId
      ? `<iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>`
      : '<p>No video available.</p>';

    document.getElementById('eventTitle').textContent = event.title || 'No Title';
    document.getElementById('eventDescription').textContent = event.description || 'No Description';

    const dateObj = new Date(event.datetime);
    document.getElementById('eventDate').textContent = dateObj.toLocaleDateString();
    document.getElementById('eventTime').textContent = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    document.getElementById('watchButton').href = event.youtube_link || '#';

  } catch (error) {
    console.error('Failed to load event details:', error);
    eventDetailDiv.innerHTML = '<p>Failed to load event details. Please try again later.</p>';
  }
}

async function loadEventList() {
  const grid = document.getElementById('eventGrid');
  if (!grid) return;

  try {
    const res = await fetch('http://localhost:3000/api/events');
    const events = await res.json();

    if (!events.length) {
      grid.innerHTML = '<p>No upcoming events.</p>';
      return;
    }

    grid.innerHTML = '';

    const role = localStorage.getItem('role'); // Check if admin

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';

      const dateStr = new Date(event.datetime).toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
      });
      const timeStr = new Date(event.datetime).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit'
      });

      card.innerHTML = `
        <img src="${event.thumbnail || 'Images/yoga_thumbnail.jpg'}" alt="${event.title}">
        <p class="event-date">${dateStr}, ${timeStr}</p>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <button class="learn-more-btn" onclick="window.location.href='event-detail.html?event_id=${event.event_id}'">Learn More</button>

        ${role === 'admin' ? `
          <div class="dropdown">
            <button class="dropdown-toggle" onclick="toggleDropdown(this)">⋮</button>
            <div class="dropdown-menu">
              <button onclick="editEvent('${event.event_id}')">Update</button>
              <button onclick="deleteEvent('${event.event_id}')">Delete</button>
            </div>
          </div>
        ` : ''}
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load events:', err);
  }
}


function editEvent(eventId) {
  window.location.href = `create-event.html?event_id=${eventId}`;
}

async function deleteEvent(eventId) {
  const confirmed = confirm('Are you sure you want to delete this event?');
  if (!confirmed) return;

  try {
    const res = await fetch(`http://localhost:3000/api/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
      }
    });

    if (res.ok) {
      alert('Event deleted successfully.');
      loadEventList(); 
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to delete event.');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Server error while deleting event.');
  }
}

function toggleDropdown(button) {
  const menu = button.nextElementSibling;
  const isVisible = menu.style.display === 'block';

  // Close all other dropdowns
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.style.display = 'none';
  });

  // Toggle current
  if (!isVisible) {
    menu.style.display = 'block';
  }
}

window.addEventListener('click', function (e) {
  if (!e.target.matches('.dropdown-toggle')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('createEventBtn');
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));

  if (adminUser) {
    createBtn.classList.remove('hidden');
  }
});
