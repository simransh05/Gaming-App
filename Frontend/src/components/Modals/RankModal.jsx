import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import React, { useEffect, useState } from 'react'
import api from '../../utils/api'
import './Rank.css'

function RankModal({ open, onClose }) {

    const [ranking, setRanking] = useState(null)

    useEffect(() => {
        const fetchRank = async () => {
            const res = await api.getRanking();
            if (res.data.length === 0) {
                setRanking([]);
            } else {
                format(res.data);
            }
        }
        fetchRank()
    }, [])

    const format = (data) => {
        let rank = 0;
        let prev = null;
        let skip = 1;
        const formatted = data.map((d, idx) => {
            if (prev && d.percentage === prev.percentage && d.totalGames === prev.totalGames) {
                skip++;
            } else {
                rank = rank + skip;
                skip = 1;
            }
            const item = {
                ...d,
                rank: rank
            };

            prev = d;
            return item;
        })
        // console.log(formatted)
        setRanking(formatted);
    }

    // console.log(ranking)
    return (
        <Dialog open={open} onClose={onClose} className='modal-container'>
            <DialogTitle>
                Leaderboard
            </DialogTitle>

            <DialogContent>
                {ranking === null || ranking.length === 0 ? <div className='no-rank'> No leaderboard</div> :
                    <>
                        {ranking?.map((r, index) => (
                            <div key={index} className='ind-rank'>
                                <span className='rank-num'>{r.rank}</span>
                                <span className='rank-name'>{r.name}</span>
                            </div>
                        ))}
                    </>
                }

            </DialogContent>
        </Dialog>
    )
}

export default RankModal
