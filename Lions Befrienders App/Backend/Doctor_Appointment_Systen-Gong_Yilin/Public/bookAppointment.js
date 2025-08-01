// Get references to DOM elements

        const doctorInfoDiv = document.getElementById('doctor-info');
        const doctorImg = document.getElementById('doctor-img');
        const doctorName = document.getElementById('doctor-name');
        const doctorDetails = document.getElementById('doctor-details');
        const userEmailInput = document.getElementById('user-email'); // User email input
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
        const userIdInput = document.getElementById('user-id');

        // API base URL
        const apiBaseUrl = "http://localhost:3000";

        let currentDoctorId = null;
        let selectedTimeSlot = null;
        let fetchedUserId = null; // This will store the user_id after successful lookup

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
                const response = await fetch(`${apiBaseUrl}/doctor/${doctorId}`);

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
                    doctorImg.src = `Images/${doctor.image_path}`;
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
                // Fetch all potential slots with their booked status from the backend
                const response = await fetch(`${apiBaseUrl}/doctor-availability/${currentDoctorId}/${selectedDate}/slots`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const allSlotsWithStatus = await response.json(); // Expecting [{ time: "HH:MM", isBooked: true/false }]
                loadingSlots.classList.add('hidden');

                if (allSlotsWithStatus.length === 0) {
                    timeSlotsContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">No available slots for this date.</p>';
                } else {
                    allSlotsWithStatus.forEach(slot => {
                        const button = document.createElement('button');
                        button.textContent = slot.time;
                        button.dataset.time = slot.time; // Store time in a data attribute

                        if (slot.isBooked) {
                            button.classList.add('time-slot-button', 'booked');
                            button.disabled = true; // Disable booked slots
                        } else {
                            button.classList.add('time-slot-button', 'available');
                            button.disabled = false; // Enable available slots
                            button.addEventListener('click', () => {
                                // Remove 'selected' class from previously selected button
                                const currentSelected = document.querySelector('.time-slot-button.selected');
                                if (currentSelected) {
                                    currentSelected.classList.remove('selected');
                                }
                                // Add 'selected' class to the clicked button
                                button.classList.add('selected');
                                selectedTimeSlot = slot.time;
                                selectedSlotTimeInput.value = slot.time; // Update hidden input
                                submitBtn.disabled = false; // Enable submit button
                                slotSelectionMessage.classList.add('hidden'); // Hide selection message
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

             const userEmail = userEmailInput.value.trim();
            if (!userEmail) {
                showMessage('Please enter your email.', 'error');
                userEmailInput.focus();
                return;
            }

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
            showMessage('', ''); // Clear previous messages

            
            try {

                // --- Step 1: Look up user by email ---
                const userResponse = await fetch(`${apiBaseUrl}/users/email/${userEmail}`);
                if (!userResponse.ok) {
                    if (userResponse.status === 404) {
                        throw new Error('Email not found. Please ensure you have registered or entered a valid email.');
                    }
                    const errorData = await userResponse.json();
                    throw new Error(errorData.message || `Failed to verify email: HTTP ${userResponse.status}`);
                }
                const userData = await userResponse.json();
                fetchedUserId = userData.user_id; // Store the fetched user ID

                if (!fetchedUserId) {
                    throw new Error('Could not retrieve user ID from email. User data incomplete.');
                }

                // Set the hidden user ID input for form submission (though fetchedUserId is used directly)
                userIdInput.value = fetchedUserId;   



                 const appointmentData = {
                    user_id: fetchedUserId, // Use the fetched user ID
                    doctor_id: parseInt(currentDoctorId),
                    appointment_date: appointmentDateInput.value,
                    appointment_time: selectedTimeSlot + ':00', // Append :00 for HH:MM:SS format
                    reason: reasonInput.value.trim(),
                    status: 'Scheduled'
                };




                const response = await fetch(`${apiBaseUrl}/appointment`, {
                    method: 'POST',
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
                showMessage('Appointment booked successfully!', 'success');
                console.log('Appointment booked:', result);

               // --- FINAL CHANGE: Redirect to appointment.html with user ID ---
                // Give a brief moment for the success message to be seen, then redirect
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

                // Placeholder for User ID (replace with actual user ID from authentication)
                // appointmentDateInput.disabled = true;
                // reasonInput.disabled = true;
                // submitBtn.disabled = true;


                // Fetch doctor details immediately
                await fetchDoctorDetails(currentDoctorId);

                

                // Add event listener for date input change
                appointmentDateInput.addEventListener('change', fetchAndDisplayTimeSlots);

                // Add event listener for form submission
                appointmentForm.addEventListener('submit', handleAppointmentSubmission);

            } else {
                showMessage("No doctor ID provided in the URL. Please use a URL like doctor.html?id=1", 'error');
                doctorInfoDiv.style.display = "none";
                userEmailInput.disabled = true;
                appointmentDateInput.disabled = true;
                reasonInput.disabled = true;
                submitBtn.disabled = true;
            }
        });