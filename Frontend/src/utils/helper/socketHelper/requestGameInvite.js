import Swal from "sweetalert2";
import socket from "../../../socket/socket";
import ROUTES from "../../../constant/Route/route";

const requestGameInvite = (currentUser, navigate, anotherRoom) => {
    socket.on('receive-invite', async ({ from, fromName, roomId }) => {
        // console.log('here', roomId)

        const result = await Swal.fire({
            title: `${fromName.name} ask to join`,
            text: '',
            icon: 'info',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Accept',
            cancelButtonText: 'Reject'
        })
        if (result.isConfirmed) {
            socket.emit('join', { roomId }, (res) => {
                // console.log(res);
                if (res.roomFull) {
                    socket.emit('totalUser', { roomId: anotherRoom }, (res) => {
                        // console.log(res);
                        if (res.players.length === 1) {
                            return Swal.fire({ title: 'Room is Full ' });
                        } else {
                            socket.emit('leave', { roomId: anotherRoom }, (res) => {
                                if (res.status === 200) {
                                    navigate(`${ROUTES.HOME}`);
                                    return Swal.fire({ title: 'Room is Full ' });
                                }
                            })
                        }
                    })
                } else {
                    socket.emit('leave', { roomId: anotherRoom }, (res) => {
                        if (res.status === 200) {
                            return navigate(`${ROUTES.HOME}${roomId}`)
                        }
                    })

                }
            });

        } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.backdrop) {
            socket.emit('reject-invite', { from: currentUser._id, to: from })
        }
    })
    return () => {
        socket.off('receive-invite');
    }
}

export default requestGameInvite;