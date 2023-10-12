import jwt  from "jsonwebtoken";
import { getErrorMessage } from "../errors/errorMessages.js";
import admin from "../config/firebase/firebase.js"
const secret_key = process.env.SECRET_KEY;

function validateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  const tokenType = req.headers.authorization?.split(" ")[0]
  if(tokenType === "Bearer") {
    if (!token) {
      return res.status(401).json({ message: getErrorMessage(401) });
    }
    jwt.verify(token, 'new_web_secret', (err, decoded) => {
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
      console.error('Firebase token verification error:', error);
      return res.status(401).json({ message: getErrorMessage(401) });
    });
  }
}

export default validateToken;
