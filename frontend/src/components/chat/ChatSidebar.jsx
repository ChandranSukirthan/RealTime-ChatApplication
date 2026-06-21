import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useClerk } from "@clerk/react";
import { APP_NAME, AppLogo } from "../AppLogo";
import { ThemePresetPicker } from "../ThemePresetPicker";
import { ThemeToggle } from "../ThemeToggle";
import { WallpaperPicker } from "../WallpaperPicker";
import { Volume2, VolumeX, LogOut, Search, MessageSquare, Users } from "lucide-react";
import { getInitials } from "../../hooks/useSelectedConversation";

export default function ChatSidebar() {
  const clerk = useClerk();
  
  // Auth state
  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  
  // Chat store state
  const users = useChatStore((state) => state.users);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const searchQuery = useChatStore((state) => state.searchQuery);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  
  // Chat store actions
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);
  const setSoundEnabled = useChatStore((state) => state.setSoundEnabled);

  // Filter list of users or conversations based on search
  const currentList = sidebarTab === "chats" ? conversations : users;
  const filteredList = currentList.filter((item) => {
    const name = item.fullName?.toLowerCase() || "";
    const email = item.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <aside className={`flex w-full flex-col border-r border-border bg-[#F6F6F6] dark:bg-[#1C1C1E] md:w-80 shrink-0 ${activeConversationId ? "hidden lg:flex" : "flex"}`}>
      {/* Sidebar Header */}
      <header className="flex flex-col gap-3 border-b border-black/10 p-4 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppLogo size={32} className="rounded-lg" />
            <h1 className="text-lg font-bold tracking-tight">{APP_NAME}</h1>
          </div>

          <div className="flex items-center gap-1">
            <WallpaperPicker />
            <ThemePresetPicker />
            
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!isSoundEnabled)}
              className="flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
            >
              {isSoundEnabled ? <Volume2 className="size-4.5" /> : <VolumeX className="size-4.5 text-danger" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => clerk.signOut()}
              className="flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-danger dark:hover:text-danger"
              title="Sign out"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>

        {/* User profile brief */}
        {authUser && (
          <div className="flex items-center gap-2.5 rounded-xl bg-black/5 p-2 dark:bg-white/5">
            {authUser.profilePic ? (
              <img src={authUser.profilePic} alt="" className="size-8.5 rounded-full object-cover" />
            ) : (
              <div className="flex size-8.5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                {getInitials(authUser.fullName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold leading-tight">{authUser.fullName}</p>
              <p className="truncate text-[10px] text-muted-foreground">{authUser.email}</p>
            </div>
          </div>
        )}
      </header>

      {/* Tabs segment control */}
      <div className="px-4 pt-3">
        <div className="flex rounded-lg bg-black/5 p-0.5 dark:bg-white/5">
          <button
            onClick={() => setSidebarTab("chats")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
              sidebarTab === "chats"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-3.5" />
            Chats
          </button>
          <button
            onClick={() => setSidebarTab("users")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
              sidebarTab === "users"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-3.5" />
            People
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={sidebarTab === "chats" ? "Search chats..." : "Search people..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-black/5 py-2 pr-4 pl-9 text-xs outline-hidden focus:bg-black/10 dark:bg-white/5 dark:focus:bg-white/10"
          />
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-8 text-center">
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "No results found" : sidebarTab === "chats" ? "No conversations yet" : "No users found"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredList.map((user) => {
              const isSelected = activeConversationId === user._id;
              const isOnline = onlineUsers.includes(user._id);

              return (
                <button
                  key={user._id}
                  onClick={() => setActiveConversationId(user._id)}
                  className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                    isSelected
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="relative shrink-0">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt=""
                        className="size-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-semibold">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#F6F6F6] bg-green-500 dark:border-[#1C1C1E]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`truncate text-sm font-medium ${isSelected ? "text-accent-foreground" : "text-foreground"}`}>
                        {user.fullName}
                      </p>
                    </div>
                    <p className={`truncate text-xs ${isSelected ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                      {sidebarTab === "chats" ? "Click to chat" : user.email}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
