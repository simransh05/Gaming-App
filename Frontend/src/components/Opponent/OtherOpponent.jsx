import React from 'react'
import { useEffect } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import { useContext } from 'react'
import { useState } from 'react'
import socket from '../../socket/socket'
import { friendStore } from '../Zustand/Friends'
import { userStore } from '../Zustand/AllUsers'

function OtherOpponent({ onSuccess }) {
    const { currentUser } = useContext(CurrentUserContext);
    const [activeUsers, setActiveUsers] = useState(null);
    const { friends } = friendStore();
    const { allUsers } = userStore();
    const [search, setSearch] = useState('');

    useEffect(() => {
        socket.emit('activeUsers');

        socket.on('active', (activeUser) => {
            setActiveUsers(activeUser)
        })

        return () => {
            socket.off('active');
        }
    }, [])

    const friendIds = new Set(friends?.map(f => f._id));

    const handleFriend = async (id) => {
        await api.postFriend(currentUser._id, id);
        friendIds.add(id);
        socket.emit('askFriend', { from: currentUser._id, to: id })
    }

    const handleClick = (id) => {
        onSuccess(id);
    }
    console.log(activeUsers, allUsers, currentUser._id);

    const handleChange = (e) => {
        setSearch(e.target.value)
        // display according to filter by playerid who's start with the same char display the 
        // result not the entire thing 
    }
    return (
        <div>
            <input type="text" onChange={handleChange} value={search} placeholder='Search by playerId' />
            <ul>
                {allUsers && allUsers?.map((u, idx) => (
                    <li key={idx} className={activeUsers?.includes(u._id) ? 'active-now' : 'not-active-now'}>
                        <span className='name-friend'>{u.name}</span>
                        {activeUsers?.includes(u._id) ?
                            <button onClick={() => handleClick(u._id)} className='active'>
                                Send Invite
                            </button>
                            : <button disabled className='non-active'>
                                Send Invite
                            </button>
                        }
                        {friendIds.has(u._id) ? <button disabled>Friend</button> :
                            <button onClick={() => handleFriend(u._id)}>Ask to be friend</button>
                        }
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default OtherOpponent
