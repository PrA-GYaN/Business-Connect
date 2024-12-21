import { useState } from 'react';
import axios from 'axios';  // Make sure axios is imported for API requests
import styles from '../Styles/VerifyModal.module.css';
import { useAuthContext } from '../Context/AuthContext';

const VerifyModal = ({ onClose, onVerify }) => {
    const [image, setImage] = useState(null); // State to manage the uploaded image
    const [isDragging, setIsDragging] = useState(false); // State to handle drag effects
    const { authUser } = useAuthContext();   


    // Handle image selection from file input
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file); // Set the actual file, not the URL
        }
    };

    // Handle drag over event (to prevent default behavior)
    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    // Handle drag leave event
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // Handle drop event
    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            setImage(file); // Set the actual file, not the URL
        }
    };

    // Trigger the file input click when drag area is clicked
    const handleDragAreaClick = () => {
        document.getElementById('fileInput').click();
    };

    // Handle form submission for image upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('userId', authUser);  // Append userId
        formData.append('image', image);      // Append the file, not the URL

        try {
            const res = await axios.post('http://localhost:5000/users/verify', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            console.log(res.data);
            onVerify();
        } catch (error) {
            console.error(error.response?.data || error.message);
            alert('Error uploading image. Please try again.');
        }
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Verify Your Account</h2>
                <p>Please upload an image to verify your account.</p>

                {/* Image upload section with drag-and-drop */}
                <div
                    className={`${styles.uploadSection} ${isDragging ? styles.dragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleDragAreaClick} // Add click event to trigger file input
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                        id="fileInput" // Add ID for reference
                    />
                    {image ? (
                        <img src={URL.createObjectURL(image)} alt="Uploaded" className={styles.previewImage} />
                    ) : (
                        <div className={styles.dragText}>
                            Drag and drop an image here, or click to select
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className={styles.buttonSection}>
                    <button onClick={handleSubmit} disabled={!image}>
                        Verify
                    </button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;