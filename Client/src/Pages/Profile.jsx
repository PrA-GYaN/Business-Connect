import { useAuthContext } from "../Context/AuthContext";
import useFeed from "../Hooks/useFeed";
import usePost from "../Hooks/usePost";
import useProfile from "../Hooks/useProfile";
import { useEffect } from 'react';
import './Feed.css';
import Loader from "../Components/Loader";

const Profile = ({ id }) => {
    id = '670d5733c5628401e9b9ca0b'; // Hardcoded for testing
    const { profile, getProfileById } = useProfile();
    const { posts, getPostById,handleLike,handleCommentSubmit,handleCommentChange,toggleComments,visibleComments,newComment,commentLoading} = usePost();
    const {authUser,profilePic} = useAuthContext();

    useEffect(() => {
        if (id) {
            getProfileById(id);
            getPostById(id);
            console.log('Profile:', profile);
        }
    }, []);

    if (!profile) {
        return <Loader/>;
    }

    return (
        <div>
            <h1>Profile</h1>
            <h2>Profile Details:</h2>
            <ul>
                {Object.entries(profile).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key}:</strong> {String(value)}
                    </li>
                ))}
            </ul>

            <h2>Posts:</h2>
            {posts.length > 0 ? (
                <div>
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
                                    <div className="comment-photo" style={{ backgroundImage: `url(${profilePic})`}}></div>
                                    <input 
                                        type="text" 
                                        value={newComment[post._id] || ''} 
                                        onChange={(e) => handleCommentChange(post._id, e.target.value)} 
                                        placeholder="Add a comment"
                                        className="input"
                                        aria-label="Add a comment"
                                    />
                                    <button type="submit" className='post-btn' disabled={commentLoading[post._id]}>
                                        {commentLoading[post._id] ? 'Posting...' : 'Post'}
                                    </button>
                                </form>
                                {post.comments && post.comments.map((comment, index) => (
                                    <div key={index} className='comment-box'>
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
            ) : (
                <p>No posts available.</p>
            )}
        </div>
    );
};

export default Profile;