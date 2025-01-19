import React, { useState, useEffect, useRef } from 'react';
import useGetConversations from '../Hooks/useGetConversations';
import Navbar from '../Components/Navbar';
import styles from '../Styles/Messages.module.css';
import { RiChatNewFill } from "react-icons/ri";
import { BsSendFill } from "react-icons/bs";
import useConversation from '../Hooks/useConversation';
import useSendMessage from '../Hooks/useSendMessage';
import useGetMessages from '../Hooks/useGetMessages';
import { useAuthContext } from '../Context/AuthContext';
import { SlOptionsVertical } from "react-icons/sl";
import { RiCalendarScheduleFill } from "react-icons/ri";
import MeetingScheduler from '../Components/MeetingScheduler';
import { useNavigate } from 'react-router-dom';
import Loader from '../Components/Loader';

const Messages = () => {
    const { authUser, openProfile } = useAuthContext();
    const { selectedConversation, setSelectedConversation,isTyping } = useConversation();
    const { loading, finalConversations, error } = useGetConversations();
    const { sendMessage } = useSendMessage();
    const { messages } = useGetMessages();
    const [message, setMessage] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // New state for search query
    const conversations = finalConversations;
    const navigate = useNavigate();

    console.log("conversations", conversations);
    // Handle the search query input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { conversationId: selectedConversation._id });
        }
        setTimeout(() => setIsTyping(false), 3000);
    };
    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader />
            </div>
        );
    }

    // Filter conversations based on search query
    const filteredConversations = conversations.filter((conversation) =>
        conversation.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openVideoCall = () => {
        if (selectedConversation) {
            navigate('/call', { state: { selectedConversationId: selectedConversation._id } });
        }
    };

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
    const formatTimestamp = (timestamp) => {
        const messageDate = new Date(timestamp);
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
    
        const isToday = messageDate.toDateString() === today.toDateString();
        const isWithinWeek = messageDate >= oneWeekAgo && messageDate <= today;
        const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
        if (isToday) {
            return time;
        }
        if (isWithinWeek) {
            const dayOfWeek = messageDate.toLocaleDateString([], { weekday: 'short' });
            return `${dayOfWeek}, ${time}`;
        }
        const date = messageDate.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
        return `${date}, ${time}`;
    };
    
    return (
        <div className={styles.messagesBox}>
            <Navbar />
            <div className={styles.messagesContainer}>
                <Sidebar
                    loading={loading}
                    error={error}
                    conversations={filteredConversations} // Pass the filtered conversations
                    selectedConversation={selectedConversation}
                    onUserClick={handleUserClick}
                    searchQuery={searchQuery} // Pass search query to Sidebar
                    onSearchChange={handleSearchChange} // Pass the search handler
                />
                <ChatBox
                    selectedConversation={selectedConversation}
                    messages={messages}
                    message={message}
                    setMessage={setMessage}
                    handleSend={handleSend}
                    handleKeyDown={handleKeyDown}
                    authUser={authUser}
                    formatTimestamp={formatTimestamp}
                    isModalOpen={isModalOpen}
                    setModalOpen={setModalOpen}
                    openVideoCall={openVideoCall}
                    open={openProfile}
                    isTyping={isTyping}
                />
            </div>
        </div>
    );
};

const Sidebar = ({ loading, error, conversations, selectedConversation, onUserClick, searchQuery, onSearchChange }) => {
    if (loading) return <div>Loading conversations...</div>;
    if (error) return <div>Error loading conversations: {error.message}</div>;
    const handleDeleteConversation = (conversationId) => {
        console.log("Deleting conversation with ID:", conversationId);
    };
    return (
        <div className={styles.sideBar}>
            <div className={styles.sideBartop}>
                <div className={styles.sideTitle}>Chats</div>
            </div>
            <div className={styles.search}>
                <input 
                    type="text" 
                    className={styles.search__input} 
                    placeholder="Search for users" 
                    value={searchQuery} // Bind the search input value
                    onChange={onSearchChange} // Handle input changes
                    aria-label="Search for users" 
                />
            </div>
            <div className={styles.usersBox}>
                {conversations.map(conversation => (
                    <UserItem
                        key={conversation._id}
                        conversation={conversation}
                        isSelected={selectedConversation && selectedConversation._id === conversation.userId._id}
                        onClick={() => onUserClick(conversation.userId)}
                        ondelete = {() => handleDeleteConversation(conversation._id)}
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
            <div className={styles.lastMessage}>{conversation.lastMessage}{"\u00A0\u00A0\u00A0"}{conversation.timeAgo}</div>
        </div>
        <div className={styles.options}>
            <SlOptionsVertical className={styles.optionIcon}/>
        </div>
    </div>
);

const ChatBox = ({ selectedConversation, messages, authUser, message,isTyping, setMessage, handleSend,formatTimestamp, handleKeyDown, isModalOpen, open, setModalOpen, openVideoCall }) => {
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, selectedConversation]);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    if (!selectedConversation) return (
        <div className={styles.emptyBox}>
            <h3>Select a user to chat</h3>
        </div>
    );

    const groupedMessages = groupMessages(messages);

    return (
        <div className={styles.chatBox}>
            <div className={styles.profileInteractions}>
                <div className={styles.profileInfo}>
                    <div className={styles.profilePicsm} style={{ backgroundImage: `url(${selectedConversation.profilePic[0].url})` }} />
                    <div className={styles.profileName} onClick={() => open({ id: selectedConversation._id })}>{selectedConversation.fullName}</div>
                </div>
                <div className={styles.interactions}>
                    <span
                        className={styles.interactionBtn}
                        onClick={openModal}
                    >
                        <RiCalendarScheduleFill className={styles.schedule} />
                    </span>
                </div>
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
                            {formatTimestamp(group[0].createdAt)}
                        </div>
                        {group.map((msg, msgIndex) => (
                            <div key={msgIndex} className={`${styles.message} ${(authUser === msg.senderId) ? styles.sender : styles.receiver}`}>
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
            <div className={styles.typingIndicator}>
                {isTyping && <p>{selectedConversation.fullName} is typing...</p>}
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

            {/* Conditionally render MeetingScheduler modal */}
            {isModalOpen && (
                <MeetingScheduler
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    participants={[{ userId: selectedConversation._id, status: 'pending' }]}
                />
            )}
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
            const timeDiff = (msgTime - lastMsgTime) / 1000;

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