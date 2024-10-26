// src/hooks/useComments.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const useComments = (threadId, authUser, fullName) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyContent, setReplyContent] = useState({});
    const [openReply, setOpenReply] = useState(null);
    const [visibleReplies, setVisibleReplies] = useState({});

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/comment/getbyid/${threadId}`);
                setComments(response.data);
            } catch (err) {
                console.error('Error fetching comments:', err);
                setError('Could not load comments. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [threadId]);

    const handleCommentSubmit = async (content) => {
        if (!content.trim()) return;

        const newComment = { content, author: authUser, threadId };
        const optimisticComment = {
            _id: Date.now(), // Temporary ID
            content,
            author: { username: fullName },
            upvotes: [],
            downvotes: [],
            replies: []
        };

        setComments([optimisticComment, ...comments]);

        try {
            const response = await axios.post('http://localhost:5000/comment/create', newComment, { withCredentials: true });
            setComments(prevComments =>
                prevComments.map(comment =>
                    comment._id === optimisticComment._id
                        ? { ...comment, _id: response.data._id }
                        : comment
                )
            );
        } catch (error) {
            console.error('Error creating comment:', error);
            setError('Could not post comment. Please try again.');
            setComments(prevComments => prevComments.filter(comment => comment._id !== optimisticComment._id));
        }
    };

    const handleReplyToggle = (commentId) => {
        setOpenReply(openReply === commentId ? null : commentId);
    };

    const handleReplySubmit = async (e, parentCommentId) => {
        e.preventDefault();
        if (!replyContent[parentCommentId]?.trim()) return;

        const newReply = { content: replyContent[parentCommentId], author: authUser, threadId, parentCommentId, type: 'reply' };
        const optimisticReply = {
            _id: Date.now(), // Temporary ID
            content: replyContent[parentCommentId],
            author: { username: fullName },
            upvotes: [],
            downvotes: []
        };

        setComments(prevComments =>
            prevComments.map(comment =>
                comment._id === parentCommentId
                    ? { ...comment, replies: [...comment.replies, optimisticReply] }
                    : comment
            )
        );

        setReplyContent(prev => ({ ...prev, [parentCommentId]: '' }));
        setOpenReply(null);

        try {
            const response = await axios.post('http://localhost:5000/comment/create', newReply, { withCredentials: true });
            setComments(prevComments =>
                prevComments.map(comment =>
                    comment._id === parentCommentId
                        ? {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply._id === optimisticReply._id
                                    ? { ...reply, _id: response.data._id }
                                    : reply
                            )
                        }
                        : comment
                )
            );
        } catch (error) {
            console.error('Error creating reply:', error);
            setError('Could not post reply. Please try again.');
            setComments(prevComments => prevComments.map(comment =>
                comment._id === parentCommentId
                    ? { ...comment, replies: comment.replies.filter(reply => reply._id !== optimisticReply._id) }
                    : comment
            ));
        }
    };

    const handleVote = async (commentId, type) => {
        const isUpvote = type === 'upvote';
        const comment = comments.find(comment => comment._id === commentId);
        const hasUpvoted = comment?.upvotes.includes(authUser);
        const hasDownvoted = comment?.downvotes.includes(authUser);

        try {
            const url = `http://localhost:5000/comment/${isUpvote ? 'upvote' : 'downvote'}/${commentId}`;
            await axios.post(url, {}, { withCredentials: true });

            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment._id !== commentId) return comment;

                    let updatedUpvotes = [...comment.upvotes];
                    let updatedDownvotes = [...comment.downvotes];

                    if (isUpvote) {
                        if (hasUpvoted) {
                            updatedUpvotes = updatedUpvotes.filter(user => user !== authUser);
                        } else {
                            if (hasDownvoted) {
                                updatedDownvotes = updatedDownvotes.filter(user => user !== authUser);
                            }
                            updatedUpvotes.push(authUser);
                        }
                    } else {
                        if (hasDownvoted) {
                            updatedDownvotes = updatedDownvotes.filter(user => user !== authUser);
                        } else {
                            if (hasUpvoted) {
                                updatedUpvotes = updatedUpvotes.filter(user => user !== authUser);
                            }
                            updatedDownvotes.push(authUser);
                        }
                    }

                    return {
                        ...comment,
                        upvotes: updatedUpvotes,
                        downvotes: updatedDownvotes,
                    };
                })
            );
        } catch (error) {
            console.error(`Error ${type} comment:`, error);
        }
    };

    const handleReplyVisibilityToggle = (commentId) => {
        setVisibleReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    return {
        comments,
        loading,
        error,
        handleCommentSubmit,
        handleReplySubmit,
        handleVote,
        handleReplyToggle,
        handleReplyVisibilityToggle,
        openReply,
        setReplyContent,
        replyContent,
        visibleReplies,
    };
};

export default useComments;