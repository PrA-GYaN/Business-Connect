import Comment from '../models/comment.model.js';
import Thread from '../models/thread.model.js';
import {timeAgo} from '../utils/timeAgo.js';

export const createComment = async (req, res) => {
    try {
        const { content, author, threadId, parentCommentId, type } = req.body;

        // Basic validation
        if (!content || !author || !threadId) {
            return res.status(400).json({ error: 'Content, author, and threadId are required.' });
        }

        const newComment = new Comment({ content, author, thread: threadId, type });
        await newComment.save();
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: newComment._id } });
        } else {
            await Thread.findByIdAndUpdate(threadId, { $push: { comments: newComment._id } });
        }

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'An error occurred while creating the comment.' });
    }
};

export const getCommentsByThreadId = async (req, res) => {
    try {
        const comments = await Comment.find({ thread: req.params.threadId })
            .populate('author', 'fullName profilePic')
            .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: 'fullName profilePic',
                },
            });
            const commentsWithTimeAgo = comments.map(comment => {
                return {
                    ...comment._doc,
                    timeAgo: timeAgo(comment.createdAt)
                };
            });

        res.status(200).json(commentsWithTimeAgo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update comment
export const updateComment = async (req, res) => {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedComment) return res.status(404).json({ message: 'Comment not found' });
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if (!deletedComment) return res.status(404).json({ message: 'Comment not found' });

        // Optionally, remove the comment reference from the thread
        await Thread.findByIdAndUpdate(deletedComment.thread, { $pull: { comments: deletedComment._id } });

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const upvoteComment = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user._id;

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the user has already liked the comment
        const likedIndex = comment.upvotes.indexOf(userId);
        const downvotedIndex = comment.downvotes.indexOf(userId);

        if (likedIndex === -1 && downvotedIndex === -1) {
            comment.upvotes.push(userId);
        } else if (downvotedIndex !== -1) {
            comment.downvotes.splice(downvotedIndex, 1);
            comment.upvotes.push(userId);
        } else {
            comment.upvotes.splice(likedIndex, 1);
        }

        await comment.save();
        return res.status(200).json(comment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const downvoteComment = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user._id;

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const downvotedIndex = comment.downvotes.indexOf(userId);
        const likedIndex = comment.upvotes.indexOf(userId);

        if (downvotedIndex === -1 && likedIndex === -1) {
            comment.downvotes.push(userId);
        } else if (likedIndex !== -1) {
            comment.upvotes.splice(likedIndex, 1);
            comment.downvotes.push(userId);
        } else {
            comment.downvotes.splice(downvotedIndex, 1);
        }

        await comment.save();
        return res.status(200).json(comment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};