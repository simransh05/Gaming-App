import React, { useContext } from 'react'
import NavBar from '../../components/NavBar/NavBar'
import socket from '../../socket/socket'
import { useState } from 'react';
import './gameroom.css'
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../../utils/api';
import ROUTES from '../../constant/Route/route';
import Swal from 'sweetalert2';
import { CurrentUserContext } from '../../context/UserContext';
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

    const handleClick = (index) => {
        if (!start) return;
        if (currentPlayer !== currentUser?._id) return;
        socket.emit("move", { roomId, index });
    };
    // console.log(currentUser);

    useEffect(() => {
        if (!roomId) return;

        socket.on("player-joined", (players) => {
            if (Array.isArray(players)) {
                setUsers(players);
            }
        });

        socket.on("game-started", (FirstPlayer) => {
            setStart(true);
            // console.log(FirstPlayer)
            setCurrentPlayer(FirstPlayer);
        });

        // when a move is done
        socket.on("moveDone", ({ players, turn, board }) => {
            // console.log(players, turn, board)
            setBoard(board);
            setUsers(players);
            setCurrentPlayer(turn);
        });

        // winner
        socket.on("winner", async ({ winnerId, board, name, pattern, lastMove }) => {
            setBoard(lastMove)
            // console.log(pattern);
            setLine(pattern);
            await Swal.fire({
                title: winnerId === currentUser?._id ? "You Won!" : "You Lost!",
                text: "",
                icon: winnerId === currentUser?._id ? "success" : "error",
                width: '300',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                setBoard(board);
                setStart(false);
                setLine(null);
                setHistory(prev => {
                    const updated = [...prev, { winner: { name } }];
                    return updated.length > 10 ? updated.slice(1) : updated;
                });
            })
        });

        // draw
        socket.on("draw", async ({ board, lastMove }) => {
            setBoard(lastMove)
            // const data = { winnerId: null, player1: players[0]._id, player2: players[0]._id }
            // const res = await api.postHistory(data);
            Swal.fire({
                title: "Draw!",
                text: "",
                icon: "info",
                width: '300',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                setBoard(board);
                setStart(false);
                setHistory(prev => {
                    const updated = [...prev, { winner: null }];
                    return updated.length > 10 ? updated.slice(1) : updated;
                });
            })
        });

        // opponent left
        socket.on("player-left", (board) => {
            Swal.fire("Opponent left", "", "warning");
            setStart(false);
            setBoard(board);
        });

        if (currentUser) {
            socket.emit('register', currentUser?._id)
        }

        socket.emit('refresh-room', { roomId }, (res) => {
            if (res.status === 200) {
                // console.log(res);
                setUsers(res.data.players);
                setBoard(res.data.board);
                setCurrentPlayer(res.data.turn);
                setStart(res.data.start)
            }
        })

        return () => {
            socket.off('game-started')
            socket.off('room-full')
            socket.off("player-joined");
            socket.off("moveDone");
            socket.off("winner");
            socket.off("draw");
            socket.off("player-left");
            socket.off('refresh-room')
        };
    }, [roomId]);


    const handleBtn = () => {
        socket.emit('start', roomId);
    }
    // console.log(line)

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

    return (
        <>
            <NavBar />
            <div className="subheader">
                <div className="names">
                    <span>players in Game: </span>
                    {users?.map((user, index) => (
                        <span key={index}
                            className={users.length === 2 ? 'two' : 'one'}>{user?.name}</span>
                    ))}
                </div>
                {start &&
                    <div className="currentTurn">Current Turn: {currentPlayer === users[0]?._id ? users[0]?.name : users[1]?.name}</div>}
                <button onClick={leave} className='leave-room'>Leave Game Room</button>
            </div>
            <div className="main-container">
                <div className="left-side">
                    <div className="grid">
                        {board.map((cell, index) => (
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
                            <button onClick={handleBtn} className='start-btn playing'>{history?.length > 0 ? 'Play Again' : 'Play'}</button>
                        }
                    </div>
                </div>

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
