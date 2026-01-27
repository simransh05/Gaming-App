import React, { useContext, useState } from 'react'
import './navbar.css'
import RoutesDrawer from '../Drawer/RoutesDrawer/RoutesDrawer';
import { MdMenu } from "react-icons/md";
import Swal from 'sweetalert2';
import api from '../../utils/api';
import ROUTES from '../../constant/Route/route';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '../../context/UserContext';
import socket from '../../socket/socket';

function NavBar() {
    const [openMenu, setOpenMenu] = useState(false);
    const { setCurrentUser } = useContext(CurrentUserContext);
    const navigate = useNavigate();
    const logout = async () => {
        setOpenMenu(false);
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

    return (
        <div className='navbar'>

            <button onClick={() => setOpenMenu(true)} className='side-drawer'>
                <MdMenu className='menu-drawer' />
            </button>

            {openMenu &&
                <RoutesDrawer
                    open={() => setOpenMenu(true)}
                    onClose={() => setOpenMenu(false)}
                    onSuccess={logout}
                />
            }

        </div >
    )
}

export default NavBar
