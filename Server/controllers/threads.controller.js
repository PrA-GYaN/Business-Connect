import Thread from '../models/thread.model.js'; // Adjust the path as necessary
import Comment from '../models/comment.model.js'; // Adjust the path as necessary
import timeAgo  from '../utils/timeago.js';
// Create a new thread
export const createThread = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const newThread = new Thread({ title, content, author });
        await newThread.save();
        console.log(newThread);
        res.status(201).json(newThread);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
    try {
        const thread = await Thread.findById(req.params.id).populate('author', 'username');
        if (!thread) return res.status(404).json({ message: 'Thread not found' });
        res.status(200).json(thread);
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
