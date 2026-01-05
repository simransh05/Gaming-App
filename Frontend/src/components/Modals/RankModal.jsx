import { Dialog, DialogTitle } from '@mui/material'
import React, { useEffect, useState } from 'react'
import api from '../../utils/api'

function RankModal({ open, onClose }) {

    const [ranking, setRanking] = useState(null)

    useEffect(() => {
        const fetchRank = async () => {
            const res = await api.getRank();
            setRanking(res.data);
        }
        fetchRank()
        // get the rank
    }, [])
    // get the entire ranking 
    if (ranking === null) return <div>Loading....</div>;
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Leaderboard
            </DialogTitle>

            <DialogContent>
                {ranking?.map((r, index) => (
                    <div>
                        {/* s.no. */}
                        <span></span>
                        {/* name */}
                        <span>{r?.name}</span>
                    </div>
                ))}
            </DialogContent>
        </Dialog>
    )
}

export default RankModal
