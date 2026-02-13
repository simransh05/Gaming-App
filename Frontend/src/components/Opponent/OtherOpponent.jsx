import React from 'react'
import { useEffect } from 'react'
import api from '../../utils/api'
import { CurrentUserContext } from '../../context/UserContext'
import { useContext } from 'react'
import { useState } from 'react'
import socket from '../../socket/socket'
import { friendStore } from '../Zustand/Friends'
import { userStore } from '../Zustand/AllUsers'
import './otherOpponent.css'
import { useParams } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'

function OtherOpponent({ onSuccess }) {
    const { currentUser } = useContext(CurrentUserContext);
    const [activeUsers, setActiveUsers] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [friendIds, setFriendIds] = useState(null);
    const { friends, fetchFriends } = friendStore();
    const { allUsers } = userStore();
    const [search, setSearch] = useState('');
    const { roomId } = useParams();

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
        fetchFriends(currentUser?._id)
        socket.emit('askFriend', { from: currentUser._id, to: id, roomId })
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
                <FaSearch className='search-icon' />
                <input type="text" onChange={handleChange} value={search} placeholder='Search by playerId' className='input-friend' />
            </div>
            <table className='opponent-table'>
                <tbody>
                    {search && searchResult.length > 0 ? (
                        searchResult.map((u, idx) => (
                            <tr key={idx}>
                                <td className='status space'>
                                    <span className={activeUsers?.includes(u._id) ? 'active-now' : 'not-active-now'}></span>
                                </td>
                                <td className='name-friend space'>{u.name}</td>

                                <td className='space'>
                                    <button
                                        onClick={() => handleClick(u._id)}
                                        disabled={!activeUsers?.includes(u._id)}
                                        className={activeUsers?.includes(u._id) ? 'active-opp' : 'non-active-opp'}
                                    >
                                        Send Invite
                                    </button>
                                </td>

                                <td className='space'>
                                    <button
                                        onClick={() => handleFriend(u._id)}
                                        disabled={friendIds.has(u._id) || !activeUsers?.includes(u._id)}
                                        className={
                                            friendIds.has(u._id)
                                                ? 'other-non-active'
                                                : activeUsers?.includes(u._id)
                                                    ? 'other-friend'
                                                    : 'other-non-active'
                                        }
                                    >
                                        {friendIds.has(u._id) ? 'Friend' : 'Add Friend'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-search-found">
                                {search ? "No search found" : "Start typing to search"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

        </div>
    )
}

export default OtherOpponent
