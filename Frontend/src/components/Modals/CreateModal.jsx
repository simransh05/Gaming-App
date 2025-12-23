import { Dialog, DialogTitle } from '@mui/material'
import React from 'react'

function CreateModal({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create Room</DialogTitle>
            {/* idea is when btn click then show above the room id for user */}
            {/* then join the team by that link */}

        </Dialog>
    )
}

export default CreateModal
