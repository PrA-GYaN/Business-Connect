import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../Components/Loader';
import styles from '../Styles/Threads.module.css';
import { TiArrowUpOutline, TiArrowUpThick, TiArrowDownOutline, TiArrowDownThick } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";
import useThread from '../Hooks/useThread';

const communities = [
    'Technology', 'Healthcare', 'Finance', 'Education',
    'Retail', 'Manufacturing', 'Hospitality', 'Real Estate',
    'Transportation', 'Non-Profit'
];

const ExploreThread = () => {
    const navigate = useNavigate();
    const { threads, loading, handleVote, hasUpvoted, hasDownvoted, calculateTotalVotes } = useThread();
    const [selectedCommunity, setSelectedCommunity] = useState(null);

    const handleCommunitySelect = (community) => {
        setSelectedCommunity(community);
        console.log("Selected Community:",community);
    };
    const community = () => {
        threads.map((thread) => {
            console.log("Community:",thread.community);
        });
    }
    community();
    const filteredThreads = selectedCommunity
    ? threads.filter((thread) => thread.community.toLowerCase() === selectedCommunity.toLowerCase())
    : threads;

    console.log("Filtered Threads:",filteredThreads);    
    if (loading) {
        return <Loader />;
    }

    return (
        <div className={styles.threadContainer}>
            <div className={styles.communityFilter}>
                <h2>Select a Community</h2>
                <div className={styles.communityButtons}>
                    {communities.map((community) => (
                        <button
                            key={community}
                            className={`${styles.communityButton} ${
                                selectedCommunity === community ? styles.active : ''
                            }`}
                            onClick={() => handleCommunitySelect(community)}
                        >
                            {community}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.rightPanel}>
                {selectedCommunity === null ? (
                    <p>Please select a community to view threads.</p>
                ) : filteredThreads.length === 0 ? (
                    <p>No threads available in the selected community. Be the first to create one!</p>
                ) : (
                    <div className={styles.threads}>
                        {filteredThreads.map((thread) => (
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
                                    {thread.content && <div className={styles.content}>{thread.content}</div>}

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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleVote(thread._id, 'upvote');
                                                    }}
                                                    className={`${styles.upvoteButton} ${styles.active}`}
                                                />
                                            ) : (
                                                <TiArrowUpOutline
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleVote(thread._id, 'upvote');
                                                    }}
                                                    className={styles.upvoteButton}
                                                />
                                            )}
                                            <p className={styles.voteCount}>
                                                {calculateTotalVotes(thread.upvotes, thread.downvotes)}
                                            </p>
                                            {hasDownvoted(thread) ? (
                                                <TiArrowDownThick
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleVote(thread._id, 'downvote');
                                                    }}
                                                    className={`${styles.downvoteButton} ${styles.active}`}
                                                />
                                            ) : (
                                                <TiArrowDownOutline
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleVote(thread._id, 'downvote');
                                                    }}
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
    );
};

export default ExploreThread;