import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = () => {
    const [image, setImage] = useState(null);
    const [authorId, setAuthorId] = useState('');
    const [content, setContent] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleAuthorIdChange = (e) => {
        setAuthorId(e.target.value);
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
        formData.append('image', image); // Ensure this matches your backend
        formData.append('authorId', authorId);
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
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Author ID:
                    <input type="text" value={authorId} onChange={handleAuthorIdChange} required />
                </label>
            </div>
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
    );
};

export default CreatePost;
