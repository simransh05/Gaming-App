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
import './Invite.css'

function InviteModal({ open, onClose, onSuccess }) {
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('join', { roomId }, async (res) => {
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

  const handleClose = () => {
    setRoomId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className='invite-container'>
      <DialogTitle className='invite-modal'>Enter Room ID</DialogTitle>

      <DialogContent className='content-modal'>
        <TextField
        sx={{marginTop:'5px'}}
          label="Room ID"
          value={roomId}
          fullWidth
          onChange={(e) => setRoomId(e.target.value)}
          required
        />
      </DialogContent>

      <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '10px' }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none', fontSize: '17px', color: 'white', background: 'slateblue' }}>Cancel</Button>
        <Button onClick={handleSubmit} sx={{ textTransform: 'none', fontSize: '17px', color: 'white', background: 'slateblue' }}>Join Room</Button>
      </DialogActions>
    </Dialog>
  );
}

export default InviteModal;