import socket from "../../socket/socket"
import { toast } from "react-toastify"

const refuseFriend = () => {
    socket.on('refused', ({ fromName }) => {
        toast.info(`${fromName.name} refuse to be Friend`)
    })
    return () => {
        socket.off('refused');
    }
}

export default refuseFriend;