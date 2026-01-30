import React from 'react'
import { useEffect } from 'react'
import { CurrentUserContext } from '../../context/UserContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTES from '../../constant/Route/route'
import NavBar from '../../components/NavBar/NavBar'
import './Homepage.css'
import { useState } from 'react'
import CreateModal from '../../components/Modals/CreateModal'
import InviteModal from '../../components/Modals/InviteModal'
import socket from '../../socket/socket'
import rejectedInvite from '../../utils/helper/rejectedInvite'
import acceptFriend from '../../utils/helper/acceptFriend'
import refuseFriend from '../../utils/helper/refuseFriend'
import getInitial from '../../utils/helper/getInitial'
import { Avatar } from '@mui/material'
import Header from '../../components/Header/Header'
import { notificationStore } from '../../components/Zustand/Notification'

function HomePage() {
    const { currentUser, loading } = useContext(CurrentUserContext)
    const [showCreate, setShowCreate] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const { fetchNotification } = notificationStore();
    const navigate = useNavigate();
    useEffect(() => {
        // console.log('here', currentUser, loading, socket.connected)
        if (loading) return;
        if (!currentUser) return navigate(`${ROUTES.LOGIN}`);
        if (socket.connected) {
            console.log('here')
            socket.emit("register", currentUser._id);
        }
        fetchNotification(currentUser._id);

        // requestInvite(currentUser, navigate);
        rejectedInvite();
        acceptFriend();
        refuseFriend();
    }, [currentUser, loading])

    const handleSuccess = (roomId) => {
        // console.log(roomId)
        navigate(`${ROUTES.HOME}${roomId}`)
    }

    return (
        <>
            <Header />

            <div className="home-container">

                <NavBar />
                <div className="rules-container">

                    <h2>🎮 Tic-Tac-Toe Rules</h2>

                    <ul>
                        <li>
                            The game is played between <strong>two players only</strong>.
                            Each game room allows <strong>exactly 2 users</strong>, and once the room is full, no other player can join.
                        </li>

                        <li>
                            The board consists of a <strong>3 × 3 grid</strong>.
                            One player uses <strong>O</strong>, the other uses <strong>X</strong>.
                        </li>

                        <li>
                            Players take turns placing their mark in an empty cell.
                            You <strong>cannot overwrite</strong> an existing mark.
                        </li>

                        <li>
                            A player wins by placing <strong>three marks in a row</strong> —
                            horizontally, vertically, or diagonally.
                        </li>

                        <li>
                            If all cells are filled and no player wins,
                            the game ends in a <strong>draw</strong>.
                        </li>

                        <li>
                            If the match has already started and any player leaves the room,
                            the match <strong>ends automatically</strong> and the remaining player is <strong>declared the winner</strong>.
                        </li>

                        <li>
                            Only the player whose turn it is can make a move.
                            Invalid moves are ignored.
                        </li>
                    </ul>

                    <p className="tip">
                        💡 <strong>Tip:</strong> The first turn is decided by toss — so play smart and make every move count!
                    </p>
                </div>

                <div className="btn-room">
                    <button className='create-room' onClick={() => setShowCreate(true)}>Create Room</button>
                    {showCreate &&
                        <CreateModal
                            open={() => setShowCreate(true)}
                            onClose={() => setShowCreate(false)}
                            onSuccess={(roomId) => handleSuccess(roomId)}
                        />}

                    <button className='invite-room' onClick={() => setShowInvite(true)}>Join Invite Room</button>
                    {showInvite &&
                        <InviteModal
                            open={() => setShowInvite(true)}
                            onClose={() => setShowInvite(false)}
                            onSuccess={(roomId) => handleSuccess(roomId)}
                        />}
                </div>

            </div>
        </>
    )
}

export default HomePage
