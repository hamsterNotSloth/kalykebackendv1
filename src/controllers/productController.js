import Product from "../model/3dModal.js";
import productService from "../services/productService.js";


export const createProductController = async (req, res) => {
  const {title, description, images} = req.body
  if(!title || !description){
   return res.status(400).json({message: "Something is missing.", status: false})
  }
  try {
    const newProduct = new Product({
      title: title,
      description: description,
      images: images,
      created_by: req.user._id
    })
    await newProduct.save();
    res.status(201).json({message: "Product Successfully Created.", status: true})
  } catch(err) {
    res.status(500).json({message: "Internal Server Error...", status: false});
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
    res.status(500).json({message: "Internal Server Error...", status: false});
  }
};

export const getProductController = async(req, res) => {
  try {
    const response = await productService.getMyProducts(req.user)

    if(response.status == false) {
      return res.status(response.code).json({response})
    }
    else {
      return res.status(200).json(response)
    }
  } catch(error) {
    console.log(error)
    res.status(500).json({message: "Internal Server Error...", status: false});
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
    res.status(500).json({message: "Internal Server Error...", status: false})
  }
}
// export const productUploaderController = async (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded.' });
//     }
  
//     const { buffer, mimetype, originalname } = req.file; 
//     const newProduct = new Product({
//       data: buffer,
//       contentType: mimetype,
//       originalName: originalname,
//     });
//     console.log(newProduct,'buffer')

//     try {
//       await newProduct.save();
//       res.json({ message: 'File uploaded and saved to MongoDB successfully.', newProduct });
//     } catch (error) {
//       console.error('Error saving file to MongoDB:', error);
//       res.status(500).json({ message: 'An error occurred while saving the file to MongoDB.' });
//     }
//   };