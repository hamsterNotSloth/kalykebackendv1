import { Router } from "express";
import validateToken from "../../middleware/index.js";
import { productUploaderController } from "../controllers/productController.js";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const productRoutes = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..',  '..', 'public/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  },
});


const upload = multer({ storage });
productRoutes.post('/product-upload', upload.single('image'), productUploaderController);


export default productRoutes;