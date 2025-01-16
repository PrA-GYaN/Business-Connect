import { useEffect, useCallback } from "react";
import { useSocketContext } from "../Context/SocketContext";
import useNotification from "./useNotification";
import { useAuthContext } from "../Context/AuthContext";

// import notificationSound from "../assets/audios/notification.wav";

const useListenNotification = () => {
	const {setIcon} = useAuthContext();
	const { socket } = useSocketContext();
	const { addNotification,playAudio} = useNotification();

	const handleNewNotification = useCallback((newNotification) => {
		playAudio();
		setIcon(true);
		addNotification(newNotification);
	}, [addNotification]);

	useEffect(() => {
		socket?.on("newNotification", handleNewNotification);
		return () => {
			socket?.off("newNotification", handleNewNotification);
		};
	}, [socket, handleNewNotification]);
};

export default useListenNotification;