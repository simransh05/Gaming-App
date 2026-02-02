import { Avatar } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import getInitial from '../../utils/helper/getInitial'
import { CurrentUserContext } from '../../context/UserContext'
import './Header.css'
import { IoNotifications } from "react-icons/io5";
import socket from '../../socket/socket'
import Notification from '../Drawer/Notification/Notification'
import { notificationStore } from '../Zustand/Notification'

function Header() {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [number, setNumber] = useState(null);
    const [notifyDrawer, setNotifyDrawer] = useState(false);
    const { notification, fetchNotification } = notificationStore();
    const formatName = (name) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        // console.log(parts);
        return parts.map(p => p[0].toUpperCase() + p.slice(1)).join(" ")
    }

    useEffect(() => {
        if (loading) return;
        if (!currentUser) return;
        setNumber(notification?.length)
        // get the notify if any user send request ..prev prev+1
    }, [currentUser?._id, loading, notification])
    // console.log(notification)

    useEffect(() => {
        socket.on('receive-invite', ({ from }) => {
            // find if there 

            // console.log(from)
            const have = notification?.some(u => u.opponent._id === from);
            if (!have) {
                setNumber(prev => prev + 1)
            }
            console.log(have);
        })
        socket.on('you-refuse', () => {
            setNumber(prev => prev - 1)
        })
        return () => {
            socket.off('receive-invite');
            socket.off('you-refuse')
        }
    }, [notification])

    return (
        <div className='header-container'>
            <h2 className="title">Gaming Zone</h2>
            <div className="user-info-avatar">
                <Avatar sx={{
                    width: '60px',
                    height: '60px',
                    background: '#F59E0B',
                    color: 'white'
                }} className='avatar-dp'>{getInitial(currentUser?.name)}</Avatar>
                <div className='header-user-name'>Hi! Welcome {formatName(currentUser?.name)}</div>
                <div className="parent">
                    <IoNotifications className='notification' onClick={() => setNotifyDrawer(true)} />
                    {number > 0 &&
                        <div className="child-num">{number}</div>
                    }
                </div>

                {notifyDrawer &&
                    <Notification
                        open={() => setNotifyDrawer(true)}
                        onClose={() => setNotifyDrawer(false)}
                    />
                }

            </div>
        </div>
    )
}

export default Header
