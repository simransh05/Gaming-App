const mongoose = require('mongoose');
const Game = require('../model/Game')
const User = require('../model/user')
module.exports.getHistory = async (req, res) => {
    const { player1, player2, userId } = req.params;

    if (!player1 || !player2) {
        return res.status(400).json({ message: "Players required" });
    }
    // console.log('here')

    try {
        // console.log(player1, player2, userId);
        const gameHistory = await Game.findOne({
            $or: [
                { playerI: player1, playerII: player2 },
                { playerI: player2, playerII: player1 }
            ]
        })
            .populate("playerI playerII", "name")
            .populate({
                path: "history.winner",
                select: "name _id"
            });
        // console.log(gameHistory);
        if (!gameHistory) {
            return res.status(200).json({ history: [] })
        }
        const filteredHistory = gameHistory.history
            .filter(h => !h.deletedBy?.includes(userId))
            .slice(-10);

        // console.log(filteredHistory)
        res.status(200).json({ history: filteredHistory });
    } catch (err) {
        res.status(500).json({ message: "Internal error" });
    }
};

module.exports.getName = async (req, res) => {
    const { userId } = req.query;
    try {
        const name = await User.findById(userId).select('name')
        return res.status(200).json(name);
    } catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.saveHistory = async ({ player1, player2, winnerId }) => {
    if (!player1 || !player2) return;

    try {
        // find existing game or create new one
        const game = await Game.findOneAndUpdate(
            {
                $or: [
                    { playerI: player1, playerII: player2 },
                    { playerI: player2, playerII: player1 }
                ]
            },
            {
                $setOnInsert: { playerI: player1, playerII: player2 },
                $push: { history: { winner: winnerId || null } },
            },
            { upsert: true, new: true }
        );

        // console.log('Game history updated:', game);
        return game;
    } catch (err) {
        console.error('Error saving game history:', err);
        throw err;
    }
}

module.exports.deleteHistory = async (req, res) => {
    const { player1, player2, userId } = req.body;

    try {
        if (!userId) {
            return res.status(400).json({ message: "No user found" });
        }

        const game = await Game.findOneAndUpdate(
            {
                $or: [
                    { playerI: player1, playerII: player2 },
                    { playerI: player2, playerII: player1 }
                ]
            },
            {
                $addToSet: {
                    "history.$[].deletedBy": userId
                }
            },
            { new: true }
        );

        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        return res.status(200).json({ message: "History deleted for this user" });

    } catch (err) {
        return res.status(500).json({ message: "Internal error" });
    }
};

module.exports.getIndividualHistory = async (req, res) => {
    const { userId } = req.params;
    const ObjectId = new mongoose.Types.ObjectId(userId);
    try {
        const individual = await Game.aggregate([
            {
                $match: {
                    $or: [
                        { playerI: ObjectId },
                        { playerII: ObjectId }
                    ]
                }
            },
            {
                $unwind: '$history'
            },
            {
                $sort: { 'history.playedAt': -1 }
            }
        ]);
        const format = await Game.populate(individual, 'playerI playerII')
        // console.log(format);
        return res.status(200).json({ individual: format });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}