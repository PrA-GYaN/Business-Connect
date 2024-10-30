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
    const getallusers = async() => {
        try {
            const { data } = await axios.get(`http://localhost:5000/users/getallusers`,
            {
                withCredentials: true,
            });
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

    return { profile,like_dislike,getallusers, getProfileById };
};
export default useProfile;