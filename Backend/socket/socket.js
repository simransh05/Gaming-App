const User = require('../model/user')
const controller = require('../controller/game')
const controller1 = require('../controller/notification')
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
            console.log(activeUser, activeMap);
            console.log('user connect', socket.id, socket.userId)
        });

        socket.on('create', (callback) => {
            const roomId = Math.floor(100000 + Math.random() * 900000);
            boards[roomId] = {
                board: Array(9).fill(null),
                players: [],
                turn: null,
                symbols: {},
                start: false,
                defaultTime: 10,
                moveIdx: 1
            };
            // console.log('room', boards[roomId])
            callback({ status: 200, roomId });
        });

        socket.on('join', async ({ roomId }, callback) => {
            // console.log('here', roomId);
            if (!boards[roomId]) {
                boards[roomId] = {
                    board: Array(9).fill(null),
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
            if (room.players.length > 1) {
                const from = socket.userId;
                const to = room.players[0]?._id;
                await controller1.deleteNotification(from, to)
            }
            // console.log(room)

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
                    board: Array(9).fill(null),
                    players: [],
                    turn: null,
                    symbols: {},
                    start: false,
                    defaultTime: 10,
                    moveIdx: 1
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
            // post notification
            await controller1.postNotification(from, to, roomId)
            if (toId) {
                // console.log(from, to)
                io.to(toId).emit('receive-invite', { from, fromName, roomId });
            }
        });

        socket.on('getUsers', (roomId, callback) => {
            const room = boards[roomId];
            if (!room) {
                callback({ status: 404 })
            }
            if (room.players.length < 2) {
                return callback({ status: 400 })
            }
            callback({ status: 200, players: room.players, symbols: room.symbols })
        })

        socket.on('reject-invite', async ({ from, to }) => {
            const toId = activeMap.get(to);
            const fromName = await User.findById(from).lean();
            const fromId = activeMap.get(from);
            io.to(fromId).emit('you-refuse');
            // console.log('fromName', fromName);
            // console.log('name', fromName.name)
            await controller1.deleteNotification(from, to)
            io.to(toId).emit('rejected', { name: fromName.name })
        })

        socket.on('move', async ({ roomId, index }) => {
            const room = boards[roomId];
            // console.log('board', board)
            if (!room.board || room.board[index]) return;
            const symbol = boards[roomId].symbols[socket.userId];
            room.board[index] = {
                symbol: symbol, // X or O
                move: room.moveIdx,
                index: index,
                userId: socket.userId
            };
            room.moveIdx++;
            // console.log('line 164', room)
            // console.log('socket', socket.userId);
            // console.log(board[index], index);
            const winner = patterns.some(([a, b, c]) =>
                room.board[a]?.symbol && room.board[a]?.symbol === room.board[b]?.symbol && room.board[a]?.symbol === room.board[c]?.symbol
            );
            // console.log('line 170', room.board[index].symbol)
            // console.log('line 171', winner);
            const findValue = patterns.find(([a, b, c]) =>
                room.board[a]?.symbol && room.board[a]?.symbol === room.board[b]?.symbol && room.board[a]?.symbol === room.board[c]?.symbol
            );

            // console.log('line 176', findValue)

            if (winner) {
                const lastMove = room.board;
                const prev = room.board;
                room.board = Array(9).fill(null)
                room.start = false;
                room.turn = room.players[0]._id.toString();
                room.moveIdx = 1;
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
                    defaultTime: room.defaultTime,
                    prev: prev,
                });
                // console.log('here move')
                await controller.saveHistory({
                    player1: room.players[0]._id,
                    player2: room.players[1]._id,
                    winnerId: socket.userId
                })
                // console.log(data);
            } else if (!room.board.includes(null)) {
                const lastMove = room.board;
                const prev = room.board;
                room.board = Array(9).fill(null);
                room.start = false;
                room.turn = room.players[0]._id.toString();
                room.moveIdx = 1;
                // console.log('board 2', room.board)
                io.to(roomId).emit('draw', {
                    board: room.board,
                    players: room.players,
                    lastMove,
                    defaultTime: room.defaultTime,
                    prev
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
        socket.on('play-again', ({ roomId }) => {
            socket.broadcast.to(roomId).emit('ask-play-again')
        })

        socket.on('refuse-to-play', ({ roomId }) => {
            // console.log('here 244');
            socket.broadcast.to(roomId).emit('refused-play')
        })
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
            // console.log('line 262', boards[roomId].players[0]._id.toString() === socket.userId);
            if (boards[roomId].players[0]._id.toString() === socket.userId) {
                socket.broadcast.to(roomId).emit('first-player-left');
            }
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
                boards[roomId].moveIdx = 1;
            }
            boards[roomId].board = Array(9).fill(null);
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
            if (boards[roomId].players.length === 0) {
                // console.log(boards[roomId])
                delete boards[roomId];
            }
            if (callback) {
                callback({ status: 200 })
            }
        })

        socket.on('disconnect', () => {
            activeUser.delete(socket.userId);
            activeMap.delete(socket.userId);
            console.log('user disconnect', socket.id, socket.userId)
        });
    });
};
