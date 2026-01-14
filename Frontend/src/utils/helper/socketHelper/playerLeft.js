import Swal from 'sweetalert2';
import socket from '../../../socket/socket'

const playerLeft = (setBoard, setCurrentPlayer, setStart, setUsers, setHistory) => {
    socket.on("player-left", ({ board, players, turn, start, beforeStart }) => {
        setStart(start);
        setBoard(board);
        setUsers(players);
        setCurrentPlayer(turn);
        setHistory(null);
        Swal.fire({
            title: beforeStart ? "Opponent left you win" : "Opponent left",
            text: "",
            icon: "warning",
            timer: 5000,
            showConfirmButton: false 
        })
    });
    return () => {
        socket.off('player-left')
    }
}

export default playerLeft;