const Notification = require('../model/notification');

module.exports.postNotification = async (from, to, roomId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { userId: to, "notification.opponent": from },
            {
                $set: { "notification.$.roomId": roomId }
            },
            { new: true, upsert: false }
        );
        console.log('line 12', notification);

        if (!notification) {
            const newNotification = await Notification.findOneAndUpdate(
                { userId: to },
                {
                    $push: {
                        notification: {
                            roomId,
                            opponent: from,
                            createdAt: new Date()
                        }
                    }
                },
                { new: true, upsert: true }
            );
            return newNotification;
        }

        return notification;
    } catch (err) {
        console.error("Error saving notification:", err);
        throw err;
    }
};

module.exports.deleteNotification = async (from, to) => {
    // idea when reject then delete from the db of the userId findand update 
    try {
        const notification = await Notification.findOneAndUpdate({
            userId: from,
            "notification.opponent": to
        }, {
            $pull: {
                notification: { opponent: to }
            }
        },
            { new: true })
        return notification;
    } catch (err) {
        console.error('Error saving game history:', err);
        throw err;
    }
}

module.exports.getNotification = async (req, res) => {
    const { userId } = req.params;
    try {
        console.log('line 14', userId);
        const notification = await Notification.findOne({ userId }).populate({ path: 'notification.opponent' });
        console.log('line 16', notification);
        if (!notification) {
            return res.status(200).json({ notification: [] });
        }
        return res.status(200).json(notification);
    } catch (err) {
        return res.status(500).json({ message: "Internal error" });
    }
}
