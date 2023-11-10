import mongoose from "mongoose";

const imagesAndModalSchema = new mongoose.Schema(
    {
        downloadLink: String,
        refernceLink: String
    }
)


const userViewSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hasViewed: {
      type: Boolean,
      default: false,
    },
  });
  

const productSchema = new mongoose.Schema(
    {
        images: {
            type: [imagesAndModalSchema],
            default: []
        },
        modal: {
            type: [imagesAndModalSchema],
            default:[]
        },
        tags: [String],
        category: String,
        userViews: [userViewSchema],
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: null
        },
        modalSetting: {
            type: String,
            default: null
        },
        userViews: [userViewSchema],
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
