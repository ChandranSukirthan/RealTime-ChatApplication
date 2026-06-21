import { useState } from "react";
import { getInitials, useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { APP_NAME, AppLogo } from "../AppLogo";
import { UserButton } from "@clerk/react";

import { SearchField, Tabs } from "@heroui/react";
import { MessageSquareIcon, UsersIcon, SearchIcon, UserPlusIcon, MessageCircleIcon, PhoneIcon, Loader2Icon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { ConversationRow } from "./ConversationRow";
import { Avatar } from "@heroui/react";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

function mapUserForList(user, onlineUsers) {
  return {
    conversationId: user._id,
    id: user._id,
    name: user.fullName,
    avatarUrl: user.profilePic,
    initials: getInitials(user.fullName),
    isOnline: onlineUsers.includes(user._id),
    phoneNumber: user.phoneNumber,
    email: user.email,
    peer: {
      name: user.fullName,
      avatarUrl: user.profilePic,
      initials: getInitials(user.fullName),
      isOnline: onlineUsers.includes(user._id),
      phoneNumber: user.phoneNumber,
      email: user.email,
    },
  };
}

function ChatSidebar() {
  const conversations = useChatStore((state) => state.conversations);

  console.log(conversations);
  const users = useChatStore((state) => state.users);

  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);

  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const addContact = useChatStore((state) => state.addContact);
  const searchContact = useChatStore((state) => state.searchContact);

  const selectedUser = useChatStore((state) => state.selectedUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const { isLargeScreen } = useSelectedConversation();
  
  const [phoneInput, setPhoneInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSearchContact = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    
    setIsSearching(true);
    setSearchResult(null);
    setSearchError("");
    
    try {
      const result = await searchContact(phoneInput.trim());
      setSearchResult(result);
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddAndChat = async () => {
    if (!searchResult?.user) return;
    
    setIsAdding(true);
    try {
      if (searchResult.isAlreadyContact) {
        setActiveConversationId(searchResult.user._id);
        setSidebarTab("chats");
        setSearchResult(null);
        setPhoneInput("");
      } else {
        const newUser = await addContact(searchResult.user.phoneNumber || searchResult.user.email);
        if (newUser) {
          setActiveConversationId(newUser._id, newUser);
          setSidebarTab("chats");
          setSearchResult(null);
          setPhoneInput("");
        }
      }
    } finally {
      setIsAdding(false);
    }
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const conversationUsers = conversations.map((user) => mapUserForList(user, onlineUsers));
  const allUsers = users.map((user) => mapUserForList(user, onlineUsers));

  // If we have an active conversation, but it's not in the conversations list yet (e.g. no messages sent yet),
  // add it to the top of the list so it shows up in the Chats tab.
  const activeUser = selectedUser?._id === activeConversationId ? selectedUser : (users.find(u => u._id === activeConversationId) || conversations.find(u => u._id === activeConversationId));
  let displayConversations = conversationUsers;
  if (activeConversationId && activeUser && !conversations.some(c => c._id === activeConversationId)) {
    displayConversations = [mapUserForList(activeUser, onlineUsers), ...displayConversations];
  }

  const filteredConversations = normalizedSearchQuery
    ? displayConversations.filter((conversation) =>
        conversation.peer.name.toLowerCase().includes(normalizedSearchQuery),
      )
    : displayConversations;

  const filteredUsers = normalizedSearchQuery
    ? allUsers.filter((user) => user.name.toLowerCase().includes(normalizedSearchQuery))
    : allUsers;

  return (
    <aside
      className={`w-full shrink-0 flex-col overflow-hidden border-r border-border lg:w-72 ${
        !isLargeScreen && activeConversationId ? "hidden lg:flex" : "flex"
      }`}
    >
      <div className="shrink-0 border-b border-border px-2 pb-2 pt-2.5 sm:px-3 sm:pt-3">
        <div className="flex items-center gap-2 px-0.5 sm:gap-2.5 sm:px-1">
          <AppLogo size={32} className="size-8 shrink-0 rounded-[9px] sm:size-8.5" alt="" />
          <p className="flex-1 truncate text-lg font-bold tracking-tight sm:text-[22px]">
            {APP_NAME}
          </p>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </div>

      <Tabs
        selectedKey={sidebarTab}
        onSelectionChange={(key) => setSidebarTab(String(key))}
        variant="secondary"
        className="flex flex-1 flex-col overflow-y-auto"
      >
        <div className="shrink-0 border-b border-border px-3 pb-2 pt-2">
          <SearchField
            fullWidth
            variant="secondary"
            className="w-full"
            value={searchQuery}
            onChange={setSearchQuery}
          >
            <SearchField.Group className="rounded-xl">
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search" />
              {searchQuery ? <SearchField.ClearButton /> : null}
            </SearchField.Group>
          </SearchField>
        </div>

        <Tabs.ListContainer className="shrink-0 border-b border-border px-2 pb-2 pt-1">
          <Tabs.List className="w-full gap-0.5">
            <Tabs.Tab id="chats" className="flex-1 justify-center gap-1.5">
              <MessageSquareIcon className="size-3.5 opacity-80" aria-hidden />
              Chats
            </Tabs.Tab>
            <Tabs.Tab id="users" className="flex-1 justify-center gap-1.5">
              <UsersIcon className="size-3.5 opacity-80" aria-hidden />
              Users
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel
          id="chats"
          className="flex-1 overflow-x-hidden overflow-y-auto outline-none"
        >
          {filteredConversations.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No conversations match your search.
            </p>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                user={conversation}
                selected={conversation.id === activeConversationId}
                onSelect={() => setActiveConversationId(conversation.id)}
              />
            ))
          )}
        </Tabs.Panel>

        <Tabs.Panel id="users" className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto outline-none">
          {/* Phone Search Section */}
          <div className="p-3 border-b border-border shrink-0 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center justify-center size-6 rounded-full bg-accent/15">
                <SearchIcon className="size-3 text-accent" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Find by email or phone</span>
            </div>
            
            <form onSubmit={handleSearchContact} className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon className="size-3.5 text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Email or phone number..."
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    if (searchError) setSearchError("");
                    if (searchResult) setSearchResult(null);
                  }}
                  className="w-full bg-surface border border-border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !phoneInput.trim()}
                className="bg-accent text-accent-foreground rounded-xl px-3.5 py-2 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                {isSearching ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SearchIcon className="size-3.5" />
                )}
                Search
              </button>
            </form>

            {/* Search Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center gap-2 py-3">
                <div className="flex gap-1 search-loading-pulse">
                  <div className="size-1.5 rounded-full bg-accent" />
                  <div className="size-1.5 rounded-full bg-accent" style={{ animationDelay: "0.2s" }} />
                  <div className="size-1.5 rounded-full bg-accent" style={{ animationDelay: "0.4s" }} />
                </div>
                <span className="text-xs text-muted">Searching...</span>
              </div>
            )}

            {/* Search Error */}
            {searchError && (
              <div className="contact-card-enter flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                <AlertCircleIcon className="size-4 text-red-500 shrink-0" />
                <span className="text-sm text-red-500">{searchError}</span>
              </div>
            )}

            {/* Search Result Preview Card */}
            {searchResult && (
              <div className="contact-card-enter rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="p-3 flex items-center gap-3">
                  <AvatarWithOnlineIndicator isOnline={onlineUsers.includes(searchResult.user._id)}>
                    <Avatar className="size-12 shrink-0">
                      <Avatar.Image alt={searchResult.user.fullName} src={searchResult.user.profilePic} />
                      <Avatar.Fallback className="text-sm font-medium">
                        {getInitials(searchResult.user.fullName)}
                      </Avatar.Fallback>
                    </Avatar>
                  </AvatarWithOnlineIndicator>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{searchResult.user.fullName}</p>
                    {searchResult.user.phoneNumber && (
                      <p className="truncate text-xs text-muted mt-0.5 flex items-center gap-1">
                        <PhoneIcon className="size-3 shrink-0" />
                        {searchResult.user.phoneNumber}
                      </p>
                    )}
                    {searchResult.isAlreadyContact && (
                      <p className="flex items-center gap-1 text-xs text-success mt-1 font-medium">
                        <CheckCircle2Icon className="size-3" />
                        Already in contacts
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={handleAddAndChat}
                    disabled={isAdding}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isAdding ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : searchResult.isAlreadyContact ? (
                      <MessageCircleIcon className="size-4" />
                    ) : (
                      <UserPlusIcon className="size-4" />
                    )}
                    {searchResult.isAlreadyContact ? "Open Chat" : "Add & Chat"}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Existing Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">No contacts found.</p>
            ) : (
            filteredUsers.map((user) => (
              <ConversationRow
                key={user.conversationId}
                user={user}
                selected={user.conversationId === activeConversationId}
                onSelect={() => setActiveConversationId(user.conversationId)}
              />
            ))
          )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
}
export default ChatSidebar;