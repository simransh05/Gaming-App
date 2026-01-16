const User = require('../model/user')
const controller = require('../controller/game')
module.exports = (io) => {
    const patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const boards = {};
    const activeUser = new Set();
    const activeMap = new Map();

    io.on('connection', (socket) => {
        socket.on('register', (userId) => {
            socket.userId = userId;
            activeUser.add(socket.userId)
            activeMap.set(userId, socket.id);
            // console.log(activeUser, activeMap);
            console.log('user connect', socket.userId)
        });

        socket.on('create', () => {
            const roomId = Math.floor(100000 + Math.random() * 900000);
            boards[roomId] = {
                board: ["", "", "", "", "", "", "", "", ""],
                players: [],
                turn: null,
                symbols: {},
                start: false,
                defaultTime: 10
            };
            // console.log('room', boards[roomId])
            socket.emit('receive-create', roomId);
        });

        socket.on('join', async ({ roomId }, callback) => {
            // console.log('here', roomId);
            if (!boards[roomId]) {
                boards[roomId] = {
                    board: Array(9).fill(""),
                    players: [],
                    turn: null,
                    symbols: {},
                    start: false,
                    defaultTime: 10
                };
            }
            const room = boards[roomId];

            const alreadyIn = room.players.some(u => u?._id.toString() === socket.userId);
            // console.log('here 67', alreadyIn)
            if (callback && alreadyIn) {
                return callback({ alreadyIn })
            }
            // console.log('room', boards[roomId])

            if (room.players.length >= 2) {
                return callback({ roomFull: true })
            }
            // already in match

            socket.join(roomId);

            const user = await User.findById(socket.userId).lean();
            room.players.push(user);

            if (callback) {
                callback({ joined: true })
            }

            if (room.players.length === 2) {
                const p1 = room.players[0]?._id.toString();
                const p2 = room.players[1]?._id.toString();
                const firstTurn = Math.random() < 0.5 ? p1 : p2;
                // console.log('first', firstTurn);
                // console.log('players', room.players);
                const secondTurn = firstTurn === p1 ? p2 : p1;
                // console.log('second', secondTurn);
                room.turn = firstTurn;
                room.symbols[firstTurn] = 'O';
                room.symbols[secondTurn] = 'X'
            }
            // console.log('joined', room);
            socket.emit('joined-room', roomId);
            // console.log('players', room.players)
            io.to(roomId).emit('player-joined', room.players);
        });

        socket.on('totalUser', ({ roomId }, callback) => {
            callback({ players: boards[roomId].players });
        })

        socket.on('getTime', ({ roomId }, callback) => {
            // console.log('room', boards[roomId]);
            if (!boards[roomId]) {
                boards[roomId] = {
                    board: Array(9).fill(""),
                    players: [],
                    turn: null,
                    symbols: {},
                    start: false,
                    defaultTime: 10
                };
            }
            const time = boards[roomId].defaultTime;
            // console.log(time)
            callback({ time })
        });

        socket.on('setNewTime', ({ roomId, time }) => {
            boards[roomId].defaultTime = time;
            io.to(roomId).emit('getNewTime', { time: boards[roomId].defaultTime })
        })
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
            // console.log('defaulTIME', boards[roomId])
            io.to(roomId).emit('game-started', { FirstPlayer: boards[roomId].turn, defaultTime: boards[roomId].defaultTime });
        })

        socket.on('send-invite', async ({ from, to, roomId }) => {
            // console.log('from,to', from, to, roomId)
            const toId = activeMap.get(to);
            const fromName = await User.findById(from).lean();
            // console.log('fromName', fromName)
            if (toId) {
                // console.log(from, to)
                io.to(toId).emit('receive-invite', { from, fromName, roomId });
            }
        });

        socket.on('reject-invite', async ({ from, to }) => {
            const toId = activeMap.get(to);
            const fromName = await User.findById(from).lean();
            // console.log('fromName', fromName);
            // console.log('name', fromName.name)

            io.to(toId).emit('rejected', { name: fromName.name })
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
                    lastMove: lastMove,
                    defaultTime: room.defaultTime
                });
                // console.log('here move')
                await controller.saveHistory({
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
                io.to(roomId).emit('draw', {
                    board: room.board,
                    players: room.players,
                    lastMove,
                    defaultTime: room.defaultTime
                });
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
                    players: room.players,
                    defaultTime: room.defaultTime
                });
            }
            // console.log('board 4', room.board)
        });

        socket.on('askFriend', async ({ from, to }) => {
            const toId = activeMap.get(to);
            const fromName = await User.findById(from).lean();
            // console.log('line 224', from, to)
            io.to(toId).emit('acceptFriend', { from: to, fromName, to: from })
        })

        socket.on('refuse-friend', async ({ from, to }) => {
            const toId = activeMap.get(to);
            const fromName = await User.findById(from).lean();
            if (toId) {
                io.to(toId).emit('refused', { fromName });
            }
        })
        socket.on('skip-turn', (roomId) => {
            const room = boards[roomId];
            // console.log('room', room);
            if (!room) return;
            const otherPlayer = room.players.find(p => p._id.toString() !== socket.userId);
            room.turn = otherPlayer?._id.toString();
            // console.log('other player', otherPlayer);
            // console.log('......................................')
            io.to(roomId).emit('nextTurn', {
                start: room.start,
                prevTurn: socket.userId,
                turn: room.turn,
                defaultTime: room.defaultTime
            });
        });

        socket.on('activeUsers', () => {
            // console.log(activeUser);
            socket.emit('active', Array.from(activeUser))
        })

        socket.on('leave', async ({ roomId }, callback) => {
            let beforeStart;
            if (boards[roomId]) {
                boards[roomId].players = boards[roomId].players.filter(
                    u => u?._id.toString() !== socket.userId
                );
                if (boards[roomId].start) {
                    await controller.saveHistory({
                        player1: socket.userId,
                        player2: boards[roomId].players[0]._id,
                        winnerId: boards[roomId].players[0]._id
                    })
                }
                beforeStart = boards[roomId].start
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
                turn: boards[roomId].turn,
                beforeStart
            });
            // console.log(boards[roomId]);
            socket.leave(roomId);
            if (boards[roomId].players === 0) {
                delete boards[roomId];
            }
            if (callback) {
                callback({ status: 200 })
            }
        })

        socket.on('disconnect', () => {
            activeUser.delete(socket.userId);
            activeMap.delete(socket.userId);
            console.log('user disconnect', socket.id)
        });
    });
};
