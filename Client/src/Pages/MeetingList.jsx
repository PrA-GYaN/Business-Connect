// src/Components/MeetingList.js

import React,{useEffect,useState} from 'react';
import { format } from 'date-fns-tz';
import useMeetings from '../Hooks/useMeetings';
import Loader from '../Components/Loader';
import './MeetingList.css';
import MeetingScheduler from '../Components/MeetingScheduler';
import { useAuthContext } from '../Context/AuthContext';

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
            <li key={_id} className={`meeting-item ${isAccepted ? 'accepted' : isPending ? 'pending' : 'rejected'}`}>
                <strong>{title}</strong> <br />
                {format(new Date(startTime), 'Pp', { timeZone })} - 
                {format(new Date(endTime), 'Pp', { timeZone })} <br />
                {link && isAccepted && (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="join-link">Join Meeting</a>
                )}
                {isPending && !isCreatedByUser && (
                    <div className="button-group">
                        <button onClick={() => handleConfirm(_id)} className="confirm-button">Confirm</button>
                        <button onClick={() => handleReject(_id)} className="reject-button">Reject</button>
                    </div>
                )}
            </li>
        );
    };

    return (
        <div className="meeting-list">
            <h2>Meetings</h2>
            <div className="button-group">
                {['all', 'pending', 'accepted'].map(status => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`status-button ${selectedStatus === status ? 'active' : ''}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            <div className="meeting-container">
                {meetingsToDisplay.length > 0 ? (
                    <ul className="meeting-list-ul">
                        {meetingsToDisplay.map(renderMeetingItem)}
                    </ul>
                ) : (
                    <div className="no-meetings">No meetings available</div>
                )}
            </div>
            <div>
                <button onClick={() => setModalOpen(true)}>Schedule a Meeting</button>
                <MeetingScheduler isOpen={isModalOpen} onClose={() => setModalOpen(false)}/>
            </div>
        </div>
    );
};

export default MeetingList;
