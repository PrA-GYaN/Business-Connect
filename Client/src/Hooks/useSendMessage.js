import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import axios from "axios";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();

	const sendMessage = async (message) => {
		setLoading(true);
		try {
			const response = await axios.post(`http/messages/send/${selectedConversation._id}`, {
				message,
			}, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = response.data;
			setMessages([...messages, data]);
		} catch (error) {
			// Handle error appropriately
			toast.error(error.response?.data?.error || error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};

export default useSendMessage;