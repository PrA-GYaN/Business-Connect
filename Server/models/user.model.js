import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const ImageSchema = new Schema({
url: {
	type: String,
	required: true,
},
public_id: {
	type: String,
	required: true,
}
});
const certificate = new Schema({
    name: { type: String, required: true }
});
const swipe = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Users' },
  action: { type: String, enum: ['Liked', 'Disliked'] },
  timestamp: { type: Date, default: Date.now }
});
const connection = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Users' }
});
const meeting = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting' },
});


const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    businessTitle: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true,
        enum: [
            'technology', 'healthcare', 'finance', 'education',
            'retail', 'manufacturing', 'hospitality', 'real estate',
            'transportation', 'non-profit'
        ]
    },
    phoneNumber: {
        type: String,
        required: true,
        match: /^\+\d{1,3}\d{10}$/ 
    },
    address: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
	profilePic: [ImageSchema],
    bio: {
      type: String,
      required:false,
      default: "No bio provided",
    },
    education: {
      type: String,
      required:false,
        default: "No education provided",
    },
    job: {
      type: String,
      required:false,
        default: "No job provided",
    },
    company: {
      type: String,
      required:false,
        default: "No company provided",
    },
    verified: {
      type: Boolean,
      required:false,
      default: false,
    },
    imageData: { type: Buffer, required: false }, 
    contentType: { type: String, required: false },
    interests:[String],
    languages:[String],
    activities:[String],
    skills:[String],
    certificates:[certificate],
    swipes:[swipe],
    connections:[connection],
    meetings:[meeting]
});
const Users = mongoose.model('Users', userSchema);

export default Users;
