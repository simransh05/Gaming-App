import { Drawer, Tab, Tabs } from '@mui/material'
import React from 'react'
import MyFriendModal from '../Modals/MyFriendModal'
import { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useContext } from 'react'
import { CurrentUserContext } from '../../context/UserContext'
import socket from '../../socket/socket'
import OtherOpponent from '../Opponent/OtherOpponent'

function OpponentDrawer({ open, onClose }) {
    const [tabName, setTabName] = useState('myFriend');
    const { roomId } = useParams();
    const { currentUser, loading } = useContext(CurrentUserContext);

    const handleClick = (_, value) => {
        setTabName(value);
    }

    useEffect(() => {
        if (loading) return;
    }, [loading])

    // console.log(currentUser._id , currentUser._id.toString())

    const handleFriend = (userId) => {
        const from = currentUser._id;
        // console.log('here')
        socket.emit('send-invite', { from, to: userId, roomId })
    }
    return (
        <Drawer open={open} onClose={onClose} >
            <Tabs value={tabName} onChange={handleClick} sx={{ margin: '5px' }}>
                <Tab value='myFriend' label='My Friends' />
                <Tab value='otherOppenent' label='Other Opponent' />
            </Tabs>

            {tabName === 'myFriend' && <MyFriendModal
                onSuccess={(userId) => handleFriend(userId)} />}

            {tabName === 'otherOppenent' &&
                <OtherOpponent
                    onSuccess={(userId) => handleFriend(userId)}
                />
            }
        </Drawer>
    )
}

export default OpponentDrawer
