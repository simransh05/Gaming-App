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
    const [notify, setNotify] = useState(null);
    const navigate = useNavigate();
    // now we have notification
    console.log(notification);


    useEffect(() => {
        setNotify(notification)
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
            // get new notification in res 
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
        // get in res the new data if want 
        // const newFriend = friend.filter(d => d._id !== to);
        // // console.log(newFriend);
        // setFriend(newFriend);
        await api.postFriend(from, to);
    }

    const handleReject = (opponent) => {
        socket.emit('reject-invite', { from: currentUser._id, to: opponent })
        // get the new in res then filter and set status here 
        // // filter 
        // const newInvite = invite.filter(d => d.opponent._id !== opponent);
        // // console.log(newInvite);
        // setInvite(newInvite);
    }

    const handleRejectFriend = (to) => {
        const from = currentUser?._id;
        socket.emit('refuse-friend', { from, to })
        // same for this get in res 
        // const newFriend = friend.filter(d => d._id !== to);
        // setFriend(newFriend);
    }

    // console.log(notification.length)

    // same table logic max-width of the span text is 120px

    return (
        <Drawer open={open} onClose={onClose} className="notify-drawer">
            <h1 className="notify-heading">Notification</h1>
            <div className="notify-sections">
                {notification.length != 0 ? notify?.map((n, idx) => (
                    n.roomId ?
                        <div className="notify-section" key={n._id}>
                            <div className="notify-container invite-container">
                                <div key={n.opponent._id} className="single-notify">
                                    <span>{n.opponent.name} send you game invite</span>
                                    <button onClick={() => handleClick(n.opponent._id, n.roomId)} className="accept-btn">Accept</button>
                                    <button onClick={() => handleReject(n.opponent._id)} className="reject-btn">Refuse</button>
                                </div>
                            </div>
                        </div>
                        :
                        <div className="notify-section" key={n._id}>
                            <div className="notify-container friend-container">

                                <div key={n.requests._id} className="single-notify">
                                    <span>{n.requests.name} send you friend request</span>
                                    <button onClick={() => handleFriendRequest(n.requests._id)} className="accept-btn">Accept</button>
                                    <button onClick={() => handleRejectFriend(n.requests._id)} className="reject-btn">Refuse</button>
                                </div>

                            </div>
                        </div>
                )) :
                    <div className="no-notify">No Notification</div>
                }
            </div>
        </Drawer>
    )
}

export default Notification
