import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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
    profilePicture: String,
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", usersSchema);
export default User;
