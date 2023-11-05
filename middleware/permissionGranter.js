import jwt from "jsonwebtoken";
import { getErrorMessage } from "../errors/errorMessages.js";
import admin from "../config/firebase/firebase.js"
import dotenv from "dotenv";
dotenv.config();

const secret_key = process.env.SECRET_KEY;

function permissionGranter(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if(!token) {
    next();
    return;
  }
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.log(error, "Error While verifying accessToken from firebase")
       res.status(401).json({ message: getErrorMessage(401), status: false });
       next();
    })
    
}

export default permissionGranter;