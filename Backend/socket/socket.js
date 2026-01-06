const User = require('../model/user')
const controller = require('../controller/game')
module.exports = (io) => {
    const patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const boards = {}; // room id : [index total 9]
    const activeUser = new Set();
    const activeMap = new Map();

    io.on('connection', (socket) => {
        socket.on('register', (userId) => {
            socket.userId = userId;
            activeUser.add(socket.userId)
            activeMap.set(userId, socket.id);
            // console.log(activeUser)
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
                const firstTurn = Math.random() < 0.5 ? p1 : p2;
                // console.log('first', firstTurn);
                // console.log('players', room.players); 
                const secondTurn = firstTurn === p1 ? p2 : p1;
                // console.log('second', secondTurn);
                room.turn = firstTurn;
                room.symbols[firstTurn] = 'X';
                room.symbols[secondTurn] = 'O'
            }
            // console.log('joined', room);
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
            // console.log('refresh', boards[roomId])
            callback({ data: boards[roomId] || [], status: 200 })
        })

        socket.on('start', (roomId) => {
            boards[roomId].start = true;
            io.to(roomId).emit('game-started', boards[roomId].turn);
        })

        socket.on('send-invite', async ({ from, to }) => {
            // console.log('from,to', from, to)
            const toId = activeMap.get(to);
            const fromName = await User.findById(from).lean();
            // console.log('fromName', fromName)
            if (toId) {
                // console.log(from, to)
                io.to(toId).emit('receive-invite', { from , fromName});
            }
        });

        socket.on('accept-invite', async ({ from }) => {
            const roomId = Math.floor(100000 + Math.random() * 900000);
            socket.join(roomId);
            // console.log('here');
            boards[roomId] = {
                board: ["", "", "", "", "", "", "", "", ""],
                players: [],
                turn: null,
                symbols: {},
                start: false
            };
            const fromId = activeMap.get(from);
            // console.log(fromId);
            if (fromId) {
                io.to(fromId).socketsJoin(roomId);
            }
            const room = boards[roomId];
            const user1 = await User.findById(from).lean();
            room.players.push(user1);
            const user2 = await User.findById(socket.userId).lean();
            room.players.push(user2);
            const p1 = room.players[0]?._id.toString();
            const p2 = room.players[1]?._id.toString();
            const firstTurn = Math.random() < 0.5 ? p1 : p2;
            const secondTurn = firstTurn === p1 ? p2 : p1;
            room.turn = firstTurn;
            room.symbols[firstTurn] = 'X';
            room.symbols[secondTurn] = 'O';
            // console.log(boards[roomId])
            io.to(roomId).emit('room-created', { roomId });
        });

        socket.on('move', async (data) => {
            const { roomId, index } = data;
            const room = boards[roomId];
            // console.log('board', board)
            if (!room.board || room.board[index]) return;
            const symbol = boards[roomId].symbols[socket.userId];
            room.board[index] = symbol;
            // console.log('socket', socket.userId);
            // console.log(board[index], index);
            const winner = patterns.some(([a, b, c]) =>
                room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]
            );
            // console.log(winner);
            const findValue = patterns.find(([a, b, c]) =>
                room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]
            );

            if (winner) {
                const lastMove = room.board;
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
                    name: username.name,
                    pattern: findValue,
                    lastMove: lastMove
                });
                // console.log('here move')
                const data = await controller.saveHistory({
                    player1: room.players[0]._id,
                    player2: room.players[1]._id,
                    winnerId: socket.userId
                })
                // console.log(data);
            } else if (!room.board.includes("")) {
                const lastMove = room.board;
                room.board = ["", "", "", "", "", "", "", "", ""]
                room.start = false;
                room.turn = room.players[0]._id.toString();
                // console.log('board 2', room.board)
                io.to(roomId).emit('draw', { board: room.board, players: room.players, lastMove });
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

        socket.on('askFriend', (roomId) => {
            socket.broadcast.to(roomId).emit('acceptFriend', { players: boards[roomId].players })
        })
        socket.on('skip-turn', (roomId) => {
            const room = boards[roomId];
            // console.log('room', room);
            if (!room) return;
            const otherPlayer = room.players.find(p => p._id.toString() !== socket.userId.toString());
            room.turn = otherPlayer?._id.toString();
            // console.log('other player', otherPlayer);
            // console.log('......................................')
            io.to(roomId).emit('nextTurn', { turn: room.turn });
        });

        socket.on('activeUsers', () => {
            // console.log(activeUser);
            socket.emit('active', Array.from(activeUser))
        })

        socket.on('leave', async ({ roomId }, callback) => {
            if (boards[roomId]) {
                boards[roomId].players = boards[roomId].players.filter(
                    u => u?._id.toString() !== socket.userId.toString()
                );
                boards[roomId].start = false;
            }
            boards[roomId].board = ["", "", "", "", "", "", "", "", ""];
            boards[roomId].turn = null;
            boards[roomId].symbols = {};
            // console.log(boards[roomId].players)
            socket.broadcast.to(roomId).emit('player-left', {
                board: boards[roomId].board,
                start: boards[roomId].start,
                players: boards[roomId].players,
                turn: boards[roomId].turn
            });
            // console.log(boards[roomId]);

            socket.leave(roomId);
            if (boards[roomId].players === 0) {
                delete boards[roomId];
            }
            callback({ status: 200 })
        })

        socket.on('disconnect', () => {
            activeUser.delete(socket.userId);
            activeMap.delete(socket.userId);
            console.log('user disconnect', socket.id)
        });
    });
};
