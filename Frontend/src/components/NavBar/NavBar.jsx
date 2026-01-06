import React, { useState } from 'react'
import { FiLogOut } from "react-icons/fi";
import { useContext } from 'react';
import { CurrentUserContext } from '../../context/UserContext';
import './navbar.css'
import Swal from 'sweetalert2'
import { Avatar } from '@mui/material';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import RankModal from '../Modals/RankModal';
function NavBar() {
    const navigate = useNavigate()
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    const [rankModal, setRankModal] = useState(false);
    const getInitial = (name) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    const logout = async () => {
        const result = await Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            cancelButtonText: 'No',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            icon: 'warning',
            reverseButtons: true
        })
        if (result.isConfirmed) {
            await api.postLogout();
            setCurrentUser(null)
            navigate('/');
        }
    };

    return (
        <div className='navbar'>
            <h1>Gaming Zone</h1>
            <div className="right-side">
                {/* add btn ranking */}
                <button onClick={() => setRankModal(true)} className='rank-btn'>Top Ranking</button>
                {rankModal &&
                    <RankModal
                        open={() => setRankModal(true)}
                        onClose={() => setRankModal(false)}
                    />}
                <Avatar sx={{
                    width: '60px',
                    height: '60px',
                    background: 'black',
                    color: 'white'
                }} className='avatar-dp'>{getInitial(currentUser?.name)}</Avatar>
                <button onClick={logout} className='btn-logout'>
                    <FiLogOut className='logout' />
                </button>
            </div>
        </div >
    )
}

export default NavBar
