import { useAuthContext } from "../Context/AuthContext";
import usePost from "../Hooks/usePost";
import useProfile from "../Hooks/useProfile";
import { useEffect, useState } from 'react';
import Loader from "../Components/Loader";
import Navbar from "../Components/Navbar";
import styles from '../Styles/Profile.module.css';
import useThread from "../Hooks/useThread";
import { TiArrowUpOutline, TiArrowUpThick, TiArrowDownOutline, TiArrowDownThick } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";
import { MdVerified, MdEdit } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import EditProfileModal from "../Components/EditProfileModal";

const Profile = ({ id }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pid } = location.state || {};
    const { profile, getProfileById, updateUserProfile, loading: profileLoading, error: profileError } = useProfile();
    const { posts, getPostById, loading: postsLoading, error: postsError, handleLike, handleCommentSubmit, handleCommentChange, toggleComments, visibleComments, newComment, commentLoading } = usePost();
    const { authUser, profilePic } = useAuthContext();
    const [bodyType, setBodyType] = useState('posts');
    const [threads, setThreads] = useState([]); // Ensuring threads is an array
    const [isModalOpen, setIsModalOpen] = useState({});
    const { getThreadByProfile, handleVote, hasUpvoted, hasDownvoted, calculateTotalVotes } = useThread();

    id = pid;

    if (!id) {
        id = authUser;
    }

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
    if (isLoading) {
        return <Loader />;
    }
    if (profileError) {
        console.error(profileError);
        return <p>Error loading profile data. Please try again later.</p>;
    }

    if (postsError) {
        console.error(postsError);
        return <p>Error loading posts data. Please try again later.</p>;
    }

    return (
        <>
            <Navbar />
            <div className={styles.profileBox}>
                <div className={styles.profileInfo}>
                    {profile && (
                        <>
                            <div className={styles.heading}>
                                <div className={styles.profilePicMain} style={{ backgroundImage: `url(${profile.profilePic?.[0]?.url })` }} />
                                <div className={styles.profileMore}>
                                    <div className={styles.profilefullName}>
                                        <span>{profile.fullName}</span>
                                        {profile.verified ?
                                            <span className={styles.verified}><MdVerified /></span>
                                            :
                                            <span className={styles.verifyNow}>Verify Now</span>
                                        }
                                    </div>
                                    <div className={styles.profileCount}>
                                        <div><strong>{Array.isArray(profile.connections) ? profile.connections.length : 0}</strong> connections</div>
                                        <div><strong>{Array.isArray(posts) ? posts.length : 0}</strong> posts</div>
                                        <div><strong>{Array.isArray(threads) ? threads.length : 0}</strong> threads</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.profileEdit}>
                                <div className={styles.editBox}>
                                    <div className={styles.profileContact}>
                                        <p>{profile.businessTitle}</p>
                                        <p>{profile.email}</p>
                                        <p>{profile.phoneNumber}</p>
                                        <p>{profile.address}</p>
                                    </div>
                                    <div className={styles.editProfile}>
                                        <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, email: true }))} />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.profileEdit}>
                                <div className={styles.editTitle}>Bio</div>
                                <div className={styles.editBox}>
                                    <div className={styles.profileBio}>
                                        <p>{profile.bio}</p>
                                    </div>
                                    <div className={styles.editProfile}>
                                        <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, bio: true }))} />
                                    </div>
                                </div>
                            </div>
                            {
                                profile.businessType === 'individual'?
                                (
                                    <>
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Interests</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileInterests}>
                                                {profile.interests?.map((interest, index) => (
                                                    <span key={index} className={styles.interests}>{interest}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, interests: true }))} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Languages</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileLanguages}>
                                                {profile.languages?.map((language, index) => (
                                                    <span key={index} className={styles.languages}>{language}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, languages: true }))} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Skills</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileSkills}>
                                                {profile.skills?.map((skill, index) => (
                                                    <span key={index} className={styles.skill}>{skill}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, skills: true }))} />
                                            </div>
                                        </div>
                                    </div>
                                    </>
                                ):(
                                    <>
                                    {/* Operational Focus */}
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Operational Focus</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileDetails}>
                                                {profile.operationalFocus?.map((focus, index) => (
                                                    <span key={index} className={styles.interests}>{focus}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, operationalFocus: true }))} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technologies */}
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Technologies</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileDetails}>
                                                {profile.technologies?.map((tech, index) => (
                                                    <span key={index} className={styles.interests}>{tech}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, operationalFocus: true }))} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Models */}
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Business Model</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileDetails}>
                                                {profile.businessModels?.map((model, index) => (
                                                    <span key={index} className={styles.interests}>{model}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, operationalFocus: true }))} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strategic Goals */}
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Strategic Goals</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileDetails}>
                                                {profile.strategicGoals?.map((goal, index) => (
                                                    <span key={index} className={styles.interests}>{goal}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, operationalFocus: true }))} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Metrics */}
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Performance Metrics</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileDetails}>
                                                {profile.performanceMetrics?.map((metric, index) => (
                                                    <span key={index} className={styles.interests}>{metric}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, operationalFocus: true }))} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Industry Focus */}
                                    <div className={styles.profileEdit}>
                                        <div className={styles.editTitle}>Industry</div>
                                        <div className={styles.editBox}>
                                            <div className={styles.profileDetails}>
                                                {profile.industryFocus?.map((indust, index) => (
                                                    <span key={index} className={styles.interests}>{indust}</span>
                                                ))}
                                            </div>
                                            <div className={styles.editProfile}>
                                                <MdEdit onClick={() => setIsModalOpen(prev => ({ ...prev, operationalFocus: true }))} />
                                            </div>
                                        </div>
                                    </div>
                                    </>
                                )
                            }
                            
                        </>
                    )}
                    {Object.keys(isModalOpen).map((field) => (
                        <EditProfileModal
                            key={field}
                            isOpen={isModalOpen[field]}
                            onClose={() => setIsModalOpen((prev) => ({ ...prev, [field]: false }))}
                            profile={profile}
                            field={field}
                            onUpdate={updateUserProfile}
                        />
                    ))}
                </div>
                <div className={styles.bodyType}>
                    <div 
                        className={`${styles.bodyPosts} ${bodyType === 'posts' ? styles.bodyActive : ''}`} 
                        onClick={() => setBodyType('posts')}
                    >
                        Posts
                    </div>
                    <div 
                        className={`${styles.bodyThreads} ${bodyType === 'threads' ? styles.bodyActive : ''}`} 
                        onClick={() => setBodyType('threads')}
                    >
                        Threads
                    </div>
                </div>
                {bodyType === 'posts' ? (
                    <>
                        {Array.isArray(posts) && posts.length > 0 ? (
                            <div className={styles.authorPosts}>
                                {posts.map(post => (
                                    <div key={post._id} className={styles.postBox}>
                                        <div className={styles.author}>
                                            <div 
                                                className={styles.profilePhoto} 
                                                style={{ backgroundImage: `url(${post.authorId?.profilePic?.[0]?.url })` }} 
                                            />
                                            <span className={styles.fullname}>{post.authorId?.fullName}</span>
                                        </div>
                                        <p className={styles.contentBox}>{post.content}</p>
                                        {post.image && post.image.length > 0 && (
                                            <div 
                                                className={styles.postImage} 
                                                style={{ backgroundImage: `url(${post.image[0].url})` }} 
                                            />
                                        )}
                                        <div className={styles.interactionsPost}>
                                            <div className={styles.iBtns}>
                                                <div 
                                                    className={`${styles.interactionBtn} ${post.likes?.includes(authUser) ? styles.liked : ''}`} 
                                                    onClick={() => handleLike(post._id)}
                                                >
                                                    {Array.isArray(post.likes) ? post.likes.length : 0} Like 
                                                </div>
                                                <div 
                                                    className={styles.interactionBtn} 
                                                    onClick={() => toggleComments(post._id)}
                                                >
                                                    {visibleComments[post._id] ? 'Hide Comments' : 'Show Comments'}
                                                </div>
                                            </div>
                                            {visibleComments[post._id] && (
                                                <div className={`${styles.commentsSection} ${styles.active}`}>
                                                    <form className={styles.Comment} onSubmit={(e) => handleCommentSubmit(post._id, e)}>
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
                                                                style={{ backgroundImage: `url(${comment.userId?.profilePic || 'default-commenter-pic-url'})`, marginTop: '0.5rem' }} 
                                                            />
                                                            <div className={styles.commentBody}>
                                                                <span className={styles.fullname}>{comment.userId?.fullName || 'Unknown User'}</span>
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
                        ) : (
                            <p>No posts available.</p>
                        )}
                    </>
                ) : (
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
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`${styles.upvoteButton} ${styles.active}`}
                                                            disabled
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
                                                            disabled
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
                                                    <p className={styles.commentCount}>{thread.comments?.length || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;