const form = document.getElementById('postForm');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const textArea = document.getElementById('text');
const charCount = document.getElementById('charCount');
const token = localStorage.getItem('token');

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('post_id')

// Character count
if (textArea && charCount) {
  textArea.addEventListener('input', () => {
    charCount.textContent = `${textArea.value.length}/500`;
  });
}

// Image preview
if (imageInput && imagePreview) {
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
      };
      reader.readAsDataURL(file);
    }
  });
}

async function prefillPostIfEditing() {
  if (!postId || !form) return;

  document.querySelector('h1').textContent = 'Update Post';
  document.querySelector('.create-btn').textContent = 'Update';

  try {
    const res = await fetch(`http://localhost:3000/api/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch post');
    const post = await res.json();

    textArea.value = post.text || '';
    charCount.textContent = `${post.text.length}/500`;

    if (post.image_url) {
      imagePreview.innerHTML = `<img src="${post.image_url}" style="max-width: 100%; border-radius: 10px;" />`;
    }
  } catch (err) {
    console.error('Error loading post:', err);
  }
}


// Submit new post
if (form) {
  form.onsubmit = async function (e) {
    e.preventDefault();

    const formData = new FormData();

    if (imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    formData.append('text', textArea.value);

    const endpoint = postId
      ? `http://localhost:3000/api/posts/${postId}`  
      : `http://localhost:3000/api/posts`;          

    const method = postId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert(postId ? 'Post updated!' : 'Post created!');
        window.location.href = 'community-feed.html';
      } else {
        alert(data.message || 'Server error.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Server error.');
    }
  };
}

// Load posts
async function loadPosts() {
  const wall = document.getElementById('postWall');
  if (!wall) return;

  try {
    const [postsRes, likesRes] = await Promise.all([
      fetch('http://localhost:3000/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }),
      fetch('http://localhost:3000/api/posts-likes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    ]);


    const posts = await postsRes.json();
    const likesRaw = await likesRes.json();

    const likes = Array.isArray(likesRaw) ? likesRaw : likesRaw.data || [];

    wall.innerHTML = '';

    posts.forEach(post => {
      const likeData = likes.find(l => l.post_id === post.post_id);
      const likeCount = likeData ? likeData.like_count : 0;

      const li = document.createElement('li');
      li.className = 'post';
      li.innerHTML = `
        <div class="post-card">
          <div class="post-header">
            <div class="post-info">
              <div class="username">Posted By <strong>${post.username}</strong></div>
              ${(() => {
                const loginUser = JSON.parse(localStorage.getItem('loginUser'));
                const adminUser = JSON.parse(localStorage.getItem('adminUser'));

                if (!adminUser && loginUser && loginUser.full_name === post.username) {
                  return `
                    <div class="menu">
                      <button class="menu-btn" data-id="${post.post_id}">⋮</button>
                      <div class="menu-options hidden" id="menu-${post.post_id}">
                        <button class="edit-btn" data-id="${post.post_id}">Edit</button>
                        <button class="delete-btn" data-id="${post.post_id}">Delete</button>
                      </div>
                    </div>
                  `;
                }
                return '';
              })()}
            </div>
            <div class="timestamp">${timeAgo(new Date(post.timestamp))}</div>
          </div>

          <div class="post-body">
            ${post.image_url ? `<img src="${post.image_url}" class="post-image" alt="Post Image" />` : ''}
            <div class="post-text">${post.text}</div>
          </div>

          <div class="post-footer">
            <button 
              class="heart-icon ${post.likedByUser ? 'liked' : ''}" 
              data-post-id="${post.post_id}">
              <i class="${post.likedByUser ? 'fas' : 'far'} fa-heart"></i>
              <span class="like-count">${post.likeCount}</span>
            </button>
          </div>
        </div>
      `;

      wall.appendChild(li);
    });

    bindLikeButtons(); 

  } catch (err) {
    console.error('Error loading posts:', err);
  }
}

// Event Delegation for menu/edit/delete
document.getElementById('postWall')?.addEventListener('click', async function (e) {
  const postId = e.target.dataset.postId || e.target.dataset.id;

  // Toggle 3-dot menu
  if (e.target.classList.contains('menu-btn')) {
    const menu = document.getElementById(`menu-${postId}`);
    if (menu) menu.classList.toggle('hidden');
  }

  // Edit post
  if (e.target.classList.contains('edit-btn')) {
    window.location.href = `create-post.html?post_id=${postId}`;
  }


  // Delete post
  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Are you sure you want to delete this post?')) {
      await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      loadPosts();
    }
  }
});

// Like/unlike logic
function bindLikeButtons() {
  const buttons = document.querySelectorAll('.heart-icon');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.postId;
      const loginUser = JSON.parse(localStorage.getItem('loginUser'));
      const token = localStorage.getItem('token');
      if (!loginUser || !loginUser.id || !token) return alert('Please login to react.');

      try {
        const res = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ user_id: loginUser.id })
        });

        if (res.ok) {
          const result = await res.json();

          // Update heart icon class and color
          const icon = btn.querySelector('i');
          const countSpan = btn.querySelector('.like-count');
          let count = parseInt(countSpan.innerText);

          if (result.liked) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.classList.add('liked');
            countSpan.innerText = count + 1;
          } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.classList.remove('liked');
            countSpan.innerText = count - 1;
          }
        }

      } catch (err) {
        console.error('Like error:', err);
      }
    });
  });
}

// Convert timestamp to "time ago"
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 0) return 'Just now'; 
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

// Load posts on page load
window.onload = () => {
  if (document.getElementById('postWall')) {
    loadPosts();
  }

  if (document.getElementById('postForm')) {
    prefillPostIfEditing();
  }
};

  // Hide Create Post button if user is an admin
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  const createPostBtn = document.getElementById('createPostBtn');

  if (adminUser && createPostBtn) {
    createPostBtn.style.display = 'none';
  }