// src/Components/Feed.js

import React from 'react';
import './Feed.css';
import { useAuthContext } from '../Context/AuthContext';
import Loader from '../Components/Loader';
import useFeed from '../Hooks/useFeed';

const Feed = () => {
    const { authUser, profilePic } = useAuthContext();
    const {
        posts,
        loading,
        error,
        handleLike,
        handleCommentChange,
        handleCommentSubmit,
        toggleComments,
        visibleComments,
        newComment,
        commentLoading,
    } = useFeed();

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="post-container" aria-live="polite">
            {posts.map(post => (
                <div key={post._id} className="post-box">
                    <div className="author">
                        <div className="profile-photo" style={{ backgroundImage: `url(${post.image[0].url})` }}></div>
                        <span className='fullname'>{post.authorId.fullName}</span>
                    </div>
                    <p>{post.content}</p>
                    {post.image && (
                        <div className="post-image" style={{ backgroundImage: `url(${post.image[0].url})` }}></div>
                    )}
                    <div className="interactions">
                        <div className="i-btns">
                            <div className={`interaction-btn ${post.likes.includes(authUser) ? 'liked' : 'like'}`} onClick={() => handleLike(post._id)}>
                                {post.likes.length} Like 
                            </div>
                            <div className='interaction-btn comment' onClick={() => toggleComments(post._id)}>
                                {visibleComments[post._id] ? 'Hide Comments' : 'Show Comments'}
                            </div>
                        </div>
                        {visibleComments[post._id] && (
                            <div className="comments-section active">
                                <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
                                    <div className="comment-photo" style={{ backgroundImage: `url(${profilePic})`}}></div>
                                    <input 
                                        type="text" 
                                        value={newComment[post._id] || ''} 
                                        onChange={(e) => handleCommentChange(post._id, e.target.value)} 
                                        placeholder="Add a comment"
                                        className="input"
                                        aria-label="Add a comment"
                                    />
                                    <button type="submit" className='post-btn' disabled={commentLoading[post._id]}>
                                        {commentLoading[post._id] ? 'Posting...' : 'Post'}
                                    </button>
                                </form>
                                {post.comments && post.comments.map((comment, index) => (
                                    <div key={index} className='comment-box'>
                                        <div className="comment-photo" style={{ backgroundImage: `url(${comment.userId.profilePic})`, marginTop: '0.5rem' }}></div>
                                        <div className="comment-body">
                                            <span className='fullname'>{comment.userId.fullName}</span>
                                            <span>{comment.content}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Feed;