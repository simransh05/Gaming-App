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
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import rejectedInvite from '../../utils/helper/rejectedInvite';
import { userStore } from '../../components/Zustand/AllUsers'
import { friendStore } from '../../components/Zustand/Friends'
import acceptFriend from '../../utils/helper/acceptFriend';
import refuseFriend from '../../utils/helper/refuseFriend';
import refreshGame from '../../utils/helper/socketHelper/refreshGame';
import requestGameInvite from '../../utils/helper/socketHelper/requestGameInvite';
import startGame from '../../utils/helper/socketHelper/StartGame';
import playerLeft from '../../utils/helper/socketHelper/playerLeft';
import drawMatch from '../../utils/helper/socketHelper/drawMatch';
import Winner from '../../utils/helper/socketHelper/Winner';
import HistoryDrawer from '../../components/Drawer/History/HistoryDrawer';
import { TbInfoCircleFilled } from "react-icons/tb";
import PreviewDrawer from '../../components/Drawer/PrevDrawer/PreviewDrawer';
import { Button, Snackbar } from '@mui/material';
function GameRoom() {
    const { roomId } = useParams()
    const [board, setBoard] = useState([
        "", "", "",
        "", "", "",
        "", "", ""
    ]);
    const [users, setUsers] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [prevDrawer, setPrevDrawer] = useState(false);
    const [prevData, setPrevData] = useState(null);
    const [start, setStart] = useState(false);
    const [history, setHistory] = useState(null);
    const [symbols, setSymbols] = useState(null);
    const [playAgainRequest, setPlayAgainRequest] = useState(false);
    const navigate = useNavigate();
    const [line, setLine] = useState(null);
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [timer, setTimer] = useState(0);
    const [defaultTimer, setDefaultTimer] = useState(0);
    const [defaultTime, setDefaultTime] = useState(false);
    const [areFriend, setAreFriend] = useState(false);
    const [opponent, setOpponent] = useState(false);
    const { fetchAllUsers } = userStore();
    const [showHistory, setShowHistory] = useState(false);
    const { fetchFriends } = friendStore();

    useEffect(() => {
        if (loading) return;
        if (!currentUser) {
            Swal.fire("Need to login first", "", "warning")
            navigate(`${ROUTES.LOGIN}`)
        }
    }, [currentUser, loading])


    useEffect(() => {
        if (loading) return;
        fetchAllUsers(currentUser?._id);
        fetchFriends(currentUser?._id);
    }, [loading])

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
    }, [users, loading])

    const handleClick = (index) => {
        if (!start) return;
        if (currentPlayer !== currentUser?._id) return;
        socket.emit("move", { roomId, index });
    };

    useEffect(() => {
        if (!roomId) return;

        if (loading) return;

        const anotherRoom = roomId;
        requestGameInvite(currentUser, navigate, anotherRoom);

        rejectedInvite();

        Winner(setBoard, setStart, setLine, setHistory, setDefaultTimer, setTimer, currentUser, roomId, setPrevData, setPrevDrawer);

        drawMatch(setBoard, setStart, setHistory, setDefaultTimer, setTimer, roomId, setPrevDrawer, setPrevData)

        acceptFriend(setAreFriend)

        refuseFriend();

        playerLeft(setBoard, setCurrentPlayer, setStart, setUsers, setHistory, setOpponent);

        startGame(setStart, setCurrentPlayer, setDefaultTimer, setTimer, currentUser)

        socket.on("player-joined", (players) => {
            if (Array.isArray(players)) {
                setUsers(players);

            }
        });

        socket.on("moveDone", ({ players, turn, board, defaultTime }) => {
            setBoard(board);
            setUsers(players);
            setDefaultTimer(defaultTime);
            setTimer(defaultTime);
            setCurrentPlayer(turn);
        });

        socket.on('nextTurn', ({ start, prevTurn, turn, defaultTime }) => {
            if (start && prevTurn === currentUser._id) {
                toast.info('your turn is skipped');
            }
            setCurrentPlayer(turn);
            setTimer(defaultTime);
            setDefaultTimer(defaultTime)
        })

        socket.on('first-player-left', () => {
            navigate(`${ROUTES.HOME}`)
            Swal.fire({
                title: "The room host has left",
                text: "You’ve been returned to the home page.",
                icon: "info",
                showConfirmButton: false,
                timer: 5000
            });
        })

        socket.on('getNewTime', ({ time }) => {
            setTimer(time);
            setDefaultTimer(time)
        })

        socket.on('ask-play-again', () => {
            setPlayAgainRequest(true);
        })

        socket.on('refused-play', () => {
            // console.log('here')
            Swal.fire({
                title: 'Play Again request',
                text: 'Opponent refuse to play again',
                icon: 'info',
                showCancelButton: false,
                showConfirmButton: false,
                timer: 5000
            })
        })

        socket.emit('getTime', (roomId), (res) => {
            setTimer(res.time);
            setDefaultTimer(res.time)
        })

        if (currentUser) {
            if (!socket.connected) {
                socket.emit('register', currentUser._id)
            }
        }

        socket.emit('getUsers', (roomId), (res) => {
            // console.log(res)
            if (res.status === 200) {
                setSymbols(res.symbols)
                setUsers(res.players);
            }
        })

        refreshGame(roomId, setUsers, setBoard, setCurrentPlayer, setStart, setTimer, setDefaultTimer, currentUser, navigate)

        return () => {
            socket.off("player-joined");
            socket.off("moveDone");
            socket.off('nextTurn');
            socket.off('refused-play');
            socket.off('ask-play-again')
        };
    }, [roomId, loading]);


    const handleBtn = () => {
        if (users?.length != 2) return;
        socket.emit('start', roomId);
    }

    useEffect(() => {
        const fetchData = async () => {
            if (loading) return;
            if (users?.length === 2) {
                const player1 = users[0]?._id;
                const player2 = users[1]?._id;
                const res = await api.getHistory(player1, player2, currentUser?._id)
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
    // console.log(currentPlayer)
    const handleInfo = () => {
        socket.emit('getTime', ({ roomId }), (res) => {
            // console.log(res)
            Swal.fire({
                title: 'Game Rules',
                html: `<div class="info-user-game">
                <p><b>Turn Timer:</b> ${res.time} seconds per player</p>
                <p><b>Mode:</b> 1 vs 1 match</p>
                <p>If a player does not move in time, the turn is skipped.</p>
                </div>`,
                icon: 'info',
                confirmButtonText: 'Got it'
            })
        })
    }

    const handleFriend = async () => {
        const otherUser = users.find(u => u._id !== currentUser?._id)
        // console.log('here', currentUser._id, otherUser._id);
        const res = await api.postFriend(currentUser._id, otherUser._id);
        if (res.status === 200) {
            setAreFriend(true);
        }
        socket.emit('askFriend', { from: currentUser._id, to: otherUser._id, roomId });
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

    // console.log(prevData)

    return (
        <>
            <Snackbar
                open={playAgainRequest}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                message="Opponent asked to play again"
                className='game-snackbar'
                action={
                    <div className='action-btns'>
                        <Button
                            color="success"
                            size="small"
                            onClick={() => {
                                socket.emit('start', roomId);
                                setPlayAgainRequest(false);
                            }}
                        >
                            Yes
                        </Button>
                        <Button
                            color="error"
                            size="small"
                            onClick={() => {
                                socket.emit('refuse-to-play', { roomId });
                                setPlayAgainRequest(false);
                            }}
                        >
                            No
                        </Button>
                    </div>
                }
            />
            <div className="subheader">
                <div className="names">
                    <span>Players in Game: </span>
                    {users?.map((user, index) => (
                        <span key={index}
                            className={users.length === 2 ? 'two' : 'one'}>{user?.name}</span>
                    ))}
                </div>
                {users && users.length === 1 && <>
                    <button onClick={() => setDefaultTime(true)} className='change-time'>Change Timer</button>
                    {defaultTime && <TimerSet
                        open={() => setDefaultTime(true)}
                        onClose={() => setDefaultTime(false)}
                        onSuccess={(successTime) => handleTimer(successTime)}
                    />}
                    <button onClick={() => setOpponent(true)} className='add-opponent'>Choose opponent</button>
                    {opponent &&
                        <OpponentDrawer
                            open={() => setOpponent(true)}
                            onClose={() => setOpponent(false)}
                            onSuccess={(data) => handleDrawer(data)}
                        />
                    }
                </>
                }

                {users && users.length > 1 && <button onClick={() => setShowHistory(true)} className='open-history-drawer'>Show History</button>}
                {showHistory &&
                    <HistoryDrawer
                        open={() => setShowHistory(true)}
                        onClose={() => setShowHistory(false)}
                        history={history}
                        onSuccess={handleDelete}
                    />
                }

                {areFriend ?
                    users && users.length === 2 && <button disabled className='already-friend'>Friends</button> :
                    users && users.length === 2 && <button onClick={handleFriend} className='ask-friend'>
                        Ask to be Friend
                    </button>}

                {prevDrawer &&
                    <PreviewDrawer
                        open={() => setPrevDrawer(true)}
                        onClose={() => setPrevDrawer(false)}
                        prevData={prevData}
                        players={users}
                        symbols={symbols}
                    />}

                <div className="buttons-game">
                    <button onClick={leave} className='leave-room'>Leave Game Room</button>
                    <TbInfoCircleFilled className='info-btn' onClick={handleInfo} />
                </div>

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
                                {cell?.symbol}
                            </div>
                        ))}
                        {line && <div className={getLineClass(line)} />}
                    </div>
                    <div className="play-game">
                        {start ?
                            <button disabled className='start-btn started'>Started</button> :
                            users && users.length === 2 ? <button onClick={handleBtn} className='start-btn playing'>Toss</button> :
                                <button className='start-btn' disabled>Toss</button>
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
                        />
                        <div className='currentPlayer timer-text'>
                            <div>
                                {currentPlayer === users[0]?._id ? users[0]?.name : users[1]?.name}
                            </div>
                            <div>{timer}</div>
                        </div>
                    </div> :
                    <>
                        {start &&
                            <div className='parentCount timer-text other-player'>
                                <div>
                                    {currentPlayer === users[0]?._id ? users[0]?.name : users[1]?.name}
                                </div>
                                <div>{timer}</div>
                            </div>
                        }
                    </>
                }

            </div>
        </>
    )
}

export default GameRoom
