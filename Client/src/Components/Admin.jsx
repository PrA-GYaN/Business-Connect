import React, { useState, useEffect } from "react";
import useProfile from "../Hooks/useProfile";
import styles from "../Styles/Admin.module.css";
import { IoTrashBinSharp } from "react-icons/io5";

const Admin = () => {
    const { getAllUsers } = useProfile();
    const [profiles, setProfiles] = useState([]);

    const fetchProfiles = async () => {
        try {
            const data = await getAllUsers();
            console.log("Data:", data);
            if (data && Array.isArray(data)) {
                setProfiles(data);
            } else {
                console.error("Invalid data format:", data);
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

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
            <h1>Manage Users</h1>

            {/* User Profile Management */}
            <div>
                {profiles.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Business Type</th>
                                <th>Business Title</th>
                                <th>Industry</th>
                                <th>Verified</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.id}>
                                    <td>{profile.fullName}</td>
                                    <td>{profile.email}</td>
                                    <td>{profile.businessType}</td>
                                    <td>{profile.businessTitle}</td>
                                    <td>{profile.industry}</td>
                                    <td>{profile.verified ? 'Yes' : 'No'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteUser(profile.id)}
                                            className={styles.buttonDelete}
                                        >
                                            <IoTrashBinSharp />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No profiles found</p>
                )}
            </div>
        </div>
    );
};

export default Admin;