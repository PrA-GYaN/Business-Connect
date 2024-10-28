import axios from "axios";
import { useEffect, useState } from "react";

const useProfile = () => {
    const [profile, setProfile] = useState({});

    const getProfileById = async (id) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/users/getprofilebyid/${id}`);
            setProfile(data);
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };
    return { profile, getProfileById };
};
export default useProfile;