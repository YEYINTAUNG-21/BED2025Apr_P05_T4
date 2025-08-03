window.addEventListener('load', () => {
  const pathname = window.location.pathname;

  if (pathname.includes('event.html') && !pathname.includes('create-event.html') && !pathname.includes('event-detail.html')) {
    loadEventList();
  } else if (pathname.includes('event-detail.html')) {
    loadEventDetail();
  } else if (pathname.includes('create-event.html')) {
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
  const heading = document.querySelector('h1');
  const submitBtn = document.querySelector('.create-btn');

  if (!form || !submitBtn || !heading) {
    console.warn('Required form elements not found');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('event_id'); // Edit mode check

  if (eventId) {
    console.log('Edit mode detected, event_id =', eventId);
    try {
      const res = await fetch(`http://localhost:3000/api/events/${eventId}`);
      console.log('Fetch status:', res.status);
      if (!res.ok) throw new Error('Failed to fetch event');
      const data = await res.json();
      console.log('Fetched data:', data);

      // Pre-fill fields
      document.getElementById('title').value = data.title || '';
      document.getElementById('description').value = data.description || '';
      document.getElementById('datetime').value = data.datetime ? new Date(data.datetime).toISOString().slice(0, 16) : '';
      document.getElementById('youtube_link').value = data.youtube_link || '';

      // Update UI for edit mode
      heading.textContent = 'Update Virtual Event';
      submitBtn.textContent = 'Update Event';
    } catch (err) {
      console.error('Failed to load event for editing:', err);
    }
  } else {
    // Create mode UI
    heading.textContent = 'Create Virtual Event';
    submitBtn.textContent = 'Create Event';
  }

  // Submit handler
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
        message.style.color = 'green';
        message.textContent = eventId
          ? 'Event updated successfully!'
          : 'Event created successfully!';
        form.reset();


      } else {
        const err = await res.json();
        message.style.color = 'red';
        message.textContent = err.error || 'Failed to submit form.';
      }
    } catch (err) {
      message.style.color = 'red';
      message.textContent = 'Server error. Please try again later.';
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

    // Parse YouTube Video ID safely
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
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    const loggedInAdminId = adminUser?.admin_id;

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
        ${role === 'admin' && event.created_by_admin_id === loggedInAdminId ? `
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