import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { format, toZonedTime } from 'date-fns-tz';
import 'react-datepicker/dist/react-datepicker.css';
import './MeetingScheduler.css';

const MeetingScheduler = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [meetingDetails, setMeetingDetails] = useState('');

    const handleDateChange = (date) => {
        setStartDate(date);
        setSelectedTime('');
    };

    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
    };

    const generateTimeOptions = (selectedDate) => {
        const currentDate = new Date();
        const options = [];
        const startHour = selectedDate.toDateString() === currentDate.toDateString() ? currentDate.getHours() : 0;

        for (let i = startHour; i < 24; i++) {
            const hour = i % 12 === 0 ? 12 : i % 12; // 12-hour format
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

    const handleSubmit = () => {
        if (!selectedTime) {
            setErrorMessage('Please select a time for the meeting.');
            return;
        }

        setErrorMessage(''); // Clear previous error
        const meetingDateTime = new Date(startDate);
        const [hourStr, period] = selectedTime.split(' ');
        let hour = parseInt(hourStr, 10);
        hour = period === 'PM' && hour < 12 ? hour + 12 : hour; // Convert to 24-hour format
        meetingDateTime.setHours(hour, 0); // Set minutes to 0

        const utcDateTime = toZonedTime(meetingDateTime, 'UTC');
        const formattedDateTimeInUtc = format(utcDateTime, 'yyyy-MM-dd HH:mmXXX', { timeZone: 'UTC' });
        const formattedDateTimeInLocal = `${startDate.toLocaleDateString()} ${selectedTime}`;

        setMeetingDetails(`Meeting scheduled on ${formattedDateTimeInLocal} in local time.\nIn UTC, that's ${formattedDateTimeInUtc}.`);
    };

    return (
        <div className="scheduler-container">
            <h2>Schedule a Meeting</h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="date-picker-container">
                <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    inline
                    filterDate={(date) => !isPastDate(date)}
                    minDate={new Date()}
                    className="date-picker"
                />
            </div>
            <label htmlFor="time">Select Time: </label>
            <select id="time" value={selectedTime} onChange={handleTimeChange} aria-label="Select Meeting Time">
                <option value="">--Select Time--</option>
                {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                ))}
            </select>
            {selectedTime && (
                <p className='scheduled'>
                    <b>Scheduled Meeting</b>
                    <br />
                    Date: {startDate.toLocaleDateString()}<br />
                    Time: {selectedTime}
                </p>
            )}
            <button className="submit-button" onClick={handleSubmit}>Schedule Meeting</button>
            {meetingDetails && (
                <div className='meeting-details'>
                    <p><b>{meetingDetails}</b></p>
                </div>
            )}
        </div>
    );
};

export default MeetingScheduler;