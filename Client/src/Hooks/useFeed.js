// src/hooks/useFeed.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../Context/AuthContext';

const useFeed = () => {
    const { authUser, fullName, profilePic } = useAuthContext();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState({});
    const [visibleComments, setVisibleComments] = useState({});
    const [commentLoading, setCommentLoading] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (currentPage) => {
        try {
            const { data } = await axios.get(`https://business-connect-m6mk.onrender.com/posts/getposts?page=${currentPage}&limit=1`);
            if (data.posts.length > 0) {
                setPosts((prevPosts) => [...prevPosts, ...data.posts]); // Append new post
                setHasMore(data.hasMore);
            } else {
                setHasMore(false); // No more posts available
            }
        } catch (err) {
            setError('Error fetching posts: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    const loadMorePosts = () => {
        if (!loading && hasMore) {
            setPage((prev) => prev + 1);
        }
    }

    const handleLike = async (postId) => {
        setPosts((prevPosts) => prevPosts.map((post) => {
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
            const { data } = await axios.post(`https://business-connect-m6mk.onrender.com/posts/like/${postId}`, {}, {
                withCredentials: true,
            });
            setPosts((prevPosts) => prevPosts.map((post) => 
                post._id === postId ? { ...post, likes: data.likes } : post
            ));
        } catch (err) {
            console.error('Error liking post:', err);
            setPosts((prevPosts) => prevPosts.map((post) => {
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
        setNewComment((prev) => ({ ...prev, [postId]: value }));
    };

    const handleCommentSubmit = async (postId, e) => {
        e.preventDefault();
        const commentContent = newComment[postId]?.trim();
        if (!commentContent) return;

        setCommentLoading((prev) => ({ ...prev, [postId]: true }));

        try {
            const res = await axios.post(`https://business-connect-m6mk.onrender.com/posts/comment/${postId}`, { content: commentContent }, {
                withCredentials: true,
            });
            const newCommentData = {
                userId: {
                    profilePic:[{url:profilePic}],
                    fullName,
                },
                content: commentContent,
            };
            setPosts((prevPosts) => prevPosts.map((post) => 
                post._id === postId ? { ...post, comments: [...post.comments, newCommentData] } : post
            ));
            setNewComment((prev) => ({ ...prev, [postId]: '' }));
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment, please try again.');
        } finally {
            setCommentLoading((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const toggleComments = (postId) => {
        setVisibleComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };


    return {
        posts,
        loading,
        error,
        handleLike,
        handleCommentChange,
        handleCommentSubmit,
        toggleComments,
        visibleComments,
        newComment,
        setNewComment,
        commentLoading,
        loadMorePosts,
        hasMore,
    };
};

export default useFeed;