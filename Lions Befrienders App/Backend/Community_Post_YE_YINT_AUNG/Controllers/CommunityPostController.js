const PostModel = require('../Models/CommunityPostModel');

// Get all posts
async function getAllPosts(req, res) {
  try {
    const user_id = req.user?.userId || null;
    const posts = await PostModel.getAllPostsWithLikes(user_id); // 👈 Pass current user
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get post by ID
async function getPostById(req, res) {
  try {
    const post = await PostModel.getPostById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}


// Create a post 
async function createPost(req, res) {
    try {
        const {text} = req.body;
        const image_url = req.file ? req.file.path : null;
        const user_id = req.user.userId;
        await PostModel.createPost({user_id, text, image_url})
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
}

// Update a post
async function updatePost(req, res) {
  try {
    const user_id = req.user.userId;
    const post_id = req.params.post_id;

    // Extract text
    const rawText = req.body?.text;
    const text = typeof rawText === 'string'
      ? rawText.trim()
      : Array.isArray(rawText) && typeof rawText[0] === 'string'
        ? rawText[0].trim()
        : '';

    if (!text || text.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing post text.' });
    }

    // Handle image
    const imageFile = req.files?.find(file => file.fieldname === 'image');
    let image_url;

    if (imageFile) {
      image_url = imageFile.path;
    } else {
      //  No new image uploaded, so fetch current one
      const existingPost = await PostModel.getPostById(post_id);
      if (!existingPost || existingPost.user_id !== user_id) {
        return res.status(403).json({ error: 'Unauthorized or post not found.' });
      }
      image_url = existingPost.image_url;
    }

    console.log('Text:', text);
    console.log('Final image_url:', image_url);

    // Proceed with update
    await PostModel.updatePost(post_id, user_id, text, image_url);
    res.status(200).json({ message: 'Post updated successfully' });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
}



// Delete a post
async function deletePost(req, res) {
    try {
    const user_id = req.user.userId;
    const post_id = req.params.post_id;

    const deletedPost = await PostModel.deletePost(post_id, user_id);
    if (!deletedPost) {
        return res.status(404).json({ error: 'You don\'t have permission to delete this post' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
    }
}

// Get likes for posts
async function getPostLikes(req, res) {
    try {
        const likes = await PostModel.getAllLikes();
        res.json(likes);
    } catch (error) {
        console.error('Error fetching likes:', error);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
}


async function toggleLike(req, res) {
    try {
        const user_id = req.user.userId;
        const post_id = req.params.post_id;
        const result = await PostModel.toggleLike(post_id, user_id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to like/unlike post' });
    }
}
module.exports = {
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    getPostLikes,
    getPostById
};