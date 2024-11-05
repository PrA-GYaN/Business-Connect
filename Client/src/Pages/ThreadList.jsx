import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../Context/AuthContext';
import Loader from '../Components/Loader';
import styles from '../Styles/Threads.module.css';
import Navbar from '../Components/Navbar';
import { TiArrowUpOutline } from "react-icons/ti";
import { TiArrowUpThick } from "react-icons/ti";
import { TiArrowDownOutline } from "react-icons/ti";
import { TiArrowDownThick } from "react-icons/ti";

const ThreadList = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authUser } = useAuthContext();

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await axios.get('http://localhost:5000/threads/getall');
                console.log('Fetched threads:', response.data);
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

const handleUpvote = async (threadId) => {
    try {
        const response = await axios.post(`http://localhost:5000/threads/upvote/${threadId}`, {}, {
            withCredentials: true,
        });

        setThreads((prevThreads) =>
            prevThreads.map((thread) =>
                thread._id === threadId
                    ? { ...thread, upvotes: response.data.upvotes, downvotes: response.data.downvotes } // Update both arrays
                    : thread
            )
        );
    } catch (error) {
        console.error('Error upvoting thread:', error);
    }
};

const handleDownvote = async (threadId) => {
    try {
        const response = await axios.post(`http://localhost:5000/threads/downvote/${threadId}`, {}, {
            withCredentials: true,
        });

        setThreads((prevThreads) =>
            prevThreads.map((thread) =>
                thread._id === threadId
                    ? { ...thread, upvotes: response.data.upvotes, downvotes: response.data.downvotes } // Update both arrays
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

const hasUpvoted = (thread) => 
{
    console.log("Checked if upvoted");
    thread.upvotes.includes(authUser);
};
const hasDownvoted = (thread) => {
    console.log("Checked if downvoted");
    thread.downvotes.includes(authUser);
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
                        { threads.length === 0 ? (
                            <p>No threads available. Be the first to create one!</p>
                        ) : (
                            <div className={styles.threads}>
                                {threads.map((thread) => (
                                    <div className={styles.threadsBox}>
                                        <div key={thread._id} className={styles.threadItem}>
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
                                            <Link to={`/threads/${thread._id}`} className={styles.links}>
                                                <div className={styles.title}>{thread.title}</div>
                                            </Link>
                                            <p className={styles.content}>{thread.content}</p>
                                            <div className={styles.interactions}>
                                                <div className={styles.voteButtons}>
                                                    <TiArrowUpOutline
                                                        onClick={() => handleUpvote(thread._id)}
                                                        className={`${styles.upvoteButton} ${hasUpvoted(thread) ? styles.active : ''}`}
                                                        disabled={hasUpvoted(thread)}
                                                    >
                                                        Upvote
                                                    </TiArrowUpOutline>
                                                    <p className={styles.voteCount}>
                                                        {calculateTotalVotes(thread.upvotes, thread.downvotes)}
                                                    </p>
                                                    <TiArrowDownOutline
                                                        onClick={() => handleDownvote(thread._id)}
                                                        className={`${styles.downvoteButton} ${hasDownvoted(thread) ? styles.active : ''}`}
                                                        disabled={hasDownvoted(thread)}
                                                    >
                                                        Downvote
                                                    </TiArrowDownOutline>
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