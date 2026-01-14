import Swal from "sweetalert2";
import socket from "../../../socket/socket";
import ROUTES from "../../../constant/Route/route";

const requestInvite = (currentUser, navigate) => {
    socket.on('receive-invite', async ({ from, fromName, roomId }) => {
        // console.log('here', from, fromName.name)
        const result = await Swal.fire({
            title: `${fromName.name} ask to join`,
            text: '',
            icon: 'info',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Accept',
            cancelButtonText: 'Reject'
        })
        console.log(result)
        if (result.isConfirmed) {
            // here add check if get the one socket emit if there is already 2 users then return message
            socket.emit('join', { roomId }, (res) => {
                console.log(res.players);
                if (res.players.length >= 2) {
                    return Swal.fire({ title: 'Room is Full ' });
                } else {
                    navigate(`${ROUTES.HOME}${roomId}`)
                }
            });
        }
        if (result.isDismissed) {
            socket.emit('reject-invite', { from: currentUser._id, to: from })
        }
    })
    return () => {
        socket.off('receive-invite');
    }
}

export default requestInvite;