import mongoose from "mongoose";

const imagesSchema = new mongoose.Schema(
    {
        data: Buffer, 
        contentType: String,
        originalName: String,
    }
)

const productSchema = new mongoose.Schema(
    {
        images: {
            type: [imagesSchema],
            default: []
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
