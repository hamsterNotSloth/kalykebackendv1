import { bucket } from "../../config/firebase/firebase.js";
import { getErrorMessage } from "../../errors/errorMessages.js";
import productService from "../services/productService.js";
import fs from "fs";

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

export const getUserProductsController = async(req, res) => {
  const id = req.params.id || req.user.uid
  try {
    const response = await productService.getMyProducts(id)

    if(response.status == false) {
      return res.status(response.code).json({response})
    }
    else {
      return res.status(response.code).json(response)
    }
  } catch(error) {
    console.log(error,'err')
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
    res.status(response.status).json(response)
  } catch(error) {
    res.status(500).json({message: getErrorMessage(500), status: false, code: 500})
  }
}
