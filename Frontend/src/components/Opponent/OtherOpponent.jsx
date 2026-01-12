import React from 'react'
import { useEffect } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import { useContext } from 'react'
import { useState } from 'react'
import socket from '../../socket/socket'

function OtherOpponent({ onSuccess }) {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [users, setUsers] = useState(null);
    const [activeUsers, setActiveUsers] = useState(null);
    const [friends, setFriends] = useState(null);

    useEffect(() => {
        if (loading) return;
        const fetchData = async () => {
            const res = await api.getAllUsers(currentUser?._id);
            const res1 = await api.getFriends(currentUser?._id)
            setFriends(res1.data.myFriends || [])
            console.log(res.data)
            if (res.data.length != 0) {
                setUsers(res.data);
            } else {
                setUsers([])
            }
        }
        fetchData();
    }, [loading])

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
        await api.postFriend(currentUser._id, id)
        // socket.emit('askFriend')
    }

    const handleClick = (id) => {
        onSuccess(id);
    }

    console.log(activeUsers, users, currentUser._id);
    return (
        <div>
            <ul>
                {users && users?.map((u, idx) => (
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

            {/* if active users then dot accordingly  */}
        </div>
    )
}

export default OtherOpponent
