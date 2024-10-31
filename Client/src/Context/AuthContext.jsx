import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();
export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [fullName, setName] = useState(null);
    const [profilePic, setProfile] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const userCookie = Cookies.get('User');
        if (userCookie) {
            try {
                const decodedUser = jwtDecode(userCookie);
                setAuthUser(decodedUser.userId);
                setName(decodedUser.fullName);
                setProfile(decodedUser.profilePic[0].url);
                console.log("User authenticated:", decodedUser);
            } catch (error) {
                console.error("Error decoding JWT:", error);
            }
        } else {
            console.log("No user cookie found");
        }
        setLoading(false); // Set loading to false after checking cookie
    }, []);

    const logout = () => {
        Cookies.remove('User');
        setAuthUser(null);
    };

    return (
        <AuthContext.Provider value={{ authUser, fullName, profilePic, loading, setAuthUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};