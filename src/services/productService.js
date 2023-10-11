import Product from "../model/3dModal.js";

async function productUploader(data) {
    try {
        res.status(200).json({message: "success"})
    } catch(err) {
        res.status(500).json({message: "Internal Server Error", status: false})
    }
}

async function deleteProduct(_id) {
    try {
        const myProduct = await Product.findById(_id)
        if(!myProduct) {
            return {message: "Modal Doesn't Exist", status: false, code: 404}
        }
        await Product.findByIdAndDelete(_id)
        return {status: true}
    } catch(err) {
        return {message: "Internal Server Error", status: false, code: 500}
    }
} 

async function getMyProducts(data) {
    try {
        const {_id: created_by} = data
        const myProducts = await Product.find({ created_by })
        if(!myProducts) {
            return {message: "Products not Found.", status: false, code: 404}
        }
        return {myProducts, status: true}
    } catch(err) {
        return {message: "Internal Server Error", status: false, code: 500}
    }
}

async function getAllProducts() {
    try {
        const allProducts = await Product.find();
        if(!allProducts) {
            return {message: "No Products available.", status: false, code: 404}
        }
        return {allProducts, status: true}
    } catch(err) {
        return {message: "Internal Server Error", status: false, code: 500}
    }
}

export default {
    productUploader,
    getMyProducts,
    deleteProduct,
    getAllProducts
};