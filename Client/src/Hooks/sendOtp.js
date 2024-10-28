import { useState } from 'react';
import axios from 'axios';

const useOtpSender = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [sentOtp, setSentOtp] = useState(''); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateOtp = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        const generatedOtp = generateOtp();
        setSentOtp(generatedOtp);
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/users/send-otp', {
                phoneNumber,
                otp: generatedOtp,
            });
            alert(response.data.message);
        } catch (err) {
            setError('Failed to send OTP.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        phoneNumber,
        setPhoneNumber,
        sentOtp, // Changed otp to sentOtp
        sendOtp,
        error,
        loading,
    };
};

export default useOtpSender;
