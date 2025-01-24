import React, { useState } from 'react';
import styles from '../Styles/ChangePassword.module.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const url = import.meta.env.VITE_Backend_Url;

const ChangePassword = ({phone}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setSuccess('');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }
    setError('');
    try
    {
            const data = { phone, newPassword };
            console.log(data);
            const response = await axios.post(`${url}/users/change-password`, data, {
              withCredentials: true,
            });
            console.log(response.data);
            toast.success('Password changed successfully.');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
    }
    catch (error) {
      console.error('Error:', error);
      toast.error(error.response.data.error);
    }
    setSuccess('Password changed successfully!');
  };

  return (
    <div className={styles.changePasswordBox}>
      <h2 className={styles.heading}>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>New Password</label>
          <input
            className={styles.input}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Confirm Password</label>
          <input
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <button className={styles.submitButton} type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ChangePassword;