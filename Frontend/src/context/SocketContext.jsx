import { createContext, useEffect } from "react";
import socket from "../socket/socket";
import { CurrentUserContext } from "./UserContext";
import { useContext } from "react";

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
    const { currentUser, loading } = useContext(CurrentUserContext);

    useEffect(() => {
        if (loading) return;
        if (currentUser?._id) {
            socket.emit("register", currentUser._id);
        } else {
            return;
        }
    }, [loading]);


    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
