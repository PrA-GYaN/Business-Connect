import axios from "axios";
import { useState } from "react";

const useProfile = () => {
    const [profile, setProfile] = useState({});

    const getProfileById = async(id) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/users/getprofilebyid/${id}`);
            setProfile(data);
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };
    const getAllUsers = async(user_interests,user_skills) => {
        const user_data = {
            user_interests,
            user_skills
        };
        try {
            const { data } = await axios.post(`http://localhost:5000/users/getrecommened`,user_data,
            {
                withCredentials: true,
            });
            console.log("Recommended Profiles:", data);
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };
    const like_dislike = async(likedUserId,action) => {
        try {
            const { data } = await axios.post('http://localhost:5000/users/swipe', {
                likedUserId,
                action
            },
        {
            withCredentials: true,
        });
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };
 
 const updateUserProfile = async ( updates) => {
    console.log("Updates:", updates);
    try {
        const { data } = await axios.post(`http://localhost:5000/users/updateUser`, updates, {
            withCredentials: true,
        });
        setProfile((prevProfile) => ({ ...prevProfile, ...data }));
        return data;
    } catch (err) {
        console.error('Error updating profile:', err);
        return null;
    }
};  

return { profile, like_dislike, getAllUsers, getProfileById, updateUserProfile };
};

export default useProfile;