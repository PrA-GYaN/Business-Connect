import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import useProfile from '../Hooks/useProfile';
import { useAuthContext } from '../Context/AuthContext';
import styles from '../Styles/Connections.module.css';
import Card from '../Components/Card';
import Loader from '../Components/Loader';
import ModalProfile from '../Components/modalProfile.jsx';

const Connections = () => {
    const { authUser, openProfile } = useAuthContext();
    const { getProfileById, getAllUsers, like_dislike,getRecUsers } = useProfile();
    const [connections, setConnections] = useState([]);
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [swipedCardIds, setSwipedCardIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('connections');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleSwipe = async (likedUserId, action) => {
        console.log(`Swiped ${action} on card ${likedUserId}`);
        like_dislike(likedUserId, action);
        setSwipedCardIds((prev) => [...prev, likedUserId]);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!authUser) return;

            setLoading(true);
            try {
                const profile = await getProfileById(authUser);
                setConnections(profile.connections || []);
                setRequests(profile.requests || []);
                let user_interests = [];
                let user_skills = [];
                let likedUserIds = [];
                if(profile.businessType === "individual"){
                    user_interests = profile.interests;
                    user_skills = profile.skills;
                    likedUserIds = profile.swipes
                    .filter(swipe => swipe.action === "Liked")
                    .map(swipe => swipe.userId);
                }
                if(profile.businessType === "house"){
                    user_interests = profile.operationalFocus;
                    user_skills = profile.technologies;
                    likedUserIds = profile.swipes
                    .filter(swipe => swipe.action === "Liked")
                    .map(swipe => swipe.userId);
                }
                likedUserIds.push(authUser);
                console.log("Interests:",user_interests);
                console.log("Skills:",user_skills);
                console.log("Liked User Ids:",likedUserIds);
                const usersData = await getRecUsers(user_interests,user_skills,likedUserIds);
                setUsers(usersData || []);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authUser]); // Dependency on authUser, this will re-run when authUser changes

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader />
            </div>
        );
    }
    const openModal = (userId) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null);
    };

    return (
        <>
            <Navbar />
            {isModalOpen && <ModalProfile id={selectedUserId} onClose={closeModal} />}
            <div className={styles.connectionsBox}>
                <div className={styles.connectionsContainer}>
                    <div className={styles.leftPanel}>
                        <div className={styles.tabs}>
                            <div
                                className={`${styles.tabButton} ${
                                    activeTab === 'connections' ? styles.activeTab : ''
                                }`}
                                onClick={() => setActiveTab('connections')}
                            >
                                Connections
                            </div>
                            <div
                                className={`${styles.tabButton} ${
                                    activeTab === 'requests' ? styles.activeTab : ''
                                }`}
                                onClick={() => setActiveTab('requests')}
                            >
                                Requests
                            </div>
                        </div>
                        <div className={styles.tabContent}>
                            {activeTab === 'connections' && (
                                <div className={styles.userConnections}>
                                    {connections.length > 0 ? (
                                        connections.map((connection) => (
                                            <div
                                                key={connection.id}
                                                className={styles.connectionCard}
                                                onClick={() => openProfile({ id: connection.userId._id })}
                                            >
                                                <div className={styles.connectionProfile}>
                                                    <div
                                                        className={styles.profilePic}
                                                        style={{
                                                            backgroundImage: `url(${connection.userId.profilePic[0].url})`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className={styles.connectionDetails}>
                                                    <span className={styles.connectionName}>
                                                        {connection.userId.fullName}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className={styles.noConnections}>
                                            No connections available
                                        </span>
                                    )}
                                </div>
                            )}
                            {activeTab === 'requests' && (
                                <div className={styles.userConnections}>
                                    {requests.length > 0 ? (
                                        requests.map((request) => (
                                            <div
                                                key={request.id}
                                                className={styles.connectionCard}
                                                onClick={() => openModal(request._id)}
                                            >
                                                <div className={styles.connectionProfile}>
                                                    <div
                                                        className={styles.profilePic}
                                                        style={{
                                                            backgroundImage: `url(${request.profilePic[0].url})`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className={styles.connectionDetails}>
                                                    <span className={styles.connectionName}>
                                                        {request.fullName}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className={styles.noConnections}>
                                            No requests available
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.rightPanel}>
                        <div className={styles.homeContainer}>
                            <div className={styles.cardContainer}>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <Card
                                            key={user.id}
                                            card={user}
                                            onSwipe={handleSwipe}
                                            isGone={swipedCardIds.includes(user.fullName)}
                                            containerWidth={300}
                                        />
                                    ))
                                ) : (
                                    <span className={styles.noCards}>No more cards</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Connections;