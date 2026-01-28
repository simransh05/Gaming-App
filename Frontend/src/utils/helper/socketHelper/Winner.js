import Swal from 'sweetalert2';
import socket from '../../../socket/socket'

const Winner = (setBoard, setStart, setLine, setHistory, setDefaultTimer, setTimer, currentUser, setPrevData, setPrevDrawer) => {
    // console.log('here')
    socket.on("winner", async ({ winnerId, board, name, pattern, lastMove, defaultTime, prev }) => {
        setBoard(lastMove);
        setStart(false);
        // console.log(pattern);
        setLine(pattern);
        const result = await Swal.fire({
            title: winnerId === currentUser?._id ? "You Won!" : "You Lost!",
            text: "",
            icon: winnerId === currentUser?._id ? "success" : "error",
            cancelButtonText: 'Preview the match',
            confirmButtonText: 'Play Again',
            showConfirmButton: true,
            showCancelButton: true,
            reverseButtons: true,
        })
        if (result.isConfirmed) {
            // confirm is the play again then send socket.emit to that if accpet then do something else return not accpeted
            socket.emit('play-again', { roomId })
            setBoard(board);
            setLine(null);
            setHistory(prev => {
                const updated = [...prev, { winner: { name } }];
                return updated.length > 10 ? updated.slice(1) : updated;
            });
            setDefaultTimer(defaultTime)
            setTimer(defaultTime);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            setPrevData(prev);
            setPrevDrawer(true);
        }
    });
    return () => {
        socket.off('winner');
    }
}

export default Winner;