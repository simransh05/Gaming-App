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
    const [users, setUsers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [start, setStart] = useState(false);
    const [history, setHistory] = useState(null);
    const navigate = useNavigate()
    const { currentUser } = useContext(CurrentUserContext);

    const handleClick = (index) => {
        console.log(index, currentPlayer)
        if (!start) return;
        console.log(currentPlayer !== currentUser?._id);
        console.log(currentUser);
        console.log(currentPlayer, currentUser?._id)
        if (currentPlayer !== currentUser?._id) return;
        socket.emit("move", { roomId, index });
    };

    useEffect(() => {
        if (!roomId) return;
        if (currentUser) {
            socket.emit('register', currentUser?._id)
        }
        socket.emit('refresh-room', { roomId }, (res) => {
            if (res.status === 200) {
                setUsers(res.user)
            }
        })

        socket.on("game-started", (FirstPlayer) => {
            setStart(true);
            console.log(users[0])
            setCurrentPlayer(FirstPlayer);
        });


        // when players join
        socket.on("player-joined", (players) => {
            setUsers(players);
        });

        // when a move is done
        socket.on("moveDone", (serverBoard) => {
            console.log(serverBoard);
            console.log(currentPlayer);
            console.log(users);
            setBoard(serverBoard.map((cellUserId) => {
                if (!cellUserId || !users || users.length < 2) return "";
                return cellUserId === users[0]._id ? "X" : "O";
            }));

            // toggle
            setCurrentPlayer((prev) =>
                prev === users[0]?._id ? users[1]?._id : users[0]?._id
            );
        });

        // winner
        socket.on("winner", (winnerId) => {
            Swal.fire(
                winnerId === currentUser?._id ? "You Won!" : "You Lost!",
                "",
                winnerId === currentUser?._id ? "success" : "error"
            );
            setStart(false);
        });

        // draw
        socket.on("draw", () => {
            Swal.fire("Draw!", "", "info");
            setStart(false);
        });

        // opponent left
        socket.on("player-left", () => {
            Swal.fire("Opponent left", "", "warning");
            setStart(false);
        });

        return () => {
            socket.off('refresh-room')
            socket.off('game-started')
            socket.off("player-joined");
            socket.off("moveDone");
            socket.off("winner");
            socket.off("draw");
            socket.off("player-left");
        };
    }, [roomId]);


    const handleBtn = () => {
        console.log(roomId)
        socket.emit('start', roomId);
    }

    useEffect(() => {
        const fetchData = async () => {
            if (users?.length === 2) {
                const player1 = users[0]?._id;
                const player2 = users[1]?._id;
                console.log(player1, player2);
                const res = await api.getHistory(player1, player2)
                console.log(res.status)
                console.log(res.data);
                setHistory(res.data);
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
    console.log(users);

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
                {history?.length > 0 ?
                    history.map((h, index) => (
                        <div key={index} className='history'>{h}</div>
                    )) : <div className='no-history'>No History Yet</div>
                }
            </div>
            {start ?
                <button disabled>Started</button> :
                <button onClick={handleBtn}>{history?.length > 0 ? 'Play again' : 'Play'}</button>
            }
        </>
    )
}

export default GameRoom
