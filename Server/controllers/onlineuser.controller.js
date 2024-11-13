import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import {timeAgoMessage} from "../utils/timeago.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id; // Get the current user's ID

    // Fetch the current user and populate the connections (assuming `connections` has a userId field)
    const filteredUsers = await User.findById(userId)
      .select("-password") // Exclude password from the returned user object
      .populate({
        path: "connections.userId", // Populate each connection's userId field
        model: "Users", // Ensure the population uses the correct model
        select: "-password"
      });
	  
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getLastMessage = async (req, res) => {
	try {
	  const userId = req.user._id;

	  const conversations = await Conversation.find({
		participants: userId,
	  })
		.populate({
		  path: "messages",
		  model: "Message",
		  options: { sort: { createdAt: -1 }, limit: 1 },
		})
		.populate({
		  path: "participants",
		  model: "Users",
		  select: "-password",
		});

	  if (!conversations.length) {
		return res.status(200).json([]);
	  }

	  const conv = conversations.map((conversation) => {
		return {
		  ...conversation._doc,
		  timeAgo: timeAgoMessage(conversation.updatedAt),

		};
	  });
  
	  // Return the conversations with the last message
	  res.status(200).json(conv);
	} catch (error) {
	  console.error("Error in getLastMessage:", error.message);
	  res.status(500).json({ error: "Internal server error", details: error.message });
	}
  };
  