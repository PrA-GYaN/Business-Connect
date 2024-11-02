import React, { useState,useEffect,useRef } from 'react';
import useGetConversations from '../Hooks/useGetConversations';
import Navbar from '../Components/Navbar';
import styles from '../Styles/Messages.module.css';
import { RiChatNewFill } from "react-icons/ri";
import { BsSendFill } from "react-icons/bs";
import useConversation from '../Hooks/useConversation';
import useSendMessage from '../Hooks/useSendMessage';
import useGetMessages from '../Hooks/useGetMessages';
import { useAuthContext } from '../Context/AuthContext';

const Messages = () => {
    const {authUser} = useAuthContext();
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { loading, conversations, error } = useGetConversations();
    const { sendMessage } = useSendMessage();
    const { messages } = useGetMessages();
    const [message, setMessage] = useState('');

    const handleUserClick = (user) => {
        setSelectedConversation(user);
    };

    const handleSend = () => {
        if (message.trim()) {
            sendMessage(message);
            console.log("Sending message:", message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className={styles.messagesBox}>
            <Navbar />
            <div className={styles.messagesContainer}>
                <Sidebar 
                    loading={loading}
                    error={error}
                    conversations={conversations} 
                    selectedConversation={selectedConversation} 
                    onUserClick={handleUserClick} 
                />
                <ChatBox 
                    selectedConversation={selectedConversation} 
                    messages={messages} 
                    message={message} 
                    setMessage={setMessage} 
                    handleSend={handleSend} 
                    handleKeyDown={handleKeyDown} 
                    authUser={authUser}
                />
            </div>
        </div>
    );
};

const Sidebar = ({ loading, error, conversations, selectedConversation, onUserClick }) => {
    if (loading) return <div>Loading conversations...</div>;
    if (error) return <div>Error loading conversations: {error.message}</div>;

    return (
        <div className={styles.sideBar}>
            <div className={styles.sideBartop}>
                <div className={styles.sideTitle}>Chats</div>
                <RiChatNewFill className={styles.newChat} />
            </div>
            <div className={styles.search}>
                <input type="text" className={styles.search__input} placeholder="Search for users" aria-label="Search for users" />
                <button className={styles.search__button} aria-label="Search"></button>
            </div>
            <div className={styles.usersBox}>
                {conversations.map(conversation => (
                    <UserItem 
                        key={conversation._id} 
                        conversation={conversation} 
                        isSelected={selectedConversation && selectedConversation._id === conversation.userId._id} 
                        onClick={() => onUserClick(conversation.userId)} 
                    />
                ))}
            </div>
        </div>
    );
};

const UserItem = ({ conversation, isSelected, onClick }) => (
    <div 
        className={`${styles.user} ${isSelected ? styles.selected : ''}`} 
        onClick={onClick} 
        role="button" 
        tabIndex={0} 
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        aria-label={`Chat with ${conversation.userId.fullName}`}
    >
        <div className={styles.profilePic} style={{ backgroundImage: `url(${conversation.userId.profilePic[0].url})` }} />
        <div className={styles.userInfo}>
            <div className={styles.userName}>{conversation.userId.fullName}</div>
            <div className={styles.lastMessage}>Test Message</div>
        </div>
    </div>
);

const ChatBox = ({ selectedConversation, messages,authUser, message, setMessage, handleSend, handleKeyDown }) => {
    const messagesContainerRef = useRef(null);
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, selectedConversation]);

    if (!selectedConversation) return(
        <div className={styles.emptyBox}>
            <h3>Select a user to chat</h3>
        </div>
    );

    const groupedMessages = groupMessages(messages);

    return (
        <div className={styles.chatBox}>
            <div className={styles.profileInfo}>
                <div className={styles.profilePicsm} style={{ backgroundImage: `url(${selectedConversation.profilePic[0].url})` }} />
                <div className={styles.profileName}>{selectedConversation.fullName}</div>
            </div>
            <hr />
            <div 
                className={styles.messages} 
                ref={messagesContainerRef} 
                style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
            >
                {groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex} className={styles.groupBox}>
                        <div className={styles.timestamp}>
                            {new Date(group[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {group.map((msg, msgIndex) => (
                            <div key={msgIndex} className={`${styles.message} ${(authUser===msg.senderId)? styles.sender:styles.receiver}`}>
                            <div
                                className={styles.profilePicsm}
                                style={{
                                    backgroundImage: authUser === msg.senderId ? 'none' : `url(${selectedConversation.profilePic[0].url})`,
                                }}
                                />
                                <div className={styles.messageContent}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className={styles.messageBox}>
                <input
                    placeholder='Type a message'
                    className={styles.messageInput}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Type a message"
                />
                <BsSendFill 
                    className={styles.sendBtn} 
                    onClick={handleSend} 
                    role="button" 
                    tabIndex={0} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    aria-label="Send message"
                />
            </div>
        </div>
    );
};


const groupMessages = (messages) => {
    const grouped = [];
    let currentGroup = [];

    messages.forEach((msg) => {
        const msgTime = new Date(msg.createdAt);
        if (currentGroup.length === 0) {
            currentGroup.push(msg);
        } else {
            const lastMsgTime = new Date(currentGroup[currentGroup.length - 1].createdAt);
            const timeDiff = (msgTime - lastMsgTime) / 1000; // difference in seconds

            if (timeDiff <= 60 && msg.senderId === currentGroup[0].senderId) {
                currentGroup.push(msg);
            } else {
                grouped.push(currentGroup);
                currentGroup = [msg];
            }
        }
    });

    if (currentGroup.length > 0) {
        grouped.push(currentGroup);
    }

    return grouped;
};


export default Messages;
