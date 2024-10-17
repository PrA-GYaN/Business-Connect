import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { format, toZonedTime } from 'date-fns-tz';
import 'react-datepicker/dist/react-datepicker.css';
import './MeetingScheduler.css';

const MeetingScheduler = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleDateChange = (date) => {
        setStartDate(date);
        setSelectedTime(''); // Reset time selection when date changes
    };

    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
    };

    const generateTimeOptions = (selectedDate) => {
        const currentDate = new Date();
        const options = [];

        if (selectedDate.toDateString() === currentDate.toDateString()) {
            const currentHour = currentDate.getHours();
            for (let i = currentHour; i < 24; i++) {
                const hour = i % 12 === 0 ? 12 : i % 12; // 12-hour format
                const period = i < 12 ? 'AM' : 'PM';
                options.push(`${hour} ${period}`);
            }
        } else {
            for (let i = 0; i < 24; i++) {
                const hour = i % 12 === 0 ? 12 : i % 12; // 12-hour format
                const period = i < 12 ? 'AM' : 'PM';
                options.push(`${hour} ${period}`);
            }
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
        meetingDateTime.setHours(hour);
        meetingDateTime.setMinutes(0); // Set minutes to 0 since we're using hourly options

        const utcDateTime = toZonedTime(meetingDateTime, 'UTC');
        const formattedDateTimeInUtc = format(utcDateTime, 'yyyy-MM-dd HH:mmXXX', { timeZone: 'UTC' });
        const formattedDateTimeInLocal = `${startDate.toLocaleDateString()} ${selectedTime}`;

        const meetingDetails = `Meeting scheduled on ${formattedDateTimeInLocal} in local time.\n` +
                               `In UTC, that's ${formattedDateTimeInUtc}.`;
        alert(meetingDetails);
    };

    const scheduledMeeting = selectedTime ? (
        <p className='scheduled'>
            <b>Scheduled Meeting</b>
            <br/>
            Date:{startDate.toLocaleDateString()}<br/>
            Time:{selectedTime}
        </p>
    ) : null;

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
            <select id="time" value={selectedTime} onChange={handleTimeChange}>
                <option value="">--Select Time--</option>
                {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                ))}
            </select>
            {scheduledMeeting}
            <button className="submit-button" onClick={handleSubmit}>Schedule Meeting</button>
        </div>
    );
};

export default MeetingScheduler;