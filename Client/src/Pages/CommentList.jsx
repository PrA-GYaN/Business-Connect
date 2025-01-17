import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../Context/AuthContext';
import useComments from '../Hooks/useComments';
import Loader from '../Components/Loader';
import useThread from '../Hooks/useThread';
import { HiHome } from "react-icons/hi2";
import { IoCreate } from "react-icons/io5";
import { MdExplore } from "react-icons/md";
import Navbar from '../Components/Navbar';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from "react-icons/io";
import styles from '../Styles/CommentList.module.css';
import { TiArrowUpOutline, TiArrowUpThick, TiArrowDownOutline, TiArrowDownThick } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";

const CommentList = () => {
    const { authUser, fullName,profilePic } = useAuthContext();
    const { threadId } = useParams();
    const navigate = useNavigate();
    const {
        comments,
        error,
        handleCommentSubmit,
        handleReplySubmit,
        hasUpvotedComment,
        hasDownvotedComment,
        handleVoteComment,
        handleReplyToggle,
        handleReplyVisibilityToggle,
        openReply,
        setReplyContent,
        replyContent,
        visibleReplies
    } = useComments(threadId, authUser, fullName,profilePic);
    const [threadContent, setThreadContent] = useState({});
    const { loading, handleVote, hasUpvoted, hasDownvoted, getThreadById, calculateTotalVotes } = useThread();
    const [commentContent, setCommentContent] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [sortOption, setSortOption] = useState('Best');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCommentInputActive, setIsCommentInputActive] = useState(false);

    useEffect(() => {
        const fetchThreadContent = async () => {
            try {
                const data = await getThreadById(threadId);
                setThreadContent(data);
            } catch (err) {
                console.error('Error fetching thread content:', err);
            }
        };

        fetchThreadContent();
    }, [threadId]);

    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }
        
        return 'Just now';
    };

    console.log("comment replies:",comments.length);

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            action();
        }
    };

    const handleSectionChange = (section) => {
        setSelectedOption(section);
        navigate(`/${section}`);
    };

    const handleVoteInstantly = (voteType, isUpvote) => {
        const updatedThreadContent = { ...threadContent };
        
        if (isUpvote) {
            if (hasUpvoted(updatedThreadContent)) {
                updatedThreadContent.upvotes = updatedThreadContent.upvotes.filter(user => user !== authUser);
            } else {
                updatedThreadContent.upvotes.push(authUser);
                updatedThreadContent.downvotes = updatedThreadContent.downvotes.filter(user => user !== authUser);
            }
        } else {
            if (hasDownvoted(updatedThreadContent)) {
                updatedThreadContent.downvotes = updatedThreadContent.downvotes.filter(user => user !== authUser);
            } else {
                updatedThreadContent.downvotes.push(authUser);
                updatedThreadContent.upvotes = updatedThreadContent.upvotes.filter(user => user !== authUser);
            }
        }

        setThreadContent(updatedThreadContent);
        handleVote(threadContent._id, voteType);
    };

    const handleReplyVoteInstantly = (commentId, reply, voteType, isUpvote) => {
        const updatedReplies = visibleReplies[commentId].map(r => {
            if (r._id === reply._id) {
                const updatedReply = { ...r };
                if (isUpvote) {
                    if (hasUpvotedComment(updatedReply)) {
                        updatedReply.upvotes = updatedReply.upvotes.filter(user => user !== authUser);
                    } else {
                        updatedReply.upvotes.push(authUser);
                        updatedReply.downvotes = updatedReply.downvotes.filter(user => user !== authUser);
                    }
                } else {
                    if (hasDownvotedComment(updatedReply)) {
                        updatedReply.downvotes = updatedReply.downvotes.filter(user => user !== authUser);
                    } else {
                        updatedReply.downvotes.push(authUser);
                        updatedReply.upvotes = updatedReply.upvotes.filter(user => user !== authUser);
                    }
                }
                return updatedReply;
            }
            return r;
        });

        setVisibleReplies(prev => ({ ...prev, [commentId]: updatedReplies }));
        handleVoteComment(reply._id, voteType);
    };

    const renderVoteButton = (voteType, isUpvote) => (
        <>
            {isUpvote ? (
                hasUpvoted(threadContent) ? (
                    <TiArrowUpThick
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVoteInstantly('upvote', true);
                        }}
                        className={`${styles.upvoteButton} ${styles.active}`}
                    />
                ) : (
                    <TiArrowUpOutline
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVoteInstantly('upvote', true);
                        }}
                        className={styles.upvoteButton}
                    />
                )
            ) : (
                hasDownvoted(threadContent) ? (
                    <TiArrowDownThick
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVoteInstantly('downvote', false);
                        }}
                        className={`${styles.downvoteButton} ${styles.active}`}
                    />
                ) : (
                    <TiArrowDownOutline
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVoteInstantly('downvote', false);
                        }}
                        className={styles.downvoteButton}
                    />
                )
            )}
        </>
    );

    const renderVoteReplyButton = (commentId, reply, voteType, isUpvote) => (
        <>
            {isUpvote ? (
                hasUpvotedComment(reply) ? (
                    <TiArrowUpThick
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReplyVoteInstantly(commentId, reply, 'upvote', true);
                        }}
                        className={`${styles.upvoteButton} ${styles.active}`}
                    />
                ) : (
                    <TiArrowUpOutline
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReplyVoteInstantly(commentId, reply, 'upvote', true);
                        }}
                        className={styles.upvoteButton}
                    />
                )
            ) : (
                hasDownvotedComment(reply) ? (
                    <TiArrowDownThick
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReplyVoteInstantly(commentId, reply, 'downvote', false);
                        }}
                        className={`${styles.downvoteButton} ${styles.active}`}
                    />
                ) : (
                    <TiArrowDownOutline
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReplyVoteInstantly(commentId, reply, 'downvote', false);
                        }}
                        className={styles.downvoteButton}
                    />
                )
            )}
        </>
    );

    const handleSubmitComment = async () => {
        if (commentContent.trim()) {
            await handleCommentSubmit(commentContent);
            setCommentContent('');
        }
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const handleCommentInputClick = () => {
        setIsCommentInputActive(true);
    };

    const filteredComments = comments.filter(comment =>
        comment.content.toLowerCase().includes(searchQuery)
    );

    const sortedComments = filteredComments.sort((a, b) => {
        if (sortOption === 'Best') {
            return b.upvotes.length - a.upvotes.length;
        }
        if (sortOption === 'New') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    });

    const renderReplies = (commentId) => {
    };

    if (loading) return <Loader />;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!comments) return <div className={styles.noComments}>No comments found.</div>;

    return (
        <>
            <Navbar />
            <div className={styles.threadBox}>
                <div className={styles.threadContainer}>
                    <div className={styles.leftPanel}>
                        <div
                            className={`${styles.panelHome} ${selectedOption === 'Home' ? styles.active : ''}`}
                            onClick={() => handleSectionChange('threads')}
                        >
                            <span className={styles.icons}><HiHome className={styles.icon}/>Home</span>
                        </div>
                        <div
                            className={`${styles.createThread} ${selectedOption === 'Create' ? styles.active : ''}`}
                            onClick={() => handleSectionChange('Create')}
                        >
                            <span className={styles.icons}><IoCreate className={styles.icon}/>Create</span>
                        </div>
                        <div
                            className={`${styles.exploreThreads} ${selectedOption === 'Explore' ? styles.active : ''}`}
                            onClick={() => handleSectionChange('Explore')}
                        >
                            <span className={styles.icons}><MdExplore className={styles.icon}/>Explore</span>
                        </div>
                    </div>

                    <div className={styles.rightPanel}>
                        <div className={styles.rightBox}>
                            {threadContent.author && (
                                <div className={styles.threadBack}>
                                    <IoMdArrowBack className={styles.backIcon} onClick={() => navigate('/threads')} />
                                    <div className={styles.titleContent}>
                                        <div className={styles.titleGroup}>
                                            <div
                                                className={styles.profilePhoto}
                                                style={{ backgroundImage: `url(${threadContent.author.profilePic[0].url})` }}
                                            />
                                            <div>
                                                <div className={styles.threadAuthor}>{threadContent.author.fullName}</div>
                                                <div className={styles.threadCommunity}>{threadContent.community.charAt(0).toUpperCase() + threadContent.community.slice(1).toLowerCase()}</div>
                                            </div>
                                        </div>
                                        <div className={styles.timeAgo}>{threadContent.timeAgo}</div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.threadTags}>
                                {threadContent?.tags?.length > 0 && (
                                    <div className={styles.tags}>
                                        {threadContent.tags.map((tag) => (
                                            <div key={tag} className={styles.tag}>{tag}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.threadContent}>
                                <div className={styles.threadTitle}>{threadContent.title}</div>
                                {threadContent?.content && (
                                    <div className={styles.threadBody}>
                                        {threadContent.content}
                                    </div>
                                )}
                                {threadContent?.image?.[0]?.url && (
                                    <div
                                        className={styles.threadImage}
                                        style={{ backgroundImage: `url(${threadContent.image[0].url})` }}
                                    />
                                )}
                            </div>

                            <div className={styles.interactions}>
                                {threadContent?.upvotes && threadContent?.downvotes && (
                                    <>
                                        <div className={styles.voteButtons}>
                                            {renderVoteButton('upvote', true)}
                                            <p className={styles.voteCount}>
                                                {calculateTotalVotes(threadContent.upvotes, threadContent.downvotes)}
                                            </p>
                                            {renderVoteButton('downvote', false)}
                                        </div>
                                    </>
                                )}
                                {threadContent?.comments && (
                                    <>    
                                        <div className={styles.comment}>
                                            <FaRegComment className={styles.commentBtn} />
                                            <div className={styles.commentCount}>{threadContent.comments.length}</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.commentSection}>
                            <div className={styles.addComment}>
                                <div className={styles.commentInputWrapper}>
                                    {isCommentInputActive ? (
                                        <textarea
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            onKeyPress={(e) => handleKeyPress(e, handleSubmitComment)}
                                            placeholder="Add a comment..."
                                            className={styles.commentInput}
                                            maxLength={1000}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            className={styles.commentInput}
                                            onClick={handleCommentInputClick}
                                            readOnly
                                        />
                                    )}
                                    {isCommentInputActive && (
                                        <div className={styles.characterCount}>
                                            {commentContent.length}/1000
                                        </div>
                                    )}
                                </div>
                                {isCommentInputActive && (
                                    <button 
                                        onClick={handleSubmitComment} 
                                        className={styles.submitComment}
                                        disabled={!commentContent.trim()}
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>

                            <div className={styles.sortAndSearch}>
                                <p className={styles.sortLabel}>Sort by:</p>
                                <select value={sortOption} onChange={handleSortChange} className={styles.sortDropdown}>
                                    <option value="Best">Best</option>
                                    <option value="New">New</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search comments..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className={styles.searchBox}
                                />
                            </div>

                                <div className={styles.commentsList}>
                                    {sortedComments.map((comment) => (
                                        <>
                                        {
                                            comment.type === 'normal' && (
                                                <>
                                                    <div key={comment._id} className={styles.commentItem}>
                                                        <div className={styles.commentprofilePhoto} style={{ backgroundImage: `url(${comment.author.profilePic[0].url})` }} />
                                                        <div className={styles.commentMain}>
                                                            <div className={styles.commentHeader}>
                                                                <div className={styles.commentAuthor}>{comment.author.fullName}</div>
                                                                <div className={styles.commentTimeAgo}>{formatTimeAgo(comment.createdAt)}</div>
                                                            </div>
                                                            <div className={styles.commentContent}>{comment.content}</div>
                                                            <div className={styles.commentActions}>
                                                                {hasUpvotedComment(comment) ? (
                                                                    <TiArrowUpThick
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleVoteComment(comment._id, 'upvote');
                                                                        }}
                                                                        className={`${styles.upvoteButton} ${styles.active}`}
                                                                    />
                                                                ) : (
                                                                    <TiArrowUpOutline
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleVoteComment(comment._id, 'upvote');
                                                                        }}
                                                                        className={styles.upvoteButton}
                                                                    />
                                                                )}
                                                                <p className={styles.voteCommentCount}>
                                                                    {calculateTotalVotes(comment.upvotes, comment.downvotes)}
                                                                </p>
                                                                {hasDownvotedComment(comment) ? (
                                                                    <TiArrowDownThick
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleVoteComment(comment._id, 'downvote');
                                                                        }}
                                                                        className={`${styles.downvoteButton} ${styles.active}`}
                                                                    />
                                                                ) : (
                                                                    <TiArrowDownOutline
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleVoteComment(comment._id, 'downvote');
                                                                        }}
                                                                        className={styles.downvoteButton}
                                                                    />
                                                                )}
                                                                <button
                                                                    onClick={() => handleReplyToggle(comment._id)}
                                                                    className={styles.replyButton}
                                                                >
                                                                    Reply
                                                                </button>
                                                                {
                                                                    comment.replies.length > 0 && (
                                                                        <button
                                                                        onClick={() => handleReplyVisibilityToggle(comment._id)}
                                                                        className={styles.showHideRepliesButton}
                                                                        >
                                                                            {visibleReplies[comment._id] ? 'Hide Replies' : `Show Replies (${comment.replies.length})`}
                                                                        </button>
                                                                    )
                                                                }
                                                            </div>
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
                                                                <>
                                                                    {comment.replies.map(reply => (
                                                                        <div key={reply._id} className={styles.replyItem}>
                                                                            <div
                                                                                className={styles.commentprofilePhoto}
                                                                                style={{
                                                                                    backgroundImage: `url(${reply.author?.profilePic[0]?.url || '/default-profile.png'})`
                                                                                }}
                                                                            />
                                                                            <div className={styles.replyMain}>
                                                                                <div className={styles.commentHeader}>
                                                                                    <div className={styles.commentAuthor}>{reply.author?.fullName || 'Unknown User'}</div>
                                                                                    <div className={styles.commentTimeAgo}>{formatTimeAgo(reply.createdAt)}</div>
                                                                                </div>
                                                                                <div className={styles.commentContent}>{reply.content}</div>
                                                                                {/* <p>Votes: {(reply.upvotes?.length || 0) - (reply.downvotes?.length || 0)}</p> */}
                                                                                {/* 
                                                                                <button onClick={() => handleVoteComment(reply._id, 'upvote')}>Upvote</button>
                                                                                <button onClick={() => handleVoteComment(reply._id, 'downvote')}>Downvote</button> 
                                                                                */}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </>
                                                            )}

                                                        </div>
                                                    </div>
                                                </>
                                                )
                                            }
                                        </>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommentList;