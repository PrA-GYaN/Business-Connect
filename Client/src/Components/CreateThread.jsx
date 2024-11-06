import React, { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../Context/AuthContext';
import Navbar from './Navbar';
import styles from '../Styles/CreateThreads.module.css';

const tagsList = [
    "Entrepreneurship","Leadership",
    "Marketing","Sales","Startup","Finance","Growth","Networking",
    "Strategy","Productivity","Investment","Innovation","Management",
    "Partnerships","Technology","E-commerce","Social Media","Team Building","Funding",
    "Customer Service","Discussion","News","Question","Review"
  ];
  const communityOptions = [
    'technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing',
    'hospitality', 'real estate', 'transportation', 'non-profit'
];

const CreateThread = () => {
    const { authUser } = useAuthContext();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [bodyType, setBodyType] = useState('image');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!authUser) {
            console.error('User is not authenticated');
            return;
        }

        try {
            const newThread = {
                title,
                content: bodyType === 'text' ? content : uploadedFile,
                tags: selectedTags,
                community: selectedCommunity,
                author: authUser,
                bodyType
            };
            await axios.post('http://localhost:5000/threads/create', newThread, { withCredentials: true });
            setTitle('');
            setContent('');
            setSelectedTags([]);
            setSelectedCommunity('');
            setUploadedFile(null);
        } catch (error) {
            console.error('Error creating thread:', error);
        }
    };

    // Handle file upload through input or drag-and-drop
    const handleFileUpload = (file) => {
        setUploadedFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleTagClick = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    return (
        <>
            <Navbar />
            <div className={styles.createBox}>
                <div className={styles.createContainer}>
                    <div className={styles.leftPanel}>r/anime</div>
                    <div className={styles.rightPanel}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.titleContainer}>
                                <input
                                    type="text"
                                    placeholder="Title*"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    maxLength="300"
                                />
                            </div>

                            {/* Community Dropdown */}
                            <div className={styles.communityContainer}>
                                <select
                                    value={selectedCommunity}
                                    onChange={(e) => setSelectedCommunity(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Community</option>
                                    {communityOptions.map((community) => (
                                        <option key={community} value={community}>{community}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags Section */}
                            <div className={styles.tagContainer}>
                                <button type="button" onClick={() => setIsModalOpen(true)}>
                                    {selectedTags.length > 0 ? `Tags: ${selectedTags.join(', ')}` : "Add Tags"}
                                </button>
                            </div>

                            {/* Body Type Selector */}
                            <div className={styles.bodyTypeSelector}>
                                <label>
                                    <input
                                        type="radio"
                                        value="image"
                                        checked={bodyType === 'image'}
                                        onChange={() => setBodyType('image')}
                                    />
                                    Image
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="text"
                                        checked={bodyType === 'text'}
                                        onChange={() => setBodyType('text')}
                                    />
                                    Text
                                </label>
                            </div>

                            {/* Body Section based on selected body type */}
                            {bodyType === 'text' ? (
                                <div className={styles.bodyContainer}>
                                    <textarea
                                        placeholder="Body"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`${styles.uploadContainer} ${isDragging ? styles.dragging : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileUpload(e.target.files[0])}
                                        style={{ display: 'none' }}
                                        id="fileInput"
                                    />
                                    <label htmlFor="fileInput">
                                        {uploadedFile ? (
                                            <div className={styles.uploadedFileInfo}>
                                                Uploaded: {uploadedFile.name}
                                                <button onClick={() => setUploadedFile(null)}>Remove</button>
                                            </div>
                                        ) : (
                                            <div className={styles.dropMessage}>
                                                Drag & Drop or <span>Click to Upload</span> Media
                                            </div>
                                        )}
                                    </label>
                                </div>
                            )}

                            <button type="submit" className={styles.submitButton}>Post</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Select Tags</h2>
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className={styles.searchBox}
                        />

                        <div className={styles.selectedTagsContainer}>
                            {selectedTags.map(tag => (
                                <div key={tag} className={styles.selectedTagBox}>
                                    {tag}
                                    <span onClick={() => handleRemoveTag(tag)} className={styles.removeTagButton}>×</span>
                                </div>
                            ))}
                        </div>

                        {searchText && (
                            <div className={styles.tagsList}>
                                {tagsList
                                    .filter(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
                                    .map(tag => (
                                        <div
                                            key={tag}
                                            onClick={() => handleTagClick(tag)}
                                            className={`${styles.tagItem} ${selectedTags.includes(tag) ? styles.selectedTag : ''}`}
                                        >
                                            {tag}
                                        </div>
                                    ))}
                                {tagsList.filter(tag => tag.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                                    <div className={styles.noTagsMessage}>No tags found</div>
                                )}
                            </div>
                        )}

                        <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateThread;