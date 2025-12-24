import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import socket from '../../socket/socket';
import Swal from 'sweetalert2';

function InviteModal({ open, onClose, onSuccess }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('join', inputValue);
  };

  useEffect(() => {
    socket.on('room-full', async () => {
      await Swal.fire({ title: 'Room is Full' });
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

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Room ID</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Room ID"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Join Room</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default InviteModal;