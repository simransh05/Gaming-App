const User = require('../model/user');
const Friends = require('../model/friends');
const Game = require('../model/Game');

module.exports.postFriend = async (req, res) => {
    const { userId, id } = req.params;
    try {
        await Friends.findByIdAndUpdate({ userId },
            { $addToSet: { myFriends: id } },
            { new: true }
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
        const friend = await Friends.findById(userId);
        console.log('friend',friend);
        return res.status(200).json(friend);
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getIndividualFriend = async (req, res) => {
    const { userId, id } = req.params;
    try {
        const friend = await Friends.findById(userId)
        console.log('friend', friend);
        const isFriend = friend.myFriends.includes(id);
        console.log('isFriend', isFriend)
        return res.status(200).json(isFriend);
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getRanking = async (req, res) => {
    try {

    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}