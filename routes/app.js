const express = require('express');
const multer  = require('multer');
const { addUser, getAllUsers, addExercise, getUserLogs } = require('../database');

const router = express.Router();
const upload = multer();

let users = {};
let logs = {};

router.get("/api/users", async function(req, res){
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.post("/api/users", upload.none(), async function(req, res){
    const { username } = req.body;
    const savedUser = await addUser(username);

    return res.json(savedUser);
});

router.post("/api/users/:_id/exercises", upload.none(), async function(req, res){
    const { description, duration, date } = req.body;
    const { _id } = req.params;

    try {
        const result = await addExercise(_id, description, duration, date);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/api/users/:_id/logs", async function(req, res){
    const { from, to, limit } = req.query;
    const { _id } = req.params;

    try {
        const result = await getUserLogs(_id, from, to, limit);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;