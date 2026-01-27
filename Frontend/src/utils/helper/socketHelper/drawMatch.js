import Swal from 'sweetalert2';
import socket from '../../../socket/socket'

const drawMatch = (setBoard, setStart, setHistory, setDefaultTimer, setTimer) => {
    socket.on("draw", async ({ board, lastMove, defaultTime }) => {
        setBoard(lastMove);
        setStart(false);
        Swal.fire({
            title: "Draw!",
            text: "",
            icon: "info",
            width: '300',
            showConfirmButton: false,
            timer: 5000,
            didClose: () => {
                setBoard(board);
                setHistory(prev => {
                    const updated = [...prev, { winner: null }];
                    return updated.length > 10 ? updated.slice(1) : updated;
                });
                setDefaultTimer(defaultTime)
                setTimer(defaultTime)
            }
        })
    });
    return () => {
        socket.off('draw');
    }
}

export default drawMatch;