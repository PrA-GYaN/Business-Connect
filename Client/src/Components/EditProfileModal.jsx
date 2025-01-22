import React, { useState, useEffect } from 'react';
import styles from '../Styles/EditProfileModal.module.css';

// Define all the options inside the modal
const options = {
  interests: {
    values: [
      'Traveling', 'Reading', 'Cooking', 'Sports', 'Music',
      'Art', 'Technology', 'Gaming', 'Fitness', 'Photography',
      'Entrepreneurship', 'Investing', 'Economics', 'Leadership',
      'Sales Strategies', 'Marketing Trends', 'Business Networking',
      'Corporate Social Responsibility', 'Business Analytics',
      'Digital Transformation',
    ],
    maxSelections: 7,
  },
  skills: {
    values: [
      'JavaScript', 'Python', 'Design', 'Project Management',
      'Data Analysis', 'Public Speaking', 'Marketing', 'SEO',
      'Networking', 'UX/UI Design',
    ],
    maxSelections: 5, // Maximum selections for 'skills'
  },
  languages: {
    values: [
      'English', 'Spanish', 'French', 'German', 'Mandarin',
      'Italian', 'Japanese', 'Russian', 'Arabic', 'Portuguese',
    ],
    maxSelections: 3, // Maximum selections for 'languages'
  },
  education: {
    values: [
      'High School', 'Bachelor\'s', 'Master\'s', 'PhD',
    ],
    maxSelections: 1, // Maximum selections for 'education'
  },
  operationalFocus: {
    values: [
      'Cost Reduction', 'Revenue Growth', 'Process Optimization', 'Market Expansion', 'Innovation',
      'Customer Retention', 'Sustainability', 'Automation', 'Scalability', 'Brand Positioning',
      'Data Analytics', 'Customer Experience', 'Corporate Culture', 'Employee Wellbeing', 'Agility',
      'Strategic Partnerships', 'Mergers & Acquisitions', 'Crisis Management', 'Leadership Development',
    ],
    maxSelections: 5, // Maximum selections for 'operationalFocus'
  },
  technologies: {
    values: [
      'Artificial Intelligence', 'Blockchain', 'Cloud Computing', 'Cybersecurity', 'Big Data',
      'Internet of Things (IoT)', 'Machine Learning', 'Business Intelligence (BI)', 'Robotic Process Automation (RPA)',
      'Enterprise Resource Planning (ERP)', 'Customer Relationship Management (CRM)', 'Augmented Reality (AR)',
      'Virtual Reality (VR)', 'Data Visualization', 'Cloud-based Solutions', '5G Technology', 'FinTech',
    ],
    maxSelections: 5, // Maximum selections for 'technologies'
  },
  businessModels: {
    values: [
      'B2B', 'B2C', 'C2B', 'Subscription-based', 'Freemium', 'Licensing', 'Franchise', 'Direct Sales',
      'Affiliate Marketing', 'Marketplace', 'Crowdsourcing', 'Social Enterprise', 'Digital Products',
      'Platform-based', 'Aggregator', 'On-demand', 'Peer-to-peer', 'Wholesale', 'Retail',
    ],
    maxSelections: 5,
  },
  strategicGoals: {
    values: [
      'Revenue Growth', 'Market Leadership', 'Customer Loyalty', 'Innovation Leadership', 'Brand Recognition',
      'Profitability', 'Global Expansion', 'Sustainability Leadership', 'Product Diversification', 'Employee Engagement',
      'Operational Efficiency', 'Digital Transformation', 'Cost Leadership', 'Mergers & Acquisitions',
      'Strategic Partnerships', 'Customer Centricity', 'Supply Chain Resilience', 'Crisis Preparedness',
    ],
    maxSelections: 5,
  },
  performanceMetrics: {
    values: [
      'Net Profit Margin', 'Return on Investment (ROI)', 'Customer Acquisition Cost (CAC)', 'Customer Lifetime Value (CLV)',
      'Employee Productivity', 'Sales Growth', 'Market Share', 'Brand Equity', 'Churn Rate', 'Revenue per Employee',
      'Customer Retention Rate', 'Cost per Lead (CPL)', 'Customer Satisfaction Score (CSAT)', 'Net Promoter Score (NPS)',
      'Operational Costs', 'Cash Flow', 'Return on Assets (ROA)', 'Return on Equity (ROE)', 'Gross Margin',
    ],
    maxSelections: 5,
  },
  industryFocus: {
    values: [
      'Technology', 'Healthcare', 'Finance & Banking', 'Retail', 'Energy', 'Manufacturing', 'Telecommunications',
      'Education', 'Hospitality', 'Real Estate', 'Logistics & Transportation', 'Consumer Goods', 'Automotive',
      'Entertainment', 'Pharmaceuticals', 'E-commerce', 'Agriculture', 'Nonprofit Organizations', 'Professional Services',
    ],
    maxSelections: 2,
  },
  bio: {
    values: [], // Bio doesn't have predefined options, it's just a free text area
    maxSelections: 1,
  },
};

const EditProfileModal = ({ isOpen, onClose, profile, field, onUpdate }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const { values: currentOptions = [], maxSelections } = options[field] || {};

  useEffect(() => {
    if (isOpen && profile) {
      if (profile[field]) {
        if (field === 'email' || field === 'phone' || field === 'bio') {
          setInputValue(profile[field]);
        } else {
          setSelectedOptions(profile[field] || []);
        }
      }
    }
  }, [isOpen, profile, field]);

  const handleSelect = (option) => {
    if (selectedOptions.includes(option)) {
      // Deselect the option
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      // Select the option, but only if we haven't reached the max selection limit
      if (selectedOptions.length < maxSelections) {
        setSelectedOptions([...selectedOptions, option]);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (field === 'email' || field === 'phone' || field === 'bio') {
      onUpdate({ value: inputValue, field });
    } else {
      onUpdate({ value: selectedOptions, field });
    }
    onClose();
  };

  if (!isOpen) return null;

  const renderOptionButtons = () => {
    return currentOptions.map((option, index) => (
      <button
        key={index}
        type="button"
        className={`${styles.optionButton} ${selectedOptions.includes(option) ? styles.selected : ''}`}
        onClick={() => handleSelect(option)}
        disabled={selectedOptions.length >= maxSelections && !selectedOptions.includes(option)}
      >
        {option}
      </button>
    ));
  };

  const renderInputField = () => {
    return (
      <input
        type={field === 'email' ? 'email' : field === 'bio' ? 'text' : 'text'}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={`Enter your ${field}`}
      />
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edit {field.replace(/([A-Z])/g, ' $1')}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            {field.replace(/([A-Z])/g, ' $1')}: {/* Convert camelCase to words */}
          </label>
          <div className={styles.optionsContainer}>
            {field === 'email' || field === 'phone' || field === 'bio'
              ? renderInputField()
              : renderOptionButtons()}
          </div>
          <button type="submit">Update {field.replace(/([A-Z])/g, ' $1')}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;