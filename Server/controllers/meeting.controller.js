import Meeting from "../models/meeting.model.js";

// Send a meeting request
export const sendMeetingRequest = async (req, res) => {
    const meetingData = req.body; // Get meeting data from the request body
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

// Accept a meeting request
export const acceptMeetingRequest = async (req, res) => {
    const meetingId = req.params.id;
    const userId = req.user._id; // Ensure user ID is fetched correctly
    console.log('Accepting meeting request', meetingId);

    try {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        const participant = meeting.participants.find(p => p.userId.toString() === userId.toString());
        if (participant) {
            participant.status = "accepted";
            await meeting.save();
            return res.status(200).json(meeting);
        } else {
            return res.status(404).json({ message: 'Participant not found' });
        }
    } catch (error) {
        console.error("Error accepting meeting:", error);
        res.status(500).json({ message: 'Error accepting meeting', error: error.message });
    }
};

// Reject a meeting request
export const rejectMeetingRequest = async (req, res) => {
    const meetingId = req.params.meetingId;
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
            return res.status(200).json(meeting);
        } else {
            return res.status(404).json({ message: 'Participant not found' });
        }
    } catch (error) {
        console.error("Error rejecting meeting:", error);
        res.status(500).json({ message: 'Error rejecting meeting', error: error.message });
    }
};

// Get all meetings
export const getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find().populate('participants.userId', 'name email'); // Adjust fields to populate as needed
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
};