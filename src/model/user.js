import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema(
  {
    socialMediaName: String,
    link: String
  }
)

const purchaseHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
)

const usersSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
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
    purchaseHistory: {
      type: [purchaseHistorySchema],
      default: []
    },
    description: {
      type: String,
      default: null
    },
    socialMedia: {
      type: [socialMediaSchema],
      default: []
    },
    resetToken: {
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
