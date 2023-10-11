import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: null
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
