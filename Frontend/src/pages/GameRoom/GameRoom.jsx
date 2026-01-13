import React, { useContext } from 'react'
import socket from '../../socket/socket'
import { useState } from 'react';
import './gameroom.css'
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../../utils/api';
import ROUTES from '../../constant/Route/route';
import Swal from 'sweetalert2';
import { CurrentUserContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
import TimerSet from '../../components/Modals/TimerSet';
import OpponentDrawer from '../../components/Drawer/OpponentDrawer';
import { CircularProgress } from '@mui/material';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import rejectedInvite from '../../utils/helper/rejectedInvite';
import { userStore } from '../../components/Zustand/AllUsers'
import { friendStore } from '../../components/Zustand/Friends'
import acceptFriend from '../../utils/helper/acceptFriend';
import refuseFriend from '../../utils/helper/refuseFriend';
function GameRoom() {
    const { roomId } = useParams()
    const [board, setBoard] = useState([
        "", "", "",
        "", "", "",
        "", "", ""
    ]);
    const [users, setUsers] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [start, setStart] = useState(false);
    const [history, setHistory] = useState(null);
    const navigate = useNavigate();
    const [line, setLine] = useState(null);
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [timer, setTimer] = useState(0);
    const [defaultTimer, setDefaultTimer] = useState(0);
    const [defaultTime, setDefaultTime] = useState(false);
    const [areFriend, setAreFriend] = useState(false);
    const [opponent, setOpponent] = useState(false);
    const { fetchAllUsers } = userStore();
    const { fetchFriends } = friendStore();

    useEffect(() => {
        if (loading) return;
        // console.log(currentUser);
        if (!currentUser) {
            Swal.fire("Need to login first", "", "warning")
            navigate(`${ROUTES.LOGIN}`)
        } else if (currentUser && users?.length > 0) {
            // console.log(users, currentUser)
            const notJoined = users?.some(u => u?._id === currentUser?._id)
            // console.log(notJoined, users.length === 0)
            if (users?.length === 0 || !notJoined) {
                Swal.fire({ title: 'You are not Joined' })
                navigate(ROUTES.HOME)
            }
        }
    }, [currentUser, loading])

    // console.log(users);

    useEffect(() => {
        if (loading) return;
        fetchAllUsers(currentUser?._id);
        fetchFriends(currentUser?._id);
    }, [loading])

    // console.log(allUsers);
    // console.log(friends);

    useEffect(() => {
        const friendsCheck = async () => {
            if (loading) return;
            if (!users) return;
            if (users?.length === 2) {
                const otherUser = users.find(u => u._id !== currentUser?._id)
                const userId = currentUser._id;
                const id = otherUser._id;
                const res = await api.getIndividualFriend(userId, id)
                setAreFriend(res.data);
            }

        }
        friendsCheck();
        // check for the user if they are friend or not
    }, [users, loading])

    const handleClick = (index) => {
        if (!start) return;
        // console.log(index)
        if (currentPlayer !== currentUser?._id) return;
        // console.log('here')
        socket.emit("move", { roomId, index });
    };
    // console.log(currentUser);

    useEffect(() => {
        if (!roomId) return;

        if (loading) return;

        rejectedInvite();

        socket.on("player-joined", (players) => {
            if (Array.isArray(players)) {
                // console.log(players)
                setUsers(players);
            }
        });

        socket.on("game-started", ({ FirstPlayer, defaultTime }) => {
            // console.log(currentUser._id, FirstPlayer)
            Swal.fire({
                title: currentUser._id === FirstPlayer ? 'You win the toss got first move' : 'You lose the toss',
                text: '',
                icon: currentUser._id === FirstPlayer ? 'success' : 'error',
                timer: 3000,
                showCancelButton: false,
                showConfirmButton: false,
            }).then(() => {
                setStart(true);
                // console.log(FirstPlayer)
                setCurrentPlayer(FirstPlayer);
                setDefaultTimer(defaultTime)
                setTimer(defaultTime)
            })
        });

        // when a move is done
        socket.on("moveDone", ({ players, turn, board, defaultTime }) => {
            // console.log(players, turn, board)
            setBoard(board);
            setUsers(players);
            setDefaultTimer(defaultTime);
            setTimer(defaultTime);
            setCurrentPlayer(turn);
        });

        // winner
        socket.on("winner", async ({ winnerId, board, name, pattern, lastMove, defaultTime }) => {
            setBoard(lastMove);
            setStart(false);
            // console.log(pattern);
            setLine(pattern);
            await Swal.fire({
                title: winnerId === currentUser?._id ? "You Won!" : "You Lost!",
                text: "",
                icon: winnerId === currentUser?._id ? "success" : "error",
                width: '300',
                showConfirmButton: false,
                timer: 5000
            }).then(() => {
                setBoard(board);
                setLine(null);
                setHistory(prev => {
                    const updated = [...prev, { winner: { name } }];
                    return updated.length > 10 ? updated.slice(1) : updated;
                });
                setDefaultTimer(defaultTime)
                setTimer(defaultTime);
            })
        });

        // draw
        socket.on("draw", async ({ board, lastMove, defaultTime }) => {
            setBoard(lastMove);
            setStart(false);
            Swal.fire({
                title: "Draw!",
                text: "",
                icon: "info",
                width: '300',
                showConfirmButton: false,
                timer: 5000
            }).then(() => {
                setBoard(board);
                setHistory(prev => {
                    const updated = [...prev, { winner: null }];
                    return updated.length > 10 ? updated.slice(1) : updated;
                });
                setDefaultTimer(defaultTime)
                setTimer(defaultTime)
            })
        });

        socket.on('nextTurn', ({ start, prevTurn, turn, defaultTime }) => {
            // console.log(prevTurn, currentUser._id)
            if (start && prevTurn === currentUser._id) {
                toast.info('your turn is skipped');
            }
            // console.log(turn)
            setCurrentPlayer(turn);
            setTimer(defaultTime);
            setDefaultTimer(defaultTime)
        })

        acceptFriend(setAreFriend)

        refuseFriend();

        socket.on('getNewTime', ({ time }) => {
            setTimer(time);
            setDefaultTimer(time)
        })
        // opponent left
        socket.on("player-left", ({ board, players, turn, start }) => {
            setStart(start);
            setBoard(board);
            setUsers(players);
            setCurrentPlayer(turn);
            setHistory(null);
            Swal.fire({
                title: "Opponent left",
                text: "",
                icon: "warning",
                timer: 5000,
                showConfirmButton: false
            })
        });

        socket.emit('getTime', (roomId), (res) => {
            setTimer(res.time);
            setDefaultTimer(res.time)
        })

        if (currentUser) {
            if (!socket.connected) {
                socket.emit('register', currentUser._id)
            }
        }

        socket.emit('refresh-room', { roomId }, (res) => {
            if (res.status === 200) {
                // console.log(res);
                setUsers(res.data.players);
                setBoard(res.data.board);
                setCurrentPlayer(res.data.turn);
                setStart(res.data.start);
                setTimer(res.data.defaultTime)
                setDefaultTimer(res.data.defaultTime);
            }
        })

        return () => {
            socket.off('game-started')
            socket.off('room-full')
            socket.off("player-joined");
            socket.off("moveDone");
            socket.off("winner");
            socket.off("draw");
            socket.off('nextTurn');
            socket.off("player-left");
            socket.off('refresh-room');
        };
    }, [roomId, loading]);


    const handleBtn = () => {
        if (users?.length != 2) return;
        socket.emit('start', roomId);
    }
    // console.log(currentUser);
    // console.log(users)

    useEffect(() => {
        const fetchData = async () => {
            if (loading) return;
            if (users?.length === 2) {
                const player1 = users[0]?._id;
                const player2 = users[1]?._id;
                const res = await api.getHistory(player1, player2, currentUser?._id)
                // console.log(res.status)
                // console.log(res.data);
                setHistory(res.data.history);
            }
            else {
                return;
            }
        }
        fetchData();
    }, [users, loading])

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Delete History',
            text: 'Are you sure u want to delete history',
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
            showCancelButton: true,
            reverseButtons: true,
        })
        if (result.isConfirmed) {
            const player1 = users[0]?._id;
            const player2 = users[1]?._id;
            const data = { player1, player2, userId: currentUser?._id }
            const res = await api.deleteHistory(data);
            if (res.status === 200) {
                setHistory(null);
            }
        }
    }

    const leave = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to leave the game?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, leave",
            cancelButtonText: "No, stay",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            reverseButtons: true
        })
        if (result.isConfirmed) {
            socket.emit('leave', { roomId }, (res) => {
                if (res.status === 200) {
                    navigate(`${ROUTES.HOME}`)
                }
            })
        }
    }

    const handleFriend = async () => {
        const otherUser = users.find(u => u._id !== currentUser?._id)
        // console.log('here', currentUser._id, otherUser._id);
        const res = await api.postFriend(currentUser._id, otherUser._id);
        if (res.status === 200) {
            setAreFriend(true);
        }
        socket.emit('askFriend', { from: currentUser._id, to: otherUser._id });
    }

    const getLineClass = (pattern) => {
        const key = pattern.join("-");
        switch (key) {
            case "0-1-2": return "line row-1";
            case "3-4-5": return "line row-2";
            case "6-7-8": return "line row-3";
            case "0-3-6": return "line col-1";
            case "1-4-7": return "line col-2";
            case "2-5-8": return "line col-3";
            case "0-4-8": return "line diag-1";
            case "2-4-6": return "line diag-2";

            default: return "";
        }
    };

    // const handleDrawer = (id) => {
    //  socket.emit()   
    // }

    useEffect(() => {
        if (!currentPlayer) return;

        if (start) {
            setTimer(timer);
        }

        const id = setInterval(() => {
            setTimer(prev => {
                // console.log(prev)
                if (prev <= 1) {
                    // console.log('here')
                    socket.emit('skip-turn', roomId);
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [currentPlayer]);

    const handleTimer = (time) => {
        socket.emit('setNewTime', { roomId, time })
    }

    // console.log(start)

    return (
        <>
            <div className="subheader">
                <div className="names">
                    <span>Players in Game: </span>
                    {users?.map((user, index) => (
                        <span key={index}
                            className={users.length === 2 ? 'two' : 'one'}>{user?.name}</span>
                    ))}
                </div>
                {users && users.length === 1 && <>
                    <button onClick={() => setDefaultTime(true)}>Change Timer</button>
                    {defaultTime && <TimerSet
                        open={() => setDefaultTime(true)}
                        onClose={() => setDefaultTime(false)}
                        onSuccess={(successTime) => handleTimer(successTime)}
                    />}
                    <button onClick={() => setOpponent(true)}>Choose opponent</button>
                    {opponent &&
                        <OpponentDrawer
                            open={() => setOpponent(true)}
                            onClose={() => setOpponent(false)}
                            onSuccess={(data) => handleDrawer(data)}
                        />
                    }
                </>
                }
                {areFriend ?
                    users && users.length === 2 && <button disabled className='already-friend'>Friends</button> :
                    users && users.length === 2 && <button onClick={handleFriend} className='ask-friend'>
                        Ask to be Friend
                    </button>}
                {/* {start &&
                    <div className="currentTurn">Current Turn: {currentPlayer === users[0]?._id ? users[0]?.name : users[1]?.name}</div>} */}
                <button onClick={leave} className='leave-room'>Leave Game Room</button>
            </div>
            <div className="main-container">
                <div className="left-side">
                    <div className="grid">
                        {board?.map((cell, index) => (
                            <div
                                key={index}
                                className={`cell ${line?.includes(index) ? 'winner-index' : ''}`}
                                onClick={() => handleClick(index)}
                            >
                                {cell}
                            </div>
                        ))}
                        {line && <div className={getLineClass(line)} />}
                    </div>
                    <div className="play-game">
                        {start ?
                            <button disabled className='start-btn started'>Started</button> :
                            <button onClick={handleBtn} className='start-btn playing'>Toss</button>
                        }
                    </div>
                </div>
                {start &&
                    currentPlayer === currentUser?._id ?
                    <div className='parentCount'>
                        <CountdownCircleTimer
                            key={currentPlayer}
                            isPlaying
                            duration={defaultTimer}
                            remainingTime={timer}
                            colors={["#22c55e", "#facc15", "#ef4444"]}
                            colorsTime={[defaultTimer, defaultTimer / 2, 3]}
                            strokeWidth={6}
                            size={100}
                        >
                            {timer}
                        </CountdownCircleTimer>
                        <div className='currentPlayer timer-text'>
                            <div>
                                {currentPlayer === users[0]?._id ? users[0]?.name : users[1]?.name}
                            </div>
                            <div>{timer}</div>
                        </div>
                    </div> :
                    <>
                        {start &&
                            <div className='parentCount timer-text'>
                                <div>
                                    {currentPlayer === users[0]?._id ? users[0]?.name : users[1]?.name}
                                </div>
                                <div>{timer}</div>
                            </div>
                        }
                    </>
                }

                <div className="history-list">
                    {history?.length > 0 ?
                        history.map((h, index) => (
                            <div key={index} className='history'>{h?.winner === null ? 'Draw' : h?.winner?.name}</div>
                        ))
                        : <div className='no-history'>No History Yet</div>
                    }
                    {history?.length > 0 && <button className="delete-btn" onClick={handleDelete}>Delete History</button>}
                </div>
            </div>
        </>
    )
}

export default GameRoom
