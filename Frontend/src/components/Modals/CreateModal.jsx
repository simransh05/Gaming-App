import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React from 'react'
import socket from '../../socket/socket'
import './create.css'
function CreateModal({ open, onClose, onSuccess }) {

    const handleClick = () => {
        socket.emit('create', (res) => {
            // console.log(res);
            if (res.status === 200) {
                const roomId = res.roomId;
                socket.emit('join', { roomId }, async (res) => {
                    // console.log(res);
                    if (res.alreadyIn) {
                        onSuccess(roomId)
                    } else if (res.roomFull) {
                        onClose();
                        await Swal.fire({ title: 'Room is Full ' });
                    } else {
                        onSuccess(roomId);
                    }
                });
            }
        })
    }

    return (
        <Dialog open={open} onClose={onClose} className='dialog-create'>
            <DialogContent className='content-head'>
                <div className='content-create'>
                    <p className='heading-content'><strong>Room Rules</strong></p>

                    <ul className='list-items'>
                        <li>This is a 1 vs 1 match.</li>
                        <li>Only invited players can join the room.</li>
                        <li>The creator of the room can change the turn timer after join</li>
                        <li>Make sure you have read the rules on the home page</li>
                    </ul>

                    <p className='info-content'>
                        Make sure you are ready before joining the room.
                    </p>
                </div>
            </DialogContent>
            <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '10px' }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', fontSize: '17px', color: 'white', background: 'slateblue', padding: '6px 15px' }}>Cancel</Button>
                <Button onClick={handleClick} sx={{ textTransform: 'none', fontSize: '17px', color: 'white', background: 'slateblue' }}>Create and Join Room</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CreateModal
