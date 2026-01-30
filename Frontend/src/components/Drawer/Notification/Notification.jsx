import { Drawer } from '@mui/material'
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
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    // now we have notification
    console.log(notification.notification);


    useEffect(() => {
        setData(notification.notification)
    }, [notification])

    useEffect(() => {
        fetchNotification(currentUser?._id);
    },[])

    const handleClick = (roomId) => {
        onClose();
        // on click accept do that 
        socket.emit('join', { roomId }, (res) => {
            // console.log(res);
            if (res.roomFull) {
                return Swal.fire({ title: 'Room is Full ' });
            } else if (res.joined) {
                navigate(`${ROUTES.HOME}${roomId}`)
            }
        })
    }

    const handleReject = (opponent) => {
        socket.emit('reject-invite', { from: currentUser._id, to: opponent })
    }
    // idea is to show all person who send will the 2 btns if accept then do something if refuse do something
    return (
        <Drawer open={open} onClose={onClose} className='notify-drawer'>
            <h1>Notification</h1>
            {notification && data?.length != 0 ? data?.map((n, idx) => (
                <div key={n.opponent._id} className='single-notify'>
                    <span>{n.opponent.name}</span>
                    <button onClick={() => handleClick(n.roomId)}>Accept</button>
                    <button onClick={() => handleReject(n.opponent._id)}>Reject</button>
                </div>
            )) :
                <div className='no-nofify'>No Notification</div>
            }
        </Drawer>
    )
}

export default Notification
