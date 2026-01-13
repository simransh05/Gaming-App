import React, { useContext, useEffect, useState } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import socket from '../../socket/socket';
import './MyFriend.css'
import { friendStore } from '../Zustand/Friends';

function MyFriendModal({ onSuccess }) {
    const [activeUsers, setActiveUsers] = useState(null);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const { friends } = friendStore();

    useEffect(() => {
        socket.emit('activeUsers');

        socket.on('active', (activeUser) => {
            setActiveUsers(activeUser)
        })

        return () => {
            socket.off('active');
        }
    }, [])

    const handleClick = (id) => {
        onSuccess(id);
    }

    const handleChange = (e) => {
        setSearch(e.target.value);
        // filter according to the name or the player id
    }

    // console.log(friends, activeUsers)
    return (
        <div className='friends-info'>
            <input type="text" onChange={handleChange} value={search} placeholder='Search by name or playerId' />
            <ul className='friend-list'>
                {friends === null || friends.length === 0 ? <div className='no-friend'>No Friend</div> : (
                    friends?.map((f, idx) => (
                        <li key={idx} className={activeUsers?.includes(f?._id) ? 'active-now' : 'not-active-now'}>
                            <span className='name-friend'>{f?.name}</span>
                            {activeUsers?.includes(f?._id) ?
                                <button onClick={() => handleClick(f._id)} className='active'>
                                    Send Invite
                                </button>
                                : <button disabled className='non-active'>
                                    Send Invite
                                </button>}
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}

export default MyFriendModal
