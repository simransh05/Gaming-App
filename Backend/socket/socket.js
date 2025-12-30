const User = require('../model/user')
const controller = require('../controller/game')
module.exports = (io) => {
    const patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const boards = {}; // room id : [index total 9]
    // const roomUsers = {};

    io.on('connection', (socket) => {
        socket.on('register', (userId) => {
            socket.userId = userId;
            console.log('user connect', socket.userId)
        });

        socket.on('create', () => {
            const roomId = Math.floor(100000 + Math.random() * 900000);
            boards[roomId] = {
                board: ["", "", "", "", "", "", "", "", ""],
                players: [],
                turn: null,
                symbols: {},
                start: false
            };
            // console.log('room', boards[roomId])
            socket.emit('receive-create', roomId);
        });

        socket.on('join', async (roomId) => {

            if (!boards[roomId]) {
                boards[roomId] = {
                    board: Array(9).fill(""),
                    players: [],
                    turn: null,
                    symbols: {},
                    start: false
                };
            }

            const room = boards[roomId];

            if (room.players.length >= 2) {
                socket.emit('room-full');
                return;
            }

            socket.join(roomId);

            const user = await User.findById(socket.userId).lean();
            room.players.push(user);

            if (room.players.length === 2) {
                const p1 = room.players[0]?._id.toString();
                const p2 = room.players[1]?._id.toString();
                room.symbols[p1] = "O";
                room.symbols[p2] = "X";
                room.turn = p1;
            }
            socket.emit('joined-room', roomId);
            // console.log('players', room.players)
            io.to(roomId).emit('player-joined', room.players);
        });


        socket.on('refresh-room', ({ roomId }, callback) => {
            const room = boards[roomId];
            if (!room) {
                callback({ status: 404 })
            }
            socket.join(roomId);
            // console.log(roomUsers[roomId], roomId)
            callback({ data: boards[roomId] || [], status: 200 })
        })

        socket.on('start', (roomId) => {
            boards[roomId].start = true;
            io.to(roomId).emit('game-started', boards[roomId].turn);
        })

        socket.on('move', async (data) => {
            const { roomId, index } = data;
            const room = boards[roomId];
            // console.log('board', board)
            if (!room.board || room.board[index]) return;
            const symbol = boards[roomId].symbols[socket.userId];
            room.board[index] = symbol;
            // console.log('socket', socket.userId);
            // console.log(board[index], index);
            const winner = patterns.find(([a, b, c]) =>
                room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]
            );
            // console.log('here');

            if (winner) {
                room.board = ["", "", "", "", "", "", "", "", ""]
                room.start = false;
                room.turn = room.players[0]._id.toString();
                // console.log('board 1', room.board)
                const username = await User.findById(socket.userId).select('name').lean();
                // console.log('username', username);
                io.to(roomId).emit('winner', {
                    winnerId: socket.userId,
                    board: room.board,
                    players: room.players,
                    name: username.name
                });
                // console.log('here move')
                const data = await controller.saveHistory({
                    player1: room.players[0]._id,
                    player2: room.players[1]._id,
                    winnerId: socket.userId
                })
                // console.log(data);
            } else if (!room.board.includes("")) {
                room.board = ["", "", "", "", "", "", "", "", ""]
                room.start = false;
                room.turn = room.players[0]._id.toString();
                // console.log('board 2', room.board)
                io.to(roomId).emit('draw', { board: room.board, players: room.players });
                await controller.saveHistory({
                    player1: room.players[0]._id,
                    player2: room.players[1]._id,
                    winnerId: null
                })
            } else {
                const otherPlayer = room.players.find(p => p._id.toString() !== socket.userId);
                // console.log('others', otherPlayer)
                room.turn = otherPlayer._id.toString();
                // console.log('board 3', room.turn)
                io.to(roomId).emit('moveDone', {
                    board: room.board,
                    turn: room.turn,
                    players: room.players
                });
            }
            // console.log('board 4', room.board)
        });
        socket.on('leave', async ({ roomId }, callback) => {
            if (boards[roomId]) {
                boards[roomId].players = boards[roomId].players.filter(
                    u => u?._id.toString() !== socket.userId.toString()
                );
                boards[roomId].start = false;
            }
            boards[roomId].board = ["", "", "", "", "", "", "", "", ""]
            socket.broadcast.to(roomId).emit('player-left', { board: boards[roomId].board });
            // console.log(roomUsers[roomId]);

            socket.leave(roomId);
            delete boards[roomId];
            callback({ status: 200 })
        })

        socket.on('disconnect', () => {
            console.log('user disconnect', socket.id)
        });
    });
};
