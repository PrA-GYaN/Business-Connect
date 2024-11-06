import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../Context/AuthContext';
import Loader from '../Components/Loader';
import styles from '../Styles/Threads.module.css';
import Navbar from '../Components/Navbar';
import { TiArrowUpOutline, TiArrowUpThick, TiArrowDownOutline, TiArrowDownThick } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";
import CreateThread from '../Components/CreateThread';

const ThreadList = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authUser } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await axios.get('http://localhost:5000/threads/getall');
                const data = Array.isArray(response.data) ? response.data : [];
                setThreads(data);
            } catch (error) {
                console.error('Error fetching threads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, []);

    const handleUpvote = async (e, threadId) => {
        e.stopPropagation();
        try {
            const response = await axios.post(`http://localhost:5000/threads/upvote/${threadId}`, {}, {
                withCredentials: true,
            });
            setThreads((prevThreads) =>
                prevThreads.map((thread) =>
                    thread._id === threadId
                        ? { ...thread, upvotes: response.data.upvotes, downvotes: response.data.downvotes }
                        : thread
                )
            );
        } catch (error) {
            console.error('Error upvoting thread:', error);
        }
    };

    const handleDownvote = async (e, threadId) => {
        e.stopPropagation();
        try {
            const response = await axios.post(`http://localhost:5000/threads/downvote/${threadId}`, {}, {
                withCredentials: true,
            });
            setThreads((prevThreads) =>
                prevThreads.map((thread) =>
                    thread._id === threadId
                        ? { ...thread, upvotes: response.data.upvotes, downvotes: response.data.downvotes }
                        : thread
                )
            );
        } catch (error) {
            console.error('Error downvoting thread:', error);
        }
    };

    const calculateTotalVotes = (upvotes, downvotes) => {
        return upvotes.length - downvotes.length;
    };

    const hasUpvoted = (thread) => {
        return thread.upvotes.includes(authUser);
    };

    const hasDownvoted = (thread) => {
        return thread.downvotes.includes(authUser);
    };

    if (loading) { return <Loader />; }

    return (
        <>
            <Navbar />
            <div className={styles.threadBox}>
                <div className={styles.threadContainer}>
                    <div className={styles.leftPanel}>
                        Home
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
                                                        backgroundImage: `url(${thread.author.profilePic[0].url})`
                                                    }}
                                                ></div>
                                                <p className={styles.fullName}>{thread.author.fullName}</p>
                                                <p className={styles.timeAgo}>{thread.timeAgo}</p>
                                            </div>
                                            <div className={styles.title}>{thread.title}</div>
                                            <p className={styles.content}>{thread.content}</p>
                                            <div className={styles.interactions}>
                                                <div className={styles.voteButtons}>
                                                    {hasUpvoted(thread) ? (
                                                        <TiArrowUpThick
                                                            onClick={(e) => handleUpvote(e, thread._id)}
                                                            className={`${styles.upvoteButton} ${styles.active}`}
                                                            disabled
                                                        />
                                                    ) : (
                                                        <TiArrowUpOutline
                                                            onClick={(e) => handleUpvote(e, thread._id)}
                                                            className={styles.upvoteButton}
                                                        />
                                                    )}
                                                    <p className={styles.voteCount}>
                                                        {calculateTotalVotes(thread.upvotes, thread.downvotes)}
                                                    </p>
                                                    {hasDownvoted(thread) ? (
                                                        <TiArrowDownThick
                                                            onClick={(e) => handleDownvote(e, thread._id)}
                                                            className={`${styles.downvoteButton} ${styles.active}`}
                                                            disabled
                                                        />
                                                    ) : (
                                                        <TiArrowDownOutline
                                                            onClick={(e) => handleDownvote(e, thread._id)}
                                                            className={styles.downvoteButton}
                                                        />
                                                    )}
                                                </div>
                                                <div className={styles.comment}>
                                                    <FaRegComment className={styles.commentBtn}/>
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