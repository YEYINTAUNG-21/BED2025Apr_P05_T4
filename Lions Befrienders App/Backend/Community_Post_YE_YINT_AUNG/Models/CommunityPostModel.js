const sql = require('mssql');
const dbConfig = require('../../db_config');

// Get all posts
async function getAllPostsWithLikes(currentUserId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input('user_id', sql.Int, currentUserId)
      .query(`
        SELECT 
          p.post_id,
          p.text,
          p.image_url,
          p.timestamp,
          u.full_name AS username,
          (SELECT COUNT(*) FROM PostLikes WHERE post_id = p.post_id) AS likeCount,
          (SELECT COUNT(*) FROM PostLikes WHERE post_id = p.post_id AND user_id = @user_id) AS likedByUser
        FROM Posts p
        JOIN users u ON p.user_id = u.user_id
        ORDER BY p.timestamp DESC
      `);

    return result.recordset.map(post => ({
      ...post,
      likedByUser: post.likedByUser > 0  // convert to boolean
    }));
  } catch (error) {
    console.error('Error fetching posts with likes:', error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Get post by ID
async function getPostById(postId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input('post_id', sql.Int, postId)
      .query(`
        SELECT 
          p.post_id,
          p.user_id,       
          p.text,
          p.image_url,
          p.timestamp,
          u.full_name AS username
        FROM Posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.post_id = @post_id
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Create new post
async function createPost(post){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        await connection.request()
            .input('user_id', sql.Int, post.user_id)
            .input('text', sql.NVarChar, post.text)
            .input('image_url', sql.NVarChar, post.image_url)
            .query(`INSERT INTO Posts (user_id, text, image_url) 
                VALUES (@user_id, @text, @image_url)`);
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Update Post
async function updatePost(post_id, user_id, text, image_url){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        await connection.request()
            .input('post_id', sql.Int, post_id)
            .input('user_id', sql.Int, user_id)
            .input('text', sql.NVarChar, text) 
            .input('image_url', sql.NVarChar, image_url)
            .query(`Update Posts
                SET text = @text,
                image_url = @image_url
                WHERE post_id = @post_id AND user_id = @user_id`);
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Delete Post
async function deletePost(post_id, user_id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Step 1: Delete likes first
    await connection.request()
      .input('post_id', sql.Int, post_id)
      .query(`
        DELETE FROM PostLikes WHERE post_id = @post_id
      `);

    // Step 2: Now delete the post
    const result = await connection.request()
      .input('post_id', sql.Int, post_id)
      .input('user_id', sql.Int, user_id)
      .query(`
        DELETE FROM Posts
        WHERE post_id = @post_id AND user_id = @user_id
      `);

    return result.rowsAffected[0] > 0;

  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


// Get Likes
async function getAllLikes(){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .query(`
                SELECT post_id, COUNT(*) AS LikeCount
                FROM PostLikes
                GROUP BY post_id
            `);
        return result.recordset;
    } catch (error) {
        console.error('Error fetching likes:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Like/Unlike Post
async function toggleLike(post_id, user_id){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input('post_id', sql.Int, post_id)
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT * FROM PostLikes
                WHERE post_id = @post_id AND user_id = @user_id
                `);
        if (result.recordset.length > 0) {
            await connection.request()
                .input('post_id', sql.Int, post_id)
                .input('user_id', sql.Int, user_id)
                .query(`
                    DELETE FROM PostLikes
                    WHERE post_id = @post_id AND user_id = @user_id
                `);
            return {liked: false};
        } else {
            await connection.request()
                .input('post_id', sql.Int, post_id)
                .input('user_id', sql.Int, user_id)
                .query(`
                    INSERT INTO PostLikes (post_id, user_id)
                    VALUES (@post_id, @user_id)
                `);
            return {liked: true};
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
  getAllPostsWithLikes,
  createPost,
  updatePost,
  deletePost,
  getAllLikes,
  toggleLike,
  getPostById
};