import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import socket from '../../socket/socket';

function MyFriendModal({ open, onClose }) {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [friends, setFriends] = useState(null);
    const [activeUsers, setActiveUsers] = useState(null);

    useEffect(() => {
        const fetchFriends = async () => {
            if (loading) return;
            const userId = currentUser?._id;
            const res = await api.getFriends(userId)
            // console.log(res.data)
            setFriends(res.data)
        }
        fetchFriends();
    }, [loading])

    useEffect(() => {
        socket.emit('activeUsers');

        socket.on('active', (activeUser) => {
            setActiveUsers(activeUser)
            console.log(activeUser)
        })

        return () => {
            socket.off('active');
        }
    }, [])
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>My Friends</DialogTitle>
            <DialogContent>
                {friends === null ? <div>No Friend</div> : (
                    friends?.map((f, idx) => (
                        <div key={idx}>
                            <span>{f?.name}</span>
                            {activeUsers.includes(f?._id) ?
                                <button>
                                    Active send Invite
                                </button>
                                : <button disabled>
                                    Not Active
                                </button>}
                            {/* if present in active set then show btn active and a btn ask to play */}
                            {/* else  */}
                        </div>
                    ))
                )}
            </DialogContent>
        </Dialog>
    )
}

export default MyFriendModal
