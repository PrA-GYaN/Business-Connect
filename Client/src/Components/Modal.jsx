import React, { useState } from 'react';
import { useAuthContext } from '../Context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose }) => {
    const { authUser, fullName, profilePic } = useAuthContext();
    const [image, setImage] = useState(null);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            // Check if there is content or an image
            if (content || image) {
                const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close the modal?');
                if (confirmClose) {
                    onClose();
                }
            } else {
                onClose();
            }
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleContentChange = (e) => {
        setContent(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if both content and image are empty
        if (!content && !image) {
            toast.error('Please provide either content or an image to submit the post.');
            return;
        }

        const formData = new FormData();
        if (image) {
            formData.append('image', image);
        }
        formData.append('authorId', authUser);
        formData.append('content', content);

        setIsLoading(true);
        try {
            await axios.post('http://localhost:5000/posts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Post created successfully!');
            setImage(null);
            setContent('');
        } catch (error) {
            console.error(error.response.data);
            toast.error('Error uploading post. Please try again.');
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick} aria-hidden={!isOpen}>
            <div className={styles.postCard}>
                <h1>Create Post</h1>
                <div className={styles.author}>
                    <div className={styles.profilePic} style={{ backgroundImage: `url(${profilePic})` }}></div>
                    <span className={styles.fullName}>{fullName}</span>
                </div>
                {/* <hr /> */}
                <form onSubmit={handleSubmit} className={styles.postForm}>
                    <textarea 
                        placeholder="What's on your mind?" 
                        value={content} 
                        onChange={handleContentChange} 
                    />
                    <hr />
                    <div className={styles.buttonRow}>
                        <input 
                            type="file" 
                            onChange={handleImageChange} 
                            style={{ display: 'none' }} 
                            id="image-upload" 
                        />
                        <label htmlFor="image-upload" className={styles.upload}>
                            Upload Image
                        </label>
                        {image && <p>Selected file: {image.name}</p>}
                    </div>
                    <button type="submit" className={styles.post} disabled={isLoading}>
                        {isLoading ? 'Posting...' : 'Post'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Modal;