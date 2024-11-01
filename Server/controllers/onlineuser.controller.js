import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const  userId = req.user._id;

		const filteredUsers = await User.findById(userId).select("-password")
		.populate({
			path: 'connections.userId',
			model: 'Users'
		  });
		console.log("filteredUsers: ", filteredUsers);
		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
