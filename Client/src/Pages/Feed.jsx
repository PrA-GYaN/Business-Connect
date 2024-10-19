import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Feed.css';
import { useAuthContext } from '../Context/AuthContext';

const Feed = () => {
    const { authUser } = useAuthContext();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState({});
    const [visibleComments, setVisibleComments] = useState({});

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/posts/getposts');
                setPosts(data);
            } catch (err) {
                setError('Error fetching posts: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleLike = async (postId) => {
        setPosts(prevPosts => prevPosts.map(post => {
            if (post._id === postId) {
                const isLiked = post.likes.includes(authUser);
                const newLikes = isLiked 
                    ? post.likes.filter(userId => userId !== authUser) 
                    : [...post.likes, authUser];
                return { ...post, likes: newLikes };
            }
            return post;
        }));

        try {
            const { data } = await axios.post(`http://localhost:5000/posts/like/${postId}`, {}, {
                withCredentials: true,
            });
            setPosts(prevPosts => prevPosts.map(post => 
                post._id === postId ? { ...post, likes: data.likes } : post
            ));
        } catch (err) {
            console.error('Error liking post:', err);
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    const newLikes = post.likes.includes(authUser) 
                        ? post.likes.filter(userId => userId !== authUser) 
                        : [...post.likes, authUser];
                    return { ...post, likes: newLikes }; // Revert to previous state
                }
                return post;
            }));
        }
    };

    const handleCommentChange = (postId, value) => {
        setNewComment(prev => ({ ...prev, [postId]: value }));
    };

    const handleCommentSubmit = async (postId, e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`http://localhost:5000/posts/comment/${postId}`, { content: newComment[postId] }, {
                withCredentials: true,
            });
            setPosts(prevPosts => prevPosts.map(post => 
                post._id === postId ? { ...post, comments: [...post.comments, data] } : post
            ));
            setNewComment(prev => ({ ...prev, [postId]: '' }));
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const toggleComments = (postId) => {
        setVisibleComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="post-container">
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
                                    <div className="comment-photo"></div>
                                    <input 
                                        type="text" 
                                        value={newComment[post._id] || ''} 
                                        onChange={(e) => handleCommentChange(post._id, e.target.value)} 
                                        placeholder="Add a comment"
                                        className="input"
                                        aria-label="Add a comment"
                                    />
                                    <button type="submit" className='post-btn'>Post</button>
                                </form>
                                {post.comments && post.comments.map(comment => (
                                    <div key={comment._id} className='comment-box'>
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