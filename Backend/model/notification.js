const mongoose = require('mongoose')
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Invite: [{
        roomId: {
            type: String,
            required: true
        },
        opponent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sendAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            default: "",
            required: true
        }
    }],
    Friends: [{
        requests: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sendAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            default: "",
            required: true
        }
    }]
})

module.exports = mongoose.model('Notification', notificationSchema)