import styles from '../Styles/Navbar.module.css';
import { useAuthContext } from '../Context/AuthContext';

const Navbar = () => {
  const {logout} = useAuthContext();
  return (
    <>
        <div className={styles.navbarBox}>
            <div className={styles.navbarContainer}>
                <div onClick={()=>logout()}>LogOut</div>
            </div>
        </div>
    </>
  )
}

export default Navbar
