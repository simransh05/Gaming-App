import Swal from 'sweetalert2';
import socket from '../../../socket/socket'

const askPlay = (roomId) => {
    socket.on('ask-play-again', async () => {
        const result = await Swal.fire({
            title: 'Play Again',
            text: 'Opponent asked to play again',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes'
        })
        console.log(result)
        console.log(result.dismiss === Swal.DismissReason.cancel)
        if (result.isConfirmed) {
            socket.emit('start', roomId);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            socket.emit('refuse-to-play', { roomId });
        }
    })
    return () => {
        socket.off('ask-play-again')
    }
}

export default askPlay;