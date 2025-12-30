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
    const navigate = useNavigate()
    const { currentUser, loading } = useContext(CurrentUserContext);

    useEffect(() => {
        if (loading) return;
        // console.log(currentUser);
        if (!currentUser) {
            Swal.fire("Need to login first", "", "warning")
            navigate(`${ROUTES.LOGIN}`)
        } else if (currentUser) {
            const notJoined = users?.find(u => u?._id !== currentUser?._id)
            if (notJoined) {
                Swal.fire({ title: 'Room is full' })
                navigate(ROUTES.HOME)
            }
        }
    }, [currentUser, loading])

    const handleClick = (index) => {
        // console.log(index, currentPlayer)
        if (!start) return;
        // console.log(currentPlayer !== currentUser?._id);
        // console.log(currentUser);
        // console.log(currentPlayer, currentUser?._id)
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
        socket.on("winner", async ({ winnerId, board, name }) => {
            // console.log(winnerId, currentUser?._id)
            Swal.fire(
                winnerId == currentUser?._id ? "You Won!" : "You Lost!",
                "",
                winnerId == currentUser?._id ? "success" : "error"
            );
            setBoard(board);
            setStart(false);
            setHistory(prev => {
                const updated = [...prev, { winner: { name } }];
                return updated.length > 10 ? updated.slice(1) : updated;
            });


        });

        // draw
        socket.on("draw", async ({ board }) => {
            // const data = { winnerId: null, player1: players[0]._id, player2: players[0]._id }
            // const res = await api.postHistory(data);
            Swal.fire("Draw!", "", "info");
            setBoard(board);
            setStart(false);
            setHistory(prev => {
                const updated = [...prev, { winner: null }];
                return updated.length > 10 ? updated.slice(1) : updated;
            });

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
        // console.log(roomId)
        socket.emit('start', roomId);
    }
    console.log(users)

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
                <div className="grid">
                    {board.map((cell, index) => (
                        <div
                            key={index}
                            className="cell"
                            onClick={() => handleClick(index)}
                        >
                            {cell}
                        </div>
                    ))}
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
            <div className="play-game">
                {start ?
                    <button disabled className='start-btn started'>Started</button> :
                    <button onClick={handleBtn} className='start-btn playing'>{history?.length > 0 ? 'Play again' : 'Play'}</button>
                }
            </div>
        </>
    )
}

export default GameRoom
