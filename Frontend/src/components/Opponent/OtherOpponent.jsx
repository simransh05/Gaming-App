import React from 'react'
import { useEffect } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import { useContext } from 'react'
import { useState } from 'react'
import socket from '../../socket/socket'
import { friendStore } from '../Zustand/Friends'
import { userStore } from '../Zustand/AllUsers'
import './OtherOpponent.css'

function OtherOpponent({ onSuccess }) {
    const { currentUser } = useContext(CurrentUserContext);
    const [activeUsers, setActiveUsers] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [friendIds, setFriendIds] = useState(null);
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

    useEffect(() => {
        if (!friends) return;

        setFriendIds(new Set(friends.map(f => f._id)));
    }, [friends]);


    const handleFriend = async (id) => {
        await api.postFriend(currentUser._id, id);
        setFriendIds(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
        socket.emit('askFriend', { from: currentUser._id, to: id })
    }

    // console.log(search)

    const handleClick = (id) => {
        onSuccess(id);
    }
    // console.log(activeUsers, allUsers, currentUser._id);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        let lowerSearch = value.toLowerCase();
        // console.log(lowerSearch)
        const result = allUsers.filter(f => String(f.playerId).includes(lowerSearch));
        // console.log('search result', result);
        setSearchResult(result)
    }
    return (
        <div className='other-opponent-container'>
            <div className="input-box">
                <input type="text" onChange={handleChange} value={search} placeholder='Search by playerId' className='input-friend' />
            </div>
            <ul>
                {search && searchResult.length > 0 ? searchResult?.map((u, idx) => (
                    <li key={idx} className={activeUsers?.includes(u._id) ? 'active-now' : 'not-active-now'}>
                        <span className='name-friend'>{u.name}</span>
                        {activeUsers?.includes(u._id) ?
                            <button onClick={() => handleClick(u._id)} className='active-opp'>
                                Send Invite
                            </button>
                            : <button disabled className='non-active-opp'>
                                Send Invite
                            </button>
                        }
                        {friendIds.has(u._id) ? <button disabled className='other-non-active'>Friend</button> :
                            <>
                                {activeUsers?.includes(u._id) ? <button onClick={() => handleFriend(u._id)} className='other-friend'>Ask to be friend</button> :
                                    <button onClick={() => handleFriend(u._id)} disabled className='other-non-active'>Ask to be friend</button>}
                            </>
                        }
                    </li>
                )
                ) : (
                    search && <div className="no-search-found">
                        No search found
                    </div>
                )
                }
            </ul>
        </div>
    )
}

export default OtherOpponent
