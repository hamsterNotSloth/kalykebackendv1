import mongoose from "mongoose";

const imagesAndModalSchema = new mongoose.Schema(
    {
        downloadLink: String,
        refernceLink: String
    }
)

const purchaseHistorySchema = new mongoose.Schema({
    user: {
      type: String,
      ref: "User",
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  });

  const replySchema = new mongoose.Schema({
    userName: {
      type: String,
      ref: "User",
    },
    u_id: {
      type: String,
      ref: "Product",
    },
    profilePic: {
      type: String,
      ref: "User",
    },
    user: {
      type: String,
      ref: "User",
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  
const commentSchema = new mongoose.Schema({
  userName: {
    type: String,
    ref: "User",
  },
  u_id: {
    type: String,
    ref: "Product",
  },
  profilePic: {
    type: String,
    ref: "User",
  },
    user: {
      type: String,
      ref: "User",
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    replies: [replySchema],
  });
  

const productSchema = new mongoose.Schema(
    {
        images: {
            type: [imagesAndModalSchema],
            default: []
        },
        modal: {
            type: [imagesAndModalSchema],
            default: []
        },
        tags: [String],
        category: String,
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: null
        },
        rating: {
            type: Number,
            default: 0
        },
        likes: {
            type: [String],
            default: []
        },
        comments: {
          type: [commentSchema], 
          default: [],
        },
        modalSetting: {
            type: String,
            default: null
        },
        purchaseHistory: {
            type: [purchaseHistorySchema],
            default: []
        },
        userViews: {
            type: [String],
            default: []
        },
        created_by: {
            type: String,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);


const Product = mongoose.model("Product", productSchema);
export default Product;
