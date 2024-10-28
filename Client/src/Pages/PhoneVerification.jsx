import React, { useState } from 'react';
import styles from '../Styles/Otp.module.css';

const PhoneVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const handleChange = (e, index) => {
    const newOtp = [...otp];
    
    // Handle backspace
    if (e.target.value === '' && e.key !== 'Backspace') {
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) {
        const prevInput = document.getElementById(`input${index}`);
        if (prevInput) {
          prevInput.focus();
        }
      }
    } else {
      newOtp[index] = e.target.value.slice(0, 1);
      setOtp(newOtp);

      // Focus next input if current input is filled
      if (e.target.value && index < 5) {
        const nextInput = document.getElementById(`input${index + 2}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      const prevInput = document.getElementById(`input${index}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter all digits of the OTP.');
      return;
    }

    // Simulate OTP verification
    console.log('Verifying OTP:', otpString);
    // Add your verification logic here

    // Reset error if verification is successful
    setError('');
  };

  return (
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
        <button className={styles.action} type="submit">Verify Me</button>
        <span className={styles.rebox}>
        <p>Didn't receive the code?</p>
      <button className={styles.resend} onClick={() => console.log('Resend OTP')}>Resend OTP</button>
      </span>
      </form>
     
    </div>
  );
};

export default PhoneVerification;