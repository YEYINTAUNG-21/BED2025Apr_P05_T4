// public/bookAppointment.js

// Get references to DOM elements
const doctorInfoDiv = document.getElementById('doctor-info');
const doctorImg = document.getElementById('doctor-img');
const doctorName = document.getElementById('doctor-name');
const doctorDetails = document.getElementById('doctor-details');
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
const userIdInput = document.getElementById('user-id'); // Hidden input for user ID

// API base URL
const apiBaseUrl = "http://localhost:3000";

let currentDoctorId = null;
let selectedTimeSlot = null;
let fetchedUserId = null; // This will store the user_id from localStorage

// --- Helper Functions ---

// Function to get doctor ID from URL query parameter (e.g., doctor.html?id=3)
function getDoctorIdFromUrl() {
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
        const response = await fetch(`${apiBaseUrl}/api/doctor/${doctorId}`); // Corrected API path
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

            // Enable date and reason inputs once doctor details are loaded
            appointmentDateInput.disabled = false;
            reasonInput.disabled = false;
        } else {
            showMessage('Doctor not found.', 'error');
            doctorInfoDiv.style.display = "none";
            // Disable all inputs if doctor not found
            appointmentDateInput.disabled = true;
            reasonInput.disabled = true;
            submitBtn.disabled = true;
        }
    } catch (error) {
        console.error("Error loading doctor details:", error);
        showMessage(`Error loading doctor details: ${error.message}`, 'error');
        doctorInfoDiv.style.display = "none";
        // Disable all inputs on error
        appointmentDateInput.disabled = true;
        reasonInput.disabled = true;
        submitBtn.disabled = true;
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
        const response = await fetch(`${apiBaseUrl}/api/doctor-availability/${currentDoctorId}/${selectedDate}/slots`); // Corrected API path
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

                if (slot.isBooked) {
                    button.classList.add('time-slot-button', 'booked');
                    button.disabled = true;
                } else {
                    button.classList.add('time-slot-button', 'available');
                    button.disabled = false;
                    button.addEventListener('click', () => {
                        const currentSelected = document.querySelector('.time-slot-button.selected');
                        if (currentSelected) {
                            currentSelected.classList.remove('selected');
                        }
                        button.classList.add('selected');
                        selectedTimeSlot = slot.time;
                        selectedSlotTimeInput.value = slot.time;
                        submitBtn.disabled = false; // Enable submit button only after a slot is selected
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

// Function to handle appointment form submission
async function handleAppointmentSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    showMessage('', ''); // Clear any previous messages

    // --- Get userId from localStorage ---
    const userIdFromLocalStorage = localStorage.getItem("userId");
    if (!userIdFromLocalStorage) {
        showMessage('User ID not found. Please ensure you are logged in or your ID is stored.', 'error');
        // You might want to redirect to a login page here or show a login prompt
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Appointment';
        return;
    }
    // Set the global fetchedUserId for consistency and for redirection
    fetchedUserId = userIdFromLocalStorage;
    userIdInput.value = fetchedUserId; // Update hidden input

    if (!selectedTimeSlot) {
        slotSelectionMessage.classList.remove('hidden');
        return;
    }

    if (!reasonInput.value.trim()) { // Check if reason is empty
        showMessage('Please provide a reason for the appointment.', 'error');
        reasonInput.focus();
        return;
    }

    submitBtn.disabled = true; // Disable button to prevent multiple submissions
    submitBtn.textContent = 'Booking...';

    try {
        const appointmentData = {
            user_id: parseInt(fetchedUserId), // Use the fetched user ID from localStorage
            doctor_id: parseInt(currentDoctorId),
            appointment_date: appointmentDateInput.value,
            appointment_time: selectedTimeSlot + ':00', // Append :00 for HH:MM:SS format
            reason: reasonInput.value.trim(),
            status: 'Scheduled'
        };

        const response = await fetch(`${apiBaseUrl}/api/appointments`, { // Corrected API path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });

        if (!response.ok) {
            const errorData = response.headers
                .get("content-type")
                ?.includes("application/json")
                ? await response.json()
                : { message: response.statusText };
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showMessage('Appointment booked successfully!', 'success');
        console.log('Appointment booked:', result);

        // Redirect to userAppointments.html with fetchedUserId
        setTimeout(() => {
            window.location.href = `appointment.html?id=${fetchedUserId}`;
        }, 1500); // Redirect after 1.5 seconds

    } catch (error) {
        console.error('Error booking appointment:', error);
        showMessage(`Failed to book appointment: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Appointment';
    }
}

// --- Run on page load ---
document.addEventListener('DOMContentLoaded', async () => {
    currentDoctorId = getDoctorIdFromUrl();
    if (currentDoctorId) {
        // Set hidden input value
        document.getElementById('doctor-id').value = currentDoctorId;

        // Set min date for date input to today
        const today = new Date().toISOString().split('T')[0];
        appointmentDateInput.min = today;

        // Disable elements initially until doctor details are loaded
        appointmentDateInput.disabled = true;
        reasonInput.disabled = true;
        submitBtn.disabled = true; // Keep submit button disabled until a slot is chosen

        // Fetch doctor details immediately
        await fetchDoctorDetails(currentDoctorId); // This function will enable date and reason inputs

        // Add event listener for date input change
        appointmentDateInput.addEventListener('change', fetchAndDisplayTimeSlots);

        // Add event listener for form submission
        appointmentForm.addEventListener('submit', handleAppointmentSubmission);

    } else {
        showMessage("No doctor ID provided in the URL. Please use a URL like doctor.html?id=1", 'error');
        doctorInfoDiv.style.display = "none";
        // Disable all form elements if no doctor ID
        appointmentDateInput.disabled = true;
        reasonInput.disabled = true;
        submitBtn.disabled = true;
    }
});