import React,{useEffect,useState} from 'react';
import { format } from 'date-fns-tz';
import useMeetings from '../Hooks/useMeetings';
import Loader from '../Components/Loader';
import styles from '../Styles/MeetingList.module.css';
import MeetingScheduler from '../Components/MeetingScheduler';
import { useAuthContext } from '../Context/AuthContext';
import Navbar from '../Components/Navbar';
import { IoIosAddCircle } from "react-icons/io";

const MeetingList = () => {
    const {authUser} = useAuthContext();
    const [isModalOpen, setModalOpen] = useState(false);

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

    const renderMeetingItem = (meeting) => {
        const { _id, title, startTime, endTime, link, participants, createdBy } = meeting;
        const isAccepted = participants.some(p => p.status === 'accepted');
        const isPending = participants.some(p => p.status === 'pending');
        const isCreatedByUser = createdBy === authUser;

        return (
            <li key={_id}
                className={`${styles.meetingItem} ${isAccepted ? styles.accepted : isPending ? styles.pending : styles.rejected}`}
                >
                <strong>{title}</strong> <br />
                {format(new Date(startTime), 'Pp', { timeZone })} - 
                {format(new Date(endTime), 'Pp', { timeZone })} <br />
                {link && isAccepted && (
                    <a href={link} target="_blank" rel="noopener noreferrer" className={styles.joinLink}>Join Meeting</a>
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
                        {meetingsToDisplay.length > 0 ? (
                            <ul className={styles.meetingList}>
                                {meetingsToDisplay.map(renderMeetingItem)}
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
