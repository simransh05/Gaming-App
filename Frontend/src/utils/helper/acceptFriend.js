import Swal from "sweetalert2";
import socket from "../../socket/socket";
import api from "../api";

const acceptFriend = (setAreFriend) => {
    socket.on('acceptFriend', async ({ from, fromName, to }) => {
        const result = await Swal.fire({
            title: `${fromName.name} ask to be Friend`,
            text: '',
            icon: 'question',
            cancelButtonText: 'Deny',
            confirmButtonText: 'Accept',
            showConfirmButton: true,
            showCancelButton: true
        })
        if (result.isConfirmed) {
            await api.postFriend(from, to);
            if (setAreFriend) {
                setAreFriend(true)
            }
        }
        if (result.isDismissed) {
            if (setAreFriend) {
                setAreFriend(false)
            }
            socket.emit('refuse-friend', { from, to })

        }
    })
    return () => {
        socket.off('acceptFriend');
    }
}

export default acceptFriend;