import { Drawer, Tab, Tabs } from '@mui/material'
import React from 'react'
import MyFriendModal from '../Modals/MyFriendModal'
import { useState } from 'react'

function OpponentDrawer({ open, onClose, onSuccess }) {
    const [tabName, setTabName] = useState('myFriend') 

    const handleClick = (_, value) => {
        setTabName(value);
    }
    return (
        <Drawer open={open} onClose={onClose} >
            <Tabs value={tabName} onChange={handleClick}>
                <Tab value='myFriend' label='My Friends' />
                <Tab value='otherOppenent' label='Other Opponent' />
            </Tabs>

            {tabName === 'myFriend' && <MyFriendModal />}
        </Drawer>
    )
}

export default OpponentDrawer
