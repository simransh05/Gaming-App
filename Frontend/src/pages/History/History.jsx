import React, { useContext, useEffect, useState } from 'react'
import api from '../../utils/api';
import { CurrentUserContext } from '../../context/UserContext';
import './History.css'
import formatDate from '../../utils/helper/FormatDate';
import NavBar from '../../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../constant/Route/route';

function History() {
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [history, setHistory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        const fetchData = async () => {
            const res = await api.getIndividualHistory(currentUser?._id);
            if (res.status === 200 || res.data.length > 1) {
                setHistory(res.data.individual);
            } else {
                setHistory([]);
            }
        }
        fetchData();
    }, [loading])

    console.log(history);

    return (
        <>
            <NavBar />
            <div className='history-container'>
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
                                {history?.map((h, idx) => (
                                    <tr className="value" key={idx}>
                                        <td className="name">{h.playerI._id === currentUser._id ? h.playerII.name : h.playerI.name}</td>
                                        <td>{h.playerI._id === currentUser._id ? h.playerII.email : h.playerI.email}</td>
                                        <td>{h.playerI._id === currentUser._id ? h.playerII.playerId : h.playerI.playerId}</td>
                                        <td>{formatDate(h.history.playedAt)}</td>
                                        <td className={h.history.winner === currentUser._id ? 'Win' : h.history.winner === null ? 'Draw' : 'Lose'}>{h.history.winner === currentUser._id ? 'You Win' : h.history.winner === null ? 'Draw' : 'You Lose'}</td>
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
