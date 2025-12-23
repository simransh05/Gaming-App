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

function HomePage() {
    const { currentUser } = useContext(CurrentUserContext)
    const [showCreate, setShowCreate] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const navigate = useNavigate()
    useEffect(() => {
        if (!currentUser) navigate(`${ROUTES.LOGIN}`)
    }, [currentUser])
    return (
        <>
            {/* navbar */}
            <NavBar />
            {/* rules and regulation */}
            <div className="rules-container">
                <h2>🎮 Tic-Tac-Toe Rules</h2>

                <ul>
                    <li>
                        The game is played between <strong>two players only</strong>.
                        Each game room allows <strong>exactly 2 users</strong>.
                    </li>

                    <li>
                        Once two players join a room, no other user can enter that room.
                    </li>

                    <li>
                        The board consists of a <strong>3 × 3 grid</strong>.
                        One player uses <strong>X</strong>, the other uses <strong>O</strong>.
                    </li>

                    <li>
                        The game starts when <strong>any one player presses the “Play” button</strong>.
                        The player who presses the Play button gets the <strong>first turn</strong>.
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
                        If any player leaves the room during the game,
                        the match <strong>ends automatically</strong>.
                    </li>

                    <li>
                        Only the player whose turn it is can make a move.
                        Invalid moves are ignored.
                    </li>
                </ul>

                <p className="tip">
                    💡 <strong>Tip:</strong> Pressing the Play button early gives you the first move —
                    but strategy matters more than speed!
                </p>
            </div>

            <div className="btn-room">
                <button className='create-room' onClick={() => setShowCreate(true)}>Create Invite</button>
                {showCreate &&
                    <CreateModal
                        open={() => setShowCreate(true)}
                        onClose={() => setShowCreate(false)}
                    />}
                <button className='invite-room' onClick={() => setShowInvite(true)}>Join Invite Room</button>
                {showInvite &&
                    <InviteModal
                        open={() => setShowInvite(true)}
                        onClose={() => setShowInvite(false)}
                    />}
            </div>

        </>
    )
}

export default HomePage
