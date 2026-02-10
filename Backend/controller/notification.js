const friends = require('../model/friends');
const Notification = require('../model/notification');

module.exports.postNotification = async (from, to, roomId) => {
    try {
        await Notification.updateOne(
            { userId: to },
            { $pull: { Invite: { opponent: from } } }
        );

        const notification = await Notification.findOneAndUpdate(
            { userId: to },
            {
                $push: {
                    Invite: {
                        roomId,
                        opponent: from,
                    }
                }
            },
            { new: true, upsert: true }
        );
        // console.log(notification);
        return notification;

    } catch (err) {
        console.error("Error saving notification:", err);
        throw err;
    }
};

module.exports.addStatusInvite = async (from, to, message) => {
    try {
        const friend = await Notification.findOneAndUpdate(
            {
                userId: from,
                "Invite.opponent": to
            },
            {
                $set: { "Invite.$.status": message }
            },
            { new: true }
        )
        return friend;
        // idea is to add the status for the invites send when accept or not accept get that person then 
        // add if came from message add that in status area 
    } catch (err) {
        console.error('Error saving game history:', err);
        throw err;
    }
}

module.exports.deleteNotification = async (req, res) => {
    const { userId } = req.params;
    // idea change now frontend will delete the all notification when they do all the notification 
    // till date anything send or friend request remove all 
    try {
        await Notification.findOneAndDelete({ userId });
        return res.status(200).json({ message: 'Successfully deleted' })
    } catch (err) {
        console.error('Error saving game history:', err);
        throw err;
    }
}

module.exports.getNotification = async (req, res) => {
    const { userId } = req.params;
    try {
        // console.log('line 14', userId);
        const notify = await Notification.findOne({ userId }).populate({ path: 'Invite.opponent Friends.requests' });
        // console.log('line 16', notification);
        if (!notify) {
            return res.status(200).json([]);
        }
        // console.log('notify', notify);
        const invite = notify.Invite.reverse();
        const friend = notify.Friends.reverse();
        // console.log('reversed', invite, friend)
        const notification = [...invite, ...friend].sort((a, b) => b.sendAt - a.sendAt);
        console.log(notification);
        return res.status(200).json(notification);
    } catch (err) {
        return res.status(500).json({ message: "Internal error" });
    }
}

module.exports.postFriend = async (to, from) => {
    try {
        const allData = await friends.findOne({ userId: from });
        // console.log('line 73', allData);
        const isFriend = allData?.myFriends?.includes(to);
        // console.log('line 74 ', isFriend, to, from);
        if (!isFriend) {
            const friend = await Notification.findOneAndUpdate(
                { userId: from },
                { $push: { Friends: { requests: to } } },
                { new: true, upsert: true }
            )
            return friend;
        }
        // only when that is not my friend
        return null;
        // idea is to post that in user array then get both opponent and friends 
    } catch (err) {
        console.error('Error saving game history:', err);
        throw err;
    }
}

module.exports.AddStatusFriend = async (from, to, message) => {
    try {
        // // idea is to add the status for the invites send when accept or not accept get that person then 
        // add if came from message add that in status area find where is that then add status 
        const friend = await Notification.findOneAndUpdate(
            {
                userId: from,
                "Friends.requests": to
            },
            {
                $set: { "Friends.$.status": message }
            },
            { new: true }
        )
        console.log('line 124',friend)
        return friend;
        // if refuse then remove from the friend request 
        // if already avaiable in friend list then don't add check this too 
    } catch (err) {
        console.error('Error saving game history:', err);
        throw err;
    }
}