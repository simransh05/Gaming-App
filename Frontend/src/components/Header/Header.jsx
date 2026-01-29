import { Avatar } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import getInitial from '../../utils/helper/getInitial'
import { CurrentUserContext } from '../../context/UserContext'
import './Header.css'
import { IoNotifications } from "react-icons/io5";
import socket from '../../socket/socket'
import Notification from '../Drawer/Notification/Notification'

function Header() {
    const { currentUser } = useContext(CurrentUserContext);
    const [number, setNumber] = useState(null);
    const [notifyDrawer, setNotifyDrawer] = useState(false);
    const formatName = (name) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        // console.log(parts);
        return parts.map(p => p[0].toUpperCase() + p.slice(1)).join(" ")
    }

    useEffect(() => {
        if (!currentUser?._id) return;
        socket.emit('getNotification', { userId: currentUser._id }, (res) => {
            console.log(res);
            setNumber(res?.number?.length)
        })
    }, [currentUser?._id])

    console.log(number)

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
