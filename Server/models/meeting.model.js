import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: true,
		},
        link:
        {
            type: String,
        },
		participants: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				status: {
					type: String,
					enum: ["pending", "accepted", "rejected"],
					default: "pending",
				},
			},
		],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;