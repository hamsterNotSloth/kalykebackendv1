import express, { json, urlencoded } from "express";
import cors from "cors";
import connection from "../config/database/connection.js";
import Routes from "./routes/index.js";
import { createServer } from "http";
import  socketServer  from "../config/socket/socket.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 8000;
const server = createServer(app);

const io = socketServer(server);

connection();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/api", Routes);
app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
