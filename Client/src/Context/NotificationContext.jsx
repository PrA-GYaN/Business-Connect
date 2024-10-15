import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();
export const useNotificationContext = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const addNotification = (notification) => {
        setNotifications((prevNotifications) => [
            ...prevNotifications,
            notification,
        ]);
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
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
