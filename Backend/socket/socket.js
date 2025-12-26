const User = require('../model/user')

module.exports = (io) => {
    const patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const boards = {}; // room id : [index total 9]
    const roomUsers = {};

    io.on('connection', (socket) => {
        socket.on('register', (userId) => {
            socket.userId = userId;
            console.log('user connect', socket.userId)
        });

        socket.on('create', () => {
            const roomId = Math.floor(100000 + Math.random() * 900000);
            boards[roomId] = ["", "", "", "", "", "", "", "", ""];
            console.log('room', roomId)
            socket.emit('receive-create', roomId);
        });

        socket.on('join', async (roomId) => {
            if (!socket.userId) return;
            const room = io.sockets.adapter.rooms.get(roomId);
            const playersCount = room ? room.size : 0;
            if (playersCount >= 2) {
                socket.emit('room-full');
                return;
            }
            else {
                if (!boards[roomId]) {
                    boards[roomId] = Array(9).fill("");
                }
                socket.join(roomId);

                const user = await User.findById(socket.userId).lean();
                if (!roomUsers[roomId]) {
                    roomUsers[roomId] = [];
                }
                // console.log('1', socket.userId)
                // console.log('user', user)
                roomUsers[roomId].push(user);
                // console.log('room-user', roomUsers[roomId])
                socket.emit('joined-room', roomId);
                io.to(roomId).emit('player-joined', roomUsers[roomId]);
            }
        });

        socket.on('refresh-room', ({ roomId }, callback) => {
            // console.log(roomUsers[roomId], roomId)
            callback({ user: roomUsers[roomId] || [], status: 200 })
        })

        socket.on('start', (roomId) => {
            const firstPlayer = roomUsers[roomId][0]._id;
            io.to(roomId).emit('game-started', firstPlayer);
        })

        socket.on('move', (data) => {
            const { roomId, index } = data;
            const board = boards[roomId];
            // console.log('board', board)
            if (!board || board[index]) return;
            board[index] = socket.userId;
            // console.log('socket', socket.userId);
            // console.log(board[index], index);
            const winner = patterns.find(([a, b, c]) =>
                board[a] && board[a] === board[b] && board[a] === board[c]
            );
            console.log('here');

            if (winner) {
                console.log('board 1' , board)
                io.to(roomId).emit('winner', socket.userId, winner);
            } else if (!board.includes("")) {
                console.log('board 2' , board)
                io.to(roomId).emit('draw');
            } else {
                console.log('board 3' , board)
                io.to(roomId).emit('moveDone', board);
            }console.log('board 4' , board)
        });
        socket.on('leave', async ({ roomId }, callback) => {
            socket.broadcast.to(roomId).emit('player-left', socket.userId);
            if (roomUsers[roomId]) {
                roomUsers[roomId] = roomUsers[roomId].filter(
                    u => u?._id.toString() !== socket.userId.toString()
                );
            }
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
