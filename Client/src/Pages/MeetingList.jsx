import React,{useEffect,useState} from 'react';
import { format } from 'date-fns-tz';
import useMeetings from '../Hooks/useMeetings';
import Loader from '../Components/Loader';
import styles from '../Styles/MeetingList.module.css';
import MeetingScheduler from '../Components/MeetingScheduler';
import { useAuthContext } from '../Context/AuthContext';
import Navbar from '../Components/Navbar';
import { IoIosAddCircle } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const MeetingList = () => {
    const {authUser} = useAuthContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const openCallInNewWindow = (userID) => {
        console.log('Opening call in new window for user:', userID);
        navigate('/call', { state: {userID:userID} });
    };

    const isMeetingWithin10Minutes = (startTime) => {
        const now = new Date();
        const meetingTime = new Date(startTime);
        const timeDifference = (meetingTime - now) / 1000 / 60;
        return timeDifference <= 1000 && meetingTime.toDateString() === now.toDateString();
    };

    const {
        meetings,
        loading,
        error,
        selectedStatus,
        setSelectedStatus,
        meetingsToDisplay,
        handleConfirm,
        handleReject,
    } = useMeetings();

    if (loading) return <Loader />;
    if (error) return <div className="error">{error}</div>;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const sortedMeetings = meetingsToDisplay.sort((a, b) => {
        const aAccepted = a.participants.some(p => p.status === 'accepted');
        const bAccepted = b.participants.some(p => p.status === 'accepted');
        if (aAccepted && !bAccepted) return -1;
        if (!aAccepted && bAccepted) return 1;
        if (aAccepted && bAccepted) return new Date(a.startTime) - new Date(b.startTime);
        return 0;
    });

    const renderMeetingItem = (meeting) => {
        const { _id, title, startTime, endTime, link, participants, createdBy } = meeting;
        const isAccepted = participants.some(p => p.status === 'accepted');
        const isPending = participants.some(p => p.status === 'pending');
        const isCreatedByUser = createdBy === authUser;
        let peerId = '';
        if(authUser === createdBy){
            peerId = participants.find(p => p.userId._id !== authUser).userId._id;
        }
        else
        {
            peerId = createdBy;
        }
        return (
            <li key={_id}
                className={`${styles.meetingItem} ${isAccepted ? styles.accepted : isPending ? styles.pending : styles.rejected}`}
                >
                <strong>{title}</strong>
                <div className={styles.participants}>
                    <span className={styles.title}>Start Time:</span>
                    {format(new Date(startTime), 'Pp', { timeZone })}
                </div>
                {link && isAccepted && isMeetingWithin10Minutes(startTime) && (
                    <div onClick={()=>openCallInNewWindow(peerId)} className={styles.joinLink}>Join Meeting</div>
                )}
                {isPending && !isCreatedByUser && (
                    <div className={styles.buttonGroup}>
                        <button onClick={() => handleConfirm(_id)} className={styles.confirmButton}>Confirm</button>
                        <button onClick={() => handleReject(_id)} className={styles.rejectButton}>Reject</button>
                    </div>
                )}
            </li>
        );
    };

    return (
        <>
        <Navbar />
        <div className={styles.meetingBox}>
            <div className={styles.meetingContainer}>
                <div className={styles.List}>
                    <div className={styles.heading}>Meetings</div>
                    <div className={styles.buttonGroup}>
                        {['all', 'pending', 'accepted'].map(status => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`${styles.statusButton} ${selectedStatus === status ? styles.active : ''}`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className={styles.meetingGroup}>
                        {sortedMeetings.length > 0 ? (
                            <ul className={styles.meetingList}>
                                {sortedMeetings.map(renderMeetingItem)}
                            </ul>
                        ) : (
                            <div className={styles.noMeetings}>No meetings available</div>
                        )}
                    </div>
                    <div>
                        <MeetingScheduler isOpen={isModalOpen} onClose={() => setModalOpen(false)}/>
                    </div>
                <IoIosAddCircle className={styles.addIcon}  onClick={() => setModalOpen(true)}/>
                </div>
            </div>
        </div>
        </>
    );
};

export default MeetingList;
