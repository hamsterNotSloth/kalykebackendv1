import Product from "../model/3dModal.js";

export const productUploaderController = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
  
    const { buffer, mimetype, originalname } = req.file; 
    const newProduct = new Product({
      data: buffer,
      contentType: mimetype,
      originalName: originalname,
    });
    console.log(newProduct,'buffer')

    try {
      await newProduct.save();
      res.json({ message: 'File uploaded and saved to MongoDB successfully.', newProduct });
    } catch (error) {
      console.error('Error saving file to MongoDB:', error);
      res.status(500).json({ message: 'An error occurred while saving the file to MongoDB.' });
    }
  };