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
        let updated = false;
        const data = notify.map(n => {
            if (!updated && n.opponent && n.opponent._id === opponent) {
                updated = true;
                return { ...n, status: "Accepted" };
            }
            return n;
        });
        setNotify(data);
    }

    const handleFriendRequest = async (to) => {
        const from = currentUser?._id;
        socket.emit('accept-friend', { from, to });
        let updated = false;
        const data = notify.map(n => {
            if (!updated && n.requests && n.requests._id === to) {
                updated = true;
                return { ...n, status: "Accepted" };
            }
            return n;
        });
        setNotify(data);
        // get in res the new data if want 
        // const newFriend = friend.filter(d => d._id != to);
        // // console.log(newFriend);
        // setFriend(newFriend);
        await api.postFriend(from, to);
    }

    const handleReject = (opponent) => {
        socket.emit('reject-invite', { from: currentUser._id, to: opponent })
        // get the new in res then filter and set status here 
        // // filter 
        let updated = false;
        const data = notify.map(n => {
            if (!updated && n.opponent && n.opponent._id === opponent) {
                updated = true;
                return { ...n, status: "Rejected" };
            }
            return n;
        });
        setNotify(data);
        // const newInvite = invite.filter(d => d.opponent._id != opponent);
        // // console.log(newInvite);
        // setInvite(newInvite);
    }

    const handleRejectFriend = (to) => {
        const from = currentUser?._id;
        socket.emit('refuse-friend', { from, to });
        let updated = false;
        const data = notify.map(n => {
            if (!updated && n.requests && n.requests._id === to) {
                updated = true;
                return { ...n, status: "Rejected" };
            }
            return n;
        });
        setNotify(data);
        // same for this get in res 
        // const newFriend = friend.filter(d => d._id != to);
        // setFriend(newFriend);
    }

    const handleClearClick = async () => {
        const res = await api.deleteNotification(currentUser?._id);
        console.log(res)
        if (res.status === 200) {
            setNotify([])
        }
    }
    // console.log(notification.length)

    // same table logic max-width of the span text is 120px

    return (
        <Drawer open={open} onClose={onClose} className="notify-drawer" anchor='right'>
            <div className="notify-body">
                <h1 className="notify-heading">Notification</h1>
                <div className="notify-scroll">
                    <table className="notify-sections">
                        <tbody>
                            {notify?.length != 0 ? (
                                <>
                                    {notify?.map((n, idx) =>
                                        n.roomId ?
                                            n.status != "" ? (
                                                <tr key={idx} className="single-notify">
                                                    <td className='after-text' colSpan={2}>{n.opponent.name} sent you a game invite</td>
                                                    <td className='status-info'>{n.status}</td>
                                                </tr>
                                            ) :
                                                (

                                                    // here add the status too if status then show status else this 
                                                    <tr key={idx} className="single-notify">
                                                        <td className='text'>{n.opponent.name} sent you a game invite</td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleClick(n.opponent._id, n.roomId)}
                                                                className="accept-btn"
                                                            >
                                                                Accept
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleReject(n.opponent._id)}
                                                                className="reject-btn"
                                                            >
                                                                Refuse
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ) :
                                            n.status != "" ? (
                                                <tr key={idx} className="single-notify">
                                                    <td className='after-text' colSpan={2}>{n.requests.name} sent you a friend request</td>
                                                    <td className='status-info'>{n.status}</td>
                                                </tr>
                                            ) :
                                                (
                                                    <tr key={idx} className="single-notify">
                                                        <td className='text'>{n.requests.name} sent you a friend request</td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleFriendRequest(n.requests._id)}
                                                                className="accept-btn"
                                                            >
                                                                Accept
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleRejectFriend(n.requests._id)}
                                                                className="reject-btn"
                                                            >
                                                                Refuse
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                    )}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan="3" className="no-notify">
                                        No Notification
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {notification?.length > 0 &&
                    <div className="clear">
                        <button className="clear-notify" onClick={handleClearClick}>
                            Clear Notification
                        </button>
                    </div>}
            </div>
        </Drawer >
    )
}

export default Notification
