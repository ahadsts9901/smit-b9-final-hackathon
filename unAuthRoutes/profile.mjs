
import express from 'express';
import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb'
import openai from "openai";

const db = client.db("weapp");
const col = db.collection("posts");
const userCollection = db.collection("auth");

let router = express.Router()

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
                profileImage: result.profileImage
            },
            id: userId
        });

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
})

router.get('/posts/:userId', async (req, res, next) => {
    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    try {
        const cursor = col.find({ userId: new ObjectId(userId) }).sort({ _id: -1 });
        const results = await cursor.toArray();

        console.log(results);
        res.send(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.get('/post/:postId', async (req, res, next) => {

    console.log(req.params.postId);
    const postId = new ObjectId(req.params.postId);

    try {
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

router.get('/comments/:postId', async (req, res, next) => {

    const postId = new ObjectId(req.params.postId)

    try {
        const cursor = commentsCollection.find({ postId: postId }).sort({ _id: -1 });
        let results = await cursor.toArray();
        res.send(results);
    } catch (error) {
        console.error(error);
    }
});

router.use((req, res) => {
    res.status(401).send({ message: "invalid token" })
    return;
})

export default router