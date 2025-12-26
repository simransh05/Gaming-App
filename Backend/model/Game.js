const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    playerI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    playerII: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    history: [
        {
            winner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null // null = draw
            },
            playedAt: {
                type: Date,
                default: Date.now
            },
            deletedBy: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }]
        }
    ]
});

module.exports = mongoose.model('Game', gameSchema)