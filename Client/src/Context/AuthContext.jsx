import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();
export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [fullName, setName] = useState(null);
    const [profilePic, setprofile] = useState(null);

    useEffect(() => {
        const userCookie = Cookies.get('User');
        if (userCookie) {
            try {
                const decodedUser = jwtDecode(userCookie);
                setAuthUser(decodedUser.userId);
                setName(decodedUser.fullName);
                setprofile(decodedUser.profilePic);
                console.log("User authenticated:", decodedUser);
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
        <AuthContext.Provider value={{ authUser,fullName,profilePic, setAuthUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
