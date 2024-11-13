import Thread from '../models/thread.model.js'; // Adjust the path as necessary
import Comment from '../models/comment.model.js'; // Adjust the path as necessary
import {timeAgo}  from '../utils/timeago.js';
import stream from 'stream';
import cloudinary from '../utils/cloudinary.js';

// Create a new thread
export const createThread = async (req, res) => {
    try {

        // Destructuring data from the request body
        const { title, content, author, tags, community } = req.body;
        const image = req.file;

        // Basic validation of required fields
        if (!title || !author) {
            return res.status(400).json({ error: 'Title and author are required fields.' });
        }
        // Prepare image data if an image is provided
        let imageData = null;
        if (image) {
            const bufferStream = new stream.PassThrough();
            bufferStream.end(image.buffer);

            // Upload image to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                bufferStream.pipe(cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }));
            });

            // Set image data (url and public_id)
            imageData = {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            };
        }

        // Create a new thread object with the provided data
        const newThread = new Thread({
            title,
            content: content || null,  // If no content, set to null
            author,
            tags: tags || [],  // Default to an empty array if no tags are provided
            community,  // Community field
            image: imageData || [],  // Add image data if available, otherwise null
            createdAt: new Date(),  // Add a timestamp for when the thread is created
        });

        // Save the new thread to the database
        await newThread.save();

        // Return a success response with the new thread data
        res.status(201).json({ message: 'Thread created successfully', thread: newThread });
    } catch (err) {
        // Handle any errors (e.g., database issues, image upload errors)
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const getAllThreads = async (req, res) => {
    console.log('Getting all threads');
    try {
        const threads = await Thread.find().populate('author', 'fullName profilePic').sort({ createdAt: -1 })
        const threadsWithTimeAgo = threads.map(thread => {
            return {
                ...thread._doc,
                timeAgo: timeAgo(thread.createdAt)
            };
        });

        res.status(200).json(threadsWithTimeAgo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get thread by ID
export const getThreadById = async (req, res) => {
    const userId = req.user._id;
    try {
        const thread = await Thread.findById(req.params.id).populate('author', 'username');
        if (!thread) return res.status(404).json({ message: 'Thread not found' });
        res.status(200).json(thread);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getThreadByProfile = async (req, res) => {
    const userId = req.params.id;
    try {
        const threads = await Thread.find({ author: userId }).populate('author', 'fullName profilePic').sort({ createdAt: -1 })
        if (threads.length === 0) return res.status(200).json({ message: 'No threads found for this user' });
        res.status(200).json(threads);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update thread
export const updateThread = async (req, res) => {
    try {
        const updatedThread = await Thread.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedThread) return res.status(404).json({ message: 'Thread not found' });
        res.status(200).json(updatedThread);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete thread
export const deleteThread = async (req, res) => {
    try {
        const deletedThread = await Thread.findByIdAndDelete(req.params.id);
        if (!deletedThread) return res.status(404).json({ message: 'Thread not found' });
        res.status(200).json({ message: 'Thread deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const upvoteThread = async (req, res) => {
    const threadId = req.params.id;
    const userId = req.user._id;

    try {
        const thread = await Thread.findById(threadId);

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        // Check if the user has already liked the post
        const likedIndex = thread.upvotes.indexOf(userId);
        const downvotedIndex = thread.downvotes.indexOf(userId);

        if (likedIndex === -1 && downvotedIndex === -1) {
            // User hasn't liked the post yet, add them to the likes array
            thread.upvotes.push(userId);
        }
        else if (downvotedIndex !== -1) {
            // User has downvoted, remove them from the downvotes array
            thread.downvotes.splice(downvotedIndex, 1);
            thread.upvotes.push(userId);
        }
         else {
            // User has already liked the post, remove them from the likes array
            thread.upvotes.splice(likedIndex, 1);
        }

        await thread.save(); // Save the updated thread

        return res.status(200).json(thread); // Return the updated thread
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const downvoteThread = async (req, res) => {
    const threadId = req.params.id;
    const userId = req.user._id;

    try {
        const thread = await Thread.findById(threadId);

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        const downvotedIndex = thread.downvotes.indexOf(userId);
        const likedIndex = thread.upvotes.indexOf(userId);

        if (downvotedIndex === -1 && likedIndex === -1) {
            // User hasn't downvoted yet
            thread.downvotes.push(userId);
        }

        else if (likedIndex !== -1) {
                // User has upvoted, remove them from upvotes
                thread.upvotes.splice(likedIndex, 1);
                thread.downvotes.push(userId);
            }
        else {
            // User has already downvoted, remove them from downvotes
            thread.downvotes.splice(downvotedIndex, 1);
        }

        await thread.save(); // Save the updated thread

        return res.status(200).json(thread); // Return the updated thread
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
