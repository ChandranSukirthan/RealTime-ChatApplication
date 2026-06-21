import { ChevronLeft, Phone, Video, Info } from "lucide-react";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";

export function ChatHeader() {
  const { activeConversation } = useSelectedConversation();
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

  if (!activeConversation) return null;

  const { peer } = activeConversation;

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-black/10 bg-[#F6F6F6]/95 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-[#1C1C1E]/95">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile back button */}
        <button
          onClick={() => setActiveConversationId(null)}
          className="flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Profile Picture / Initials */}
        <div className="relative shrink-0">
          {peer.avatarUrl ? (
            <img src={peer.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-semibold">
              {peer.initials}
            </div>
          )}
          {peer.isOnline && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#F6F6F6] bg-green-500 dark:border-[#1C1C1E]" />
          )}
        </div>

        {/* Partner Name & Status */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{peer.name}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {peer.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Decorative controls */}
      <div className="flex shrink-0 items-center gap-1">
        <button className="flex size-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5">
          <Phone className="size-4.5" />
        </button>
        <button className="flex size-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5">
          <Video className="size-4.5" />
        </button>
        <button className="flex size-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5">
          <Info className="size-4.5" />
        </button>
      </div>
    </header>
  );
}
