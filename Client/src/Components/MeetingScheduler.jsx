import React, { useState, useMemo, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format, toZonedTime } from 'date-fns-tz';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../Styles/MeetingScheduler.module.css';
import useProfile from '../Hooks/useProfile';
import { useAuthContext } from '../Context/AuthContext';
import useMeetings from '../Hooks/useMeetings';

const MeetingScheduler = ({ isOpen, onClose, participants = [] }) => {
  const { meetingRequest } = useMeetings();
  const { authUser } = useAuthContext();
  const { getProfileById } = useProfile();
  const [users, setUsers] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [meetingDetails, setMeetingDetails] = useState('');
  const [changesMade, setChangesMade] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getProfileById(authUser);
        setUsers(profile.connections.map(connection => connection.userId) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [authUser]);

  const handleDateChange = (date) => {
    setStartDate(date);
    setSelectedTime('');
    setChangesMade(true);
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
    setChangesMade(true);
  };

  const handleTitleChange = (event) => {
    setMeetingTitle(event.target.value);
    setChangesMade(true);
  };

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
    setChangesMade(true);
  };

  const generateTimeOptions = (selectedDate) => {
    const currentDate = new Date();
    const options = [];
    const startHour = selectedDate.toDateString() === currentDate.toDateString() ? currentDate.getHours() : 0;

    for (let i = startHour; i < 24; i++) {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const period = i < 12 ? 'AM' : 'PM';
      options.push(`${hour} ${period}`);
    }
    return options;
  };

  const timeOptions = useMemo(() => generateTimeOptions(startDate), [startDate]);

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSubmit = async () => {
    if (!selectedTime || !meetingTitle || (participants.length === 0 && !selectedUser)) {
      setErrorMessage('Please fill out all fields: title, time, link, and user (if applicable).');
      return;
    }

    setErrorMessage('');
    const meetingDateTime = new Date(startDate);
    const [hourStr, period] = selectedTime.split(' ');
    let hour = parseInt(hourStr, 10);
    hour = period === 'PM' && hour < 12 ? hour + 12 : hour;
    meetingDateTime.setHours(hour, 0);

    const endTime = new Date(meetingDateTime);
    endTime.setHours(endTime.getHours() + 1);

    // Create the meeting data with only hour and minute
    const meetingData = {
      title: meetingTitle,
      startTime: meetingDateTime.toISOString(), // Keep this as ISO for storage
      endTime: endTime.toISOString(), // Keep this as ISO for storage
      participants: participants.length
        ? participants
        : [{ userId: selectedUser, status: 'pending' }], // Default status if no participants provided
      createdBy: authUser, // Set createdBy to the authenticated user's ID
    };
    console.log(meetingData);
    meetingRequest(meetingData);
    setMeetingDetails(`Meeting "${meetingTitle}" scheduled on ${startDate.toLocaleDateString()} ${selectedTime}.\nIn UTC, that's ${meetingData.startTime}.`);
    resetForm();
    onClose();
  };

  const confirmClose = () => {
    if (changesMade) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close the modal?');
      if (confirm) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setSelectedTime('');
    setMeetingTitle('');
    setSelectedUser('');
    setErrorMessage('');
    setMeetingDetails('');
    setChangesMade(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        confirmClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changesMade, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalOverFlow}>
        <div className={styles.modalContent}>
          <div className={styles.closeIcon}>
            <button className={styles.closeButton} onClick={confirmClose}>×</button>
          </div>
          <div className={styles.heading}>Schedule a Meeting</div>
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

          <input
            type="text"
            value={meetingTitle}
            onChange={handleTitleChange}
            placeholder="Meeting Title"
            aria-label="Meeting Title"
            className={styles.inputField}
          />
          {!participants.length && (
            <div>
              {/* <label htmlFor="user">Select User: </label> */}
              <select className={styles.customselect} id="user" value={selectedUser} onChange={handleUserChange} aria-label="Select User">
                <option value="">--Select User--</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.fullName}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.datePickerContainer}>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              inline
              filterDate={(date) => !isPastDate(date)}
              minDate={new Date()}
              className={styles.datePicker}
              aria-label="Select Meeting Date"
            />
          </div>
          <label htmlFor="time" className={styles.timeLabel}>Select Time: </label>
          <select id="time" value={selectedTime} onChange={handleTimeChange} aria-label="Select Meeting Time" className={styles.timeSelect}>
            <option value="">--Select Time--</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {selectedTime && (
            <p className={styles.scheduled}>
              <b>Scheduled Meeting</b>
              <br />
              Date: {startDate.toLocaleDateString()}<br />
              Time: {selectedTime}
            </p>
          )}
          <button className={styles.submitButton} onClick={handleSubmit}>Schedule Meeting</button>
          {meetingDetails && (
            <div className={styles.meetingDetails}>
              <p><b>{meetingDetails}</b></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;