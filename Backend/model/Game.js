const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
    playerI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    playerII: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    winner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }],
    isDraw: {
        type: Boolean,
        default: false
    },
    // idea is to store 2 player 
    // store the winner array for the object id of user else the drow
    // store the moves too ?
})

module.exports = mongoose.model('Game', gameSchema)