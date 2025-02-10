import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import styles from '../Styles/Login.module.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import useOtpSender from '../Hooks/useOtpSender';
import Cookies from 'js-cookie';

const url = import.meta.env.VITE_Backend_Url;
const Login = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const validatePhoneNumber = (phone) => /^\+9779\d{9}$/.test(phone);
  const {
    sendOtpfunc,
} = useOtpSender();

  const setCookie = (token) => {
    console.log('Setting cookie:', token);
    Cookies.set('User', token, {
      expires: 1,  // 1 day expiration
      path: '/',  // Make the cookie available on the entire domain
      secure: process.env.NODE_ENV === 'production',  // Only set Secure in production
      sameSite: 'None',  // Allow cross-site cookies
    });
  };

  const handleForgotPassword = async() => {
    if(!validatePhoneNumber(phoneNumber)){
      toast.error('Please enter valid phone number to reset your password.');
      return;
    }
    const sentOtp = await sendOtpfunc(phoneNumber);
    navigate('/forgot-password',{state: {phonenumber:phoneNumber,sentOtp: sentOtp}});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { phoneNumber, password };

    try {
      const response = await axios.post(`${url}/users/login`, data, {
        withCredentials: true,
      });
      toast.success('Logged in successfully.');
      const cookie = response.cookie;
      console.log('Cookie:', cookie);
      setCookie(cookie);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response.data.error);
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
            <span className={styles.pageLinkLabel} onClick={handleForgotPassword}>Forgot Password?</span>
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