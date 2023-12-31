import admin from "../config/firebase/firebase.js"
import dotenv from "dotenv";
dotenv.config();

function permissionGranter(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if(!token) {
    req.user = null;
    next();
    return;
  }
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
      return 
    })
    .catch((error) => {
      console.log(error, "Error While verifying accessToken from firebase")
       req.user = null;
       next();
       return 
    })
}

export default permissionGranter;