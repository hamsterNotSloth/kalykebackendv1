import mongoose from "mongoose";

const imagesSchema = new mongoose.Schema(
    {
        downloadLink: String,
    }
)

const productSchema = new mongoose.Schema(
    {
        images: {
            type: [imagesSchema],
            default: []
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: null
        },
        // created_by: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: true
        // },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);


const Product = mongoose.model("Product", productSchema);
export default Product;
