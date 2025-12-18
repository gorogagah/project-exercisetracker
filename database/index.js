const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    username: String,
}));

const Exercise = mongoose.model('Exercise', new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    description: String,
    duration: Number,
    date: Date,
}));

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_IP}/exercisetracker?appName=${process.env.DB_NAME}`)

exports.addUser = async function(username){
    const user = new User({ username });
    const savedUser = await user.save();

    return {
        _id: savedUser._id,
        username: savedUser.username
    };
}

exports.getAllUsers = async function () {
    const users = await User.find({}, "_id username");
    return users;
};

exports.addExercise = async function (userId, description, duration, date) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const exercise = new Exercise({
        userId,
        description,
        duration: Number(duration),
        date: date ? new Date(date) : new Date()
    });

    const saved = await exercise.save();
    return {
        _id: user._id,
        username: user.username,
        description: saved.description,
        duration: saved.duration,
        date: saved.date.toDateString()
    };
};

exports.getUserLogs = async function (userId, from, to, limit) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const filter = { userId };

    // Date filtering
    if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
    }

    let query = Exercise.find(filter).select("description duration date");

    if (limit) {
        query = query.limit(Number(limit));
    }

    const exercises = await query.exec();

    return {
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: exercises.map(e => ({
            description: e.description,
            duration: e.duration,
            date: e.date.toDateString()
        }))
    };
};

