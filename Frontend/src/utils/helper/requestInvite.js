import Swal from "sweetalert2";
import socket from "../../socket/socket";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../constant/Route/route";

const requestInvite = (currentUser , navigate) => {
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
        // console.log(result)
        if (result.isConfirmed) {
            socket.emit('join', roomId);
            navigate(`${ROUTES.HOME}${roomId}`)
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