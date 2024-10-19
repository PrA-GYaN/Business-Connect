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
    ref: 'User',
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
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: [ImageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema]
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
