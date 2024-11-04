import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import cloudinary from "../utils/cloudinary.js";
import { sendNotification } from "./notification.controller.js";
import stream from 'stream';
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
import CustomAuth from '../utils/CustomAuth.js';
const { Client } = pkg;

const client = new Client({
    authStrategy: new CustomAuth(),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

export const sendOTP = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    console.log(`Sending OTP: ${otp} to Phone Number: ${phoneNumber}`);
    let formattedPhoneNumber = phoneNumber.trim();
	if (formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = formattedPhoneNumber.substring(1);
    }
    const chatId = `${formattedPhoneNumber}@c.us`;
    console.log('Formatted Chat ID:', chatId);

    try {
        const message = `Your OTP for Business-Connect Verification is: ${otp}`;
        console.log('About to send message:', message, 'to:', chatId);
        await client.sendMessage(chatId, message);
        res.status(200).json({ success: true, message: 'OTP sent!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
};

export const signup = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            gender,
            businessTitle,
            phoneNumber,
            address,
            dob,
            industry,
        } = req.body;

        console.log("Received data:", fullName, email, password, gender, businessTitle, phoneNumber, address, dob, industry);
        if (!fullName || !email || !password || !gender || !businessTitle || !phoneNumber || !address || !dob || !industry) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ phoneNumber }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: "Full Name or email already exists." });
        }

        // Handle image upload to Cloudinary
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required." });
        }

        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        // Upload the image to Cloudinary
        bufferStream.pipe(cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            async (error, result) => {
                if (error) {
                    return res.status(400).json({ error: 'Error uploading image: ' + error.message });
                }

                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Create a new user
                const newUser = new User({
                    fullName,
                    email,
                    password: hashedPassword,
                    gender,
                    businessTitle,
                    phoneNumber,
                    address,
                    dob,
                    industry,
                    profilePic: {
                        url: result.secure_url,
                        public_id: result.public_id,
                    },
                });

                await newUser.save();
                generateTokenAndSetCookie(newUser._id,newUser.fullName,newUser.profilePic,res);
                res.status(201).json({
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    businessTitle: newUser.businessTitle,
                    phoneNumber: newUser.phoneNumber,
                    address: newUser.address,
                    dob: newUser.dob,
                    industry: newUser.industry,
                    profilePic: newUser.profilePic,
                });
                console.log("User created successfully:");
            }
        ));
    } catch (error) {
        console.error("Error in signup controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const updateUserSelection = async (req, res) => {
    const { fullName, interests, skills, languages, education } = req.body;
  
    console.log('Received data:', fullName, skills, languages, education, interests);
    
    try {
      const user = await User.findOneAndUpdate(
        { fullName },
        {
          $addToSet: {  
            skills: { $each: skills },
            languages: { $each: languages },
            interests: { $each: interests }
          },
          education
        },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log('Updated User:', user);
      return res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };
  
export const login = async (req, res) => {
	try {
		const { phoneNumber, password } = req.body;
		const user = await User.findOne({ phoneNumber });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id,user.fullName,user.profilePic,res);
		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getProfileById = async (req, res) => {
	const id = req.params.id;
	try{
		const user = await User.findById(id).select("-password")
        .populate({
            path: 'connections.userId', // Populate the userId in each comment
            model: 'Users'
          });
		if(user){
			res.status(200).json(user);
		}
		else{
			res.status(404).json({error: "User not found"});
		}
	}
	catch(error){
		console.log("Error in getProfileById controller", error.message);
	}
};

export const getAllUser = async (req, res) => {
    const userId = req.user._id;
    try {
        const users = await User.find({ _id: { $ne: userId } }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const Liked_Dislike = async (req, res) => {
    const userId = req.user._id;
    try {
        console.log("User ID:", userId);
        const { likedUserId, action: initialAction } = req.body;

        // Validate action
        if (!likedUserId || !['right', 'left'].includes(initialAction)) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const action = initialAction === 'right' ? 'Liked' : 'Disliked';
        const [user, likedUser] = await Promise.all([
            User.findById(userId).select('-password'),
            User.findById(likedUserId).select('-password'),
        ]);

        if (!user || !likedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingSwipe = user.swipes.find(swipe => swipe.userId.toString() === likedUserId.toString());
        const reverseSwipe = likedUser.swipes.find(swipe => swipe.userId.toString() === userId.toString());

        if (existingSwipe) {
            existingSwipe.action = action; 
        } else {
            user.swipes.push({ userId: likedUserId, action });
        }
        await user.save();

        if (reverseSwipe && reverseSwipe.action === 'Liked') {

            if (!likedUser.connections.some(conn => conn.userId.toString() === userId.toString())) {
                likedUser.connections.push({ userId });
                sendNotification(`${likedUser.fullName} has liked you!`,userId);
                sendNotification(`${user.fullName} has liked you!`,likedUserId);
                await likedUser.save();
            }

            if (!user.connections.some(conn => conn.userId.toString() === likedUserId.toString())) {
                user.connections.push({ userId: likedUserId });
                sendNotification(`${likedUser.fullName} has liked you back!`,userId);
                await user.save();
                console.log("Added Connection in User");
            }
        } else {
            console.log("Reverse swipe not found or conditions not met");
        }

        return res.status(200).json({ message: 'Swipe processed successfully' });

    } catch (error) {
        console.error("Error processing swipe:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};
