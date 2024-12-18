import React, { useState } from 'react';
import styles from '../Styles/Otp.module.css';
import useOtpSender from '../Hooks/useOtpSender';
import axios from 'axios';
import Setup from '../Pages/Setup';
import { toast } from 'react-toastify';

const PhoneVerification = ({ data, sentOtp }) => {
  const { verifyOtp, sendOtpfunc } = useOtpSender();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified,setVerify] = useState(false);

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
      document.getElementById(`input${index + 2}`)?.focus();
    } else if (!value && index > 0) {
      document.getElementById(`input${index}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      document.getElementById(`input${index}`)?.focus();
    }
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
      const res = await verifyOtp(otpString, sentOtp);
      if (res) {
        console.log('OTP Verified');
        await axios.post('http://localhost:5000/users/signup', data, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('User registered successfully.');
        setVerify(true);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while verifying OTP.');
      console.error(error.response ? error.response.data : error.message);
      toast.error('An error occurred while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setOtp(['', '', '', '', '', '']);
    setError('');
    try {
      await sendOtpfunc();
      console.log('OTP resent successfully');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {
        verified ? (<Setup fullName={data.fullName} businessType={data.businessType}/>):
        (
          <div className={styles.otpbox}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.title}>OTP Verification</div>
              <p className={styles.message}>We have sent a verification code to your WhatsApp Number</p>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.inputs}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
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
          </div>
        )
      }
    </>
  );
};

export default PhoneVerification;