import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import React from 'react'
import socket from '../../socket/socket'
import { useState } from 'react'
import { useEffect } from 'react';

function CreateModal({ open, onClose }) {

    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState(null);

    const handleClick = () => {
        socket.emit('create')
    }

    useEffect(() => {
        socket.on('receive-create', (roomId) => {
            setShowInput(true);
            setInputValue(roomId);
        });

        return () => {
            socket.off('receive-create');
        };
    }, []);


    const handleClose = () => {
        setInputValue(null);
        setShowInput(false);
        onClose()
    }
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create Room</DialogTitle>
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
            <DialogActions sx={{display:'flex',justifyContent:'center'}}>
                <Button onClick={handleClick}>Create Room</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CreateModal
