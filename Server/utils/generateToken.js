import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId,fullName,profilePic,res) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        if (!userId) {
            throw new Error("Invalid userId");
        }

        console.log("Generating token for userId:", userId);
        const token = jwt.sign({ userId,fullName,profilePic }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        // console.log("Token generated:", token);
        return token;

    } catch (error) {
        console.error("Error generating token:", error.message);
    }
};

export default generateTokenAndSetCookie;