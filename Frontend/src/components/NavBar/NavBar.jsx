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
import socket from '../../socket/socket';
import ROUTES from '../../constant/Route/route'
import { useEffect } from 'react';
import format from '../../utils/helper/formatRank';
function NavBar() {
    const navigate = useNavigate()
    const { currentUser, setCurrentUser, loading } = useContext(CurrentUserContext);
    const [ranking, setRanking] = useState(null)
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
            setCurrentUser(null);
            socket.disconnect();
            navigate(`${ROUTES.LOGIN}`);
        }
    };

    useEffect(() => {
        if (loading) return;
        const fetchRank = async () => {
            const res = await api.getRanking();
            if (res.data.length === 0) {
                setRanking([]);
            } else {
                const data = format(res.data);
                console.log(data);
                setRanking(data);
            }
        }
        fetchRank()
    }, [loading])

    console.log(ranking, currentUser)

    return (
        <div className='navbar'>
            <h1>Gaming Zone</h1>
            <div className="right-side">
                {/* add btn ranking */}
                {(!ranking || ranking.length === 0) ? <div className='my-rank'>No Rank</div> :
                    (
                        ranking.map((r, idx) => {
                            { console.log('here') }
                            { if(currentUser?._id === r.userId ) return <div key={idx} className='my-rank'>My Rank: {r.rank}</div> }
                        })
                    )}
                <button onClick={() => navigate(`${ROUTES.TOP_RANKING}`)} className='rank-btn'>Top Ranking</button>

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
