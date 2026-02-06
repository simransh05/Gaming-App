import Swal from "sweetalert2";
import ROUTES from "../../constant/Route/route";

const loginFirst = (loading, currentUser, navigate) => {
    if (loading) return;
    if (!currentUser) {
        Swal.fire("Need to login first", "", "warning")
        navigate(`${ROUTES.LOGIN}`)
    }
}

export default loginFirst;