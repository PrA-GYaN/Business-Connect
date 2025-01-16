import { useEffect, useState } from 'react';
import useProfile from "../Hooks/useProfile";
import usePost from "../Hooks/usePost";
import useThread from "../Hooks/useThread";
import { TiArrowUpOutline, TiArrowUpThick, TiArrowDownOutline, TiArrowDownThick } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import styles from '../Styles/ModalProfile.module.css';

const ModalProfile = ({ id, onClose }) => {
    const { profile, getProfileById, loading: profileLoading, error: profileError } = useProfile();
    const { posts, getPostById, loading: postsLoading, error: postsError, handleLike, handleCommentSubmit, handleCommentChange, toggleComments, visibleComments, newComment, commentLoading } = usePost();
    const [bodyType, setBodyType] = useState('posts');
    const [threads, setThreads] = useState([]);
    const { getThreadByProfile, handleVote, hasUpvoted, hasDownvoted, calculateTotalVotes } = useThread();

    useEffect(() => {
        if (id) {
            getProfileById(id);
            getPostById(id);
            getThreadByProfile(id).then(data => {
                setThreads(Array.isArray(data) ? data : []);
            });
        }
    }, [id]);

    const isLoading = profileLoading || postsLoading;
    if (isLoading) return <div className={styles.loading}>Loading...</div>;
    if (profileError || postsError) return <div className={styles.error}>Error loading data</div>;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.profileBox}>
                    <div className={styles.profileInfo}>
                        {profile && (
                            <>
                                <div className={styles.heading}>
                                    <div 
                                        className={styles.profilePicMain} 
                                        style={{ backgroundImage: `url(${profile.profilePic?.[0]?.url})` }} 
                                    />
                                    <div className={styles.profileMore}>
                                        <div className={styles.profilefullName}>
                                            <span>{profile.fullName}</span>
                                            {profile.verified && (
                                                <span className={styles.verified}>
                                                    <MdVerified />
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.profileCount}>
                                            <div><strong>{Array.isArray(profile.connections) ? profile.connections.length : 0}</strong> connections</div>
                                            <div><strong>{Array.isArray(posts) ? posts.length : 0}</strong> posts</div>
                                            <div><strong>{Array.isArray(threads) ? threads.length : 0}</strong> threads</div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.profileSection}>
                                    <div className={styles.profileContact}>
                                        <p>{profile.businessTitle}</p>
                                        <p>{profile.email}</p>
                                        <p>{profile.phoneNumber}</p>
                                        <p>{profile.address}</p>
                                    </div>
                                </div>

                                <div className={styles.profileSection}>
                                    <div className={styles.sectionTitle}>Bio</div>
                                    <div className={styles.profileBio}>
                                        <p>{profile.bio}</p>
                                    </div>
                                </div>

                                {profile.businessType === 'individual' ? (
                                    <>
                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Interests</div>
                                            <div className={styles.tagContainer}>
                                                {profile.interests?.map((interest, index) => (
                                                    <span key={index} className={styles.tag}>{interest}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Languages</div>
                                            <div className={styles.tagContainer}>
                                                {profile.languages?.map((language, index) => (
                                                    <span key={index} className={styles.tag}>{language}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Skills</div>
                                            <div className={styles.tagContainer}>
                                                {profile.skills?.map((skill, index) => (
                                                    <span key={index} className={styles.tag}>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Operational Focus</div>
                                            <div className={styles.tagContainer}>
                                                {profile.operationalFocus?.map((focus, index) => (
                                                    <span key={index} className={styles.tag}>{focus}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Technologies</div>
                                            <div className={styles.tagContainer}>
                                                {profile.technologies?.map((tech, index) => (
                                                    <span key={index} className={styles.tag}>{tech}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Business Model</div>
                                            <div className={styles.tagContainer}>
                                                {profile.businessModels?.map((model, index) => (
                                                    <span key={index} className={styles.tag}>{model}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Strategic Goals</div>
                                            <div className={styles.tagContainer}>
                                                {profile.strategicGoals?.map((goal, index) => (
                                                    <span key={index} className={styles.tag}>{goal}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Performance Metrics</div>
                                            <div className={styles.tagContainer}>
                                                {profile.performanceMetrics?.map((metric, index) => (
                                                    <span key={index} className={styles.tag}>{metric}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.profileSection}>
                                            <div className={styles.sectionTitle}>Industry</div>
                                            <div className={styles.tagContainer}>
                                                {profile.industryFocus?.map((industry, index) => (
                                                    <span key={index} className={styles.tag}>{industry}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className={styles.bodyType}>
                        <div 
                            className={`${styles.bodyTab} ${bodyType === 'posts' ? styles.active : ''}`}
                            onClick={() => setBodyType('posts')}
                        >
                            Posts
                        </div>
                        <div 
                            className={`${styles.bodyTab} ${bodyType === 'threads' ? styles.active : ''}`}
                            onClick={() => setBodyType('threads')}
                        >
                            Threads
                        </div>
                    </div>

                    <div className={styles.contentSection}>
                        {bodyType === 'posts' ? (
                            <div className={styles.posts}>
                                {Array.isArray(posts) && posts.length > 0 ? posts.map(post => (
                                    <div key={post._id} className={styles.postBox}>
                                        <div className={styles.postAuthor}>
                                            <div 
                                                className={styles.authorPic} 
                                                style={{ backgroundImage: `url(${post.authorId?.profilePic?.[0]?.url})` }} 
                                            />
                                            <span>{post.authorId?.fullName}</span>
                                        </div>
                                        <p className={styles.postContent}>{post.content}</p>
                                        {post.image && post.image.length > 0 && (
                                            <div 
                                                className={styles.postImage} 
                                                style={{ backgroundImage: `url(${post.image[0].url})` }} 
                                            />
                                        )}
                                    </div>
                                )) : (
                                    <p className={styles.noContent}>No posts available.</p>
                                )}
                            </div>
                        ) : (
                            <div className={styles.threads}>
                                {threads.length > 0 ? threads.map(thread => (
                                    <div key={thread._id} className={styles.threadBox}>
                                        <div className={styles.threadHeader}>
                                            <div 
                                                className={styles.authorPic} 
                                                style={{ backgroundImage: `url(${thread.author.profilePic[0].url})` }} 
                                            />
                                            <span>{thread.author.fullName}</span>
                                            <span className={styles.timeAgo}>{thread.timeAgo}</span>
                                        </div>
                                        <h3 className={styles.threadTitle}>{thread.title}</h3>
                                        <p className={styles.threadContent}>{thread.content}</p>
                                        {/* <div className={styles.threadInteractions}>
                                            <div className={styles.votes}>
                                                <span>{calculateTotalVotes(thread.upvotes, thread.downvotes)}</span>
                                            </div>
                                            <div className={styles.comments}>
                                                <FaRegComment />
                                                <span>{thread.comments?.length || 0}</span>
                                            </div>
                                        </div> */}
                                    </div>
                                )) : (
                                    <p className={styles.noContent}>No threads available.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalProfile;