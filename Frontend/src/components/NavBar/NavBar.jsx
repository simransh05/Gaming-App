import React from 'react'
import { FiLogOut } from "react-icons/fi";
import { useContext } from 'react';
import { CurrentUserContext } from '../../context/UserContext';
import './navbar.css'
import Swal from 'sweetalert2'
import { Avatar } from '@mui/material';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
function NavBar() {
    const navigate = useNavigate()
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
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
                <Avatar sx={{ width: '80px', height: '80px' ,backgroundColor:'black' ,color:'white'}}>{getInitial(currentUser?.name)}</Avatar>
                <button onClick={logout} className='btn-logout'>
                    <FiLogOut className='logout' />
                </button>
            </div>

        </div>
    )
}

export default NavBar
