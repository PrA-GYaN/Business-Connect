import React, { useState } from 'react';
import useGetConversations from '../Hooks/useGetConversations';
import Navbar from '../Components/Navbar';
import styles from '../Styles/Messages.module.css';
import { RiChatNewFill  } from "react-icons/ri";

const Messages = () => {
    const { loading, conversations } = useGetConversations();
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    return (
        <div className={styles.messagesBox}>
            <Navbar />
            <div className={styles.messagesContainer}>
                <div className={styles.sideBar}>
                    <div className={styles.sideBartop}>
                        <div className={styles.sideTitle}>Chats</div>
                        <span>
                        <RiChatNewFill className={styles.newChat}/>
                        </span>
                    </div>
                    <div className={styles.search}>
                        <input 
                            type="text" 
                            className={styles.search__input} 
                            placeholder="Search for users" 
                        />
                        <button className={styles.search__button}>
                            <svg className={styles.search__icon} aria-hidden="true" viewBox="0 0 24 24">
                                <g>
                                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                                </g>
                            </svg>
                        </button>
                    </div>
                    <div className={styles.usersBox}>
                        {conversations.map((conversation) => (
                            <div className={`${styles.user} ${conversation.userId._id === (selectedUser ? selectedUser._id : null) ? styles.selected : ''}`} key={conversation._id}>
                                <div className={styles.profilePic} style={{backgroundImage:`url(${conversation.userId.profilePic[0].url})`}}>
                                </div>
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}  onClick={() => handleUserClick(conversation.userId)}>
                                        {conversation.userId.fullName}
                                    </div>
                                    <div className={styles.lastMessage}>
                                        Test Message
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.chatBox}>
                    {selectedUser ? (
                        <>
                            <div className={styles.profileInfo}>
                                <div className={styles.profilePicsm} style={{backgroundImage:`url(${selectedUser.profilePic[0].url})`}}></div>
                                <div className={styles.profileName}>{selectedUser.fullName}</div>
                            </div>
                            <hr/>
                            <div className={styles.messages}>
                                {messages.map((message, index) => (
                                    <div key={index} className={styles.message}>
                                        {message}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.messageBox}>
                                <input placeholder='Type a message' className={styles.messageInput} />
                            </div>
                        </>
                    ) : (
                        <h3>Select a user to chat</h3>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
