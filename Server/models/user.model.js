import mongoose from 'mongoose';
import { Schema } from 'mongoose';

// Image Schema for profile pictures and other images
const ImageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
});

// Certificate Schema for certificates
const certificate = new Schema({
  name: { type: String, required: true },
});

// Swipe Schema for swipe actions
const swipe = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Users' },
  action: { type: String, enum: ['Liked', 'Disliked'] },
  timestamp: { type: Date, default: Date.now },
});

// Connection Schema for user connections
const connection = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Users' },
});

// Meeting Schema for meetings related to users
const meeting = new Schema({
  meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting' },
});

// Main User Schema
const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  businessType: {
    type: String,
    required: true,
    enum: ['individual', 'house'],
  },
  businessTitle: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'technology', 'healthcare', 'finance', 'education',
      'retail', 'manufacturing', 'hospitality', 'real estate',
      'transportation', 'non-profit',
    ],
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^\+\d{1,3}\d{10}$/, // Regex for phone number validation
  },
  address: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  profilePic: [ImageSchema], // Profile pictures
  bio: {
    type: String,
    default: "No bio provided",
  },
  education: {
    type: String,
    default: "No education provided",
  },
  job: {
    type: String,
    default: "No job provided",
  },
  company: {
    type: String,
    default: "No company provided",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  imageData: { 
    type: Buffer, 
    required: false 
  },
  contentType: { 
    type: String, 
    required: false 
  },
  interests: [String],
  languages: [String],
  activities: [String],
  skills: [String],
  certificates: [certificate],
  swipes: [swipe],
  connections: [connection],
  meetings: [meeting],

  operationalFocus: [String],
  technologies: [String],
  businessModels: [String],
  strategicGoals: [String],
  performanceMetrics: [String],
  industryFocus: [String],
});

const Users = mongoose.model('Users', userSchema);

export default Users;
