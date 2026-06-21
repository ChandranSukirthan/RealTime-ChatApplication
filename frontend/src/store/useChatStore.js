import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,
      replyingToMessage: null,
      editingMessage: null,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in get Users", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      addContact: async (emailOrPhone) => {
        try {
          const res = await axiosInstance.post("/messages/add-contact", { emailOrPhone });
          toast.success("Contact added successfully");
          get().getUsers();
          return res.data;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to add contact");
          return null;
        }
      },

      searchContact: async (phoneNumber) => {
        try {
          const res = await axiosInstance.post("/messages/search-contact", { phoneNumber });
          return res.data;
        } catch (error) {
          const msg = error.response?.data?.message || "Search failed";
          throw new Error(msg);
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return false;

        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          set({ messages: [...messages, res.data], composerText: "" });
          get().getConversations();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      editMessageAction: async (messageId, text) => {
        try {
          const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text });
          set((state) => ({
            messages: state.messages.map((m) => {
              let updated = m;
              if (m._id === messageId) {
                updated = res.data;
              }
              if (m.replyTo && String(m.replyTo._id) === String(messageId)) {
                updated = {
                  ...updated,
                  replyTo: {
                    ...m.replyTo,
                    text: res.data.text,
                    image: res.data.image,
                    video: res.data.video,
                    audio: res.data.audio,
                    document: res.data.document,
                    isEdited: true
                  }
                };
              }
              return updated;
            }),
          }));
          set({ editingMessage: null, composerText: "" });
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to edit message");
          return false;
        }
      },

      deleteMessageAction: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/delete/${messageId}`);
          set((state) => ({
            messages: state.messages.map((m) => {
              let updated = m;
              if (m._id === messageId) {
                updated = { ...m, isDeleted: true, text: "", image: undefined, video: undefined };
              }
              if (m.replyTo && String(m.replyTo._id) === String(messageId)) {
                updated = { ...updated, replyTo: { ...m.replyTo, isDeleted: true, text: "", image: undefined, video: undefined } };
              }
              return updated;
            }),
          }));
          toast.success("Message deleted");
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete message");
          return false;
        }
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.off("messageEdited");
        socket.off("messageDeleted");

        socket.on("newMessage", (newMessage) => {
          const state = get();
          state.getConversations();
          if (state.activeConversationId && String(newMessage.senderId) === String(state.activeConversationId)) {
            set({ messages: [...state.messages, newMessage] });
          }
        });

        socket.on("messageEdited", (updatedMessage) => {
          set((state) => ({
            messages: state.messages.map((m) => {
              let updated = m;
              if (m._id === updatedMessage._id) {
                updated = updatedMessage;
              }
              if (m.replyTo && String(m.replyTo._id) === String(updatedMessage._id)) {
                updated = {
                  ...updated,
                  replyTo: {
                    ...m.replyTo,
                    text: updatedMessage.text,
                    image: updatedMessage.image,
                    video: updatedMessage.video,
                    audio: updatedMessage.audio,
                    document: updatedMessage.document,
                    isEdited: true
                  }
                };
              }
              return updated;
            }),
          }));
        });

        socket.on("messageDeleted", ({ _id }) => {
          set((state) => ({
            messages: state.messages.map((m) => {
              let updated = m;
              if (m._id === _id) {
                updated = { ...m, isDeleted: true, text: "", image: undefined, video: undefined };
              }
              if (m.replyTo && String(m.replyTo._id) === String(_id)) {
                updated = { ...updated, replyTo: { ...m.replyTo, isDeleted: true, text: "", image: undefined, video: undefined } };
              }
              return updated;
            }),
          }));
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("messageEdited");
        socket?.off("messageDeleted");
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId) => {
        set((state) => ({
          activeConversationId,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find((user) => user._id === activeConversationId) ||
            null,
          messages: activeConversationId ? state.messages : [],
          replyingToMessage: null,
          editingMessage: null,
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),
      setReplyingToMessage: (msg) => set({ replyingToMessage: msg, editingMessage: null }),
      setEditingMessage: (msg) => set({ editingMessage: msg, replyingToMessage: null, composerText: msg?.text || "" }),
      clearComposerMode: () => set({ replyingToMessage: null, editingMessage: null, composerText: "" }),

      sendTextMessage: async (conversationId) => {
        const state = get();
        const messageText = state.composerText.trim();
        if (!conversationId || !messageText) return false;

        // If editing a message
        if (state.editingMessage) {
          return state.editMessageAction(state.editingMessage._id, messageText);
        }

        // Normal send (with optional reply)
        const formData = { text: messageText };
        if (state.replyingToMessage) {
          formData.replyTo = state.replyingToMessage._id;
        }
        const sent = await get().sendMessage(formData);
        if (sent) set({ replyingToMessage: null });
        return sent;
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);
        const state = get();
        if (state.replyingToMessage) {
          formData.append("replyTo", state.replyingToMessage._id);
        }

        set({ isSendingMedia: true });
        try {
          const sent = await get().sendMessage(formData);
          if (sent) set({ replyingToMessage: null });
          return sent;
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "imessage-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);