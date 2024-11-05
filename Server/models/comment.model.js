import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
    upvotes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
      }],
    downvotes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
      }],
      replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    type:
    {
        type: String,
        enum: ['normal', 'reply'],
        default: 'normal',
    }
});

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
