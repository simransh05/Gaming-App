const User = require('../model/user')

module.exports = (io) => {
    const patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const boards = {}; // room id : [index total 9]

    io.on('connection', (socket) => {
        socket.on('register', (userId) => {
            socket.userId = userId;
            console.log('user connect', socket.userId)
        });

        socket.on('create', () => {
            const roomId = Math.floor(100000 + Math.random() * 900000);
            boards[roomId] = ["", "", "", "", "", "", "", "", ""];
            console.log(roomId)
            socket.emit('receive-create', roomId);
        });

        socket.on('join', async (roomId) => {
            const room = io.sockets.adapter.rooms.get(roomId);
            const playersCount = room ? room.size : 0;
            if (playersCount >= 2) {
                socket.emit('room-full');
                return;
            }
            else {
                socket.join(roomId);
                const user = await User.findById(socket.userId)
                socket.emit('joined-room', roomId);
                io.to(roomId).emit('player-joined', user);
            }
        });

        socket.on('move', ({ roomId, index }) => {
            const board = boards[roomId];
            if (!board || board[index]) return;
            board[index] = socket.userId;
            const winner = patterns.find(([a, b, c]) =>
                board[a] && board[a] === board[b] && board[a] === board[c]
            );

            if (winner) {
                io.to(roomId).emit('winner', socket.userId, winner);
            } else if (!board.includes("")) {
                io.to(roomId).emit('draw');
            } else {
                io.to(roomId).emit('moveDone', board);
            }
        });

        socket.on('disconnect', () => {
            console.log('user disconnect', socket.id)
        });
    });
};
