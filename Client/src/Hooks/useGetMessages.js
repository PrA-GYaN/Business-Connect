import { useEffect, useState } from "react";
import axios from "axios";
import useConversation from "./useConversation.js";
import toast from "react-hot-toast";

const useGetMessages = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();

	useEffect(() => {
		const getMessages = async () => {
			setLoading(true);
			try {
				const { data } = await axios.get(`http://localhost:5000/messages/${selectedConversation._id}`,
					{
						withCredentials: true,
					}
				);
				setMessages(data);
			} catch (error) {
				toast.error(error.response?.data?.error || error.message);
			} finally {
				setLoading(false);
			}
		};

		if (selectedConversation?._id) getMessages();
	}, [selectedConversation?._id, setMessages]);

	return { messages, loading };
};

export default useGetMessages;