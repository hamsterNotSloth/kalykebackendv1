import mongoose from "mongoose";

const imagesAndModalSchema = new mongoose.Schema(
    {
        downloadLink: String,
        refernceLink: String
    }
)


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
