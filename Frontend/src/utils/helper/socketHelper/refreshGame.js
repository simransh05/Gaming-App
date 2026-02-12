import Swal from "sweetalert2";
import socket from "../../../socket/socket";
import ROUTES from "../../../constant/Route/route";

const refreshGame = (roomId, setUsers, setBoard, setCurrentPlayer, setStart, setTimer, setDefaultTimer, currentUser, navigate) => {
    socket.emit('refresh-room', { roomId }, (res) => {
        if (res.status === 200) {
            // console.log(res);
            setUsers(res.data.players);
            setBoard(res.data.board);
            setCurrentPlayer(res.data.turn);
            setStart(res.data.start);
            setTimer(res.data.defaultTime)
            setDefaultTimer(res.data.defaultTime);
            const isAlreadyIn = res.data?.players?.some(u => u?._id === currentUser._id);
            // console.log(isAlreadyIn);
            if (!isAlreadyIn) {
                Swal.fire({
                    title: 'Not In',
                    text: 'You are not joined',
                    icon: 'info',
                    showCancelButton: false,
                    showConfirmButton: false,
                    timer: 5000
                })
                return navigate(ROUTES.HOME)
            }
        } else if (res.status === 404) {
            Swal.fire({
                title: 'Not In',
                text: 'You are not joined',
                icon: 'info',
                showCancelButton: false,
                showConfirmButton: false,
                timer: 5000
            })
            return navigate(ROUTES.HOME)
        }
    })
}
export default refreshGame