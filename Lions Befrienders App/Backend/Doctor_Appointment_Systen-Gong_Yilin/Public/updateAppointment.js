// public/updateAppointment.js

// Get references to DOM elements
const doctorInfoDiv = document.getElementById('doctor-info');
const doctorImg = document.getElementById('doctor-img');
const doctorName = document.getElementById('doctor-name');
const doctorDetails = document.getElementById('doctor-details');
// Removed userEmailInput as it's no longer displayed
const currentAppointmentDisplay = document.getElementById('current-appointment-display');
const appointmentDateInput = document.getElementById('appointment-date');
const timeSlotsContainer = document.getElementById('time-slots-container');
const loadingSlots = document.getElementById('loading-slots');
const noSlotsMessage = document.getElementById('no-slots-message');
const slotSelectionMessage = document.getElementById('slot-selection-message');
const selectedSlotTimeInput = document.getElementById('selected-slot-time');
const reasonInput = document.getElementById('reason');
const submitBtn = document.getElementById('submit-btn');
const appointmentForm = document.getElementById('appointment-form');
const messageBox = document.getElementById('message-box');

// Hidden inputs
const appointmentIdInput = document.getElementById('appointment-id');
const doctorIdInput = document.getElementById('doctor-id');
const userIdInput = document.getElementById('user-id');

// API base URL
const apiBaseUrl = "http://localhost:3000";

let currentAppointmentId = null;
let currentDoctorId = null;
let currentUserId = null;
let initialAppointmentTime = null; // Store the original time to pre-select
let selectedTimeSlot = null; // Current selected time slot for update

// --- Helper Functions ---

// Function to get appointment ID from URL query parameter (e.g., updateAppointment.html?id=123)
function getAppointmentIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Function to display messages to the user
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

// Function to fetch and display the doctor details
async function fetchDoctorDetails(doctorId) {
    try {
        // Corrected API path
        const response = await fetch(`${apiBaseUrl}/api/doctor/${doctorId}`);
        if (!response.ok) {
            const errorBody = response.headers
                .get("content-type")
                ?.includes("application/json")
                ? await response.json()
                : { message: response.statusText };
            throw new Error(`HTTP ${response.status}: ${errorBody.message}`);
        }

        const doctor = await response.json();

        if (doctor) {
            doctorImg.src = `Images/Doctors/${doctor.image_path}`;
            doctorImg.alt = doctor.doctor_name;
            doctorName.textContent = doctor.doctor_name;
            doctorDetails.textContent = `Years of Experience: ${doctor.years_of_experience} | Clinic: ${doctor.clinic_address || 'N/A'}`;
            doctorInfoDiv.style.display = "flex";
        } else {
            showMessage('Doctor not found.', 'error');
            doctorInfoDiv.style.display = "none";
        }
    } catch (error) {
        console.error("Error loading doctor details:", error);
        showMessage(`Error loading doctor details: ${error.message}`, 'error');
        doctorInfoDiv.style.display = "none";
    }
}

