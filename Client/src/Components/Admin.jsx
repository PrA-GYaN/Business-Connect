import React, { useState, useEffect } from "react";
import useProfile from "../Hooks/useProfile";

const Admin = () => {
    const { getAllUsers, getAllPosts } = useProfile();
    const [profiles, setProfiles] = useState([]);
    const [posts, setPosts] = useState([]);

    const fetchProfiles = async () => {
        try {
            const data = await getAllUsers(); // Fetch user data
            if (data && Array.isArray(data)) {
                setProfiles(data);
            } else {
                console.error("Invalid data format:", data);
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    const fetchPosts = async () => {
        try {
            const data = await getAllPosts(); // Fetch posts from the backend
            if (data && Array.isArray(data)) {
                setPosts(data);
                console.log(data)
            } else {
                console.error("Invalid data format:", data);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    // Fetch profiles and posts on component mount
    useEffect(() => {
        fetchProfiles();
        fetchPosts();
    }, []);

    // Handle post actions (delete and approve)
    const handleDeletePost = async (postId) => {
        try {
            // Call API to delete post
            console.log("Deleting post with ID:", postId);
            // After deletion, you can update the posts state to reflect the changes
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleApprovePost = async (postId) => {
        try {
            // Call API to approve post
            console.log("Approving post with ID:", postId);
            // Update the posts state accordingly
            setPosts(posts.map(post =>
                post.id === postId ? { ...post, approved: true } : post
            ));
        } catch (error) {
            console.error("Error approving post:", error);
        }
    };

    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        try {
            // Call API to delete user
            console.log("Deleting user with ID:", userId);
            // After deletion, you can update the profiles state
            setProfiles(profiles.filter(profile => profile.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div>
            <h1>Admin Panel</h1>

            {/* User Profile Management */}
            <div>
                <h3>Manage Users</h3>
                {profiles.length > 0 ? (
                    profiles.map((profile) => (
                        <div key={profile.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
                            <div>
                                <h4>{profile.name}</h4>
                                <p>Email: {profile.email}</p>
                                <button
                                    onClick={() => handleDeleteUser(profile.id)}
                                    style={{ padding: "5px 10px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}
                                >
                                    Delete User
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No profiles found</p>
                )}
            </div>

            {/* Post Management */}
            <div>
                <h3>Manage Posts</h3>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
                            <div>
                                <p>{post.content}</p>
                                <span>By: {post.author}</span>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    style={{ padding: "5px 10px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleApprovePost(post.id)}
                                    style={{ padding: "5px 10px", backgroundColor: "green", color: "white", border: "none", cursor: "pointer" }}
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No posts found</p>
                )}
            </div>
        </div>
    );
};

export default Admin;
