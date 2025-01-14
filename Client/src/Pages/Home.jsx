import Feed from './Feed'
import { useEffect, useState } from 'react';
import styles from '../Styles/Home.module.css';
import Navbar from '../Components/Navbar';
// import Loader from '../Components/Loader';
import { useAuthContext } from '../Context/AuthContext';
import useProfile from '../Hooks/useProfile';
import Modal from '../Components/Modal';
import { FcViewDetails } from "react-icons/fc";
import { FcCollaboration } from "react-icons/fc";
import { FcOvertime } from "react-icons/fc";
import { IoMdSearch } from "react-icons/io";

const Home = () => {
  const {authUser,fullName,profilePic} = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const { getProfileById } = useProfile();
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
        try {
            const user = await getProfileById(authUser);
            setUser(user || []);
            setConnections(user.connections || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    fetchData();
}, [authUser]);

  return (
    <div className={styles.homeBox}>
      <Navbar/>
      <div className={styles.homeContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.profileBox}>
            <div className={styles.profilePic} style={{backgroundImage: `url(${profilePic})`}}></div>
            <div className={styles.profileInfo}>
              <div className={styles.fullName}>
                {fullName}
                </div>
                <div className={styles.businessTitle}>
                  {user.businessTitle}
                </div>
                <div className={styles.Company}>
                  Works at {user.company}
                </div>
                <div className={styles.connections}>
                  Connections: {user.connections?.length}
                </div>
                {/* <div className={styles.meetings}>
                  Meetings: {user.meetings?.length}
                  </div> */}

            </div>
            <div className={styles.profilebtns}>
              <div className={styles.posts}>
                <FcViewDetails className={styles.icon}/> Posts
              </div>
              <div className={styles.posts}>
                <FcCollaboration className={styles.icon}/> Threads
              </div>
              <div className={styles.posts}>
                <FcOvertime className={styles.icon}/> Meetings
              </div>
            </div>
            </div>
        </div>
        <div className={styles.centerPanel}>
          <div className={styles.createPost} onClick={openModal}>
          <Modal isOpen={isModalOpen} onClose={closeModal} />
            <div className={styles.profilePicsm} style={{backgroundImage: `url(${profilePic})`}}></div>
            <input className={styles.createPostInput} type="text" placeholder={`What's on your mind? ${fullName}`}/>
            <button type="submit" className={styles.postBtn}>
              Post
            </button>
          </div>
          <Feed/>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.friendBox}>
            <div className={styles.titleBox}>
              <span className={styles.rightTitle}>Friends</span>
              {/* <IoMdSearch className={styles.searchIcon}/> */}
            </div>
            <div className={styles.friendList}>
              {connections.length > 0 ? (
                  connections.map((connection) => (
                      <div key={connection.id} className={styles.connectionCard}>
                          <div className={styles.connectionProfile}>
                          <div
                              className={styles.profilePicfriend}
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
        </div>
      </div>
    </div>
  )
}

export default Home
