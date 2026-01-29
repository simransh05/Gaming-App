import Swal from 'sweetalert2';
import socket from '../../../socket/socket'

const drawMatch = (setBoard, setStart, setHistory, setDefaultTimer, setTimer, roomId, setPrevDrawer, setPrevData) => {
    socket.on("draw", async ({ board, lastMove, defaultTime, prev }) => {
        setBoard(lastMove);
        setStart(false);
        const result = await Swal.fire({
            title: "Draw!",
            text: "",
            icon: "info",
            // width: '300',
            cancelButtonText: 'Preview the match',
            confirmButtonText: 'Play Again',
            showConfirmButton: true,
            showCancelButton: true,
            reverseButtons: true,
            cancelButtonColor: '#3b82f6',
            confirmButtonColor:'#22c55e',
        })
        if (result.isConfirmed) {
            // confirm is the play again then send socket.emit to that if accpet then do something else return not accpeted
            socket.emit('play-again', { roomId })
            setBoard(board);
            setHistory(prev => {
                const updated = [...prev, { winner: null }];
                return updated.length > 10 ? updated.slice(1) : updated;
            });
            setDefaultTimer(defaultTime)
            setTimer(defaultTime)
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            setPrevData(prev);
            setPrevDrawer(true);
            setBoard(board);
            setHistory(prev => {
                const updated = [...prev, { winner: null }];
                return updated.length > 10 ? updated.slice(1) : updated;
            });
            setDefaultTimer(defaultTime)
            setTimer(defaultTime)
        } else {
            setBoard(board);
            setHistory(prev => {
                const updated = [...prev, { winner: null }];
                return updated.length > 10 ? updated.slice(1) : updated;
            });
            setDefaultTimer(defaultTime)
            setTimer(defaultTime)
        }
        // if cancel then prev modal or something that is the board backend send in prev 
    });
    return () => {
        socket.off('draw');
    }
}

export default drawMatch;