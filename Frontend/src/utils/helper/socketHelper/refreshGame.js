import Swal from "sweetalert2";
import socket from "../../../socket/socket";

const refreshGame = (roomId, setUsers, setBoard, setCurrentPlayer, setStart, setTimer, setDefaultTimer) => {
    socket.emit('refresh-room', { roomId }, (res) => {
        if (res.status === 200) {
            console.log(res);
            setUsers(res.data.players);
            setBoard(res.data.board);
            setCurrentPlayer(res.data.turn);
            setStart(res.data.start);
            setTimer(res.data.defaultTime)
            setDefaultTimer(res.data.defaultTime);
            if (!res.data.start && res.data.players.length === 1) {
                Swal.fire({
                    title: 'Game rules',
                    text: 'U can change the time of the game',
                    icon: 'info',
                    showConfirmButton: true
                })
            } else if (!res.data.start && res.data.players.length === 2) {
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