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
    const { currentUser } = useContext(CurrentUserContext);

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

        // socket.on('joined-room' , (players) =>{
        //     setUsers(players)
        // })

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
            console.log(winnerId, currentUser?._id)
            Swal.fire(
                winnerId == currentUser?._id ? "You Won!" : "You Lost!",
                "",
                winnerId == currentUser?._id ? "success" : "error"
            );
            setBoard(board);
            setStart(false);
            setHistory((prev) => [
                ...prev,
                { winner: { name } }
            ]);

        });

        // draw
        socket.on("draw", async ({ board }) => {
            // const data = { winnerId: null, player1: players[0]._id, player2: players[0]._id }
            // const res = await api.postHistory(data);
            Swal.fire("Draw!", "", "info");
            setBoard(board);
            setStart(false);
            setHistory((prev) => [
                ...prev,
                { winner: null }
            ]);
        });

        // opponent left
        socket.on("player-left", () => {
            Swal.fire("Opponent left", "", "warning");
            setStart(false);
        });

        return () => {
            socket.off('refresh-room')
            socket.off('game-started')
            // socket.off('joined-room')
            socket.off("player-joined");
            socket.off("moveDone");
            socket.off("winner");
            socket.off("draw");
            socket.off("player-left");
        };
    }, [roomId]);


    const handleBtn = () => {
        // console.log(roomId)
        socket.emit('start', roomId);
    }

    useEffect(() => {
        const fetchData = async () => {
            if (users?.length === 2) {
                const player1 = users[0]?._id;
                const player2 = users[1]?._id;
                // console.log(player1, player2);
                const res = await api.getHistory(player1, player2)
                // console.log(res.status)
                // console.log(res.data);
                setHistory(res.data.history);
            }
            else {
                return;
            }
        }
        fetchData();
    }, [users])

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
                    {users?.map((user, index) => (
                        <span key={index}
                            className='user-name'>{user?.name}</span>
                    ))}
                </div>
                <button onClick={leave}>Leave Game Room</button>
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
                            <div key={index} className='history'>{h?.winner?.name === null ? 'Draw' : h?.winner?.name}</div>
                        )) : <div className='no-history'>No History Yet</div>
                    }
                </div>
            </div>
            {start ?
                <button disabled>Started</button> :
                <button onClick={handleBtn}>{history?.length > 0 ? 'Play again' : 'Play'}</button>
            }
        </>
    )
}

export default GameRoom
