const mongoose = require('mongoose')
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notification: [{
        roomId: {
            type: String,
            required: true
        },
        opponent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }]
})

module.exports = mongoose.model('Notification', notificationSchema)