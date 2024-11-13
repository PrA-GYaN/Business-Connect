import { create } from "zustand";

const useConversation = create((set) => ({
	selectedConversation: null,
	setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
	messages: [],
	setMessages: (messages) => set({ messages }),
	lastmessage:"",
	setLastMessage: (lastmessage) => set({ lastmessage }),
}));

export default useConversation;