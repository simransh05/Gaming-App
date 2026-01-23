import React, { useState } from 'react'
import './navbar.css'
import RoutesDrawer from '../Drawer/RoutesDrawer/RoutesDrawer';
import { MdMenu } from "react-icons/md";

function NavBar() {
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <div className='navbar'>

            <button onClick={() => setOpenMenu(true)} className='side-drawer'>
                <MdMenu className='menu-drawer'/>
            </button>

            {openMenu &&
                <RoutesDrawer
                    open={() => setOpenMenu(true)}
                    onClose={() => setOpenMenu(false)}
                />
            }

        </div >
    )
}

export default NavBar
