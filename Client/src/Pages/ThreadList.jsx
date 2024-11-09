import React from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../Components/Loader';
import styles from '../Styles/Threads.module.css';
import Navbar from '../Components/Navbar';
import { TiArrowUpOutline, TiArrowUpThick, TiArrowDownOutline, TiArrowDownThick } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";
import useThread from '../Hooks/useThread';

const ThreadList = () => {
    const navigate = useNavigate();
    const { threads, loading, handleVote, hasUpvoted, hasDownvoted, calculateTotalVotes } = useThread();

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Navbar />
            <div className={styles.threadBox}>
                <div className={styles.threadContainer}>
                    <div className={styles.leftPanel}>
                        <div className={styles.panelHome} onClick={() => navigate('/threads')}>
                            Home
                        </div>
                        <div className={styles.createThread} onClick={() => navigate('/create')}>
                            Create
                        </div>
                    </div>
                    <div className={styles.rightPanel}>
                        {threads.length === 0 ? (
                            <p>No threads available. Be the first to create one!</p>
                        ) : (
                            <div className={styles.threads}>
                                {threads.map((thread) => (
                                    <div key={thread._id} className={styles.threadsBox}>
                                        <div
                                            className={styles.threadItem}
                                            onClick={() => navigate(`/threads/${thread._id}`)}
                                        >
                                            <div className={styles.profileinfo}>
                                                <div
                                                    className={styles.profilePic}
                                                    style={{
                                                        backgroundImage: `url(${thread.author.profilePic[0]?.url})`
                                                    }}
                                                ></div>
                                                <p className={styles.fullName}>{thread.author.fullName}</p>
                                                <p className={styles.timeAgo}>{thread.timeAgo}</p>
                                            </div>
                                            <div className={styles.title}>{thread.title}</div>
                                            {thread.content ? (
                                                <div className={styles.content}>{thread.content}</div>
                                            ) :null}

                                            {thread.image && thread.image.length > 0 && (
                                                <div
                                                    className={styles.image}
                                                    style={{ backgroundImage: `url(${thread.image[0]?.url})` }}
                                                />
                                            )}

                                            <div className={styles.interactions}>
                                                <div className={styles.voteButtons}>
                                                    {hasUpvoted(thread) ? (
                                                        <TiArrowUpThick
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`${styles.upvoteButton} ${styles.active}`}
                                                            
                                                        />
                                                    ) : (
                                                        <TiArrowUpOutline
                                                            onClick={(e) => { e.stopPropagation(); handleVote(thread._id, 'upvote'); }}
                                                            className={styles.upvoteButton}
                                                        />
                                                    )}
                                                    <p className={styles.voteCount}>
                                                        {calculateTotalVotes(thread.upvotes, thread.downvotes)}
                                                    </p>
                                                    {hasDownvoted(thread) ? (
                                                        <TiArrowDownThick
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`${styles.downvoteButton} ${styles.active}`}
                                                        
                                                        />
                                                    ) : (
                                                        <TiArrowDownOutline
                                                            onClick={(e) => { e.stopPropagation(); handleVote(thread._id, 'downvote'); }}
                                                            className={styles.downvoteButton}
                                                        />
                                                    )}
                                                </div>
                                                <div className={styles.comment}>
                                                    <FaRegComment className={styles.commentBtn} />
                                                    <p className={styles.commentCount}>{thread.comments.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThreadList;