import express from 'express';
import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb';
import openai from "openai"
import {
    stringToHash,
    varifyHash,
} from "bcrypt-inzi";
import jwt from 'jsonwebtoken';
import "dotenv/config"

const db = client.db("smit-final-hackathon")
const col = db.collection("posts")
const userCollection = db.collection("auth")
const commentsCollection = db.collection("comments")
const chatCol = db.collection("chats")
const notifyCol = db.collection("notifications");
import {bucket} from "../firbase.mjs"
import {upload} from "../multer.mjs"



let router = express.Router()

// POST    /api/v1/post
router.post('/post', (req, res, next) => {
    req.decoded = { ...req.body.decoded };
    next();
},
    upload.any(), async (req, res, next) => {

        if (!req.body.postText && (!req.files || !req.files[0])) {
            res.status(403);
            res.send(`required parameters missing, 
            example request body:
            {
                postText: "some post text"
            }`);
            return;
        }

        if (req.files && req.files[0] && req.files[0].size > 2000000) { // Check file size if a file is provided
            res.status(403).send({ message: 'File size limit exceeded, maximum limit 2MB' });
            return;
        }

        // Handle file upload only if a file is provided
        if (req.files && req.files[0]) {
            bucket.upload(
                req.files[0].path,
                {
                    destination: `posts/${req.files[0].filename}`,
                },
                function (err, file, apiResponse) {
                    if (!err) {
                        // Handle file upload and processing

                        file.getSignedUrl({
                            action: 'read',
                            expires: '03-09-2491'
                        }).then(async (urlData, err) => {
                            if (!err) {
                                console.log("public downloadable url: ", urlData[0]) // this is a public downloadable URL

                                // Continue handling text data
                                try {
                                    const insertResponse = await col.insertOne({
                                        title: req.body.postTitle || '', // Set to an empty string if not provided
                                        text: req.body.postText || "",
                                        time: new Date(),
                                        email: req.body.userLogEmail,
                                        userId: new ObjectId(req.body.userId),
                                        image: urlData[0], // Set to an empty string if no file was provided
                                        userImage: req.body.userImage,
                                        likes: []
                                    });
                                    console.log(insertResponse);
                                    res.send('post created');
                                } catch (e) {
                                    console.log("error inserting mongodb: ", e);
                                    res.status(500).send({ message: 'server error, please try later' });
                                }

                                // Delete the uploaded file from the server folder (if a file was provided)
                                if (req.files && req.files[0]) {
                                    try {
                                        fs.unlinkSync(req.files[0].path)
                                        //file removed
                                    } catch (err) {
                                        console.error(err)
                                    }
                                }
                            }
                        });
                    } else {
                        console.log("err: ", err)
                        res.status(500).send({
                            message: "server error"
                        });
                    }
                });
        } else {
            // Continue handling text data
            if (req.body.postText.trim() === "") {
                return;
            }
            try {
                const insertResponse = await col.insertOne({
                    title: req.body.postTitle || '', // Set to an empty string if not provided
                    text: req.body.postText,
                    time: new Date(),
                    email: req.body.userLogEmail,
                    userId: new ObjectId(req.body.userId),
                    userImage: req.body.userImage,
                    likes: []
                });
                console.log(insertResponse);
                res.send('post created');
            } catch (e) {
                console.log("error inserting mongodb: ", e);
                res.status(500).send({ message: 'server error, please try later' });
            }
        }
    });

//GET  ALL   POSTS   /api/v1/post/:postId
router.get('/feed', async (req, res, next) => {

    const page = Number(req.query.page) || 0;

    try {
        const projection = { _id: 1, title: 1, text: 1, time: 1, userId: 1, likes: 1, image: 1, userImage: 1 }
        const cursor = col.find({}).sort({ _id: -1 }).project(projection);
        let results = await cursor.toArray();

        console.log(results);
        res.send(results);
    } catch (error) {
        console.error(error);
    }
});

// GET  ONE   POST   /api/v1/posts/
router.get('/post/:postId', async (req, res, next) => {

    console.log(req.params.postId);

    const postId = new ObjectId(req.params.postId);

    try {
        // const projection = {_id :1, title:1, text:1, time:1, userId:1, likes:1, }
        const post = await col.findOne({ _id: postId });

        if (post) {
            res.send(post);
        } else {
            res.status(404).send('Post not found with id ' + postId);
        }
    } catch (error) {
        console.error(error);
        console.log(postId)
    }
});

// DELETE ALL   /api/v1/posts

router.delete('/posts/all', async (req, res, next) => {
    try {

        const deleteResponse = await col.deleteMany({});

        if (deleteResponse.deletedCount > 0) {
            res.send(`${deleteResponse.deletedCount} posts deleted successfully.`);
        } else {
            res.send('No posts found to delete.');
        }
    } catch (error) {
        console.error(error);
    }
});

// DELETE  /api/v1/post/:postId
router.delete('/post/:postId', async (req, res, next) => {
    const postId = new ObjectId(req.params.postId);

    try {
        const deleteResponse = await col.deleteOne({ _id: postId });
        if (deleteResponse.deletedCount === 1) {
            res.send(`Post with id ${postId} deleted successfully.`);
        } else {
            res.send('Post not found with the given id.');
        }
    } catch (error) {
        console.error(error);
    }
});

// EDIT post

// PUT /api/v1/post/:postId
router.put('/post/:postId', async (req, res, next) => {
    const postId = new ObjectId(req.params.postId);
    const { text } = req.body;

    if (!text) {
        res.status(403).send('Required parameters missing. Please provide both "title" and "text".');
        return;
    }

    try {
        const updateResponse = await col.updateOne({ _id: postId }, { $set: { text } });

        if (updateResponse.matchedCount === 1) {
            res.send(`Post with id ${postId} updated successfully.`);
        } else {
            res.send('Post not found with the given id.');
        }
    } catch (error) {
        console.error(error);
    }
});

// all posts of a user

