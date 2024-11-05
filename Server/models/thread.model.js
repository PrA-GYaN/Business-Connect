import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    upvotes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
      }],
    downvotes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
      }],
    // tags: [{
    //     type: String,
    // }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    status: {
        type: String,
        enum: ['active', 'closed', 'deleted'],
        default: 'active',
    },
});

const Thread = mongoose.model('Thread', ThreadSchema);

export default Thread;
