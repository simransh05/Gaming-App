import socket from '../../../socket/socket'
import { toast } from 'react-toastify';

const playerLeft = (setBoard, setCurrentPlayer, setStart, setUsers, setHistory, setOpponent) => {
    socket.on("player-left", ({ board, players, turn, start, beforeStart }) => {
        setStart(start);
        setBoard(board);
        setUsers(players);
        setCurrentPlayer(turn);
        setOpponent(false);
        setHistory(null);
        toast.info(beforeStart ? "Opponent left you win" : "Opponent left");
    });
    return () => {
        socket.off('player-left')
    }
}

export default playerLeft;