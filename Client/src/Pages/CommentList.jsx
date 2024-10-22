import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../Context/AuthContext';
import Loader from '../Components/Loader';

const CommentList = () => {
    const { authUser, fullName } = useAuthContext();
    const { threadId } = useParams();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState({});
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openReply, setOpenReply] = useState(null);
    const [visibleReplies, setVisibleReplies] = useState({});

    useEffect(() => {
        const fetchThreadAndComments = async () => {
            setLoading(true);
            setError(null);
            try {
                const threadResponse = await axios.get(`http://localhost:5000/thread/getbyid/${threadId}`);
                setThread(threadResponse.data);

                const commentsResponse = await axios.get(`http://localhost:5000/comment/getbyid/${threadId}`);
                console.log(commentsResponse.data);
                setComments(commentsResponse.data);
            } catch (error) {
                console.error('Error fetching thread or comments:', error);
                setError('Could not load thread or comments. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchThreadAndComments();
    }, [threadId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        setContent('');

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
            // Rollback optimistic update
            setComments(prevComments => prevComments.filter(comment => comment._id !== optimisticComment._id));
        }
    };

    const handleReplyToggle = (commentId) => {
        setOpenReply(openReply === commentId ? null : commentId);
    };

    const handleReplyVisibilityToggle = (commentId) => {
        setVisibleReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const handleReplySubmit = async (e, parentCommentId) => {
        e.preventDefault();
        if (!replyContent[parentCommentId]?.trim()) return;

        const newReply = { content: replyContent[parentCommentId], author: authUser, threadId, parentCommentId,type:'reply' };
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
            // Rollback optimistic update
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
            // Send the vote to the server
            const url = `http://localhost:5000/comment/${isUpvote ? 'upvote' : 'downvote'}/${commentId}`;
            await axios.post(url, {}, { withCredentials: true });
    
            console.log("Setting up Comment");
    
            // Update the local state
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment._id !== commentId) return comment;
    
                    let updatedUpvotes = [...comment.upvotes];
                    let updatedDownvotes = [...comment.downvotes];
    
                    if (isUpvote) {
                        if (hasUpvoted) {
                            // User already upvoted, remove their upvote
                            updatedUpvotes = updatedUpvotes.filter(user => user !== authUser);
                        } else {
                            // User is downvoting or has not voted yet
                            if (hasDownvoted) {
                                // Remove downvote
                                updatedDownvotes = updatedDownvotes.filter(user => user !== authUser);
                            }
                            // Add upvote
                            updatedUpvotes.push(authUser);
                        }
                    } else {
                        if (hasDownvoted) {
                            // User already downvoted, remove their downvote
                            updatedDownvotes = updatedDownvotes.filter(user => user !== authUser);
                        } else {
                            // User is upvoting or has not voted yet
                            if (hasUpvoted) {
                                // Remove upvote
                                updatedUpvotes = updatedUpvotes.filter(user => user !== authUser);
                            }
                            // Add downvote
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
    

    const handleThreadVote = async (type) => {
        const isUpvote = type === 'upvote';
        const hasUpvoted = thread?.upvotes?.includes(authUser);
        const hasDownvoted = thread?.downvotes?.includes(authUser);
    
        try {
            const url = `http://localhost:5000/thread/${isUpvote ? 'upvote' : 'downvote'}/${threadId}`;
            await axios.post(url, { userId: authUser }, { withCredentials: true });
    
            setThread(prevThread => {
                let updatedUpvotes = [...prevThread.upvotes];
                let updatedDownvotes = [...prevThread.downvotes];
    
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
                    ...prevThread,
                    upvotes: updatedUpvotes,
                    downvotes: updatedDownvotes,
                };
            });
        } catch (error) {
            console.error(`Error ${type} thread:`, error);
        }
    };
    

    if (loading) return <Loader />;
    if (error) return <div>{error}</div>;
    if (!thread) return <div>Thread not found.</div>;

    return (
        <div>
            <h1>{thread.title}</h1>
            <p>{thread.content}</p>
            <p>Author: {thread.author.username}</p>
            <p>Votes: {(thread.upvotes?.length || 0) - (thread.downvotes?.length || 0)}</p>
            <button onClick={() => handleThreadVote('upvote')} aria-label="Upvote thread">Upvote</button>
            <button onClick={() => handleThreadVote('downvote')} aria-label="Downvote thread">Downvote</button>
            <h2>Comments</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Add a comment"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button type="submit">Add Comment</button>
            </form>
            <ul>
                {comments.map((comment) => {
                    const commentVotes = (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);
                    return (
                        <li key={comment._id}>
                            {comment.type === 'reply'?
                            (<></>)
                            :
                                (
                                    <>
                                    <p>{comment.content}</p>
                            <p>Author: {comment.author.username}</p>
                            <p>Votes: {commentVotes}</p>
                            <button onClick={() => handleVote(comment._id, 'upvote')} aria-label="Upvote comment">Upvote</button>
                            <button onClick={() => handleVote(comment._id, 'downvote')} aria-label="Downvote comment">Downvote</button>
                            <p>{comment.replies.length} Replies</p>
                            <button onClick={() => handleReplyVisibilityToggle(comment._id)}>
                                {visibleReplies[comment._id] ? 'Hide Replies' : 'Show Replies'}
                            </button>
                            <button onClick={() => handleReplyToggle(comment._id)}>
                                {openReply === comment._id ? 'Cancel' : 'Reply'}
                            </button>
                            {openReply === comment._id && (
                                <form onSubmit={(e) => handleReplySubmit(e, comment._id)}>
                                    <textarea
                                        placeholder="Add a reply"
                                        value={replyContent[comment._id] || ''}
                                        onChange={(e) => setReplyContent(prev => ({ ...prev, [comment._id]: e.target.value }))} 
                                        required
                                    />
                                    <button type="submit">Reply</button>
                                </form>
                            )}
                            {visibleReplies[comment._id] && comment.replies.length > 0 && (
                                <ul>
                                    {comment.replies.map(reply => {
                                        const replyVotes = (reply.upvotes?.length || 0) - (reply.downvotes?.length || 0);
                                        return (
                                            <li key={reply._id}>
                                                <p>{reply.content}</p>
                                                <p>Author: {reply.author.username}</p>
                                                <p>Votes: {replyVotes}</p>
                                                <button onClick={() => handleVote(reply._id, 'upvote')} aria-label="Upvote reply">Upvote</button>
                                                <button onClick={() => handleVote(reply._id, 'downvote')} aria-label="Downvote reply">Downvote</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                                    </>
                                )
                            }
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default CommentList;