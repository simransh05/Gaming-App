import { createContext, useEffect } from "react";
import socket from "../socket/socket";
import { CurrentUserContext } from "./UserContext";
import { useContext } from "react";

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
    const { currentUser } = useContext(CurrentUserContext);

    useEffect(() => {
        if (currentUser?._id) {
            socket.emit("register", currentUser._id);
        } else {
            return;
        }
    }, [currentUser?._id]);


    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
