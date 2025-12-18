const express = require('express');
const multer  = require('multer');

const router = express.Router();
const upload = multer();

let id = 0;
let users = {};
let logs = {};

router.post("/api/users", upload.none(), async function(req, res){
    const { username } = req.body;

    id++;
    users[id] = username;

    return res.json({username: username, _id: id.toString()});
});

router.post("/api/users/:_id/exercises", upload.none(), async function(req, res){
    const id = req.params._id;
    const { description, duration, date } = req.body;

    if (!logs[id]) {
        logs[id] = [];
    }

    logs[id].push({
        description,
        duration: Number(duration),
        date: new Date(date),
    });

    return res.json({
        username: users[id],
        description,
        duration: Number(duration),
        date: new Date(date).toDateString(),
        _id: id.toString(),
    });
});

router.get("/api/users/:_id/logs", async function(req, res){
    const id = req.params._id;
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;

    if(!logs[id]){
        return res.status(404).json({ message: "user not found" });
    }

    const exercises = logs[id].sort((a, b) => new Date(a.date) - new Date(b.date)).reduce((acc, item) => {
        let ok = true;
        if(from && new Date(item.date) < new Date(from)) {
            ok = false;
        }

        if(to && new Date(item.date) > new Date(to)) {
            ok = false;
        }

        if(limit && acc.length >= Number(limit)){
            ok = false;
        }

        if(ok) {
            acc.push({
                description: item.description,
                duration: item.duration,
                date: new Date(item.date).toDateString(),
            });
        }

        return acc;
    }, []);

    const data = {
        username: users[id].username,
        count: exercises.length,
        _id: id.toString(),
        log: exercises,
    }

    return res.json(data);
});

module.exports = router;