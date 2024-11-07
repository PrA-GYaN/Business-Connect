// EditProfileModal.js
import React, { useState, useEffect } from 'react';
import styles from '../Styles/EditProfileModal.module.css';

const EditProfileModal = ({ isOpen, onClose, profile, field, onUpdate }) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (isOpen && profile) {
            setValue(profile[field] || '');
        }
    }, [isOpen, profile, field]);

    const handleChange = (e) => {
        setValue(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(field, value); // Pass the field and updated value to the parent
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Edit {field.replace(/([A-Z])/g, ' $1')}</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        {field.replace(/([A-Z])/g, ' $1')}: {/* Convert camelCase to words */}
                        <input
                            type={field === 'email' ? 'email' : 'text'} // Use email input for email field
                            name={field}
                            value={value}
                            onChange={handleChange}
                        />
                    </label>
                    <button type="submit">Update {field.replace(/([A-Z])/g, ' $1')}</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;