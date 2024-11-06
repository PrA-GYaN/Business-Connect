import mongoose from "mongoose";

const ThreadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }],
        tags: [{
            type: String,
            enum: [
                'technology', 'healthcare', 'finance', 'education',
                'retail', 'manufacturing', 'hospitality', 'real estate',
                'transportation', 'non-profit'
            ],
            unique: true,
        }],
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }],
        status: {
            type: String,
            enum: ['active', 'closed', 'deleted'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

ThreadSchema.index({ author: 1 });
ThreadSchema.index({ status: 1 });
ThreadSchema.index({ tags: 1 });

const Thread = mongoose.model('Thread', ThreadSchema);

export default Thread;
