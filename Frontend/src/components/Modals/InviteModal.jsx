import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import React from 'react'

function InviteModal({open , onClose}) {
    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            // idea for the data what to do when click 
        }
        catch(err){
            console.log(err);
        }
    }
    return (
        <Dialog open={open} onClose={onClose} maxWidth={340}>
            {/* idea for this is input box give the id invite then click enter then there will be navigate to the that id room  */}
            <DialogTitle>Enter the Room Id</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        name='name'
                        label='Room Id'
                        margin='normal'
                        fullWidth
                        onChange={(e)=> e.target.value}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button>Enter Gaming Room</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default InviteModal
