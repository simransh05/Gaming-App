import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import socket from '../../socket/socket';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../constant/Route/route';
import './MyFriend.css'

function MyFriendModal({ open, onClose, onSuccess }) {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [friends, setFriends] = useState(null);
    const [activeUsers, setActiveUsers] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchFriends = async () => {
            if (loading) return;
            const userId = currentUser?._id;
            const res = await api.getFriends(userId)
            console.log(res.data)
            setFriends(res.data.myFriends || [])
        }
        fetchFriends();
    }, [loading])

    useEffect(() => {
        socket.emit('activeUsers');

        socket.on('active', (activeUser) => {
            setActiveUsers(activeUser)
            console.log(activeUser)
        })

        socket.on('joined-room', (roomId) => {
            navigate(`${ROUTES.HOME}/${roomId}`)
        });

        return () => {
            socket.off('active');
            socket.off('joined-room');
        }
    }, [])

    const handleClick = (id) => {
        onSuccess(id);
        onClose();
    }

    console.log(friends)
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>My Friends</DialogTitle>
            <DialogContent>
                {friends === null || friends.length === 0 ? <div>No Friend</div> : (
                    friends?.map((f, idx) => (
                        <div key={idx} className='ind-friend'>
                            <span className='name-friend'>{f?.name}</span>
                            {activeUsers.includes(f?._id) ?
                                <button onClick={() => handleClick(f._id)} className='active'>
                                    Active send Invite
                                </button>
                                : <button disabled className='non-active'>
                                    Not Active
                                </button>}
                        </div>
                    ))
                )}
            </DialogContent>
        </Dialog>
    )
}

export default MyFriendModal
