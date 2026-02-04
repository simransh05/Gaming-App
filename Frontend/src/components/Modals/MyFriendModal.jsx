import React, { useContext, useEffect, useState } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import socket from '../../socket/socket';
import './MyFriend.css'
import { friendStore } from '../Zustand/Friends';
import { FaSearch } from "react-icons/fa";

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
        const value = e.target.value;
        setSearch(value);
        let lowerSearch = value.toLowerCase();
        // console.log(lowerSearch)
        const result = friends.filter(f => f.email.toLowerCase().includes(lowerSearch) ||
            String(f.playerId).includes(lowerSearch));
        // console.log('search result', result);
        setSearchResult(result);
    }

    // console.log(friends)
    return (
        <div className='friends-info'>
            <div className="input-box">
                <FaSearch className='search-icon'/>
                <input type="text" onChange={handleChange} value={search} placeholder='Search by email or playerId' className='input-friend' />
            </div>
            <ul className='friend-list'>
                {friends === null || friends.length === 0 ? <div className='no-friend'>No Friend</div> : (
                    !search ? friends?.map((f, idx) => (
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
                    )) :
                        (search && searchResult.length > 0) ? (
                            searchResult?.map((f, idx) => (
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
                        ) :
                            search && <div className="no-search-found">
                                No search found
                            </div>
                )}
            </ul>
        </div>
    )
}

export default MyFriendModal
