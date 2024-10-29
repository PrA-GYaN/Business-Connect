import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Styles/Setup.module.css';
import { toast } from 'react-toastify';

const Setup = ({ fullName }) => {
  const [selections, setSelections] = useState({
    interests: [],
    skills: [],
    languages: [],
    education: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const options = {
    interests: [
      'Traveling', 'Reading', 'Cooking', 'Sports', 'Music',
      'Art', 'Technology', 'Gaming', 'Fitness', 'Photography',
      'Entrepreneurship', 'Investing', 'Economics', 'Leadership',
      'Sales Strategies', 'Marketing Trends', 'Business Networking',
      'Corporate Social Responsibility', 'Business Analytics',
      'Digital Transformation',
    ],
    skills: [
      'JavaScript', 'Python', 'Design', 'Project Management',
      'Data Analysis', 'Public Speaking', 'Marketing', 'SEO',
      'Networking', 'UX/UI Design',
    ],
    languages: [
      'English', 'Spanish', 'French', 'German', 'Mandarin',
      'Italian', 'Japanese', 'Russian', 'Arabic', 'Portuguese',
    ],
    education: [
      'High School', 'Bachelor\'s', 'Master\'s', 'PhD',
    ],
  };

  const handleSelect = (type, value) => {
    const maxLimits = {
      interests: 7,
      skills: 5,
      languages: 10,
      education: 1,
    };

    setSelections((prev) => {
      const currentSelection = type === 'education' ? prev.education : prev[type];
      
      if (type === 'education') {
        return { ...prev, education: value };
      } else {
        if (currentSelection.includes(value)) {
          return { ...prev, [type]: currentSelection.filter(item => item !== value) };
        } else if (currentSelection.length < maxLimits[type]) {
          return { ...prev, [type]: [...currentSelection, value] };
        } else {
          setError(`You can only select up to ${maxLimits[type]} ${type}.`);
          return prev;
        }
      }
    });
  };

  const renderOptions = (type) => {
    const currentSelection = type === 'education' ? [selections.education] : selections[type];
    
    return options[type].map(option => (
      <button
        key={option}
        type="button"
        className={`${styles.optionButton} ${currentSelection.includes(option) ? styles.selected : ''}`}
        aria-pressed={currentSelection.includes(option)}
        onClick={() => handleSelect(type, option)}
      >
        {option}
      </button>
    ));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    console.log('Submitting selections:', selections);
    try {
      const res = await axios.post('http://localhost:5000/users/update-user-selection', {
        fullName,
        ...selections,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log(res.data);
      toast.success('User information updated successfully.');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user information. Please try again later.');
      setError('Failed to update user information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setError('');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className={styles.setupBox}>
      <div className={styles.setupContainer}>
        {error && <div className={styles.error}>{error}</div>}
        <h2>Select Your Interests</h2>
        <div className={styles.optionsContainer}>
          {renderOptions('interests')}
        </div>

        <h2>Select Your Skills</h2>
        <div className={styles.optionsContainer}>
          {renderOptions('skills')}
        </div>

        <h2>Select Languages You Speak</h2>
        <div className={styles.optionsContainer}>
          {renderOptions('languages')}
        </div>

        <h2>Select Your Education Level</h2>
        <div className={styles.optionsContainer}>
          {renderOptions('education')}
        </div>
        
        <div onClick={handleSubmit} className={styles.subbtn}>
          {loading ? 'Updating...' : 'Update Info'}
        </div>
      </div>
    </div>
  );
};

export default Setup;