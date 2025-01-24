import { useEffect, useState,useRef  } from "react";
import axios from "axios";
import { useAuthContext } from "../Context/AuthContext";
import { useNotificationContext } from '../Context/NotificationContext';
const url = import.meta.env.VITE_Backend_Url;

const useNotification = () => {
    const { authUser } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const {notifications,playAudio, addNotification,clearNotifications} = useNotificationContext();
    const [error, setError] = useState(null);

    useEffect(() => {
        const getNotification = async () => {
            if (!authUser) return;

            setLoading(true);
            setError(null);
            clearNotifications();
            try {
                console.log('Calling getNotification');
                const res = await axios.get(`${url}/users/notification/`,
                    {
                        withCredentials: true,
                    }
                );
                const data = res.data;
                data.reverse().forEach(item => {
                    addNotification(item);
                });
            } catch (err) {
                console.error(err.message);
                setError(err.message || "Failed to fetch notifications");
            } finally {
                setLoading(false);
            }
        };

        console.log("Fetching notifications...");
        getNotification();
    }, [authUser]);

    return { notifications,loading,playAudio, error,addNotification};
};

export default useNotification;
