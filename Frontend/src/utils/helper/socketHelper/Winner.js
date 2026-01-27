import Swal from 'sweetalert2';
import socket from '../../../socket/socket'

const Winner = (setBoard, setStart, setLine, setHistory, setDefaultTimer, setTimer, currentUser) => {
    // console.log('here')
    socket.on("winner", async ({ winnerId, board, name, pattern, lastMove, defaultTime }) => {
        setBoard(lastMove);
        setStart(false);
        // console.log(pattern);
        setLine(pattern);
        await Swal.fire({
            title: winnerId === currentUser?._id ? "You Won!" : "You Lost!",
            text: "",
            icon: winnerId === currentUser?._id ? "success" : "error",
            width: '300',
            showConfirmButton: false,
            timer: 5000,
            didClose: () => {
                // console.log('here')
                setBoard(board);
                setLine(null);
                setHistory(prev => {
                    const updated = [...prev, { winner: { name } }];
                    return updated.length > 10 ? updated.slice(1) : updated;
                });
                setDefaultTimer(defaultTime)
                setTimer(defaultTime);
            }
        })
    });
    return () => {
        socket.off('winner');
    }
}

export default Winner;