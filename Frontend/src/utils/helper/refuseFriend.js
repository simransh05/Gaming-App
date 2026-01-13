import Swal from "sweetalert2"
import socket from "../../socket/socket"

const refuseFriend = () => {
    socket.on('refused', ({ fromName }) => {
        Swal.fire({
            title: `${fromName.name} refuse to be Friend`,
            text: '',
            icon: 'info',
            showCancelButton: false,
            showConfirmButton: false,
            timer: 3000
        })
    })
    return () => {
        socket.off('refused');
    }
}

export default refuseFriend;