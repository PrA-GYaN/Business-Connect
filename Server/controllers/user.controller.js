import bcrypt from "bcryptjs";
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import gridfsStream from 'gridfs-stream';
// import { Readable } from 'stream';
// import { connectToMongoDB } from "../db/connectToMongoDB.js";
// let gfs;

// const setupGridFS = (connection) => {
//     const dbConnection = connection.connection.db;
//     gfs = gridfsStream(dbConnection, mongoose.mongo);
//     gfs.collection('uploads');
// };

// const init = async () => {
//     const dbConnection = await connectToMongoDB();
//     setupGridFS(dbConnection);
// };
// init();

// export const imageUpload = async(req, res) => {
// 	console.log('GridFS initialized'+gfs);
// 	if (!req.file) {
// 	  return res.status(400).json({ error: 'No file uploaded.' });
// 	}
  
// 	const { buffer, originalname, mimetype } = req.file;
// 	console.log(req.file);
// 	const writeStream = gfs.createWriteStream({
// 	  filename: originalname,
// 	  content_type: mimetype,
// 	});
  
// 	const readableStream = Readable.from(buffer);
// 	readableStream.pipe(writeStream);
  
// 	writeStream.on('close', (file) => {
// 	  const fileUrl = `${req.protocol}://${req.get('host')}/image/${file.filename}`;
// 	  res.json({
// 		fileId: file._id,
// 		fileUrl: fileUrl,
// 	  });
// 	});
// 	readableStream.on('error', (err) => {
// 	  res.status(500).json({ error: 'Error reading file buffer', details: err.message });
// 	});
  
// 	writeStream.on('error', (err) => {
// 	  res.status(500).json({ error: 'Error uploading file', details: err.message });
// 	});
//   };
export const imageUpload = async(req, res) => {
	console.log(req.file);
}
export const signup = async (req, res) => {
	try {
		const { fullName, username, password, gender } = req.body;


		const user = await User.findOne({ username });

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// https://avatar-placeholder.iran.liara.run/

		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword,
			gender,
			profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
		});

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);
		console.log("Token Generated");	
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

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getNotification = (req, res) => {
	console.log("GET NOTIFICATION Called");
    const userId = req.params.userId;
    let userNotifications = ['Notification 1','Notification 2'];
    if (userId === '6703c44dfd53728b2ef7a835') {
        userNotifications.push('Notification 3');
        // userNotifications.push('Notification 1');
		setTimeout(()=>{
			sendNotification('New Message');
		},10000);
    } else if (userId) {
        userNotifications.push('Notification 2');
    } else {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    return res.status(200).json(userNotifications);
};

export const sendNotification = (message) => {
	const newNotification = message;
	const receiverSocketId = getReceiverSocketId('6703c44dfd53728b2ef7a835');
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newNotification", newNotification);
			console.log("Notification sent:",message);
		}
};
