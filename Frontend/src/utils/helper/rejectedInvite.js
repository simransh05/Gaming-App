import Swal from "sweetalert2";
import socket from "../../socket/socket";

const rejectedInvite = () => {
    socket.on('rejected', ({ name }) => {
        Swal.fire({
            title: `${name} rejected the invite`,
            text: '',
            icon: 'info',
            timer: 5000,
            showCancelButton: false,
            showConfirmButton: false
        })
    })
    return () => {
        socket.off('rejected');
    }
}

export default rejectedInvite;