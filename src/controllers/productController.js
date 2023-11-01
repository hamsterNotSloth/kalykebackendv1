import { getErrorMessage } from "../../errors/errorMessages.js";
import productService from "../services/productService.js";

export const createProductController = async (req, res) => {
  const {title, description} = req.body.productDetails
  if(!title || !description){
   return res.status(400).json({message: "Something is missing.", status: false})
  }
  try {
    const response = await productService.createProduct(req.body.productDetails, req.user.email);
    res.status(201).json(response)
  } catch(err) {
    res.status(500).json({message: err.message, status: false});
  }
};

export const deleteProductHandler = async(req, res) => {
  try {
    const _id = req.body._id
    const response = await productService.deleteProduct(_id);
    if(response.status === false) {
      return res.status(response.code).json(response);
    }
    res.status(200).json({message: "Modal Deleted Successfully", status: true});
  } catch(err) {
    res.status(500).json({message: getErrorMessage(500), status: false});
  }
};

export const getMyProductsController = async(req, res) => {
  try {
    const response = await productService.getMyProducts(req.user)

    if(response.status == false) {
      return res.status(response.code).json({response})
    }
    else {
      return res.status(200).json(response)
    }
  } catch(error) {
    res.status(500).json({message: getErrorMessage(500), status: false});
  }
};

export const getAllProductController = async(req, res) => {
  try {
    const response = await productService.getAllProducts()
    if(response.status == false) {
      return res.status(response.code).json({response})
    }
    else {
      return res.status(200).json(response)
    }
  } catch(err) {
    res.status(500).json({message: getErrorMessage(500), status: false})
  }
}

export const getProductController = async(req, res) => {
  try {
    const _id = req.params.id
    const response = await productService.getProduct(_id)
    res.status(200).json(response)
  } catch(error) {
    res.status(500).json({message: getErrorMessage(500), status: false})
  }
}

export const downloadImageController = async (req, res) => {
  const firebaseDownloadUrl = req.body.url;
  try {
    if (!firebaseDownloadUrl) {
      return res.status(400).json({ error: 'Image URL not provided' });
    }

    res.redirect(firebaseDownloadUrl); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};