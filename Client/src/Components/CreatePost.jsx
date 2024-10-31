import React, { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../Context/AuthContext';
import Modal from './Modal';

const CreatePost = () => {
    const {authUser} = useAuthContext();
    const [image, setImage] = useState(null);
    const [content, setContent] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleContentChange = (e) => {
        setContent(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('authorId', authUser);
        formData.append('content', content);

        try {
            const res = await axios.post('http://localhost:5000/posts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(res.data);
        } catch (error) {
            console.error(error.response.data); // Log detailed error
        }
    };

    return (
        <>
        <button onClick={openModal}>Open Modal</button>
        <Modal isOpen={isModalOpen} onClose={closeModal} />
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Content:
                    <textarea value={content} onChange={handleContentChange} required />
                </label>
            </div>
            <div>
                <label>
                    Image:
                    <input type="file" onChange={handleImageChange} required />
                </label>
            </div>
            <button type="submit">Upload</button>
        </form>
        </>
    );
};

export default CreatePost;