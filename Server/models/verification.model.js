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

const verificationSchema = new mongoose.Schema({
  Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  image: [ImageSchema],
});

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
