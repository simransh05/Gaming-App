import { Drawer } from '@mui/material'
import React from 'react'
import './prevDrawer.css'

function PreviewDrawer({ open, onClose, prevData, players }) {
    // console.log(prevData);
    const sorted = [...prevData].sort((a, b) => {
        if (a == null || a.move == null) return 1;
        if (b == null || b.move == null) return -1;
        return a.move - b.move;
    });
    // console.log(sorted, players)

    const getNameBySymbol = (userId) => {
        return players.find(p => p._id === userId)?.name;
    };

    const formatIndex = (index) => {
        // idea is 1(row)*3(col)
        const row = Math.floor(index / 3) + 1
        const col = (index % 3) + 1
        return row + " X " + col;
    }


    // sort by the moves prevData = symbols and the move 
    return (
        <Drawer open={open} onClose={onClose}
            PaperProps={{
                sx: {
                    width: '200px',
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                },
            }}>
            <table className='table-drawer'>
                <thead>
                    <tr className='prev-drawer'>
                        <th>Move</th>
                        <th>Turn</th>
                        <th>Index</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((p, idx) => (
                        p != null && <tr key={idx} className='prev-drawer'>
                            <td>{p?.move}</td>
                            <td>{getNameBySymbol(p?.userId)}</td>
                            <td>{formatIndex(p?.index)}</td>
                        </tr>

                    ))}
                </tbody>
            </table>
            <button onClick={onClose} className='close-btn'>Close</button>
        </Drawer>
    )
}

export default PreviewDrawer
