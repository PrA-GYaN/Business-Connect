// src/Components/CommentList.js

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../Context/AuthContext';
import useComments from '../Hooks/useComments';
import Loader from '../Components/Loader';

const CommentList = () => {
    const { authUser, fullName } = useAuthContext();
    const { threadId } = useParams();
    
    const {
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
    } = useComments(threadId, authUser, fullName);

    if (loading) return <Loader />;
    if (error) return <div>{error}</div>;
    if (!comments) return <div>No comments found.</div>;

    return (
        <div>
            <h2>Comments</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(e.target.elements.content.value); e.target.reset(); }}>
                <textarea name="content" placeholder="Add a comment" required />
                <button type="submit">Add Comment</button>
            </form>
            <ul>
                {comments.map((comment) => (
                    <li key={comment._id}>
                        <p>{comment.content}</p>
                        <p>Author: {comment.author.username}</p>
                        <p>Votes: {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}</p>
                        <button onClick={() => handleVote(comment._id, 'upvote')}>Upvote</button>
                        <button onClick={() => handleVote(comment._id, 'downvote')}>Downvote</button>
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
                                {comment.replies.map(reply => (
                                    <li key={reply._id}>
                                        <p>{reply.content}</p>
                                        <p>Author: {reply.author.username}</p>
                                        <p>Votes: {(reply.upvotes?.length || 0) - (reply.downvotes?.length || 0)}</p>
                                        <button onClick={() => handleVote(reply._id, 'upvote')}>Upvote</button>
                                        <button onClick={() => handleVote(reply._id, 'downvote')}>Downvote</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentList;