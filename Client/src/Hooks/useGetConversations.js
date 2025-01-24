import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
const url = import.meta.env.VITE_Backend_Url;

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [finalConversations, setFinalConversations] = useState([]);
  const [middlewareConversations, setMiddlewareConversations] = useState([]);
  const [lastMessage, setLastMessage] = useState([]);

  useEffect(() => {
    const getConversations = async () => {
      setLoading(true);
      try {
        // Fetch the conversation data
        const res = await axios.get(`${url}/messages/getusersforsidebar`, {
          withCredentials: true,
        });
        setMiddlewareConversations(res.data.connections);
        // console.log("Middleware Conversations:", res.data.connections);

        // Fetch the last message data
        const resLastMessage = await axios.get(`${url}/messages/getLastMessage`, {
          withCredentials: true,
        });
        console.log("Last Messages:", resLastMessage.data);
        setLastMessage(resLastMessage.data);

      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  useEffect(() => {
    const combinedConversations = middlewareConversations.map(conversation => {
      const lastMsg = lastMessage.find(msg => 
        msg.participants.some(p => p._id === conversation.userId._id)
      );

      return {
        ...conversation,
        lastMessage: lastMsg ? lastMsg.messages[0]?.message : "",
        timeAgo: lastMsg ? lastMsg.timeAgo : "",
      };
    });

    setFinalConversations(combinedConversations);
    // console.log("Final Conversations:", combinedConversations);
  }, [middlewareConversations, lastMessage]);

  return { loading, finalConversations };
};

export default useGetConversations;
