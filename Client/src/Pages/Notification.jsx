import React from 'react';
import Notify from '../Components/Notify';
import Navabar from '../Components/Navbar';
import styles from '../Styles/Notification.module.css';

const Notification = () => {
    return(
    <>
    <Navabar/>
        <div className={styles.notificationContainer}>
            <h2>Notifications</h2>
            <Notify/>
        </div>
    </>
    );
};

export default Notification;
