import React, { useContext, useEffect, useMemo, useState } from 'react'
import api from '../../utils/api';
import { CurrentUserContext } from '../../context/UserContext';
import './History.css'
import formatDate from '../../utils/helper/FormatDate';
import NavBar from '../../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../constant/Route/route';
import { MenuItem, Select } from '@mui/material';

function History() {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [history, setHistory] = useState(null);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!currentUser) return navigate(`${ROUTES.LOGIN}`)
    }, [loading, currentUser])

    console.log(loading)

    useEffect(() => {
        if (loading) return;
        const fetchData = async () => {
            console.log('here')
            const res = await api.getIndividualHistory(currentUser?._id);
            console.log(res)
            if (res.status === 200 && res.data.individual.length > 1) {
                console.log(res.data.individual)
                setHistory(res.data.individual);
            } else {
                setHistory([]);
            }
        }
        fetchData();
    }, [loading, currentUser?._id])

    const filteredHistory = useMemo(() => {
        // if (!history) return;
        let data = history;

        // 🔍 SEARCH FILTER
        if (search.trim()) {
            const lower = search.toLowerCase();
            data = data.filter(h => {
                const opponent =
                    h.playerI._id === currentUser._id ? h.playerII : h.playerI;

                return (
                    opponent.name.toLowerCase().includes(lower) ||
                    String(opponent.playerId).includes(lower) ||
                    opponent.email.toLowerCase().includes(lower)
                );
            });
        }

        // 🎯 SELECT FILTER
        if (selected !== "all") {
            data = data.filter(h => {
                const winner = h.history.winner;
                if (selected === "draw") return winner === null;
                if (selected === "win") return winner === currentUser._id;
                if (selected === "lose") return winner && winner !== currentUser._id;
            });
        }

        return data;
    }, [search, selected, currentUser?._id]);


    console.log(history);

    return (
        <>
            <NavBar />
            <div className='history-container'>
                {history && history.length > 0 &&
                    <div className='search-parent'>
                        <Select value={selected} onChange={(e) => setSelected(e.target.value)} className='select-option'>
                            <MenuItem value="all">All history</MenuItem>
                            <MenuItem value='win'>You Win</MenuItem>
                            <MenuItem value="lose">You Lose</MenuItem>
                            <MenuItem value="draw">Draw</MenuItem>
                        </Select>

                        <input type="text" onChange={(e) => setSearch(e.target.value)} placeholder='search by name' />
                    </div>
                }
                <table className='table-history'>
                    {(!history || history.length === 0) &&
                        <caption className='caption-history'>
                            No History
                        </caption>
                    }
                    {history && history.length > 0 && (
                        <>
                            <thead className='history-head'>
                                <tr className='value'>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>PlayerId</th>
                                    <th>Date</th>
                                    <th>Winner</th>
                                </tr>
                            </thead>
                            <tbody className='history-body'>
                                {filteredHistory ? filteredHistory?.map((h, idx) => (
                                    <tr className="value" key={idx}>
                                        <td className="name">{h.playerI._id === currentUser._id ? h.playerII.name : h.playerI.name}</td>
                                        <td>{h.playerI._id === currentUser._id ? h.playerII.email : h.playerI.email}</td>
                                        <td>{h.playerI._id === currentUser._id ? h.playerII.playerId : h.playerI.playerId}</td>
                                        <td>{formatDate(h.history.playedAt)}</td>
                                        <td className={h.history.winner === currentUser._id ? 'Win' : h.history.winner === null ? 'Draw' : 'Lose'}>
                                            {h.history.winner === currentUser._id ? 'You Win' : h.history.winner === null ? 'Draw' : 'You Lose'}
                                        </td>
                                    </tr>
                                )) :
                                    history?.map((h, idx) => (
                                        <tr className="value" key={idx}>
                                            <td className="name">{h.playerI._id === currentUser._id ? h.playerII.name : h.playerI.name}</td>
                                            <td>{h.playerI._id === currentUser._id ? h.playerII.email : h.playerI.email}</td>
                                            <td>{h.playerI._id === currentUser._id ? h.playerII.playerId : h.playerI.playerId}</td>
                                            <td>{formatDate(h.history.playedAt)}</td>
                                            <td className={h.history.winner === currentUser._id ? 'Win' : h.history.winner === null ? 'Draw' : 'Lose'}>
                                                {h.history.winner === currentUser._id ? 'You Win' : h.history.winner === null ? 'Draw' : 'You Lose'}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </>
                    )}
                </table>

                <button className='home-back' onClick={() => navigate(`${ROUTES.HOME}`)}>
                    Back to home
                </button>

            </div>
        </>
    )
}

export default History
