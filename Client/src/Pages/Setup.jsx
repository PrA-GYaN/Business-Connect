import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Styles/Setup.module.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_Backend_Url;

const Setup = ({ fullName, businessType }) => {
  const navigate = useNavigate();
  const [selections, setSelections] = useState({
    interests: [],
    skills: [],
    languages: [],
    education: '',
    operationalFocus: [],
    technologies: [],
    businessModels: [],
    strategicGoals: [],
    performanceMetrics: [],
    industryFocus: [],
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

  const businessHouseOptions = {
    operationalFocus: [
      'Cost Reduction', 'Revenue Growth', 'Process Optimization', 'Market Expansion', 'Innovation',
      'Customer Retention', 'Sustainability', 'Automation', 'Scalability', 'Brand Positioning',
      'Data Analytics', 'Customer Experience', 'Corporate Culture', 'Employee Wellbeing', 'Agility',
      'Strategic Partnerships', 'Mergers & Acquisitions', 'Crisis Management', 'Leadership Development',
    ],
    technologies: [
      'Artificial Intelligence', 'Blockchain', 'Cloud Computing', 'Cybersecurity', 'Big Data',
      'Internet of Things (IoT)', 'Machine Learning', 'Business Intelligence (BI)', 'Robotic Process Automation (RPA)',
      'Enterprise Resource Planning (ERP)', 'Customer Relationship Management (CRM)', 'Augmented Reality (AR)',
      'Virtual Reality (VR)', 'Data Visualization', 'Cloud-based Solutions', '5G Technology', 'FinTech',
    ],
    businessModels: [
      'B2B', 'B2C', 'C2B', 'Subscription-based', 'Freemium', 'Licensing', 'Franchise', 'Direct Sales',
      'Affiliate Marketing', 'Marketplace', 'Crowdsourcing', 'Social Enterprise', 'Digital Products',
      'Platform-based', 'Aggregator', 'On-demand', 'Peer-to-peer', 'Wholesale', 'Retail',
    ],
    strategicGoals: [
      'Revenue Growth', 'Market Leadership', 'Customer Loyalty', 'Innovation Leadership', 'Brand Recognition',
      'Profitability', 'Global Expansion', 'Sustainability Leadership', 'Product Diversification', 'Employee Engagement',
      'Operational Efficiency', 'Digital Transformation', 'Cost Leadership', 'Mergers & Acquisitions',
      'Strategic Partnerships', 'Customer Centricity', 'Supply Chain Resilience', 'Crisis Preparedness',
    ],
    performanceMetrics: [
      'Net Profit Margin', 'Return on Investment (ROI)', 'Customer Acquisition Cost (CAC)', 'Customer Lifetime Value (CLV)',
      'Employee Productivity', 'Sales Growth', 'Market Share', 'Brand Equity', 'Churn Rate', 'Revenue per Employee',
      'Customer Retention Rate', 'Cost per Lead (CPL)', 'Customer Satisfaction Score (CSAT)', 'Net Promoter Score (NPS)',
      'Operational Costs', 'Cash Flow', 'Return on Assets (ROA)', 'Return on Equity (ROE)', 'Gross Margin',
    ],
    industryFocus: [
      'Technology', 'Healthcare', 'Finance & Banking', 'Retail', 'Energy', 'Manufacturing', 'Telecommunications',
      'Education', 'Hospitality', 'Real Estate', 'Logistics & Transportation', 'Consumer Goods', 'Automotive',
      'Entertainment', 'Pharmaceuticals', 'E-commerce', 'Agriculture', 'Nonprofit Organizations', 'Professional Services',
    ],
  };

  const handleSelect = (type, value) => {
    const maxLimits = {
      interests: 7,
      skills: 5,
      languages: 10,
      education: 1,
      operationalFocus: 5,
      technologies: 5,
      businessModels: 1,
      strategicGoals: 5,
      performanceMetrics: 5,
      industryFocus: 2,
    };

    setSelections((prev) => {
      const currentSelection = prev[type];

      // Handle deselection and selection for education (since only one is allowed)
      if (type === 'education') {
        return { ...prev, [type]: value }; // Only allow one selection
      }

      // Handle general multi-selection with max limits
      if (currentSelection.includes(value)) {
        return { ...prev, [type]: currentSelection.filter(item => item !== value) };
      } else if (currentSelection.length < maxLimits[type]) {
        return { ...prev, [type]: [...currentSelection, value] };
      } else {
        setError(`You can only select up to ${maxLimits[type]} ${type}.`);
        return prev;
      }
    });
  };

  const renderOptions = (type) => {
    const currentSelection = selections[type] || [];
    const optionsToRender = businessType === 'individual' ? options[type] : businessHouseOptions[type];

    return optionsToRender.map(option => (
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
    // Validation logic
    const validationErrors = [];

    // Validate individual categories
    if(businessType === 'individual') {
      if (selections.interests.length === 0) validationErrors.push('Please select at least one interest.');
      if (selections.skills.length === 0) validationErrors.push('Please select at least one skill.');
      if (selections.languages.length === 0) validationErrors.push('Please select at least one language.');
      if (!selections.education) validationErrors.push('Please select your education level.');
    }
    else {
      if (selections.operationalFocus.length === 0) validationErrors.push('Please select at least one operational focus.');
      if (selections.technologies.length === 0) validationErrors.push('Please select at least one technology.');
      if (!selections.businessModels) validationErrors.push('Please select a business model.');
      if (selections.strategicGoals.length === 0) validationErrors.push('Please select at least one strategic goal.');
      if (selections.performanceMetrics.length === 0) validationErrors.push('Please select at least one performance metric.');
      if (selections.industryFocus.length === 0) validationErrors.push('Please select at least one industry focus.');
    }
    // If there are validation errors, set the error state and return
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${url}/users/update-user-selection`, {
        fullName,
        businessType,
        ...selections,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      toast.success('User information updated successfully.');
      navigate('/login');
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

        {/* Individual options (for businessType 'individual') */}
        {businessType === 'individual' && (
          <>
            <h2>Select Your Interests</h2>
            <div className={styles.optionsContainer}>{renderOptions('interests')}</div>

            <h2>Select Your Skills</h2>
            <div className={styles.optionsContainer}>{renderOptions('skills')}</div>

            <h2>Select Languages You Speak</h2>
            <div className={styles.optionsContainer}>{renderOptions('languages')}</div>

            <h2>Select Your Education Level</h2>
            <div className={styles.optionsContainer}>{renderOptions('education')}</div>
          </>
        )}

        {/* Business house options (for businessType 'house') */}
        {businessType === 'house' && (
          <>
            <h2>Select Your Operational Focus</h2>
            <div className={styles.optionsContainer}>{renderOptions('operationalFocus')}</div>

            <h2>Select Technologies You Are Familiar With</h2>
            <div className={styles.optionsContainer}>{renderOptions('technologies')}</div>

            <h2>Select Business Models</h2>
            <div className={styles.optionsContainer}>{renderOptions('businessModels')}</div>

            <h2>Select Strategic Goals</h2>
            <div className={styles.optionsContainer}>{renderOptions('strategicGoals')}</div>

            <h2>Select Performance Metrics</h2>
            <div className={styles.optionsContainer}>{renderOptions('performanceMetrics')}</div>

            <h2>Select Industry Focus</h2>
            <div className={styles.optionsContainer}>{renderOptions('industryFocus')}</div>
          </>
        )}

        <div
          onClick={handleSubmit}
          className={styles.subbtn}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Info'}
        </div>
      </div>
    </div>
  );
};

export default Setup;