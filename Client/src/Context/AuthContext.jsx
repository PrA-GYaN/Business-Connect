import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();
export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        const userCookie = Cookies.get('User');
        if (userCookie) {
            try {
                const decodedUser = jwtDecode(userCookie);
                setAuthUser(decodedUser);
            } catch (error) {
                console.error("Error decoding JWT:", error);
            }
        } else {
            console.log("No user cookie found");
        }
    }, []);

    const logout = () => {
        Cookies.remove('User');
        setAuthUser(null);
    };

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
