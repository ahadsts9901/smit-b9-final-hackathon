import express from 'express';
let router = express.Router()
import { client } from '../mongodb.mjs'
import jwt from 'jsonwebtoken';
import {
    stringToHash,
    varifyHash,
} from "bcrypt-inzi";
import "dotenv/config"
import otpGenerator from 'otp-generator';
import moment from "moment"
import nodemailer from "nodemailer"

const db = client.db("smit-final-hackathon")
const col = db.collection("auth")
const otpCollection = db.collection("otps")

router.post('/login', async (req, res, next) => {

    if (!req.body.email ||
        !req.body.password
    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            email: "some@email.com",
            password: "some$password",
        } `);
        return;
    }
    req.body.email = req.body.email.toLowerCase();
    console.log(req.body.email)

    try {
        let result = await col.findOne({ email: req.body.email });
        // console.log("result: ", result);

        if (!result) { // user not found
            res.status(403).send({
                message: "email or password incorrect"
            });
            return;
        } else { // user found

            const isMatch = await varifyHash(req.body.password, result.password)

            if (isMatch) {

                const token = jwt.sign({
                    isAdmin: false,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: req.body.email,
                    _id: result._id
                }, process.env.SECRET, {
                    expiresIn: '24h'
                });

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    expires: new Date(Date.now() + 86400000)
                });

                res.send({
                    message: "login successful"
                });
                return;
            } else {
                res.status(401).send({
                    message: "email or password incorrect"
                })
                return;
            }
        }

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

router.post('/signup', async (req, res, next) => {

    if (!req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.password
    ) {
        res.status(403);
        res.send(`required parameters missing, ...`);
        return;
    }

    req.body.email = req.body.email.toLowerCase();

    try {
        let result = await col.findOne({ email: req.body.email });

        if (!result) { // user not found

            const passwordHash = await stringToHash(req.body.password);

            const insertResponse = await col.insertOne({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: passwordHash,
                isAdmin: false,
                createdOn: new Date(),
                profileImage: `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`,
            });

            // Generate a token
            const token = jwt.sign({
                isAdmin: false,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                _id: insertResponse.insertedId,
            }, process.env.SECRET, {
                expiresIn: '24h'
            });

            // Set the token as a cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                expires: new Date(Date.now() + 86400000)
            });

            // Send a response
            res.send({ message: 'Signup successful', token });

        } else {
            res.status(403).send({
                message: "user already exists with this email"
            });
        }

    } catch (e) {
        console.log("error getting data from MongoDB: ", e);
        res.status(500).send('server error, please try later');
    }
});

router.post("/logout", async (req, res, next) => {
    res.clearCookie("token")
    res.send({ message: 'Logout successful' });
});

router.post('/forgot-password', async (req, res, next) => {

    if (!req.body.email) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            email: "some@email.com"
        } `);
        return;
    }

    req.body.email = req.body.email.toLowerCase();

    try {
        const user = await col.findOne({ email: req.body.email });
        // console.log("user: ", user);

        if (!user) { // user not found
            res.status(403).send({
                message: "user not found"
            });
            return;
        }

        const otpCode = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        console.log(otpCode);

        // nodemailer email send

        try {

            const transporter = nodemailer.createTransport({
                service: 'gmail', // e.g., 'gmail'
                host: 'smtp.gmail.com',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: `<${process.env.EMAIL}>`,
                to: user.email,
                subject: 'Forget Password OTP',
                text: `Hi ${user.firstName}! Here is your forget password OTP code. This is valid for 15 minutes: ${otpCode}`
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.log("node-mailer : ", error);
        }

        // email send completed

        const otpCodeHash = await stringToHash(otpCode);

        const insertResponse = await otpCollection.insertOne({
            email: req.body.email,
            otpCodeHash: otpCodeHash,
            createdOn: new Date()
        });
        console.log("insertResponse: ", insertResponse);

        res.send({ message: 'Forget password otp sent' });

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

router.post('/forgot-password-complete', async (req, res, next) => {

    if (!req.body.email
        || !req.body.otpCode
        || !req.body.newPassword) {

        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            email: "some@email.com",
            otpCode: "344532",
            newPassword: abcd1234,
        } `);
        return;
    }

    req.body.email = req.body.email.toLowerCase();

    try {
        const otpRecord = await otpCollection.findOne(
            { email: req.body.email },
            { sort: { _id: -1 } }
        )
        console.log("otpRecord: ", otpRecord);

        if (!otpRecord) { // user not found
            res.status(403).send({
                message: "invalid otp"
            });
            return;
        }

        const isOtpValid = await varifyHash(req.body.otpCode, otpRecord.otpCodeHash);

        if (!isOtpValid) {
            res.status(403).send({
                message: "invalid otp"
            });
            return;
        }

        if (moment().diff(moment(otpRecord.createdOn), 'minutes') >= 15) {
            res.status(403).send({
                message: "invalid otp"
            });
            return;
        }

        const passwordHash = await stringToHash(req.body.newPassword);

        const updateResp = await col.updateOne(
            { email: otpRecord.email },
            {
                $set: { password: passwordHash }
            });
        console.log("updateResp: ", updateResp);

        res.send({ message: 'Forget password completed, proceed to login with new password' });

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

export default router