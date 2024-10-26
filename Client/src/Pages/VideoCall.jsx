import React, { useState } from 'react';
import { useSocketContext } from '../Context/SocketContext';
import { useAuthContext } from '../Context/AuthContext';
import Meeting from './Meeting';

const VideoCall = () => {
    const { onlineUsers } = useSocketContext();
    const { authUser } = useAuthContext();
    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleUserClick = (socketId) => {
        setSelectedUserId(socketId);
    };

    return (
        <div>
            <h2>Video Call</h2>
            <h3>Online Users:</h3>
            <ul>
                {Object.entries(onlineUsers)
                    .filter(([username]) => username !== authUser)
                    .map(([username, socketId]) => (
                        <li key={socketId}>
                            <div onClick={() => handleUserClick(socketId)}>
                                {username}
                            </div>
                        </li>
                    ))}
            </ul>
            {selectedUserId && <Meeting id={selectedUserId} />}
        </div>
    );
};

export default VideoCall;