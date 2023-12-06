import dotenv from "dotenv"; 
dotenv.config();
import express, { json, raw, urlencoded } from "express";
import cors from "cors";
import connection from "../config/database/connection.js";
import Routes from "./routes/index.js";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { webHooks } from "./controllers/transactionController.js";
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename)
const port = process.env.PORT;

const app = express();
const server = createServer(app);

connection();
app.use(cors(
  {
  origin: 'http://localhost:3000', 
  credentials: true,
},
{
  origin: 'http://kalyke.in', 
  credentials: true,
},
{
  origin: 'http://16.171.75.64', 
  credentials: true,
}
)); 
app.use("/webhook", express.raw({type: 'application/json'}), webHooks);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/api", Routes);
app.use(express.static('public'));
const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../kalykefrontendv1/build");
app.use(express.static(buildPath))

app.get("/*", function(req, res){
  res.sendFile(
      path.join(__dirname, "../../kalykefrontendv1/build/index.html"),
      function (err) {
        if (err) {
          res.status(500).send(err);
        }
      }
    );
})


server.listen(port, '0.0.0.0',() => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});