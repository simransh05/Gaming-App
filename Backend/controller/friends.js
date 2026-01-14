const User = require('../model/user');
const Friends = require('../model/friends');
const Game = require('../model/Game');

module.exports.postFriend = async (req, res) => {
    const { userId, id } = req.params;
    try {
        await Friends.findOneAndUpdate({ userId },
            { $addToSet: { myFriends: id } },
            { new: true, upsert: true }
        )
        return res.status(200).json({ message: 'successfully added' })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getFriends = async (req, res) => {
    const { userId } = req.params;
    try {
        const friend = await Friends.findOne({ userId }).populate('myFriends');
        // console.log('friend', friend);
        return res.status(200).json(friend || { myFriends: [] });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getIndividualFriend = async (req, res) => {
    const { userId, id } = req.params;
    try {
        const friend = await Friends.findOne({ userId })
        if (!friend) {
            // console.log('no user friend')
            return res.status(200).json(false);
        }
        // console.log('friend', friend);
        const isFriend = friend.myFriends.includes(id);
        // console.log('isFriend', isFriend)
        return res.status(200).json(isFriend);
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getRanking = async (req, res) => {
    try {
        const ranking = await Game.aggregate([
            {
                $project: {
                    players: ["$playerI", "$playerII"],
                    history: 1
                }
            },
            {
                $unwind: "$history"
            },
            {
                $unwind: "$players"
            },

            {
                $group: {
                    _id: "$players",

                    totalGames: { $sum: 1 },

                    totalWins: {
                        $sum: {
                            $cond: [
                                { $eq: ["$history.winner", "$players"] },
                                1,
                                0
                            ]
                        }
                    },
                    totalLose: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$history.winner", "$players"] },
                                        { $ne: ["$history.winner", null] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    totalDraw: {
                        $sum: {
                            $cond: [
                                { $eq: ["$history.winner", null] },
                                1,
                                0
                            ]
                        }
                    },
                },
            },
            {
                $addFields: {
                    percentage: {
                        $cond: [
                            { $eq: ['$totalGames', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$totalWins', '$totalGames'] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    name: "$user.name",
                    playerId: "$user.playerId",
                    totalGames: 1,
                    totalWins: 1,
                    totalLose: 1,
                    totalDraw: 1,
                    percentage: { $round: ['$percentage', 2] }
                }
            },
            {
                $sort: {
                    percentage: -1,
                    totalWins: -1
                }
            }
        ]);
        // console.log(ranking);
        res.json(ranking);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};