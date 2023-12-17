import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
const __dirname = path.resolve();
import cors from 'cors';

import authRouter from './routes/auth.mjs'
import postRouter from './routes/post.mjs'
import chatRouter from './routes/chat.mjs'
import commentsRouter from './routes/comments.mjs'
import notificationRouter from './routes/notifications.mjs'
import cookieParser from 'cookie-parser'
import { createServer } from "http";
import { Server as socketIo } from 'socket.io';
// import { decode } from 'punycode';

import unAuthProfileRouter from "./unAuthRoutes/profile.mjs"
import { globalIoObject } from './core.mjs'

const app = express();
app.use(express.json()); // body parser
app.use(cookieParser()); // cookie parser
// app.use(cors({
//     origin: ['http://localhost:3000'],
//     credentials: true
// }));                    //allow server for front end CORS policy
app.use(
    cors({
      origin: 'http://localhost:3000', // Allow requests from this origin
      credentials: true, // Enable credentials (cookies, authorization headers, etc.)
    })
  ); // Allow server for front end CORS policy
  

app.use("/api/v1", authRouter)

app.use("/api/v1", (req, res, next) => {
    console.log("cookies: ", req.cookies);

    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        req.body.decoded = {
            ...decoded
        };

        next();

    } catch (err) {
        unAuthProfileRouter(req, res)
        return;
    }
});


app.use("/api/v1", postRouter)
app.use("/api/v1", chatRouter)
app.use("/api/v1", commentsRouter)
app.use("/api/v1", notificationRouter)

app.use(express.static(path.join(__dirname, 'web/build')))
// app.get(express.static(path.join(__dirname, 'web/build')))
app.use("*", express.static(path.join(__dirname, 'web/build')))

app.get("/api/v1/ping", (req, res) => {
    res.send("OK");
})

// socket

// this is the actual server which is running
const server = createServer(app);

// handing over server access to socket.io
const io = new socketIo(server, { cors: { origin: "*", methods: "*", } });
globalIoObject.io = io;

io.on("connection", (socket) => {
    console.log("New client connected with id: ", socket.id);
})

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
    console.log(`Example server listening on port ${PORT}`)
})