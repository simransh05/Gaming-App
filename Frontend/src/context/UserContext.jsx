import { createContext, useEffect, useState } from "react";
import api from "../utils/api";

export const CurrentUserContext = createContext(null);

const CurrentUserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.getUser();
                if (res.status === 200) {
                    setCurrentUser(res.data);
                } else {
                    setCurrentUser(null);
                }
                setLoading(false);
            } catch (err) {
                setCurrentUser(null);
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <CurrentUserContext.Provider value={{ currentUser, setCurrentUser, loading, setLoading }}>
            {children}
        </CurrentUserContext.Provider>
    );
};

export default CurrentUserProvider;
