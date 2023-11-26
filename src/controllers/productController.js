import { getErrorMessage } from "../../errors/errorMessages.js";
import productService from "../services/productService.js";

export const createProduct = async (req, res) => {
  const { title, description } = req.body.productDetails
  if (!title || !description) {
    return res.status(400).json({ message: getErrorMessage(400), status: false })
  }
  try {
    const response = await productService.createProduct(req.body.productDetails, req.user.email);
    res.status(201).json(response)
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
  }
};

export const deleteProduct = async (req, res) => {
  if(!req.body || !req.user) {
    return res.status(400).json({ message: getErrorMessage(400), status: false })
  }
  if(!req.body._id || !req.user.email) {
    return res.status(400).json({ message: getErrorMessage(400), status: false })
  }
  try {
    const _id = req.body._id
    const user = req.user.email
    const response = await productService.deleteProduct(_id, user);
    if (response.status === false) {
      return res.status(response.code).json(response);
    }
    res.status(200).json({ message: "Model Deleted Successfully", status: true });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: getErrorMessage(500), status: false });
  }
};

export const getUserProducts = async (req, res) => {
  if(!req.user && !req.params) {
    return;
  }
  if (req.user && req.params) {
    if (!req.user.uid && !req.params.id) {
      return;
    }
  }
  const id = req.params.id || req.user.uid
  try {
    const response = await productService.getMyProducts(id)

    if (response.status == false) {
      return res.status(response.code).json({ response })
    }
    else {
      return res.status(response.code).json(response)
    }
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(500), status: false });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const response = await productService.getAllProducts(req.query)
    if (response.status == false) {
      return res.status(response.code).json({ response })
    }
    else {
      return res.status(200).json(response)
    }
  } catch (err) {
    console.log(err,'err')
    return res.status(500).json({ message: getErrorMessage(500), status: false })
  }
}

export const getProduct = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).json({ message: getErrorMessage(404), status: false, code: 404 })
  }
  try {
    const _id = req.params.id
    const response = await productService.getProduct(_id)
    return res.status(response.status).json(response)
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(500), status: false, code: 500 })
  }
}

export const getSimilarProducts = async (req, res) => {
  const { tags, created_by } = req.query;
  if (!tags && !created_by) {
    return res.status(404).json({ message: getErrorMessage(404), status: false, code: 404 })
  }
  try {
    const response = await productService.getSimilarProducts(tags.split(','), created_by)
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(404), status: false, code: 500 })
  }
}

export const productView = async (req, res) => {
  if(!req.params || !req.user) {
    return
  }
  if(req.user && !req.user.email) {
    return
  }
  if(req.params && !req.params.id) {
    return
  }
  const productId = req.params.id
  const userEmail = req.user.email
  try {
    const response = await productService.userView(userEmail, productId);
    res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(500), status: false, code: 500 })
  }
}

export const getAllSearchedProducts = async(req, res) => {
  if(req.query.products.length == 0) {
    return res.status(204).json({products: [], status: true, code: 204}) 
  }
  try{
    const response = await productService.searchedProducts(req.query.products)
    res.status(response.code).json(response)

  } catch(error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const addComments = async(req, res) => {
  if(!req.body || !req.user || !req.params) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  }
  if(!req.body.comment || !req.user.email || !req.params.productId) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  }
  const comment = req.body.comment
  const productId = req.params.productId
  try {
    const response = await productService.addComments({comment, user:req.user, productId})
    res.status(response.code).json(response)
  } catch(error) {
    console.log(error,':::error:::')
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const addReply = async (req, res) => {
  if (!req.body || !req.user || !req.params) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 });
  }

  if (!req.body.reply || !req.user.email || !req.params.productId || !req.params.commentId) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 });
  }

  const reply = req.body.reply;
  const productId = req.params.productId;
  const commentId = req.params.commentId;

  try {
    const response = await productService.addReply({ reply, user: req.user, productId, commentId });
    res.status(response.code).json(response);
  } catch (error) {
    console.log(error, ":::error:::");
    return res.status(500).json({
      message: getErrorMessage(500),
      status: false,
    });
  }
};

export const deleteReply = async (req, res) => {
  if (!req.params || !req.params.productId || !req.params.commentId || !req.params.replyId || !req.user) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 });
  }

  const productId = req.params.productId;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const user = req.user;

  try {
    const response = await productService.deleteReply({ productId, commentId, replyId, user });

    if (response.status) {
      res.status(response.code).json({ message: response.message, status: true });
    } else {
      res.status(response.code).json({ message: response.message, status: false });
    }
  } catch (error) {
    console.log(error, "At controller")
    return res.status(500).json({ message: getErrorMessage(500), status: false });
  }
};

export const deleteComment = async(req, res) => {
  if(!req.user || !req.params) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  }
  
  if(!req.user.email || !req.params.commentId || !req.params.productId) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  }
  const user = req.user.email
  const commentId = req.params.commentId
  const productId = req.params.productId
  try {
    const response = await productService.deleteComment({user, commentId, productId})
    res.status(response.code).json(response)
  } catch(error) {
    
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const productPurchase = async(req, res) => {
  console.log(req.params,'req.params')

  if(!req.user || !req.params) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  }

  const { productId } = req.params;
  const { email } = req.user;

  try {
    const updatedProduct = await productService.addPurchase(
      productId,
      email
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
