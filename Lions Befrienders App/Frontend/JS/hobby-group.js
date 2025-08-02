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