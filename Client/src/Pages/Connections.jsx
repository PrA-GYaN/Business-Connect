import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import useProfile from '../Hooks/useProfile';
import { useAuthContext } from '../Context/AuthContext';
import styles from '../Styles/Connections.module.css';
import Card from '../Components/Card';
import Loader from '../Components/Loader';

const Connections = () => {
    const { authUser } = useAuthContext();
    const { getProfileById, getAllUsers,like_dislike } = useProfile();
    const [connections, setConnections] = useState([]);
    const [users, setUsers] = useState([]);
    const [swipedCardIds, setSwipedCardIds] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleSwipe = async(likedUserId,action) => {
        console.log(`Swiped ${action} on card ${likedUserId}`);
        like_dislike(likedUserId,action);
        setSwipedCardIds((prev) => [...prev, likedUserId]);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const profile = await getProfileById(authUser);
                setConnections(profile.connections || []);
                const usersData = await getAllUsers();
                setUsers(usersData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authUser]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader/>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.connectionsBox}>
                <div className={styles.connectionsContainer}>
                    <div className={styles.leftPanel}>
                        <span className={styles.leftTitle}>Connections</span>
                        <div className={styles.userConnections}>
                            {connections.length > 0 ? (
                                connections.map((connection) => (
                                    <div key={connection.id} className={styles.connectionCard}>
                                        <div className={styles.connectionProfile}>
                                        <div
                                            className={styles.profilePic}
                                            style={{
                                                backgroundImage: `url(${connection.userId.profilePic[0].url})`,
                                            }}
                                            ></div>
                                        </div>
                                        <div className={styles.connectionDetails}>
                                            <span className={styles.connectionName}>{connection.userId.fullName}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className={styles.noConnections}>No connections available</span>
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