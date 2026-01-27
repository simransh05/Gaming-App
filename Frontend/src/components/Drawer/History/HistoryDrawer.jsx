import { Drawer } from '@mui/material'
import React from 'react'
import formatDate from '../../../utils/helper/FormatDate';
import './History.css'

function HistoryDrawer({ history, open, onClose, onSuccess }) {

    // console.log(history);

    return (
        <Drawer open={open} onClose={onClose} anchor='right' className='history-drawer' PaperProps={{
            sx: {
                width: 240,
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
            },
        }}>
            {history?.length > 0 ?
                history.map((h, index) => (
                    <div key={index} className='history'>
                        <span>{h?.winner === null ? 'Draw' : h?.winner?.name}</span>
                        <span>{formatDate(h?.playedAt)}</span>
                    </div>
                ))
                : <div className='no-history'>No History Yet</div>
            }
            {history?.length > 0 && <button className="delete-btn" onClick={onSuccess}>Delete History</button>}
        </Drawer>
    )
}

export default HistoryDrawer
