import React, { useState } from 'react';
import Admin from "../Components/Admin";
import ModerateContent from "../Components/ModerateContent";
import VerifyRequest from "../Components/VerifyRequest";
import styles from "../Styles/UserAdmin.module.css";
import Loader from "../Components/Loader";
import axios from 'axios';

const UserAdmin = () => {
  const [selectedComponent, setSelectedComponent] = useState('admin');
  const [loading, setLoading] = useState(false);

  const handleNavigation = (component) => {
    setSelectedComponent(component);
  };

  const RefreshData = async() => {
    setLoading(true);
    try
    {
      await axios.post('http://localhost:5000/users/updateData');
      console.log(data);
      setLoading(false);
    }
    catch(error)
    {
      console.error("Error fetching threads: ", error);
    }
    finally
    {
      setLoading(false);
    }
    window.location.reload();
  }

  const renderContent = () => {
    switch (selectedComponent) {
      case 'admin':
        return <Admin />;
      case 'moderateContent':
        return <ModerateContent />;
      case 'verifyRequest':
        return <VerifyRequest />;
      default:
        return <Admin />;
    }
  };
  if(loading)
  {
    return <Loader/>
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Admin Panel</div>
        <ul className={styles.sidebarMenu}>
          <li
            className={`${styles.menuItem} ${selectedComponent === 'admin' ? styles.active : ''}`}
            onClick={() => handleNavigation('admin')}
          >
            Dashboard
          </li>
          <li
            className={`${styles.menuItem} ${selectedComponent === 'moderateContent' ? styles.active : ''}`}
            onClick={() => handleNavigation('moderateContent')}
          >
            Moderate Content
          </li>
          <li
            className={`${styles.menuItem} ${selectedComponent === 'verifyRequest' ? styles.active : ''}`}
            onClick={() => handleNavigation('verifyRequest')}
          >
            Verify Request
          </li>
        </ul>
        <button className={styles.refreshButton} onClick={RefreshData}>Refresh Data</button>
        <button className={styles.logoutButton}>Logout</button>
      </div>
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default UserAdmin;
