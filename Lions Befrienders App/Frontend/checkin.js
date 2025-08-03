document.getElementById('checkinBtn').addEventListener('click', async () => {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = ''; // Clear previous message

  try {
    const token = localStorage.getItem('token'); // <-- Retrieve token

    const response = await fetch('/api/daily-checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token  // <-- Include token
      },
      body: JSON.stringify({})
    });

    if (response.ok) {
      statusMessage.style.color = 'green';
      statusMessage.textContent = 'Check-in successful! Thank you.';
    } else {
      const errorData = await response.json();
      statusMessage.style.color = 'red';
      statusMessage.textContent = `Check-in failed: ${errorData.message || response.statusText}`;
    }
  } catch (error) {
    statusMessage.style.color = 'red';
    statusMessage.textContent = 'Error connecting to server. Please try again later.';
  }
});