import socket from '../../../socket/socket'
import { toast } from 'react-toastify';

const startGame = (setStart, setCurrentPlayer, setDefaultTimer, setTimer, currentUser) => {
    socket.on("game-started", ({ FirstPlayer, defaultTime }) => {
        currentUser._id === FirstPlayer ? toast.success('You win the toss got first move')
            : toast.error('You lose the toss')
        // console.log(currentUser._id, FirstPlayer)
        setStart(true);
        // console.log(FirstPlayer)
        setCurrentPlayer(FirstPlayer);
        setDefaultTimer(defaultTime)
        setTimer(defaultTime)
    });
    return () => {
        socket.off('game-started');
    }
}

export default startGame;