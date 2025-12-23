import { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const CurrentUserContext = createContext(null);

const CurrentUserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.getUser();
                if (res.status === 200 && res.data?._id) {
                    setCurrentUser(res.data);
                } else {
                    setCurrentUser(null);
                }
            } catch (err) {
                setCurrentUser(null);
            }
        };

        fetchUser();
    }, []);

    return (
        <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </CurrentUserContext.Provider>
    );
};

export default CurrentUserProvider;
