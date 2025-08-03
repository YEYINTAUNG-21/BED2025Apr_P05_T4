let map;
let currentMarkers = {};
let favoriteList = [];

const sampleClinic = {
  place_id: "sample123",
  name: "Singapore General Hospital",
  vicinity: "Outram Road, Singapore",
  rating: 4.3,
  geometry: {
    location: { lat: 1.2789, lng: 103.8343 }
  }
};

function initMap() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: latitude, lng: longitude },
        zoom: 13
      });

      addMarker(sampleClinic);
    },
    () => {
      alert("Could not get your location. Using default Singapore center.");
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 1.3521, lng: 103.8198 },
        zoom: 12
      });
      addMarker(sampleClinic);
    }
  );
}

function addMarker(place) {
  const { lat, lng } = place.geometry.location;
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    title: place.name,
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
    }
  });

  currentMarkers[place.place_id] = marker;

  marker.addListener("click", () => showPopup(place));
}

function showPopup(place) {
  const popup = document.getElementById("clinic-popup");
  const content = document.getElementById("clinic-popup-content");
  content.innerHTML = `
    <strong>${place.name}</strong><br/>
    ${place.vicinity || ""}<br/>
    Rating: ${place.rating || "N/A"}<br/>
    <button onclick='favoriteClinic(${JSON.stringify({
      clinic_id: place.place_id,
      text: place.name,
      rating: place.rating
    })})'>Add to Favorites</button>
  `;
  popup.classList.remove("hidden");
}

function closePopup() {
  document.getElementById("clinic-popup").classList.add("hidden");
}

function favoriteClinic(clinic) {
  if (!favoriteList.find(f => f.clinic_id === clinic.clinic_id)) {
    favoriteList.push(clinic);
    showFavorites();
    closePopup();
    alert("Added to favorites!");
  } else {
    alert("Clinic already in favorites.");
  }
}

function showFavorites() {
  const table = document.getElementById("favorites-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  favoriteList.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="#" onclick="focusMarker('${c.clinic_id}')">${c.text}</a></td>
      <td>${c.rating || "N/A"}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removeFavorite('${c.clinic_id}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("favorites-popup").classList.remove("hidden");
}

function removeFavorite(clinic_id) {
  favoriteList = favoriteList.filter(c => c.clinic_id !== clinic_id);
  showFavorites();
}

function toggleFavorites() {
  const popup = document.getElementById("favorites-popup");
  popup.classList.toggle("hidden");
}

function focusMarker(clinic_id) {
  const marker = currentMarkers[clinic_id];
  if (marker) {
    map.setCenter(marker.getPosition());
    map.setZoom(15);
    google.maps.event.trigger(marker, "click");
  } else {
    alert("Marker not found on map.");
  }
}
