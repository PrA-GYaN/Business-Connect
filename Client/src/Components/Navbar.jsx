import styles from '../Styles/Navbar.module.css';
import { useAuthContext } from '../Context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUserFriends, FaSortDown } from "react-icons/fa";
import { TiMessages } from "react-icons/ti";
import { IoNotifications, IoCalendarNumber } from "react-icons/io5";
import { PiUsersThreeFill } from "react-icons/pi";
import { GoDotFill } from "react-icons/go";
import { useState } from 'react';
import Loader from './Loader';

const Navbar = () => {
  const navigate = useNavigate();
  const { authUser, fullName, profilePic, logout,icon } = useAuthContext();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  if (!authUser || !fullName || !profilePic) {
    return (
      <Loader />
    );
  }
  const handleLogout = () => {
    console.log("Logging out...");
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
                    <PiUsersThreeFill className={styles.icons} />
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
                    <span className={styles.notificationIcon}>
                    {icon && <GoDotFill className={styles.notify} />}
                        <IoNotifications className={styles.icons} />
                      </span>
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
                  <div className={styles.navbarProfileDropdownItem} onClick={()=>navigate('/profile')}>
                    <div className={styles.dropdownLink}>Profile</div>
                  </div>
                  {
                    authUser === '6789c4d95460a8925b9e0a0a' && (
                      <div className={styles.navbarProfileDropdownItem} onClick={()=>navigate('/admin')}>
                        <div className={styles.dropdownLink}>Admin</div>
                      </div>
                    )
                  }
                  <div onClick={handleLogout} className={styles.navbarProfileDropdownItem}>
                    <div className={styles.dropdownButton}>Logout</div>
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