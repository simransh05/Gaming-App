import { Divider, Drawer } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import api from '../../../utils/api'
import { notificationStore } from '../../Zustand/Notification';
import { CurrentUserContext } from '../../../context/UserContext';
import './Notification.css'
import socket from '../../../socket/socket';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../constant/Route/route';

function Notification({ open, onClose }) {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const { notification, fetchNotification } = notificationStore();
    const [invite, setInvite] = useState(null);
    const [friend, setFriend] = useState(null);
    const navigate = useNavigate();
    // now we have notification
    console.log(notification);


    useEffect(() => {
        setInvite(notification?.invite)
        setFriend(notification?.friend)
    }, [notification])

    useEffect(() => {
        fetchNotification(currentUser?._id);
    }, [])

    const handleClick = (opponent, roomId) => {
        onClose();
        const me = currentUser._id;
        // on click accept do that 
        socket.emit('join', { roomId, opponent, me }, (res) => {
            console.log(res);
            const newInvite = invite.filter(d => d.opponent._id !== opponent);
            // console.log(newInvite);
            setInvite(newInvite);
            if (res.roomFull) {
                return Swal.fire({ title: 'Room is Full ' });
            } else if (res.joined) {
                navigate(`${ROUTES.HOME}${roomId}`)
            } else if (res.status === 408) {
                return Swal.fire({
                    title: "The room host has left",
                    text: "You’ve been returned to the home page.",
                    icon: "info",
                    showConfirmButton: false,
                    timer: 5000
                });
            }
        })
    }

    const handleFriendRequest = async (to) => {
        const from = currentUser?._id;
        socket.emit('accept-friend', { from, to })
        const newFriend = friend.filter(d => d._id !== to);
        // console.log(newFriend);
        setFriend(newFriend);
        await api.postFriend(from, to);
    }

    const handleReject = (opponent) => {
        socket.emit('reject-invite', { from: currentUser._id, to: opponent })
        // filter 
        const newInvite = invite.filter(d => d.opponent._id !== opponent);
        // console.log(newInvite);
        setInvite(newInvite);
    }

    const handleRejectFriend = (to) => {
        const from = currentUser?._id;
        socket.emit('refuse-friend', { from, to })
        const newFriend = friend.filter(d => d._id !== to);
        setFriend(newFriend);
    }

    // console.log(notification.length)

    return (
        <Drawer open={open} onClose={onClose} className="notify-drawer">
            <h1 className="notify-heading">Notification</h1>
            <div className="notify-sections">
                {notification.length != 0 && invite?.length !== 0 && (
                    <div className="notify-section">
                        <h3 className="invite-heading">Game Invite</h3>
                        <Divider className="divider" />
                        <div className="notify-container invite-container">
                            {invite?.map(n => (
                                <div key={n.opponent._id} className="single-notify">
                                    <span>{n.opponent.name}</span>
                                    <button onClick={() => handleClick(n.opponent._id, n.roomId)} className="accept-btn">Accept</button>
                                    <button onClick={() => handleReject(n.opponent._id)} className="reject-btn">Refuse</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {notification.length != 0 && friend?.length !== 0 && (
                    <div className="notify-section">
                        <h3 className="invite-heading">Friend Request</h3>
                        <Divider className="divider" />
                        <div className="notify-container friend-container">
                            {friend?.map(n => (
                                <div key={n._id} className="single-notify">
                                    <span>{n.name}</span>
                                    <button onClick={() => handleFriendRequest(n._id)} className="accept-btn">Accept</button>
                                    <button onClick={() => handleRejectFriend(n._id)} className="reject-btn">Refuse</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {(notification.length === 0 || (invite?.length === 0 && friend?.length === 0)) && (
                <div className="no-notify">No Notification</div>
            )}
        </Drawer>
    )
}

export default Notification
