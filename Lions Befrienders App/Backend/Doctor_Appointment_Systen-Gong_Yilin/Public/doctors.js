const doctorsListDiv = document.getElementById("doctorsList");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Fetch doctors from API
async function fetchDoctors() {
  try {
    doctorsListDiv.innerHTML = "Loading doctors...";
    messageDiv.textContent = "";

    const response = await fetch(`${apiBaseUrl}/doctors`);

    if (!response.ok) {
      const errorBody = response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(`HTTP ${response.status}: ${errorBody.message}`);
    }

    const doctors = await response.json();
    doctorsListDiv.innerHTML = "";

    if (doctors.length === 0) {
      doctorsListDiv.innerHTML = "<p>No doctors found.</p>";
    } else {
      doctors.forEach((doctor) => {
        const doctorElement = document.createElement("div");
        doctorElement.classList.add("doctor-item");

        doctorElement.innerHTML = `
          <img src="Images/${doctor.image_path}" alt="${doctor.doctor_name}" class="doctor-img"/>
          <div class="doctor-info">
            <h3>${doctor.doctor_name}</h3>
            <p><strong>Experience:</strong> ${doctor.years_of_experience} years</p>
            <p><strong>Clinic:</strong> ${doctor.clinic_address}</p>
            <p><strong>Language:</strong> ${doctor.second_language}</p>
            <p><strong>Bio:</strong> ${doctor.bio}</p>
            
          </div>
          <button onclick="bookAppointment(${doctor.doctor_id})">Book Appointment</button>
        `;

        doctorsListDiv.appendChild(doctorElement);
      });
    }
  } catch (error) {
    console.error("Error fetching doctors:", error);
    doctorsListDiv.innerHTML = `<p style="color: red;">Failed to load doctors: ${error.message}</p>`;
  }
}

// Redirect to booking page
function bookAppointment(doctorId) {
  window.location.href = `bookAppointment.html?id=${doctorId}`;
}

fetchDoctors(); // Auto-load on page open
