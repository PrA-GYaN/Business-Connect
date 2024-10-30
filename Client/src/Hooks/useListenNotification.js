import { useEffect, useCallback } from "react";
import { useSocketContext } from "../Context/SocketContext";
import useNotification from "./useNotification";

// import notificationSound from "../assets/audios/notification.wav";

const useListenNotification = () => {
	const { socket } = useSocketContext();
	const { addNotification,playAudio} = useNotification();

	const handleNewNotification = useCallback((newNotification) => {
		playAudio();
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