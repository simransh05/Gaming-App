import { Drawer } from '@mui/material'
import React from 'react'

function PreviewDrawer({ open, onClose, prevData, players, symbols }) {
    console.log(prevData);
    const sorted = [...prevData].sort((a, b) => {
        if (a == null || a.move == null) return 1;
        if (b == null || b.move == null) return -1;
        return a.move - b.move;
    });
    console.log(sorted)
    // sort by the moves prevData = symbols and the move 
    return (
        <Drawer open={open} onClose={onClose}>
            {prevData.map((p, idx) => (
                <div key={idx}>{p?.symbols}</div>
            ))}
        </Drawer>
    )
}

export default PreviewDrawer
