import dotenv from "dotenv"; 
dotenv.config();
import express, { json, raw, urlencoded } from "express";
import cors from "cors";
import Routes from "./routes/index.js";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { webHooks, webHooksConnect } from "./controllers/transactionController.js";
import bodyParser from "body-parser";
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename)
const port = process.env.PORT;

const app = express();
const server = createServer(app);
app.use(cors(
  {
  origin: 'http://localhost:3000', 
  credentials: true,
},
{
  origin: 'https://kalyke3d.com', 
  credentials: true,
},
{
  origin: 'http://16.171.75.64', 
  credentials: true,
}
)); 
app.use("/webhook", express.raw({type: 'application/json'}), webHooks);
app.use("/webhook/connect", express.raw({type: 'application/json'}), webHooksConnect)
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
      function (err, html) {
        if (err) {
          res.status(500).send(err);
        }
      }
    );
})


server.listen(port, '0.0.0.0',() => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});