import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select } from '@mui/material'
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import socket from '../../socket/socket';
import './TimeSet.css'

function TimerSet({ open, onClose, onSuccess }) {
    const roomId = useParams();
    const [defaultTime, setDefaultTime] = useState(10);
    const handleUpdate = () => {
        // console.log(defaultTime)
        onSuccess(defaultTime);
        onClose();
    }

    useEffect(() => {
        socket.emit('getTime', (roomId), (res) => {
            // console.log(res)
            setDefaultTime(res.time);
        })
    }, [])
    return (
        <Dialog open={open} onClose={onClose} className='time-container'>
            <DialogTitle className='time-title'>Set Time</DialogTitle>
            <DialogContent className='time-content'>
                <div style={{ textAlign: 'center', marginBottom: '5px' }}>Turn Timer : {defaultTime} sec</div>
                <label>Set new Turn timer: </label>
                <Select value={defaultTime} onChange={(e) => setDefaultTime(Number(e.target.value))} size='small' className='select-time'>
                    <MenuItem value={10}>Set 10 sec</MenuItem>
                    <MenuItem value={15}>Set 15 sec</MenuItem>
                    <MenuItem value={20}>Set 20 sec</MenuItem>
                    <MenuItem value={25}>Set 25 sec</MenuItem>
                    <MenuItem value={30}>Set 30 sec</MenuItem>
                </Select>
            </DialogContent>
            <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', fontSize: '17px', color: 'white', background: 'slateblue', marginBottom: '10px', padding: '6px 15px' }}>Cancel</Button>
                <Button onClick={handleUpdate} sx={{ textTransform: 'none', fontSize: '17px', color: 'white', background: 'slateblue', marginBottom: '10px', padding: '6px 15px' }}>Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default TimerSet
