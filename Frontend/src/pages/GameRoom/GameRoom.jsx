import React from 'react'
import NavBar from '../../components/NavBar/NavBar'
import socket from '../../socket/socket'
import { useState } from 'react';
import './gameroom.css'
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../../utils/api';
function GameRoom() {
    const { roomId } = useParams()
    const [board, setBoard] = useState([
        "", "", "",
        "", "", "",
        "", "", ""
    ]);
    const [users, setUsers] = useState([]);

    const handleClick = (index) => {
        if (board[index] !== "") return;

        // if emit success then add move in frontend and give according to the user who is current

        // if win then display the play again and the history add post the winner on history

        // const newBoard = [...board];
        // newBoard[index] = currentPlayer; 
        // setBoard(newBoard);

    };

    const handleBtn = () => {
        // idea is start and btn disable
    }

    useEffect(() => {
        const fetchData = async () => {
            if (users.length === 2) {
                // both user ids send
                await api.getHistory() // ids send in the form of first user id , secondUser id 
            }
            // while getting user name count check 
            // if 2 user then call api history
        }
        fetchData();
    }, [])

    useEffect(() => {
        socket.on('player-joined', (user) => {
            setUsers(user)
        })
    }, [])

    const leave = () => {
        socket.emit('leave', { roomId, user })
        // response will be 200 then redirect to /
    }

    return (
        <>
            <NavBar />
            <div className="subheader">
                {/* for each users first name of them in a span with the spacing  */}
                {/* name of the users present in the room by on socket*/}
                {/* leave room  btn which will have emit navigate to / */}
                <button onClick={leave}>Leave Game Room</button>
            </div>
            <div className="main-container">
                {/* matrix */}
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

                {/* history when 2 person then get history*/}
            </div>
            {/* if no history of 2 player so play else play again */}
            <button onClick={handleBtn}>Play</button>
            {/* btn which will be there play or play again */}
        </>
    )
}

export default GameRoom
