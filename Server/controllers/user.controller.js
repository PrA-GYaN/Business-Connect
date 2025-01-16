import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Verification from "../models/verification.model.js";
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
            businessType,
        } = req.body;

        console.log("Received data:", fullName, email, password, gender, businessTitle, phoneNumber, address, dob, industry,businessType);
        if (!fullName || !email || !password || !gender || !businessTitle || !phoneNumber || !address || !dob || !industry || !businessType) {
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
                    businessType,
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
                    businessType: newUser.businessType,
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
    const { 
        fullName, 
        interests, 
        skills, 
        languages, 
        education, 
        operationalFocus, 
        technologies, 
        businessModels, 
        strategicGoals, 
        performanceMetrics, 
        industryFocus 
    } = req.body;

    console.log('Received data:', fullName, skills, languages, education, interests, operationalFocus, technologies, businessModels, strategicGoals, performanceMetrics, industryFocus);

    try {
        // Find the user and update their information
        const user = await User.findOneAndUpdate(
            { fullName },
            {
                $addToSet: {
                    skills: { $each: skills },
                    languages: { $each: languages },
                    interests: { $each: interests },
                    operationalFocus: { $each: operationalFocus },
                    technologies: { $each: technologies },
                    businessModels: { $each: businessModels },
                    strategicGoals: { $each: strategicGoals },
                    performanceMetrics: { $each: performanceMetrics },
                    industryFocus: { $each: industryFocus }
                },
                education  // Directly assign education (only one allowed)
            },
            { new: true }  // Returns the modified document
        );

        // Check if the user was found and updated
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only return the relevant data (for example, excluding sensitive info like passwords)
        const updatedUser = {
            fullName: user.fullName,
            skills: user.skills,
            languages: user.languages,
            interests: user.interests,
            education: user.education,
            operationalFocus: user.operationalFocus,
            technologies: user.technologies,
            businessModels: user.businessModels,
            strategicGoals: user.strategicGoals,
            performanceMetrics: user.performanceMetrics,
            industryFocus: user.industryFocus,
        };

        console.log('Updated User:', updatedUser);
        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

  
export const login = async (req, res) => {
    console.log("Login Request Received");
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
        const { likedUserId, action: initialAction } = req.body;

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
            // console.log("Reverse swipe not found or conditions not met");

        }

        return res.status(200).json({ message: 'Swipe processed successfully' });

    } catch (error) {
        console.error("Error processing swipe:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserProfileField = async (req, res) => {
    const userId = req.user._id
    const { field, value } = req.body; 
    console.log('Received data:', field, value);
    const allowedFields = [
        'fullName',
        'email',
        'businessTitle',
        'industry',
        'phoneNumber',
        'address',
        'dob',
        'gender',
        'bio',
        'education',
        'job',
        'company',
        'verified',
        'interests',
        'languages',
        'activities',
        'skills',
        'profilePic',
        'certificates',
        'swipes',
        'connections',
        'meetings'
    ];

    if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: 'Invalid field specified for update' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { [field]: value },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the profile', error });
    }
};
export const verifyUser = async (req, res) => {
    const userId = req.body.userId;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        bufferStream.pipe(cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            async (error, result) => {
                if (error) {
                    return res.status(400).send('Error uploading image: ' + error.message);
                }

                const newVerification = new Verification({
                    Id: userId,
                    image: {
                        url: result.secure_url,
                        public_id: result.public_id,
                    },
                });

                try {
                    await newVerification.save();
                    return res.status(201).json({ message: 'Image uploaded successfully', verification: newVerification });
                } catch (err) {
                    return res.status(400).send('Error saving verification: ' + err.message);
                }
            }
        ));
    } catch (error) {
        return res.status(500).send('Error: ' + error.message);
    }
};

export const verificationreq = async (req, res) => {
    try {
        const verifications = await Verification.find().populate('Id');
        return res.status(200).json(verifications);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const deleteverificationreq = async (req, res) => {
    const verificationId = req.body.verificationId;
    console.log("Verification ID:", verificationId);
    try {
        const result = await Verification.deleteMany({ Id: verificationId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No verification requests found with the given ID' });
        }
        console.log("Verification requests deleted:", result.deletedCount);
        return res.status(200).json({ message: `${result.deletedCount} verification request(s) deleted successfully` });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const acceptVerification = async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.verified = true;
        await user.save();
        return res.status(200).json({ message: 'User verified successfully', user });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const declineVerification = async (req, res) => {
    const userId = req.body.userId;
    const reason = req.body.reason;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.verified = false;
        await sendNotification(`Your Verification request has been decline for following Reason: ${reason}`, userId);
        await user.save();
        return res.status(200).json({ message: 'User verification declined', user });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};