const Game = require('../model/Game')
const User = require('../model/user')
module.exports.getHistory = async (req, res) => {
    const { player1, player2 } = req.params;

    if (!player1 || !player2) {
        return res.status(400).json({ message: "Players required" });
    }
    console.log('here')

    try {
        console.log(player1, player2);
        const history = await Game.findOne({
            $or: [
                { playerI: player1, playerII: player2 },
                { playerI: player2, playerII: player1 }
            ]
        }, {
            history: { $slice: -10 }
        })
            .populate("playerI playerII", "name")
            .populate({
                path: "history.winner",
                select: "name _id"
            });
        // console.log(history);
        if (!history) {
            return res.status(200).json({ history: [] })
        }

        res.status(200).json(history);
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
    // get user name by id 
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
