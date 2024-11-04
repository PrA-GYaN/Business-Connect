import Meeting from "../models/meeting.model.js";
import User from "../models/user.model.js";
import {sendNotification} from "./notification.controller.js";
// Send a meeting request
export const sendMeetingRequest = async (req, res) => {
    const meetingData = req.body.meeting;
    console.log("Meeting Data Received:", meetingData);
    
    try {
        const meeting = new Meeting(meetingData);
        await meeting.save();
        
        // Send a response back to the client
        res.status(201).json(meeting);
    } catch (error) {
        console.error("Error creating meeting:", error);
        
        // Respond with an error message
        res.status(400).json({ message: 'Error creating meeting', error: error.message });
    }
};

export const acceptMeetingRequest = async (req, res) => {
    const meetingId = req.params.id;
    const UserId = req.user._id;

    console.log(`Accepting meeting request for meeting ID: ${meetingId} by user ID: ${UserId}`);

    if (!meetingId || !UserId) {
        return res.status(400).json({ message: 'Invalid meeting ID or user ID' });
    }

    try {
        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const participant = meeting.participants.find(p => p.userId.toString() === UserId.toString());
        if (!participant) {
            return res.status(404).json({ message: 'Participant not found' });
        }

        participant.status = "accepted";

        // Ensure you're updating the users correctly
        const updateUser1 = User.findByIdAndUpdate(
            participant.userId, 
            { $addToSet: { meetings: meetingId } }, 
            { new: true }
        );

        const updateUser2 = User.findByIdAndUpdate(
            UserId, 
            { $addToSet: { meetings: meetingId } }, 
            { new: true }
        );

        await Promise.all([
            meeting.save(),
            updateUser1,
            updateUser2
        ]);

        await sendNotification(`Your meeting request has been accepted by ${req.user.name}`, meeting.createdBy);
        return res.status(200).json(meeting);
    } catch (error) {
        console.error("Error accepting meeting:", error);
        return res.status(500).json({ message: 'Error accepting meeting', error: error.message });
    }
};

// Reject a meeting request
export const rejectMeetingRequest = async (req, res) => {
    const meetingId = req.params.id;
    const userId = req.user._id; // Ensure user ID is fetched correctly
    console.log('Rejecting meeting request', meetingId);

    try {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const participant = meeting.participants.find(p => p.userId.toString() === userId.toString());
        if (participant) {
            participant.status = "rejected";
            await meeting.save();
            await sendNotification(`Your meeting request has been rejected by ${userId}`, meeting.createdBy);
            return res.status(200).json(meeting);
        } else {
            return res.status(404).json({ message: 'Participant not found' });
        }
    } catch (error) {
        console.error("Error rejecting meeting:", error);
        res.status(500).json({ message: 'Error rejecting meeting', error: error.message });
    }
};


export const getAllMeetings = async (req, res) => {
    const getId = req.params.id; // ID to check against participants
    const userId = req.user._id; // ID of the logged-in user
    const emptyArray = [];
    
    try {
        // Fetch all meetings and populate participants
        const meetings = await Meeting.find().populate('participants.userId');

        if (meetings.length === 0) {
            return res.status(200).json("No meetings found");
        }

        // Filter meetings that the user created or is a participant
        const filteredMeetings = meetings.filter(meeting => {
            console.log('Meeting:', meeting);
            return meeting.createdBy.toString() === userId.toString() || 
                   meeting.participants.some(participant => participant.userId._id.toString() === getId.toString());
        });
        // Return the filtered meetings
        if (filteredMeetings.length > 0) {
            return res.status(200).json(filteredMeetings);
        } 
        else {
            return res.status(200).json(emptyArray);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
};
