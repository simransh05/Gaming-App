import Swal from "sweetalert2";
import socket from "../../socket/socket";

const userDisconnected = () => {
    socket.on('user-disconnected', ({ name }) => {
        Swal.fire({
            title: `${name} disconnected`,
            text: '',
            icon: 'info',
            timer: 5000,
            showCancelButton: false,
            showConfirmButton: false
        })
    })
    return () => {
        socket.off('user-disconnected')
    }
}

export default userDisconnected;