import React, { createContext, useContext, useState,useRef} from 'react';
import notificationSound from '../assets/audios/notification.wav';

const NotificationContext = createContext();
export const useNotificationContext = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const audioRef = useRef(new Audio(notificationSound));
    const [notifications, setNotifications] = useState([]);
    const addNotification = (notification) => {
        setNotifications((prevNotifications) => [
            ...prevNotifications,
            notification,
        ]);
    };


	const playAudio = () => {
		audioRef.current
			.play()
			.catch((error) => {
				console.error("Error playing audio:", error);
			});
	};
    // Function to clear notifications
    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                clearNotifications,
                playAudio,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
