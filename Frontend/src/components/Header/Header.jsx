import { Avatar } from '@mui/material'
import React, { useContext } from 'react'
import getInitial from '../../utils/helper/getInitial'
import { CurrentUserContext } from '../../context/UserContext'
import './Header.css'

function Header() {
    const { currentUser } = useContext(CurrentUserContext);
    const formatName = (name) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        // console.log(parts);
        return parts.map(p => p[0].toUpperCase() + p.slice(1)).join(" ")
    }

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
            </div>
        </div>
    )
}

export default Header
