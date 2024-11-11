import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom"; 

export const AuthContext = createContext();
export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const navigate = useNavigate();
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

    const openProfile = ({id}) => {
        if (id) {
            navigate('/profile', { state: { pid: id } });
        }
    };

    const logout = () => {
        console.log("Logging out...");
        Cookies.remove('User');
        setAuthUser(null);
    };

    return (
        <AuthContext.Provider value={{ authUser, fullName, profilePic, loading, setAuthUser,openProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};