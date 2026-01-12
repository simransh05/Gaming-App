import React, { useContext, useEffect, useState } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import socket from '../../socket/socket';
import './MyFriend.css'

function MyFriendModal({ onSuccess }) {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [friends, setFriends] = useState(null);
    const [activeUsers, setActiveUsers] = useState(null);

    useEffect(() => {
        const fetchFriends = async () => {
            if (loading) return;
            const userId = currentUser?._id;
            const res = await api.getFriends(userId)
            setFriends(res.data.myFriends || [])
        }
        fetchFriends();
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

    const handleClick = (id) => {
        onSuccess(id);
    }

    // console.log(friends, activeUsers)
    return (
        <div className='friends-info'>
            {/* <h1 sx={{textAlign:'center'}}>My Friends</h1> */}
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
