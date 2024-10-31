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

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  content: {
    type: String,
    required: false
  },
  image: [ImageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  comments: [CommentSchema]
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
