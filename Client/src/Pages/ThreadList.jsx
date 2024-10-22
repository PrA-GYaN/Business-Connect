import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../Context/AuthContext';

const ThreadList = () => {
    const { authUser,fullName } = useAuthContext();
    const [threads, setThreads] = useState([]); // Initialize as an empty array
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await axios.get('http://localhost:5000/thread/getall'); // Ensure this endpoint is correct
                console.log('Fetched threads:', response.data); // Log the response

                // Ensure response.data is an array
                const data = Array.isArray(response.data) ? response.data : [];
                setThreads(data);
            } catch (error) {
                console.error('Error fetching threads:', error);
            }
        };

        fetchThreads();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!authUser) {
            console.error('User is not authenticated');
            return;
        }

        try {
            const newThread = {
                title,
                content,
                author: authUser // Use the actual user ID from authUser
            };

            const response = await axios.post('http://localhost:5000/thread/create', newThread, {
                withCredentials: true,
            });
            const newthread = 
            {
                _id:'r4638r9h3ubrf',
                title,
                content,
                author:
                {
                    username:fullName
                },
                views:0
            }
            setThreads([newthread, ...threads]); // Update the thread list
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating thread:', error);
        }
    };

    return (
        <div>
            <h1>Threads</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button type="submit">Create Thread</button>
            </form>
            {threads.length === 0 ? (
                <p>No threads available. Be the first to create one!</p>
            ) : (
                <ul>
                    {threads.map((thread) => (
                        <li key={thread._id}>
                            <Link to={`/threads/${thread._id}`}>
                                <h2>{thread.title}</h2>
                            </Link>
                            <p>{thread.content}</p>
                            <p>Author: {thread.author.username}</p>
                            <p>Views: {thread.views}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ThreadList;