import useScrollToBottom from "../../hooks/useScrollToBottom";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";
import { MessageSquare, Loader2 } from "lucide-react";

export function MessageList() {
  const { activeConversation, activeConversationId } = useSelectedConversation();
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);

  const messages = activeConversation?.messages || [];
  const peer = activeConversation?.peer;

  const scrollRef = useScrollToBottom(
    activeConversationId,
    messages[messages.length - 1]?.id
  );

  if (isMessagesLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background/40">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="mt-2 text-xs text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background/40 px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <MessageSquare className="size-8" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Select a conversation</h3>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Choose a person from the sidebar or click "People" to start a new chat.
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background/40 px-4 text-center">
        <div className="relative shrink-0">
          {peer.avatarUrl ? (
            <img src={peer.avatarUrl} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent text-lg font-semibold">
              {peer.initials}
            </div>
          )}
        </div>
        <h3 className="mt-4 text-sm font-semibold">Say hello to {peer.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Send a message to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-background/40 px-4 py-6"
    >
      <div className="space-y-4">
        {messages.map((message) => {
          const isMe = message.role === "me";

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* Receiver avatar */}
              {!isMe && (
                <div className="relative shrink-0 mb-1">
                  {peer.avatarUrl ? (
                    <img src={peer.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-full bg-accent/15 text-accent text-[10px] font-semibold">
                      {peer.initials}
                    </div>
                  )}
                </div>
              )}

              {/* Message content */}
              <div className={`flex max-w-[70%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                    isMe
                      ? "bg-accent text-accent-foreground rounded-br-xs"
                      : "bg-[#E9E9EB] text-black dark:bg-[#262629] dark:text-white rounded-bl-xs"
                  }`}
                >
                  {/* Media attachment (Image) */}
                  {message.imageUrl && (
                    <div className="mb-2 max-w-full overflow-hidden rounded-xl">
                      <img
                        src={message.imageUrl}
                        alt="Attached media"
                        className="max-h-60 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Media attachment (Video) */}
                  {message.videoUrl && (
                    <div className="mb-2 max-w-full overflow-hidden rounded-xl bg-black">
                      <video
                        src={message.videoUrl}
                        controls
                        className="max-h-60 w-full"
                        preload="metadata"
                      />
                    </div>
                  )}

                  {/* Message Text */}
                  {message.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>}
                </div>

                {/* Message Timestamp */}
                <span className="mt-1 px-1 text-[9px] text-muted-foreground">{message.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
