import { Drawer } from '@mui/material'
import React from 'react'

function Notification({ open, onClose }) {

    // idea is to store the every notification get that store in backend then get that 
    // each have 2 btn accept reject (same logic accept reject)
    // if accept close the drawer and if reject stay open

    // idea is to show all person who send will the 2 btns if accept then do something if refuse do something
    return (
        <Drawer open={open} onClose={onClose}>
        </Drawer>
    )
}

export default Notification
