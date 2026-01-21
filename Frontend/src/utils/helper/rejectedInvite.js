import socket from "../../socket/socket";
import { toast } from "react-toastify";

const rejectedInvite = () => {
    socket.on('rejected', ({ name }) => {
        toast.info(`${name} rejected the invite`);
    })
    return () => {
        socket.off('rejected');
    }
}

export default rejectedInvite;