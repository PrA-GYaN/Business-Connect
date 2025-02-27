import React, { useEffect, useRef, useState } from 'react';
import styles from '../Styles/Feed.module.css'; // Import the CSS module
import { useAuthContext } from '../Context/AuthContext';
import Loader from '../Components/Loader';
import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import useFeed from '../Hooks/useFeed';

const Feed = ({prop}) => {
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
        loadMorePosts,
        hasMore,
    } = useFeed();

    // const [filterKeyword, setFilterKeyword] = useState('');
    const observerRef = useRef();
    const filterKeyword = prop;
    console.log(filterKeyword);
    const filteredPosts = posts.filter(post => {
        const contentMatch = post.content?.toLowerCase().includes(filterKeyword.toLowerCase());
        const authorMatch = post.authorId.fullName.toLowerCase().includes(filterKeyword.toLowerCase());
        return contentMatch || authorMatch;
    });

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePosts();
            }
        });

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [loading, hasMore]);

    if (error) return <p>{error}</p>;

    return (
        <div className={styles.postContainer} aria-live="polite">
            {/* Filter Input */}
            {/* <div className={styles.filterContainer}>
                <input
                    type="text"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    placeholder="Filter posts by content or author"
                    className={styles.filterInput}
                    aria-label="Filter posts"
                />
            </div> */}
            {
                filteredPosts.length === 0 && !loading && <p className={styles.noPosts}>No posts to show</p>
            }
            {

            }
            {filteredPosts.map((post) => (
                <div key={post._id} className={styles.postBox}>
                    <div className={styles.author}>
                        <div 
                            className={styles.profilePhoto} 
                            style={{ backgroundImage: `url(${post.authorId.profilePic[0].url})` }} 
                        />
                        <span className={styles.fullname}>{post.authorId.fullName}</span>
                    </div>
                    {post.content && <p className={styles.contentBox}>{post.content}</p>}
                    {post.image && post.image.length > 0 && (
                        <div 
                            className={styles.postImage} 
                            style={{ backgroundImage: `url(${post.image[0].url})` }} 
                        />
                    )}
                    <div className={styles.interactions}>
                        <div className={styles.iBtns}>
                            <div 
                                className={`${styles.interactionBtn} ${post.likes.includes(authUser) ? styles.liked : ''}`} 
                                onClick={() => handleLike(post._id)}
                            >
                                {post.likes.includes(authUser) ? <AiFillLike className={styles.icon}/> : <AiOutlineLike className={styles.icon}/>} {post.likes.length} Like 
                            </div>
                            <div className={styles.interactionBtn} onClick={() => toggleComments(post._id)}>
                                {visibleComments[post._id] ? 'Hide Comments' : 'Show Comments'}
                            </div>
                        </div>
                        {visibleComments[post._id] && (
                            <div className={`${styles.commentsSection} ${styles.active}`}>
                                <form className={styles.commentBox} onSubmit={(e) => handleCommentSubmit(post._id, e)}>
                                    <div 
                                        className={styles.commentPhoto} 
                                        style={{ backgroundImage: `url(${profilePic})` }} 
                                    />
                                    <input 
                                        type="text" 
                                        value={newComment[post._id] || ''} 
                                        onChange={(e) => handleCommentChange(post._id, e.target.value)} 
                                        placeholder="Add a comment"
                                        className={styles.input}
                                        aria-label="Add a comment"
                                    />
                                    <button type="submit" className={styles.postBtn} disabled={commentLoading[post._id]}>
                                        {commentLoading[post._id] ? 'Posting...' : 'Post'}
                                    </button>
                                </form>
                                {post.comments && post.comments.map((comment, index) => (
                                    <div key={index} className={styles.commentBox}>
                                        <div 
                                            className={styles.commentPhoto} 
                                            style={{ backgroundImage: `url(${comment.userId.profilePic[0].url})`, marginTop: '0.5rem' }} 
                                        />
                                        <div className={styles.commentBody}>
                                            <span className={styles.fullname}>{comment.userId.fullName}</span>
                                            <span>{comment.content}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div ref={observerRef} style={{ height: '20px' }} />
        </div>
    );
};

export default Feed;