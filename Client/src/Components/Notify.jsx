import React, { useEffect } from 'react';
import {useNotificationContext} from '../Context/NotificationContext';
import styles from '../Styles/Notify.module.css';

const Notify = () => {
    const { notifications } = useNotificationContext(); 
    useEffect(() => {
        console.log("Notification state updated:", notifications);
    }, [notifications]);

    return (
        <div className={styles.notifyContainer}>
            {(!notifications || notifications.length === 0) ? (
                <p>No notifications available. Check back later!</p>
            ) : (
                <div className={styles.notifyList}>
                    {notifications.map((notif) => (
                        <div key={notif.id || notif.timestamp} className={styles.notifyItem}>
                            {notif.message || notif}
                            {
                                notif.createdAt && (
                                    <div className={styles.timeAgo}>{notif.createdAt}</div>
                                )
                            }
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notify;
