import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useOtpSender = () => {
    const [phone, setPhoneNumber] = useState('');
    const [sentOtp, setSentOtp] = useState(''); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateOtp = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const verifyOtp = (otp,sentOtp) => {
        return otp === sentOtp;
    };

    const sendOtpfunc = async (phoneNumber) => {
        const generatedOtp = generateOtp();
        setSentOtp(generatedOtp);
        setLoading(true);
        setError(null);

        try {
            // const response = await axios.post('http://localhost:5000/users/send-otp', {
            //     phoneNumber,
            //     otp: generatedOtp,
            // });
            // toast.success(response.data.message);
            console.log(generatedOtp);
            return generatedOtp;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to send OTP.';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        phone,
        setPhoneNumber,
        sentOtp,
        sendOtpfunc,
        verifyOtp,
        error,
        loading,
    };
};

export default useOtpSender;