import React, { useState } from 'react';
import axios from 'axios';
import styles from '../Styles/Signup.module.css';
import useOtpSender from '../Hooks/useOtpSender';
import PhoneVerification from '../Components/PhoneVerification';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// const validatePhoneNumber = (phone) => /^\+\d{1,3}\d{10}$/.test(phone);
const validatePhoneNumber = (phone) => /^\+9779\d{9}$/.test(phone);
// const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password);
const validatePassword = (password) => /^.{5,}$/.test(password);


const Signup = () => {
    const [formDataObject, setFormDataObject] = useState(null);
    const [otpPage,setOtpPage] = useState(false);
    const [otp,setOtp] = useState('');
    const {
        setPhoneNumber,
        sendOtpfunc,
    } = useOtpSender();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        businessTitle: '',
        industry: '',
        phoneNumber: '',
        address: '',
        dob: '',
        gender: '',
        businessType: '',
        company:'',
        image: null,
    });
    const [image, setImage] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData((prevData) => ({
            ...prevData,
            image: file, // Update image field
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: undefined });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = "Full Name is required.";
        if (!formData.email || !validateEmail(formData.email)) {
            newErrors.email = "Valid email is required.";
        }
        if (!formData.password || !validatePassword(formData.password)) {
            newErrors.password = "Password must be at least 8 characters long and contain an uppercase letter and a number.";
        }
        if (confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        if (!formData.phoneNumber || !validatePhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = "Valid Phone Number is required.";
        }
        if (!formData.businessTitle) newErrors.businessTitle = "Business Title is required.";
        if (!formData.address) newErrors.address = "Address is required.";
        if (!formData.dob) newErrors.dob = "Date of Birth is required.";
        if (!formData.gender) newErrors.gender = "Gender is required.";
        if (!formData.industry) newErrors.industry = "Industry is required.";
        if (!formData.businessType) newErrors.businessType = "Business Type is required.";
        return newErrors;
    };

    const formDataToObject = (formData) => {
        const obj = {};
        for (const [key, value] of formData.entries()) {
            if (key === 'image') {
                obj[key] = value;
            } else {
                obj[key] = value;
            }
        }
        return obj;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        const formDataToSubmit = new FormData();
        for (const key in formData) {
            formDataToSubmit.append(key, formData[key]);
        }
        if (formData.image) {
            formDataToSubmit.append('image', formData.image);
        }
        const formDataObject = formDataToObject(formDataToSubmit);
        setFormDataObject(formDataObject);
        const phone = formData.phoneNumber;
        setPhoneNumber(phone);
        setOtpPage(true); 
        const genotp = await sendOtpfunc(phone);
        setOtp(genotp);
    };

    return (
        <>
        {otpPage ? (<PhoneVerification data={formDataObject} sentOtp={otp}/>):(
            <div className={styles.signupbox}>
                <div className={styles.formbox}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <span className={styles.title}>Sign up</span>
                        <span className={styles.subtitle}>Create a free account with your email.</span>
                        <div className={styles.formContainer}>
                            <div className={styles.grp}>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                    {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        placeholder="Email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        placeholder="Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && <span className={styles.error}>{errors.password}</span>}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Phone Number (+CountryCode 1234567890)"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                    {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Business Title"
                                        name="businessTitle"
                                        value={formData.businessTitle}
                                        onChange={handleChange}
                                    />
                                    {errors.businessTitle && <span className={styles.error}>{errors.businessTitle}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Company Name"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                    {errors.businessTitle && <span className={styles.error}>{errors.company}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                    {errors.address && <span className={styles.error}>{errors.address}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                    />
                                    {errors.dob && <span className={styles.error}>{errors.dob}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div className={styles.genderGrp}>
                                    <div className={styles.genderLabel}>Gender:</div>
                                    <div className={styles.genderOptions}>
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                className={styles.gender}
                                                checked={formData.gender === 'male'}
                                                onChange={handleChange}
                                            />
                                            Male
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                className={styles.gender}
                                                checked={formData.gender === 'female'}
                                                onChange={handleChange}
                                            />
                                            Female
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="other"
                                                className={styles.gender}
                                                checked={formData.gender === 'other'}
                                                onChange={handleChange}
                                            />
                                            Other
                                        </label>
                                    </div>
                                    {errors.gender && <span className={styles.error}>{errors.gender}</span>}
                                </div>
                            </div>
                            <div className={styles.grp}>
                                <div>
                                    <label>
                                        Profile Picture:
                                        <input type="file" onChange={handleImageChange} />
                                    </label>
                                    {image && <p>{image.name}</p>}
                                </div>
                            </div>
                            <label className={styles.inputLabel} htmlFor="industry">Industry:</label>
                            <div className={styles.grp}>
                                <div>
                                    <select
                                        className={styles.input}
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="technology">Technology</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="finance">Finance</option>
                                        <option value="education">Education</option>
                                        <option value="retail">Retail</option>
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="hospitality">Hospitality</option>
                                        <option value="real estate">Real Estate</option>
                                        <option value="transportation">Transportation</option>
                                        <option value="non-profit">Non-Profit</option>
                                    </select>
                                    {errors.industry && <span className={styles.error}>{errors.industry}</span>}
                                </div>
                            </div>
                            <label className={styles.inputLabel} htmlFor="businessType">Business Type:</label>
                            <div className={styles.grp}>
                                <div>
                                    <select
                                        className={styles.input}
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Business Type</option>
                                        <option value="individual">Business Individual</option>
                                        <option value="house">Business House</option>
                                    </select>
                                    {errors.businessType && <span className={styles.error}>{errors.businessType}</span>}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Signing Up...' : 'Sign up'}
                        </button>
                    </form>
                    <div className={styles.formSection}>
                        <p>Have an account? <a href="">Log in</a></p>
                    </div>
                </div>
            </div>)
        }
        </>
        
    );
};

export default Signup;