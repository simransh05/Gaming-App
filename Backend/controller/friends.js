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
        const friend = await Friends.findOne({userId}).populate('myFriends' , 'name _id');
        console.log('friend', friend);
        return res.status(200).json(friend || { myFriends: [] });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal error' })
    }
}

module.exports.getIndividualFriend = async (req, res) => {
    const { userId, id } = req.params;
    try {
        const friend = await Friends.findOne({userId})
        if(!friend){
            console.log('no user friend')
            return res.status(200).json(false);
        }
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