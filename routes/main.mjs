import express from 'express';
import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import "dotenv/config"

import { upload } from "../multer.mjs"
import { uploadOnCloudinary } from '../cloudinary.mjs'

const db = client.db("smit-final-hackathon")
const studentCol = db.collection("students")

let router = express.Router()

// add student
router.post('/add-student', upload.any(), async (req, res, next) => {

    if (
        !req.body.firstName || !req.body.lastName
        || !req.body.email || !req.body.password
        || !req.body.course || !req.body.phoneNumber
        || !req.files
    ) {
        res.status(400).send({
            message: `required parameters missing eample requies body: 
            {
                "firstName" : "firstName",
                "lastName" : "lastName",
                "email" : "email",
                "password" : "password",
                "course" : "course",
                "phoneNumber" : "phoneNumber",
                "image" : "image"
            }
            `
        })
        return;
    }

    console.log("yes", req.files[0].path);

    const localFilePath = req.files[0].path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

    try {

        const response = await studentCol.insertOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email.toLowerCase(),
            password: req.body.password,
            course: req.body.course,
            phoneNumber: req.body.phoneNumber,
            profileImage: cloudinaryResponse.url,
            isAdmin: false
        })

        res.send({
            message: "student added"
        })


    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "server error"
        })
    }

})

// get all students
router.get('/students', async (req, res) => {
    try {
        const response = await studentCol.find({}).sort({ _id: -1 }).toArray();
        res.send({
            message: "students founded",
            data: response
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "server error"
        });
    }
});

router.get('/ping', async (req, res, next) => {

    try {
        let result = await studentCol.findOne({ email: req.body.currentUser.email });
        console.log(result);
        res.send({
            message: 'profile fetched',
            data: {
                isAdmin: result.isAdmin,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                userId: result._id,
                course: result.course,
                phoneNumber: result.phoneNumber,
                profileImage: result.profileImage,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(401).send({
            message: 'UnAuthorized'
        });
    }
})

export default router