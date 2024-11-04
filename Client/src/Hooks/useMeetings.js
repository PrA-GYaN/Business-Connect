import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../Context/AuthContext';

const useMeetings = () => {
    const { authUser } = useAuthContext();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [updateCount, setUpdateCount] = useState(0);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/meetings/allmeetings/${authUser}`, {
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
        setUpdateCount(prev => prev + 1);
    };

    const handleConfirm = async (meetingId) => {
        updateMeetingStatus(meetingId, 'accepted');

        try {
            await axios.post(`http://localhost:5000/meetings/confirmmeetings/${meetingId}`, { user: authUser }, {
                withCredentials: true,
            });
        } catch (err) {
            setError("Failed to confirm meeting.");
            updateMeetingStatus(meetingId, 'pending');
        }
    };

    const handleReject = async (meetingId) => {
        updateMeetingStatus(meetingId, 'rejected');

        try {
            await axios.post(`http://localhost:5000/meetings/rejectmeetings/${meetingId}`, { user: authUser }, {
                withCredentials: true,
            });
        } catch (err) {
            setError("Failed to reject meeting.");
            updateMeetingStatus(meetingId, 'pending');
        }
    };

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

    const meetingRequest = async (meeting) => {
        try {
            await axios.post(`http://localhost:5000/meetings/sendmeetingreq`, { meeting }, {
                withCredentials: true,
            });
            setUpdateCount(prev => prev + 1);
        } catch (err) {
            setError("Failed to request meeting.");
        }
    }

    return {
        meetings,
        loading,
        error,
        meetingRequest,
        selectedStatus,
        setSelectedStatus,
        meetingsToDisplay,
        handleConfirm,
        handleReject,
    };
};

export default useMeetings;
