import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import styles from '../Styles/Login.module.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { phoneNumber, password };

    try {
      const response = await axios.post('http://localhost:5000/users/login', data, {
        withCredentials: true,
      });
      console.log(response.data);
      toast.success('Logged in successfully.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.loginBox}>
      <div className={styles.formContainer}>
        <p className={styles.title}>Login</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            className={styles.input}
            placeholder="+{Country Code}{Phone Number}"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            className={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <p className={styles.pageLink}>
            <span className={styles.pageLinkLabel}>Forgot Password?</span>
          </p>
          <button type="submit" className={styles.formBtn}>Log in</button>
        </form>
        <p className={styles.signUpLabel}>
          Don't have an account? <span className={styles.signUpLink}>
            <Link to="/signup">Sign up</Link>
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;