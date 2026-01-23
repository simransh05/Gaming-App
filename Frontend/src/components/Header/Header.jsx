import { Avatar } from '@mui/material'
import React, { useContext } from 'react'
import getInitial from '../../utils/helper/getInitial'
import { CurrentUserContext } from '../../context/UserContext'
import './Header.css'

const formatName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1, name.length);
}

function Header() {
    const { currentUser } = useContext(CurrentUserContext);
    return (
        <div className='header-container'>
            <h2 className="title">Gaming Zone</h2>
            <div className="user-info-avatar">
                <Avatar sx={{
                    width: '60px',
                    height: '60px',
                    background: 'lightGreen',
                    color: 'white'
                }} className='avatar-dp'>{getInitial(currentUser?.name)}</Avatar>
                <div className='header-user-name'>Hi! Welcome {formatName(currentUser?.name)}</div>
            </div>
        </div>
    )
}

export default Header
