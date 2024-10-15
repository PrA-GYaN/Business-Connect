import { useEffect } from "react";
import { useSocketContext } from "../Context/SocketContext";
import useNotification from "./useNotification";

// This is a custom hook that handles notifications
const useListenNotification = () => {
	const { socket } = useSocketContext();
	const {addNotification } = useNotification();

	useEffect(() => {
		const handleNewNotification = (newNotification) => {
			addNotification(newNotification);
		};
		socket?.on("newNotification", handleNewNotification);
		return () => {
			socket?.off("newNotification", handleNewNotification);
		};
	}, [socket, addNotification]);
};

export default useListenNotification;
