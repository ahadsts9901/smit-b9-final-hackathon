import express from 'express';
import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import "dotenv/config"

const db = client.db("smit-final-hackathon")
const studentCol = db.collection("students")

let router = express.Router()

// login
router.post('/login', async (req, res, next) => {

    if (!req.body.email ||
        !req.body.password
    ) {
        res.status(403);
        res.send({
            message: `required parameters missing, 
            example request body:
            {
                email: "some@email.com",
                password: "some$password",
            } `
        });
        return;
    }

    req.body.email = req.body.email.toLowerCase();

    try {
        let result = await studentCol.findOne({ email: req.body.email });

        console.log("moin", result);

        if (!result) {
            res.status(403).send({
                message: "email or password incorrect"
            });
            return;
        }

        console.log(result);

        const isMatch = req.body.email === result.email

        if (isMatch) {

            const token = jwt.sign({
                isAdmin: result.isAdmin,
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: req.body.email,
                course: result.course,
                phoneNumber: result.phoneNumber,
                checkInTime: result.checkInTime,
                checkOutTime: result.checkOutTime,
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

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send({
            message: 'server error, please try later'
        });
    }
})

export default router