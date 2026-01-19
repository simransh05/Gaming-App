import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import React from 'react'
import socket from '../../socket/socket'
import { useState } from 'react'
import { useEffect } from 'react';

function CreateModal({ open, onClose , onSuccess}) {

    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState(null);

    const handleClick = () => {
        socket.emit('create', (res) => {
            // console.log(res);
            if (res.status === 200) {
                setInputValue(res.roomId);
                setShowInput(true);
            }
        })
    }


    const handleClose = () => {
        setInputValue(null);
        setShowInput(false);
        onClose()
    }

    const handleEnter = (e) => {
        e.preventDefault();
        socket.emit('join', { roomId : inputValue }, async (res) => {
            // console.log(res);
            if (res.alreadyIn) {
                onSuccess(roomId)
            } else if (res.roomFull) {
                onClose();
                await Swal.fire({ title: 'Room is Full ' });
            }
        });
    };

    useEffect(() => {
        socket.on('room-full', async () => {
            onClose();
        });

        socket.on('joined-room', (roomId) => {
            onSuccess(roomId);
            onClose();
        });

        return () => {
            socket.off('room-full');
            socket.off('joined-room');
        };
    }, [onSuccess, onClose]);

return (
    <Dialog open={open} onClose={handleClose}>
        <DialogContent>
            {showInput &&
                <TextField
                    label='Room Id'
                    sx={{ mt: '8px' }}
                    value={inputValue}
                    InputProps={{ readOnly: true }}
                />
            }
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
            {showInput === false && <Button onClick={handleClick}>Create Room</Button>}
            {showInput && <Button onClick={handleEnter}>Join Room</Button>}
        </DialogActions>
    </Dialog>
)
}

export default CreateModal
