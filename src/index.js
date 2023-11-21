import dotenv from "dotenv"; 
dotenv.config();
import express, { json, urlencoded } from "express";
import cors from "cors";
import connection from "../config/database/connection.js";
import Routes from "./routes/index.js";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename)
const port = process.env.PORT;

const app = express();
const server = createServer(app);

connection();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../kalykefrontendv1/build");
app.use(express.static(buildPath))
app.use("/api", Routes);
app.use(express.static('public'));

app.get("/*", function(req, res){
// const test = path.join(__dirname, "../kalykefrontendv1/build/index.html")
// console.log(test) 
  res.sendFile(
      path.join(__dirname, "../../kalykefrontendv1/build/index.html"),
      function (err) {
        if (err) {
          res.status(500).send(err);
        }
      }
    );

})


server.listen(port, () => {
  console.log(`Listening to ${port}`);
});