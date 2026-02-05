import React, { useContext, useEffect, useState } from 'react'
import api from '../../utils/api'
import './Rank.css'
import NavBar from '../NavBar/NavBar'
import format from '../../utils/helper/formatRank'
import { useNavigate } from 'react-router-dom'
import { CurrentUserContext } from '../../context/UserContext'
import ROUTES from '../../constant/Route/route'

function RankModal() {
    const navigate = useNavigate();
    const { currentUser, loading } = useContext(CurrentUserContext);
    const [ranking, setRanking] = useState(null)

    useEffect(() => {
        if (loading) return;
        if (!currentUser) return navigate(`${ROUTES.LOGIN}`)
    }, [loading, currentUser])

    useEffect(() => {
        const fetchRank = async () => {
            const res = await api.getRanking();
            if (res.data.length === 0) {
                setRanking([]);
            } else {
                const data = format(res.data);
                // console.log(data);
                setRanking(data);
            }
        }
        fetchRank()
    }, [])

    // console.log(ranking)
    return (
        <div className='rank-full'>
            <NavBar />
            <div className='modal-container'>
                <h1 className='rank-heading'>
                    Leaderboard
                </h1>

                <table className="leaderboard">
                    <caption className="no-rank">
                        {(!ranking || ranking?.length === 0) && "No leaderboard"}
                    </caption>

                    <thead className='header-table'>
                        <tr className='ind-rank'>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Player Id</th>
                            <th>Total Win</th>
                            <th>Total Lose</th>
                            <th>Draw</th>
                        </tr>
                    </thead>

                    <tbody className='body-table'>
                        {ranking?.map((r, index) => (
                            <tr key={index} className='ind-rank'>
                                <td>{r.rank}</td>
                                <td>{r.name}</td>
                                <td>{r.playerId}</td>
                                <td>{r.totalWins}</td>
                                <td>{r.totalLose}</td>
                                <td>{r.totalDraw}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default RankModal
