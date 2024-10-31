import Feed from './Feed'
import { useEffect, useState } from 'react';
import styles from '../Styles/Home.module.css';
import Navbar from '../Components/Navbar';
import Loader from '../Components/Loader';
import { useAuthContext } from '../Context/AuthContext';
import useProfile from '../Hooks/useProfile';
import Modal from '../Components/Modal';

const Home = () => {
  // const {loading} = useFeed();
  const {authUser,fullName,profilePic} = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const { getProfileById } = useProfile();
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
        try {
            const user = await getProfileById(authUser);
            setUser(user || []);
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
                  Business: {user.businessTitle}
                </div>
                <div className={styles.connections}>
                  Connections: {user.connections?.length}
                </div>
                <div className={styles.meetings}>
                  Meetings: {user.meetings?.length}
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
      </div>
    </div>
  )
}

export default Home
