import express from 'express';
import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import moment from "moment"
import "dotenv/config"

import { upload } from "../multer.mjs"
import { uploadOnCloudinary } from '../cloudinary.mjs'

const db = client.db("smit-final-hackathon")
const studentCol = db.collection("students")

let router = express.Router()

// logout
router.post("/logout", async (req, res, next) => {
    res.clearCookie("token")
    res.send({ message: 'Logout successful' });
});

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
            isAdmin: false,
            checkInTime : new Date(),
            checkOutTime :  new Date(),
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

// authentication
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
                checkInTime: result.checkInTime,
                checkOutTime: result.checkOutTime,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(401).send({
            message: 'UnAuthorized'
        });
    }
})

// get a student
router.get('/student/:studentId', async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const response = await studentCol.findOne({ _id: new ObjectId(studentId) });
        console.log("response: ", response);

        if (!response) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        res.json({
            message: "Student found",
            data: response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
});

// edit a student
router.put('/student/:studentId', upload.any(), async (req, res) => {

    const studentId = req.params.studentId;
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const phoneNumber = req.body.phoneNumber
    const password = req.body.password
    const course = req.body.course

    if (!studentId) {
        res.status(400).send({
            message: "invalid student id"
        })
        return;
    }

    if (!firstName || !lastName || !email || !password
        || !phoneNumber || !course) {
        res.status(400).send({
            message: `required parameters missing eample request body: 
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

    if (req.files.length > 0) {
        const localFilePath = req.files[0].path;
        const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

        try {
            const response = await studentCol.updateOne(
                { _id: new ObjectId(studentId) },
                {
                    $set: {
                        firstName, lastName, email, password, course, phoneNumber,
                        profileImage: cloudinaryResponse.url
                    }
                }
            );

            if (!response) {
                return res.status(404).json({
                    message: "student not found",
                });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "internal server error",
            });
        }

    } else {
        try {
            const response = await studentCol.updateOne(
                { _id: new ObjectId(studentId) },
                {
                    $set: {
                        firstName, lastName, email, password, course, phoneNumber,
                    }
                }
            );

            if (!response) {
                return res.status(404).json({
                    message: "student not found",
                });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "internal erver error",
            });
        }
    }
});

// check in
router.put('/check-in/:studentId', upload.any(), async (req, res) => {

    const studentId = req.params.studentId;

    if (!studentId) {
        res.status(400).send({
            message: "invalid student id"
        })
        return;
    }

    if (!req.files) {
        res.status(400).send({
            message: `required parameters missing eample request body: 
                {
                    "image" : "image"
                }
                `
        })
        return;
    }

    try {

        const user = studentCol.findOne({ _id: new ObjectId(studentId) })

        const checkInTime = moment(user.checkInTime);
        const checkOutTime = moment(user.checkOutTime);

        const timeDifferenceMs = checkOutTime.diff(checkInTime);
        const duration = moment.duration(timeDifferenceMs);
        const hours = duration.hours();

        if (hours <= 23) {
            res.status(400).send({
                message: "already checked in"
            })
            return
        }

        const resp = studentCol.updateOne(
            { _id: studentId },
            { $set: { checkInTime: new Date().toISOString } }
        )

        res.send({
            message: "check in successfull"
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "internal server error",
        });
    }

});

export default router