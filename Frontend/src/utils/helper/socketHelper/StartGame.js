import Swal from 'sweetalert2';
import socket from '../../../socket/socket'

const startGame = (setStart, setCurrentPlayer, setDefaultTimer, setTimer, currentUser) => {
    socket.on("game-started", ({ FirstPlayer, defaultTime }) => {
        // console.log(currentUser._id, FirstPlayer)
        Swal.fire({
            title: currentUser._id === FirstPlayer ? 'You win the toss got first move' : 'You lose the toss',
            text: '',
            icon: currentUser._id === FirstPlayer ? 'success' : 'error',
            timer: 3000,
            showCancelButton: false,
            showConfirmButton: false,
        }).then(() => {
            setStart(true);
            // console.log(FirstPlayer)
            setCurrentPlayer(FirstPlayer);
            setDefaultTimer(defaultTime)
            setTimer(defaultTime)
        })
    });
    return () => {
        socket.off('game-started');
    }
}

export default startGame;