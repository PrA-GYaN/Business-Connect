import mongoose from "mongoose";
const ImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    public_id: {
        type: String,
        required: true,
    }
  });

const ThreadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String
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
            enum:[
                "Entrepreneurship","Leadership",
                "Marketing","Sales","Startup","Finance","Growth","Networking","Sales",
                "Strategy","Productivity","Investment","Innovation","Management",
                "Partnerships","Technology","E-commerce","Social Media","Team Building","Funding",
                "Customer Service","Discussion","News","Question","Review"
              ],
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
        community: {
            type:String,
            enum: [
                'technology', 'healthcare', 'finance', 'education',
                'retail', 'manufacturing', 'hospitality', 'real estate',
                'transportation', 'non-profit'
            ],
            required: true,
        },
        image: [ImageSchema],
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
