import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import socket from '../../socket/socket';

function TimerSet({ open, onClose, onSuccess }) {
    const roomId = useParams(); 
    const [defaultTime , setDefaultTime] = useState(0);
    const handleUpdate = () => {
        console.log(defaultTime)
        onSuccess(defaultTime);
        onClose();
    }

    useEffect(()=>{
        socket.emit('getTime' , (roomId) , (res)=> {
            console.log(res)
            setDefaultTime(res.time);
        })
    },[])
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Set Time</DialogTitle>
            <DialogContent>
                <div>Default Time : {defaultTime}</div>
                <label>Set New Game Timer</label>
                <select value={defaultTime} onChange={(e)=>setDefaultTime(Number(e.target.value))}>
                    <option value={10}>Set 10 sec</option>
                    <option value={15}>Set 15 sec</option>
                    <option value={20}>Set 20 sec</option>
                    <option value={25}>Set 25 sec</option>
                    <option value={30}>Set 30 sec</option>
                </select>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdate}>Update</Button>
            </DialogActions>
        </Dialog>
    )
}

export default TimerSet
