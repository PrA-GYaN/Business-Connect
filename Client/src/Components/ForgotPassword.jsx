import React, { useState, useEffect } from 'react';
import styles from '../Styles/Otp.module.css';
import useOtpSender from '../Hooks/useOtpSender';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import ChangePassword from './ChangePassword';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { verifyOtp, sendOtpfunc } = useOtpSender();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false); // Track OTP verification status
  const location = useLocation();
  const [mainOTP, setMainOTP] = useState('');
  const { phonenumber, sentOtp } = location.state || {};

  
  // Set mainOTP from sentOtp if available
  useEffect(() => {
    if (!sentOtp) {
      navigate('/login');
    } else {
      setMainOTP(sentOtp);
    }
  }, [sentOtp, navigate]);

  console.log('Sent OTP:', mainOTP);

  const handleChange = (e, index) => {
    const value = e.target.value.slice(0, 1);
    if (/^\d?$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      manageFocus(value, index);
    }
  };

  const manageFocus = (value, index) => {
    if (value && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    } else if (!value && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs[index - 1]?.current?.focus();
    }
  };

  // Utility function for showing error toasts
  const showToastError = (message) => {
    toast.error(message || 'An error occurred');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter all digits of the OTP.');
      return;
    }
    if (!/^\d{6}$/.test(otpString)) {
      setError('OTP must be 6 digits.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(otpString, mainOTP);  // Awaiting the result
      if (res) {
        setVerified(true);
        toast.success('OTP Verified Successfully');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while verifying OTP.');
      console.error(error.response ? error.response.data : error.message);
      showToastError('An error occurred while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setOtp(['', '', '', '', '', '']);
    setError('');
    try {
      const gentOtp = await sendOtpfunc(phonenumber);
      setMainOTP(gentOtp);
      console.log('OTP resent successfully');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
      showToastError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const inputRefs = otp.map(() => React.createRef());

  return (
    <div className={styles.otpbox}>
      {!verified ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.title}>OTP Verification</div>
          <p className={styles.message}>We have sent a verification code to your WhatsApp Number</p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputs}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                id={`input${index + 1}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`OTP digit ${index + 1}`}
                className={styles.otpInput}
              />
            ))}
          </div>
          <button className={styles.action} type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Me'}
          </button>
          <span className={styles.rebox}>
            <p>Didn't receive the code?</p>
            <button className={styles.resend} onClick={handleResendOtp} disabled={isResending}>
              {isResending ? 'Resending...' : 'Resend OTP'}
            </button>
          </span>
        </form>
      ) : (
        <ChangePassword phone={phonenumber} />
      )}
    </div>
  );
};

export default ForgotPassword;