// GET ALL POSTS FOR A SPECIFIC EMAIL /api/v1/posts/:email
router.get('/posts/:userId', async (req, res, next) => {
    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    try {
        const projection = { _id: 1, title: 1, text: 1, time: 1, userId: 1, likes: 1, userImage: 1, image: 1 }
        const cursor = col.find({ userId: new ObjectId(userId) }).sort({ _id: -1 }).project(projection);
        const results = await cursor.toArray();

        console.log(results);
        res.send(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// profile

router.get('/profile/:userId', async (req, res, next) => {

    const userId = req.params.userId || req.body.decoded.userId

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    try {
        let result = await userCollection.findOne({ _id: new ObjectId(userId) });
        console.log("result: ", result); // [{...}] []
        res.send({
            message: 'profile fetched',
            data: {
                isAdmin: result.isAdmin,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                userId: result._id,
                profileImage: result.profileImage,
                createdOn: result.createdOn,
            },
            id: userId
        });

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

// ping auth

router.use('/ping', async (req, res, next) => {

    try {
        let result = await userCollection.findOne({ email: req.body.decoded.email });
        console.log("result: ", result); // [{...}] []
        res.send({
            message: 'profile fetched',
            data: {
                isAdmin: result.isAdmin,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                userId: result._id,
                profileImage: result.profileImage,
            }
        });

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(401).send('UnAuthorized');
    }
})

// search

const initializeOpenAIClient = () => {
    return new openai({
        apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
    });
};

router.get("/search", async (req, res) => {
    const queryText = req.query.q;

    try {
        // Initialize the OpenAI client
        const openaiClient = initializeOpenAIClient();

        // Create an embedding for the query text
        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: queryText,
        });

        // Extract the vector from the response
        const vector = response?.data[0]?.embedding;

        // Perform a search using the vector
        const documents = await col
            .aggregate([
                {
                    $search: {
                        index: "we_app",
                        knnBeta: {
                            vector: vector,
                            path: "embedding",
                            k: 10,
                        },
                        scoreDetails: true,
                    },
                },
                {
                    $project: {
                        embedding: 0,
                        score: { "$meta": "searchScore" },
                        scoreDetails: { "$meta": "searchScoreDetails" }
                    }
                }
            ])
            .toArray();

        res.send(documents);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during search');
    }
});

router.get('/search-user', async (req, res) => {

    const searchText = req.query.q;

    if (!searchText) {
        return res.status(400).json({ error: 'Search text is required.' });
    }

    try {
        // Perform the full-text search using the $text operator
        const projection = { _id: 1, firstName: 1, lastName: 1, email: 1, profileImage: 1 };
        const result = await userCollection.find({
            $or: [
                {
                    firstName: { $regex: new RegExp(searchText, 'i') },
                },
                {
                    lastName: { $regex: new RegExp(searchText, 'i') },
                },
            ],
        }).project(projection).toArray();
        console.log(result);
        res.status(200).send(result)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

// like dislike

router.post('/post/:postId/dolike', async (req, res, next) => {

    if (!ObjectId.isValid(req.params.postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }

    try {
        const doLikeResponse = await col.updateOne(
            { _id: new ObjectId(req.params.postId) },
            {
                $addToSet: {
                    likes: {
                        userId: new ObjectId(req.body.userId),
                        firstName: req.body.decoded.firstName,
                        lastName: req.body.decoded.lastName,
                        profileImage: req.body.profileImage,
                    }
                }
            }
        );
        console.log("doLikeResponse: ", doLikeResponse);
        res.send('like done');
    } catch (e) {
        console.log("error like post mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

router.delete('/post/:postId/undolike', async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.body.userId;

        // Check if the post ID is valid
        if (!ObjectId.isValid(postId)) {
            res.status(403).send('Invalid post id');
            return;
        }

        // Update the post to remove the like by the specified user
        const updateResult = await col.updateOne(
            { _id: new ObjectId(postId) },
            {
                $pull: {
                    likes: { userId: new ObjectId(userId) }
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            res.status(404).send('Post not found');
            return;
        }

        res.status(200).send('Like removed successfully');
    } catch (error) {
        console.error('Error removing like:', error);
        res.status(500).send('Server error, please try later');
    }
});

router.get('/likes/:postId', async (req, res, next) => {
    const postId = req.params.postId;

    if (!ObjectId.isValid(postId)) {
        res.status(403).send(`Invalid post id`);
        return;
    }

    try {
        let result = await col.findOne({ _id: new ObjectId(postId) });

        if (result) {
            console.log("result: ", result);
            res.status(200).send(result.likes);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (e) {
        console.log("error getting data from MongoDB: ", e);
        res.status(500).send('Server error, please try later');
    }
});

// profile picture upload

router.post('/profilePicture', (req, res, next) => {
    req.decoded = { ...req.body.decoded }
    next();
},
    upload.any(), async (req, res, next) => {

        if (req.files[0].size > 2000000) { // size bytes, limit of 2MB
            res.status(403).send({ message: 'File size limit exceed, max limit 2MB' });
            return;
        }

        bucket.upload(
            req.files[0].path,
            {
                destination: `profiles/${req.files[0].filename}`, // give destination name if you want to give a certain name to file in bucket, include date to make name unique otherwise it will replace previous file with the same name
            },
            function (err, file, apiResponse) {
                if (!err) {
                    // console.log("api resp: ", apiResponse);

                    // https://googleapis.dev/nodejs/storage/latest/Bucket.html#getSignedUrl
                    file.getSignedUrl({
                        action: 'read',
                        expires: '03-09-2491'
                    }).then(async (urlData, err) => {
                        if (!err) {
                            console.log("public downloadable url: ", urlData[0]) // this is public downloadable url 
                            try {

                                // update user

                                const userUpdateResponse = await userCollection.updateOne(
                                    { _id: new ObjectId(req.body.userId) },
                                    { $set: { profileImage: urlData[0] } }
                                );

                                // update all posts of user

                                const postsUpdateResponse = await col.updateMany(
                                    { userId: new ObjectId(req.body.userId) },
                                    { $set: { userImage: urlData[0] } }
                                );

                                // update all comments of user

                                const commentsUpdateResponse = await commentsCollection.updateMany(
                                    { userId: new ObjectId(req.body.userId) },
                                    { $set: { userImage: urlData[0] } }
                                );

                                // Update user image URL in Post collection's likes array

                                const postsLikesUpdateResponse = await col.updateMany(
                                    { 'likes.userId': new ObjectId(req.body.userId) },
                                    { $set: { 'likes.$.profileImage': urlData[0] } }
                                );

                                // Update user image URL in comments collection's likes array

                                const commentsLikesUpdateResponse = await commentsCollection.updateMany(
                                    { 'likes.userId': new ObjectId(req.body.userId) },
                                    { $set: { 'likes.$.profileImage': urlData[0] } }
                                );
                                // Update user image URL in notifications collection

                                const notificationsImageUpdateResponse = await notifyCol.updateMany(
                                    { sender: new ObjectId(req.body.userId) },
                                    { $set: { senderImage: urlData[0] } }
                                );

                                res.send('profile uploaded');
                            } catch (e) {
                                console.log("error inserting mongodb: ", e);
                                res.status(500).send({ message: 'server error, please try later' });
                            }

                            // // delete file from folder before sending response back to client (optional but recommended)
                            // // optional because it is gonna delete automatically sooner or later
                            // // recommended because you may run out of space if you dont do so, and if your files are sensitive it is simply not safe in server folder

                            try {
                                fs.unlinkSync(req.files[0].path)
                                //file removed
                            } catch (err) {
                                console.error(err)
                            }
                        }
                    })
                } else {
                    console.log("err: ", err)
                    res.status(500).send({
                        message: "server error"
                    });
                }
            });
    })

// name change

router.put('/update-name', async (req, res, next) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.userId) {
        res.status(403);
        res.send(`Required parameters missing, example request body:
        {
            "firstName": "Abdul",
            "lastName": "Ahad",
            "userId": "12345678"
        }`);
        return;
    }

    let { firstName, lastName, userId } = req.body;

    userId = new ObjectId(userId);

    console.log(firstName, lastName, userId);

    try {
        // Update user
        const userUpdateResponse = await userCollection.updateOne(
            { _id: userId },
            { $set: { firstName: firstName, lastName: lastName } }
        );

        // Update all posts of user
        const postsUpdateResponse = await col.updateMany(
            { userId: userId },
            { $set: { title: `${firstName} ${lastName}` } }
        );

        // Update all comments of user
        const commentsUpdateResponse = await commentsCollection.updateMany(
            { userId: userId },
            { $set: { userName: `${firstName} ${lastName}` } }
        );

        // Update user name in Post collection's likes array
        const postsLikesUpdateResponse = await col.updateMany(
            { 'likes.userId': userId },
            { $set: { 'likes.$.firstName': firstName, 'likes.$.lastName': lastName } }
        );

        // Update user name in comments collection's likes array
        const commentsLikesUpdateResponse = await commentsCollection.updateMany(
            { 'likes.userId': userId },
            { $set: { 'likes.$.firstName': firstName, 'likes.$.lastName': lastName } }
        );

        // Update user name in notifications

        const notificationsNameUpdateResponse = await notifyCol.updateMany(
            { sender: userId },
            { $set: { senderName: `${firstName} ${lastName}` } }
        );

        // Send a success response to the client
        res.status(200).json({ success: true, message: 'Name updated successfully' });
    } catch (error) {
        console.error(error);
        // Send an error response to the client
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// email change

router.put('/update-email', async (req, res, next) => {
    if (!req.body.email || !req.body.password || !req.body.userId) {
        res.status(403);
        res.send(`Required parameters missing, example request body:
        {
            "email": "abc@gmail.com",
            "password": "12345678",
            "userId": "12345678"
        }`);
        return;
    }

    let { email, password, userId } = req.body;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    userId = new ObjectId(userId);

    try {

        // verify password
        const findUserResponse = await userCollection.findOne({ _id: userId });

        if (!findUserResponse) {
            res.status(401).send({ message: 'User not found' });
            return;
        }

        const userPasswordHash = findUserResponse.password
        const isMatch = await varifyHash(password, userPasswordHash)

        if (!isMatch) {
            res.status(401).send({ message: 'Invalid Password' });
            return;
        }

        const emailVerify = await userCollection.findOne({ email: email })
        if (emailVerify) {
            res.status(401).send({ message: 'Email already taken' });
            return;
        }

        // Update user
        const userUpdateResponse = await userCollection.updateOne(
            { _id: userId },
            { $set: { email: email } }
        );

        // Update all posts of user
        const postsUpdateResponse = await col.updateMany(
            { userId: userId },
            { $set: { email: email } }
        );

        // generate a new token using JWT

        const token = jwt.sign({
            isAdmin: false,
            firstName: findUserResponse.firstName,
            lastName: findUserResponse.lastName,
            email: email,
            _id: findUserResponse._id
        }, process.env.SECRET, {
            expiresIn: '24h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 86400000)
        });

        // Send a success response to the client
        res.status(200).json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
        console.error(error);
        // Send an error response to the client
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// delete account

router.delete('/delete-account', async (req, res, next) => {

    console.log(req.body);

    if (!req.body.password || !req.body.userId) {
        res.status(403);
        res.send(`Required parameters missing, example request body:
        {
            "password": "12345678",
            "userId": "12345678"
        }`);
        return;
    }

    let { password, userId } = req.body;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    userId = new ObjectId(userId);

    try {

        // verify password
        const findUserResponse = await userCollection.findOne({ _id: userId });

        if (!findUserResponse) {
            res.status(401).send({ message: 'User not found' });
            return;
        }

        const userPasswordHash = findUserResponse.password
        const isMatch = await varifyHash(password, userPasswordHash)

        if (!isMatch) {
            res.status(401).send({ message: 'Invalid Password' });
            return;
        }

        // delete user
        const userdeleteResponse = await userCollection.deleteOne({ _id: userId });

        // delete all posts of user
        const postsdeleteResponse = await col.deleteMany({ userId: userId });

        // delete all comments
        const commentsdeleteResponse = await commentsCollection.deleteMany({ userId: userId });

        // remove all likes on posts
        const postsLikesUpdateResponse = await col.updateMany(
            { 'likes.userId': userId },
            { $pull: { likes: { userId: userId } } }
        );

        // remove all likes on comments
        const commentsLikesUpdateResponse = await commentsCollection.updateMany(
            { 'likes.userId': userId },
            { $pull: { likes: { userId: userId } } }
        );

        // Send a success response to the client
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        // Send an error response to the client
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// delete account for admin

router.delete('/delete-account-admin', async (req, res, next) => {

    console.log(req.query.userId);

    if (!req.query.userId) {
        res.status(403);
        res.send(`Required parameters missing, example request body:
        {
            "userId": "12345678"
        }`);
        return;
    }

    let { userId } = req.query;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    userId = new ObjectId(userId);

    try {

        // delete user
        const userdeleteResponse = await userCollection.deleteOne({ _id: userId });

        // delete all posts of user
        const postsdeleteResponse = await col.deleteMany({ userId: userId });

        // delete all comments
        const commentsdeleteResponse = await commentsCollection.deleteMany({ userId: userId });

        // remove all likes on posts
        const postsLikesUpdateResponse = await col.updateMany(
            { 'likes.userId': userId },
            { $pull: { likes: { userId: userId } } }
        );

        // remove all likes on comments
        const commentsLikesUpdateResponse = await commentsCollection.updateMany(
            { 'likes.userId': userId },
            { $pull: { likes: { userId: userId } } }
        );

        // Send a success response to the client
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        // Send an error response to the client
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router
