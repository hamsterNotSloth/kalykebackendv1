import jwt  from "jsonwebtoken";
import { getErrorMessage } from "../errors/errorMessages.js";
import admin from "../config/firebase/firebase.js"
import dotenv from "dotenv";
dotenv.config();

const secret_key = process.env.SECRET_KEY;

function validateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  const tokenType = req.headers.authorization?.split(" ")[0]
  if(token === undefined) {
    return res.status(400).json({ message: getErrorMessage(401) });
  }

  if(tokenType === "Bearer") {
    if (!token) {
      return res.status(404 ).json({ message: getErrorMessage(400) });
    }
    jwt.verify(token, secret_key, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: getErrorMessage(401) });
      }
      req.user = decoded;
      next();
    }); 
  }

  else if(tokenType === "firebase") {
    admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.log(error, "Error While verifying accessToken from firebase")
      return res.status(401).json({ message: getErrorMessage(401) });
    });
  }
}

export default validateToken;