import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema(
  {
    socialMediaName: String,
    link: String
  }
)

const usersSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    email_verified: {
      type: Boolean,
      default: false
    },
    followers: {
      type: [String],
      default: []
    },
    following: {
      type: [String],
      default: []
    },
    isPromotionOn: {
      type: Boolean,
      default: false
    },
    u_id: {
      type: String,
      unique: true,
      required: true, 
      default: null,
    },
    description: {
      type: String,
      default: null
    },
    socialMedia: {
      type: [socialMediaSchema],
      default: []
    },
    resetToken:{
      type: String,
    },
    resetTokenExpiration: {
      type: Date, 
    },
    firstName: String,
    LastName: String,
    profilePicture: String,
    source: {
      type: String,
      default: "Email"
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", usersSchema);
export default User;
