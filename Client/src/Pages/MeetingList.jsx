import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns-tz';
import { useAuthContext } from '../Context/AuthContext';
import './MeetingList.css';

const MeetingList = () => {
    const { authUser } = useAuthContext();
    const user = { user: authUser };
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [updateCount, setUpdateCount] = useState(0); // State to trigger re-renders

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/meetings/allmeetings', {
                    withCredentials: true,
                });
                setMeetings(response.data);
            } catch (err) {
                setError("Failed to fetch meetings. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, [updateCount]);

    const updateMeetingStatus = (meetingId, newStatus) => {
        setMeetings(prevMeetings =>
            prevMeetings.map(meeting => {
                if (meeting._id === meetingId) {
                    return {
                        ...meeting,
                        participants: meeting.participants.map(participant => 
                            participant.user === authUser ? { ...participant, status: newStatus } : participant
                        )
                    };
                }
                return meeting;
            })
        );
		console.log("Trying to Refresh");
        setUpdateCount(prev => prev + 1); 
    };

    const handleConfirm = async (meetingId) => {
        updateMeetingStatus(meetingId, 'accepted');
        
        try {
            await axios.post(`http://localhost:5000/meetings/confirmmeetings/${meetingId}`, user, {
                withCredentials: true,
            });
            setUpdateCount(prev => prev + 1);
        } catch (err) {
            setError("Failed to confirm meeting.");
            updateMeetingStatus(meetingId, 'pending');
        }
    };

    const handleReject = async (meetingId) => {
        updateMeetingStatus(meetingId, 'rejected');
        
        try {
            await axios.post(`http://localhost:5000/meetings/rejectmeetings/${meetingId}`, user, {
                withCredentials: true,
            });
            // Optionally update the count again to ensure a re-render
            setUpdateCount(prev => prev + 1);
        } catch (err) {
            setError("Failed to reject meeting.");
            updateMeetingStatus(meetingId, 'pending'); // Revert to original state if needed
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    const groupedMeetings = meetings.reduce((acc, meeting) => {
        meeting.participants.forEach(participant => {
            const status = participant.status;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(meeting);
        });
        return acc;
    }, {});

    const meetingsToDisplay = selectedStatus === 'all' ? meetings : groupedMeetings[selectedStatus] || [];

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
        </div>
    );
};

export default MeetingList;