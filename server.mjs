import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
const __dirname = path.resolve();
import cors from 'cors';

import authRoutes from './routes/main.mjs';
import unAuthRoutes from './unAuthRoutes/main.mjs';

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


app.use("/api/v1", unAuthRoutes)

app.use("/api/v1", (req, res, next) => {

    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        req.body.currentUser = {
            ...decoded
        };

        console.log(req.body.currentUser);

        next();

    } catch (err) {
        unAuthProfileRouter(req, res)
        return;
    }
});

app.use("/api/v1", authRoutes)

app.use(express.static(path.join(__dirname, 'web/build')))
app.use("*", express.static(path.join(__dirname, 'web/build')))

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Example server listening on port ${PORT}`)
})