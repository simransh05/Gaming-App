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
            const isAlreadyIn = res.data.players.some(u => u._id === currentUser._id);
            // console.log(isAlreadyIn);
            if (!isAlreadyIn) {
                Swal.fire({ title: 'You are not joined' })
                return navigate(ROUTES.HOME)
            }
            if (!res.data.start && res.data.players.length === 1 && currentUser._id === res.data.players[0]._id) {
                Swal.fire({
                    title: 'Game rules',
                    text: 'U can change the time of the game',
                    icon: 'info',
                    showConfirmButton: true
                })
            } else if (!res.data.start && currentUser._id === res.data.players[1]._id) {
                Swal.fire({
                    title: 'Game rules',
                    text: res.data.defaultTime === 10 ? 'The game time is 10sec per person' : `the creator change the default time to ${res.data.defaultTime}sec`,
                    icon: 'info',
                    showConfirmButton: true
                })
            }
        }
    })
}
export default refreshGame