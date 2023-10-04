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
    firstName: String,
    lastName: String,
    role: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    profilePicture: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

usersSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

const User = mongoose.model("User", usersSchema);
export default User;
