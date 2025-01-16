import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';

const useThread = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authUser } = useAuthContext();

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await axios.get('http://localhost:5000/threads/getall');
                const data = Array.isArray(response.data) ? response.data : [];
                setThreads(data);
            } catch (error) {
                console.error('Error fetching threads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, []);

    const getThreadByProfile = async (profileId) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/threads/getthreadbyprofile/${profileId}`);
            return data;
        } catch (error) {
            console.error('Error fetching thread:', error);
            return null;
        }
    };

    const getThreadById = async (threadId) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/threads/getthreadbyid/${threadId}`);
            return data;
        } catch (error) {
            console.error('Error fetching thread:', error);
            return null;
        }
    }

    const handleVote = async (threadId, voteType) => {
        console.log("ThreadId:",threadId);
        try {
            const url = `http://localhost:5000/threads/${voteType}/${threadId}`;
            const response = await axios.post(url, {}, { withCredentials: true });
            setThreads((prevThreads) =>
                prevThreads.map((thread) =>
                    thread._id === threadId
                        ? { ...thread, upvotes: response.data.upvotes, downvotes: response.data.downvotes }
                        : thread
                )
            );
        } catch (error) {
            console.error(`Error ${voteType} voting thread:`, error);
        }
    };

    const hasUpvoted = (thread) => {
        return thread.upvotes.includes(authUser);
    };

    const hasDownvoted = (thread) => {
        return thread.downvotes.includes(authUser);
    };

    const calculateTotalVotes = (upvotes, downvotes) => {
        return upvotes.length - downvotes.length;
    };

    return {
        threads,
        loading,
        getThreadByProfile,
        handleVote,
        hasUpvoted,
        hasDownvoted,
        calculateTotalVotes,
        getThreadById
    };
};

export default useThread;