import mongoose from "mongoose";

const imagesSchema = new mongoose.Schema(
    {
        downloadLink: String,
        refernceLink: String
    }
)

const tagsSchema = new mongoose.Schema(
    {
        tag: "String"
    }
)

const productSchema = new mongoose.Schema(
    {
        images: {
            type: [imagesSchema],
            default: []
        },
        tags: {
            type: [tagsSchema],
            default: []
        },
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
