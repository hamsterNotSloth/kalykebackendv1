import jwt  from "jsonwebtoken";
import { getErrorMessage } from "../errors/errorMessages.js";

const secret_key = process.env.SECRET_KEY;

function validateToken(req, res, next) {
  const token = req.headers.authorization || req.query.token;
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




export default validateToken;