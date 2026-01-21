import React from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTES from '../../../constant/Route/route'
import { Drawer } from '@mui/material'
import './Routes.css'

function RoutesDrawer({ open, onClose }) {
    const navigate = useNavigate();

    const handleClick = (route) => {
        navigate(route);
        onClose();
    }
    return (
        <Drawer open={open} onClose={onClose} className='drawer-container'>
            <button onClick={() => handleClick(`${ROUTES.HOME}`)} className='drawer-home'>
                Home
            </button>

            <button onClick={() => handleClick(`${ROUTES.TOP_RANKING}`)} className='drawer-rank'>
                Leaderboard
            </button>

            <button onClick={() => handleClick(`${ROUTES.HISTORY}`)} className='drawer-history'>
                Your Match History
            </button>
        </Drawer >

    )
}

export default RoutesDrawer
