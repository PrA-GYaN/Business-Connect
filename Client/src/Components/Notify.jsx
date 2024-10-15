import React, { useEffect } from 'react';
import {useNotificationContext} from '../Context/NotificationContext';
import useListenNotification from '../Hooks/useListenNotification';

const Notify = () => {
    const { notifications } = useNotificationContext(); // Use the correct variable name
    useListenNotification();
    useEffect(() => {
        console.log("Notification state updated:", notifications);
    }, [notifications]);

    return (
        <>
            {(!notifications || notifications.length === 0) ? (
                <p>No notifications available. Check back later!</p>
            ) : (
                <ul>
                    {notifications.map((notif) => (
                        <li key={notif.id || notif.timestamp}>
                            {notif.message || notif} {/* Adjust based on your notification structure */}
                            {/* Uncomment if you want to show the timestamp */}
                            {/* <span className="notification-time">{notif.timestamp}</span> */}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default Notify;
