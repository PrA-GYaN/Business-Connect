import { useState } from "react";
import useConversation from "./useConversation";
import axios from "axios";
import { toast } from 'react-toastify';
const url = import.meta.env.VITE_Backend_Url;

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();

	const sendMessage = async (message) => {
		setLoading(true);
		try {
			const response = await axios.post(`${url}/messages/send/${selectedConversation._id}`, {
				message,
			}, {
				withCredentials: true,
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