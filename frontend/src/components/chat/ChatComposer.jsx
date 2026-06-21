import { useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { Paperclip, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function ChatComposer() {
  const fileInputRef = useRef(null);
  
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const composerText = useChatStore((state) => state.composerText);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  
  const setComposerText = useChatStore((state) => state.setComposerText);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  
  const { playRandomKeyStrokeSound } = useKeyboardSound();

  const handleInputChange = (e) => {
    setComposerText(e.target.value);
    if (isSoundEnabled) {
      playRandomKeyStrokeSound();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!composerText.trim()) return;
    
    const success = await sendTextMessage(activeConversationId);
    if (!success) {
      toast.error("Failed to send message");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client validation (optional, backend will also validate)
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Only image and video uploads are allowed");
      return;
    }

    const success = await sendMediaMessage({
      conversationId: activeConversationId,
      file,
    });
    
    if (success) {
      toast.success("Media sent successfully");
    } else {
      toast.error("Failed to send media");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <footer className="border-t border-black/10 bg-[#F6F6F6]/95 p-4 dark:border-white/10 dark:bg-[#1C1C1E]/95">
      <form onSubmit={handleSend} className="flex items-center gap-3">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
          disabled={isSendingMedia}
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSendingMedia}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/5 text-foreground/75 hover:bg-black/10 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10"
          title="Upload image or video"
        >
          {isSendingMedia ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Paperclip className="size-5" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder="Send a message..."
          value={composerText}
          onChange={handleInputChange}
          disabled={isSendingMedia}
          className="flex-1 rounded-full border border-black/10 bg-background px-4 py-2 text-sm outline-hidden focus:border-accent dark:border-white/10"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!composerText.trim() || isSendingMedia}
          className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-all ${
            composerText.trim() && !isSendingMedia
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-black/5 text-foreground/30 dark:bg-white/5"
          }`}
        >
          <Send className="size-4.5" />
        </button>
      </form>
    </footer>
  );
}
export default ChatComposer;
