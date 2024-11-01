import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);

	useEffect(() => {
		const getConversations = async () => {
			setLoading(true);
			try {
				const res = await axios.get("http://localhost:5000/messages/getusersforsidebar",
					{
						withCredentials:true,
					}
				);
				setConversations(res.data.connections);
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.message;
				toast.error(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		getConversations();
	}, []);

	return { loading, conversations };
};

export default useGetConversations;