// Function to fetch and display all potential time slots with their booked status
async function fetchAndDisplayTimeSlots() {
    if (!currentDoctorId) {
        showMessage('Doctor ID is missing — unable to load slots.', 'error');
        loadingSlots.classList.add('hidden');
        timeSlotsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Invalid doctor reference.</p>';
        return;
    }

    const selectedDate = appointmentDateInput.value;
    timeSlotsContainer.innerHTML = ''; // Clear previous slots
    selectedSlotTimeInput.value = ''; // Clear selected slot
    selectedTimeSlot = null; // Reset selected time slot
    submitBtn.disabled = true; // Disable submit button until slot is chosen
    slotSelectionMessage.classList.add('hidden'); // Hide selection message

    if (!selectedDate) {
        noSlotsMessage.classList.remove('hidden');
        loadingSlots.classList.add('hidden');
        return;
    } else {
        noSlotsMessage.classList.add('hidden');
    }

    loadingSlots.classList.remove('hidden');

    try {
        // Corrected API path
        const response = await fetch(`${apiBaseUrl}/api/doctor-availability/${currentDoctorId}/${selectedDate}/slots`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allSlotsWithStatus = await response.json();

        loadingSlots.classList.add('hidden');

        if (allSlotsWithStatus.length === 0) {
            timeSlotsContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">No available slots for this date.</p>';
        } else {
            allSlotsWithStatus.forEach(slot => {
                const button = document.createElement('button');
                button.textContent = slot.time;
                button.dataset.time = slot.time;

                // Mark the current appointment's time slot as selected if it matches
                // Also, if it's the current appointment's time, ensure it's selectable.
                const originalAppointmentDate = currentAppointmentBeingUpdated.appointment_date.split('T')[0];
                const isOriginalSlot = (slot.time === initialAppointmentTime && selectedDate === originalAppointmentDate);

                if (isOriginalSlot) {
                    button.classList.add('time-slot-button', 'selected');
                    button.classList.remove('booked'); // Ensure it's not marked as booked if it's *this* appointment's slot
                    button.classList.add('available'); // Mark it as available for selection
                    selectedTimeSlot = slot.time; // Pre-select this slot
                    selectedSlotTimeInput.value = slot.time;
                    submitBtn.disabled = false; // Enable submit button
                } else if (slot.isBooked) {
                    button.classList.add('time-slot-button', 'booked');
                    button.disabled = true;
                } else {
                    button.classList.add('time-slot-button', 'available');
                    button.disabled = false;
                }

                if (!button.disabled) { // Only add listener if button is not disabled (i.e., available)
                    button.addEventListener('click', () => {
                        const currentSelected = document.querySelector('.time-slot-button.selected');
                        if (currentSelected) {
                            currentSelected.classList.remove('selected');
                        }
                        button.classList.add('selected');
                        selectedTimeSlot = slot.time;
                        selectedSlotTimeInput.value = slot.time;
                        submitBtn.disabled = false;
                        slotSelectionMessage.classList.add('hidden');
                    });
                }
                timeSlotsContainer.appendChild(button);
            });
        }
    } catch (error) {
        console.error('Error fetching time slots:', error);
        loadingSlots.classList.add('hidden');
        timeSlotsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Failed to load time slots. Please try again.</p>';
    }
}

// Function to handle appointment update submission
async function handleUpdateSubmission(event) {
    event.preventDefault();

    showMessage('', ''); // Clear any previous messages

    if (!selectedTimeSlot) {
        slotSelectionMessage.classList.remove('hidden');
        return;
    }

    if (!reasonInput.value.trim()) {
        showMessage('Please provide a reason for the appointment.', 'error');
        reasonInput.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving Changes...';

    try {
        const appointmentData = {
            user_id: currentUserId, // User ID remains the same
            doctor_id: currentDoctorId, // Doctor ID remains the same
            appointment_date: appointmentDateInput.value,
            appointment_time: selectedTimeSlot + ':00', // Append :00 for HH:MM:SS format
            reason: reasonInput.value.trim(),
            status: 'Scheduled' // Assuming status remains 'Scheduled' or you have logic to change it
        };

        // Corrected API path
        const response = await fetch(`${apiBaseUrl}/api/appointments/${currentAppointmentId}`, {
            method: 'PUT', // Use PUT for updating
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showMessage('Appointment updated successfully!', 'success');
        console.log('Appointment updated:', result);

        // Redirect back to user's appointments page
        setTimeout(() => {
            window.location.href = `appointment.html?id=${currentUserId}`;
        }, 1500); // Redirect after 1.5 seconds

    } catch (error) {
        console.error('Error updating appointment:', error);
        showMessage(`Failed to update appointment: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// --- Run on page load ---
document.addEventListener('DOMContentLoaded', async () => {
    currentAppointmentId = getAppointmentIdFromUrl();

    if (!currentAppointmentId) {
        showMessage("No Appointment ID provided in the URL. Cannot update appointment.", 'error');
        // Disable all form elements if no appointment ID
        appointmentDateInput.disabled = true;
        reasonInput.disabled = true;
        submitBtn.disabled = true;
        return;
    }

    appointmentIdInput.value = currentAppointmentId; // Set hidden input

    // Set min date for date input to today
    const today = new Date().toISOString().split('T')[0];
    appointmentDateInput.min = today;

    try {
        // 1. Fetch the specific appointment details
        // Corrected API path
        const appointmentResponse = await fetch(`${apiBaseUrl}/api/appointment/${currentAppointmentId}`);
        if (!appointmentResponse.ok) {
            throw new Error(`Failed to fetch appointment details: HTTP ${appointmentResponse.status}`);
        }
        const appointment = await appointmentResponse.json();

        if (!appointment) {
            showMessage('Appointment not found.', 'error');
            appointmentDateInput.disabled = true;
            reasonInput.disabled = true;
            submitBtn.disabled = true;
            return;
        }

        // Store the full appointment object for easy access during update
        currentAppointmentBeingUpdated = appointment; // This was missing in your snippet

        // Populate global variables and hidden inputs
        currentDoctorId = appointment.doctor_id;
        currentUserId = appointment.user_id;
        initialAppointmentTime = appointment.appointment_time; // HH:MM string from DB

        doctorIdInput.value = currentDoctorId;
        userIdInput.value = currentUserId;

        // Display current appointment details
        currentAppointmentDisplay.textContent = `${appointment.appointment_date.split('T')[0]} at ${appointment.appointment_time}`;

        // Fetch and display doctor details (read-only)
        await fetchDoctorDetails(currentDoctorId);

        // Removed logic to fetch user email for display

        // Pre-populate form fields
        appointmentDateInput.value = appointment.appointment_date.split('T')[0]; // YYYY-MM-DD
        reasonInput.value = appointment.reason;

        // Fetch and display time slots for the pre-populated date
        // This will also pre-select the initialAppointmentTime
        await fetchAndDisplayTimeSlots();

        // Add event listeners
        appointmentDateInput.addEventListener('change', fetchAndDisplayTimeSlots);
        appointmentForm.addEventListener('submit', handleUpdateSubmission);

    } catch (error) {
        console.error('Initialization error:', error);
        showMessage(`Failed to load appointment for update: ${error.message}`, 'error');
        // Disable all form elements on critical error
        appointmentDateInput.disabled = true;
        reasonInput.disabled = true;
        submitBtn.disabled = true;
    }
});
