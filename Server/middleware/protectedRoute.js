import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectedRoute = async (req, res, next) => {
	try {
		console.log("Cookies: ", req.cookies);
		const token = req.cookies.User;

		if (!token) {
			console.log("Unauthorized - No Token Provided");
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			console.log("Unauthorize - Invalid Token");
			return res.status(401).json({ error: "Unauthorize - Invalid Token" });
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			console.log("User not found");
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user;

		next();
	} catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export default protectedRoute;
