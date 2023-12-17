import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
const __dirname = path.resolve();
import cors from 'cors';

import serverRoutes from './routes/main.mjs';

import cookieParser from 'cookie-parser'

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);


app.use("/api/v1", serverRoutes)

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

app.use(express.static(path.join(__dirname, 'web/build')))
app.use("*", express.static(path.join(__dirname, 'web/build')))
app.get("/api/v1/ping", (req, res) => {
    res.send("OK");
})

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Example server listening on port ${PORT}`)
})