import axios from "axios";
import { useState } from "react";

const url = import.meta.env.VITE_Backend_Url;
const useProfile = () => {
    const [profile, setProfile] = useState({});

    const getProfileById = async(id) => {
        try {
            const { data } = await axios.get(`${url}/users/getprofilebyid/${id}`);
            // console.log("Connections:",data);
            setProfile(data);
            return data;
        } catch (err) {
            // console.log(url);
            console.error('Error fetching profile:', err);
            return null;
        }
    };

    const getAllUsers = async() => {
        try {
            const { data } = await axios.get(`${url}/users/getallusers`,
            {
                withCredentials: true,  
        });
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };
    const getAllMeetingsAdmin = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/meetings/allmeetingsadmin`
            );
            console.log("Meetings:",response.data);
            return response.data;
        } catch (err) {
            setError("Failed to fetch meetings. Please try again later.");
        }
    }

    const getRecUsers = async(user_interests,user_skills,liked_profiles) => {
        const user_data = {
            user_interests,
            user_skills,
            liked_profiles
        };
        try {
            const { data } = await axios.post(`${url}/users/getrecommened`,user_data,
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
            const { data } = await axios.post(`${url}/users/swipe`, {
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
        const { data } = await axios.post(`${url}/users/updateUser`, updates, {
            withCredentials: true,
        });
        setProfile((prevProfile) => ({ ...prevProfile, ...data }));
        return data;
    } catch (err) {
        console.error('Error updating profile:', err);
        return null;
    }
};  

return { profile,getAllMeetingsAdmin, like_dislike,getAllUsers, getRecUsers, getProfileById, updateUserProfile };
};

export default useProfile;