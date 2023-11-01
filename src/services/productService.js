import { getErrorMessage } from "../../errors/errorMessages.js";
import { getProductErrorMessage, getProductSuccessMessage } from "../../errors/productErrorMessages.js";
import Product from "../model/3dModal.js";
import User from "../model/userModal.js";

async function createProduct(data, userRef) {
  const {title, description, images, modalSetting, category} = data
    try {
        const createProduct = new Product({
            title: title,
            description: description,
            images: images,
            modalSetting: modalSetting,
            category: category,
            created_by: userRef
        })
        await createProduct.save();
        return {message: getProductSuccessMessage(201),status: true}
    } catch(err) {
        return
    }
}

async function deleteProduct(_id) {
    try {
        const myProduct = await Product.findById(_id)
        if(!myProduct) {
            return {message: getProductErrorMessage(404), status: false, code: 404}
        }
        await Product.findByIdAndDelete(_id)
        return {status: true}
    } catch(err) {
        return {message: getErrorMessage(500), status: false, code: 500}
    }
} 

async function getMyProducts(data) {
    try {
        const {email: created_by} = data
        const myProducts = await Product.find({ created_by })
        if(!myProducts) {
            return {message: getProductErrorMessage(404), status: false, code: 404}
        }
        return {myProducts, status: true}
    } catch(err) {
        return {message: getErrorMessage(500), status: false, code: 500}
    }
}

async function getAllProducts() {
    try {
        const allProducts = await Product.find();
        if(!allProducts) {
            return {message: getProductErrorMessage(404), status: false, code: 404}
        }
        return {allProducts, status: true}
    } catch(err) {
        return {message: getErrorMessage(500), status: false, code: 500}
    }
}

const getProduct = async(_id) => {
    try {
        const product = await Product.findOne({_id})
        const user = await User.findOne({email: product.created_by})
        if(!product || !user) {
            return null
        }
        return {product, user}
    } catch(error) {
        return  {message: getErrorMessage(error.code), status: false, code: error.code}
    }
}

async function downloadImage(link)  {
    try {
        const response = await fetch(link);
        if (response.ok) {
          const imageBuffer = await response.buffer();
          res.setHeader('Content-Type', response.headers.get('Content-Type'));
          res.setHeader('Content-Disposition', 'attachment; filename="downloaded_image.jpg"');
          res.send(imageBuffer);
        } else {
          res.status(response.status).send('Failed to download image');
        }
    } catch(error) {
        console.log(error)
    }
}

export default {
    createProduct,
    getMyProducts,
    deleteProduct,
    getAllProducts,
    getProduct,
    downloadImage
};