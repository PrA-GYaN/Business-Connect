import React from 'react'
import axios from 'axios';
import { useAuthContext } from '../Context/AuthContext';

const CreateThread = () => {
    const { authUser,fullName } = useAuthContext();

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
                author: authUser
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
    <>
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
    </>
  )
}

export default CreateThread
