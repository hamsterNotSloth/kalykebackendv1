import dotenv from "dotenv";
dotenv.config();
import express, { json, urlencoded } from "express";
import cors from "cors";
import connection from "../config/database/connection.js";
import Routes from "./routes/index.js";
import { createServer } from "http";

const port = process.env.PORT;

const app = express();
const server = createServer(app);

connection();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/api", Routes);
app.use(express.static('public'));

server.listen(port, () => {
  console.log(`Listening to ${port}`);
});
