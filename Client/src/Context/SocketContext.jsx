import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "../Context/AuthContext";
import io from "socket.io-client";

const url = import.meta.env.VITE_Backend_Url;
const SocketContext = createContext();

export const useSocketContext = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const { authUser } = useAuthContext();
	const [onlineUsers, setOnlineUsers] = useState({});

	useEffect(() => {
		if (authUser) {
			const socket = io(`${url}`, {
				query: {
					userId: authUser,
				},
			});

			setSocket(socket);
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});
			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
		console.log(authUser);
	}, [authUser]);

	return <SocketContext.Provider value={{ socket,onlineUsers }}>{children}</SocketContext.Provider>;
};
