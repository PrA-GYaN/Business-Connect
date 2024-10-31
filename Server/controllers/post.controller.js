import Post from "../models/post.model.js";
import cloudinary from "../utils/cloudinary.js";
import stream from 'stream';

export const createPost = async (req, res) => {
  try {
      console.log("Creating post");

      const { authorId, content } = req.body;

      if (!req.file) {
          // Creating a post without an image
          const newPost = new Post({ authorId, content });

          try {
              await newPost.save();
              return res.status(201).json({ message: 'Post created successfully', post: newPost });
          } catch (err) {
              console.error('Error saving post:', err);
              return res.status(400).send('Error saving post: ' + err.message);
          }
      } else {
          const bufferStream = new stream.PassThrough();
          bufferStream.end(req.file.buffer);

          bufferStream.pipe(cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
              if (error) {
                  console.error('Error uploading image:', error);
                  return res.status(400).send('Error uploading image: ' + error.message);
              }

              console.log("Uploaded Image");

              const newPost = new Post({
                  authorId,
                  content,
                  image: {
                      url: result.secure_url,
                      public_id: result.public_id,
                  },
              });

              try {
                  await newPost.save();
                  return res.status(201).json({ message: 'Post created successfully', post: newPost });
              } catch (err) {
                  console.error('Error saving post with image:', err);
                  return res.status(400).send('Error saving post: ' + err.message);
              }
          }));
      }
  } catch (err) {
      console.error('Unexpected error:', err);
      return res.status(500).send('Error: ' + err.message); // 500 for unexpected errors
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Optionally, delete the image from Cloudinary
    await cloudinary.uploader.destroy(deletedPost.image.public_id);

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// controllers/postController.js
export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the page number
  const limit = 1; // Set limit to 1 for one post at a time
  const skip = (page - 1) * limit; // Calculate the number of documents to skip

  try {
    const totalPosts = await Post.countDocuments(); // Count total posts
    const posts = await Post.find()
      .populate('authorId')
      .populate({
        path: 'comments.userId',
        model: 'Users'
      })
      .skip(skip)
      .limit(limit); // Apply pagination

    const postsWithImages = posts.map(post => ({
      ...post.toObject(),
      image: post.image || null,
    }));

    const hasMore = totalPosts > page * limit; // Check if more posts are available

    res.status(200).json({ posts: postsWithImages, hasMore });
  } catch (err) {
    res.status(400).json({ message: 'Error fetching posts: ' + err.message });
  }
};


export const likePost = async(req, res) =>
{
  const postId = req.params.id;
  const userId = req.user._id;
  console.log('Liking post', postId);
  try {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if the user has already liked the post
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex === -1) {
      // User hasn't liked the post yet, add them to the likes array
      post.likes.push(userId);
    } else {
      // User has already liked the post, remove them from the likes array
      post.likes.splice(likedIndex, 1);
    }

    await post.save();
    return post; // Return the updated post
  } catch (error) {
    throw new Error(error.message);
  }
};

export const commentPost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const commentText = req.body.content;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const newComment = {
      userId: userId,
      content: commentText,
    };
    post.comments.push(newComment);
    await post.save();
    res.status(200).send('Comment added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding comment: ' + error.message);
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.find({ authorId: id })
    .populate('authorId') // Populate the author of the post
    .populate({
      path: 'comments.userId', // Populate the userId in each comment
      model: 'User' // Specify the User model to populate
    });;

    if (!post) {
      console.error('Post not found');
    }

    res.status(200).json(post);
  }
  catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Error fetching post: ' + error.message);
  }
};