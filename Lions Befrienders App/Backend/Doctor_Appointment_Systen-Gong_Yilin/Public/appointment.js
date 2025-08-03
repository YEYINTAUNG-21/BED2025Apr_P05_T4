// public/userAppointments.js

document.addEventListener('DOMContentLoaded', async () => {
    const appointmentsList = document.getElementById('appointments-list');
    const userInfoDisplay = document.getElementById('user-info-display');
    const messageBox = document.getElementById('message-box');
    const apiBaseUrl = "http://localhost:3000";

    // Helper function to display messages
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = 'message-box'; // Reset classes
        if (message) {
            messageBox.classList.remove('hidden');
            messageBox.classList.add(type);
        } else {
            messageBox.classList.add('hidden');
        }
    }

    // Function to handle cancelling an appointment
    async function cancelAppointment(appointmentId, userId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return; // User cancelled the confirmation
        }

        showMessage('Cancelling appointment...', 'info');

        try {
            const response = await fetch(`${apiBaseUrl}/api/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = response.headers
                    .get("content-type")
                    ?.includes("application/json")
                    ? await response.json()
                    : { message: response.statusText };
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            showMessage('Appointment cancelled successfully!', 'success');
            // Refresh the list of appointments after successful deletion
            await fetchAndDisplayAppointments(userId);

        } catch (error) {
            console.error('Error cancelling appointment:', error);
            showMessage(`Failed to cancel appointment: ${error.message}`, 'error');
        }
    }

    // Function to fetch and display user's appointments
    async function fetchAndDisplayAppointments(userId) {
        appointmentsList.innerHTML = '<p class="loading-message">Loading your appointments...</p>'; // Show loading
        showMessage('', ''); // Clear previous messages

        try {
            const response = await fetch(`${apiBaseUrl}/api/users/${userId}/appointments`);
            if (!response.ok) {
                const errorData = response.headers
                    .get("content-type")
                    ?.includes("application/json")
                    ? await response.json()
                    : { message: response.statusText };
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const appointments = await response.json();

            appointmentsList.innerHTML = ''; // Clear loading message

            if (appointments.length === 0) {
                appointmentsList.innerHTML = '<p class="text-center text-gray-600">You have no appointments scheduled.</p>';
            } else {
                if (appointments[0].user_full_name && appointments[0].user_email) {
                    userInfoDisplay.textContent = `Appointments for ${appointments[0].user_full_name} (${appointments[0].user_email})`;
                } else {
                    userInfoDisplay.textContent = `Appointments for User ID: ${userId}`;
                }

                appointments.forEach(appointment => {
                    const card = document.createElement('div');
                    card.className = 'appointment-card';
                    card.innerHTML = `
                        <div class="info">
                            <h3>Appointment with ${appointment.doctor_name}</h3>
                            <p><strong>Date:</strong> ${appointment.appointment_date.split('T')[0]}</p>
                            <p><strong>Time:</strong> ${appointment.appointment_time}</p>
                            <p><strong>Clinic address:</strong> ${appointment.clinic_address}</p>
                            <p><strong>Status:</strong> <span class="status ${appointment.status}">${appointment.status}</span></p>
                            <p><strong>Reason:</strong> ${appointment.reason}</p>
                            <p class="text-xs text-gray-500 mt-2">Booked on: ${new Date(appointment.created_at).toLocaleString()}</p>

                        </div>
                        
                        <div class="appointment-actions">
                            ${appointment.status !== 'Completed' ? `
                                <button class="btn-update" data-appointment-id="${appointment.appointment_id}">Update Appointment</button>
                                <button class="btn-cancel" data-appointment-id="${appointment.appointment_id}">Cancel Appointment</button>
                            ` : ''}
                        </div>
                    `;
                    appointmentsList.appendChild(card);

                    // Only add listeners for update/cancel if buttons exist
                    if (appointment.status !== 'Completed') {
                        card.querySelector('.btn-update').addEventListener('click', () => {
                            // Redirect to the update page with appointment ID
                            window.location.href = `updateAppointment.html?id=${appointment.appointment_id}`;
                        });
                        card.querySelector('.btn-cancel').addEventListener('click', () => {
                            cancelAppointment(appointment.appointment_id, userId); // Pass userId for refreshing
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showMessage(`Failed to load appointments: ${error.message}`, 'error');
            appointmentsList.innerHTML = '<p class="text-center text-red-500">Failed to load appointments. Please try again.</p>';
        }
    }

    // --- Run on page load ---
    const userId =localStorage.getItem("userId");;
    if (userId) {
        fetchAndDisplayAppointments(userId);
    } else {
        appointmentsList.innerHTML = '<p class="text-center text-red-500">No User ID provided in the URL. Cannot display appointments.</p>';
        userInfoDisplay.textContent = 'Please provide a User ID in the URL (e.g., userAppointments.html?id=1).';
    }
});