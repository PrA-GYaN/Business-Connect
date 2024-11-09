import styles from '../Styles/Navbar.module.css';
import { useAuthContext } from '../Context/AuthContext';
import { NavLink } from 'react-router-dom';  // Import Link for navigation
import { FaHome, FaUserFriends, FaSortDown } from "react-icons/fa";
import { TiMessages } from "react-icons/ti";
import { IoNotifications, IoCalendarNumber,IoPeopleSharp } from "react-icons/io5";
import { useState } from 'react'; // Import useState
import Loader from './Loader';

const Navbar = () => {
  const { authUser, fullName, profilePic, logout } = useAuthContext();
  
  // State to manage dropdown visibility
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Check if the necessary data is available
  if (!authUser || !fullName || !profilePic) {
    return (
      <Loader />
    );
  }

  const handleLogout = () => {
    logout();
  };

  const toggleDropdown = () => {
    setDropdownOpen(prevState => !prevState);
  };

  return (
    <div className={styles.navbarBox}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLeft}>
          <div className={styles.navbarLogo}>
            {/* Logo (if needed) */}
          </div>
        </div>
        <div className={styles.navbarRight}>
          <div className={styles.navbarLinks}>
            <div className={styles.navbarLinkItem}>
                <NavLink
                  to="/"
                  aria-label="Home"
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.nonActiveLink)}
                >
                  <span className={styles.navbarLinkSpan}>
                    <FaHome className={styles.icons} />
                  </span>
                </NavLink>
            </div>
            <div className={styles.navbarLinkItem}>
                <NavLink
                  to="/connections"
                  aria-label="Connections"
                  className={({ isActive }) => (isActive ? styles.activeLink :styles.nonActiveLink)}
                >
                  <span className={styles.navbarLinkSpan}>
                    <FaUserFriends className={styles.icons} />
                  </span>
                </NavLink>
            </div>
            <div className={styles.navbarLinkItem}>
                <NavLink
                  to="/messages"
                  aria-label="Messages"
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.nonActiveLink)}
                >
                  <span className={styles.navbarLinkSpan}>
                    <TiMessages className={styles.icons} />
                  </span>
                </NavLink>
            </div>
            <div className={styles.navbarLinkItem}>
                <NavLink
                  to="/meeting"
                  aria-label="Meeting"
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.nonActiveLink)}
                >
                  <span className={styles.navbarLinkSpan}>
                    <IoCalendarNumber className={styles.icons} />
                  </span>
                </NavLink>
            </div>
            <div className={styles.navbarLinkItem}>
                <NavLink
                  to="/threads"
                  aria-label="threads"
                  className={({ isActive }) => (isActive ? styles.activeLink : styles.nonActiveLink)}
                >
                  <span className={styles.navbarLinkSpan}>
                    <IoPeopleSharp className={styles.icons} />
                  </span>
                </NavLink>
            </div>
            <div className={styles.navbarLinkItem}>
                <NavLink
                  to="/notifications"
                  aria-label="Notifications"
                  className={({ isActive }) => (isActive ? styles.activeLink :styles.nonActiveLink)}
                >
                  <span className={styles.navbarLinkSpan}>
                    <IoNotifications className={styles.icons} />
                  </span>
                </NavLink>
            </div>
          </div>
          <div className={styles.navbarProfile}>
            <div
              className={`${styles.navbarProfileDropdown} ${isDropdownOpen ? styles.open : ''}`}
              onClick={toggleDropdown}
            >
              <div className={styles.navbarProfilePic}>
                <div className={styles.profilePic} style={{ backgroundImage: `url(${profilePic})` }} />
              </div>
              <FaSortDown />
              {isDropdownOpen && (
                <div className={styles.navbarProfileDropdownContent}>
                  <div className={styles.navbarProfileDropdownItem}>
                    <NavLink to="/profile" className={styles.dropdownLink}>Profile</NavLink>
                  </div>
                  <div className={styles.navbarProfileDropdownItem} >
                    <div onClick={handleLogout} className={styles.dropdownButton}>Logout</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;