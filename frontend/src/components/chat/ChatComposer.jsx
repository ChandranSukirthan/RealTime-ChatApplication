import { Button, TextArea } from "@heroui/react";
import {
  ImageIcon,
  LoaderIcon,
  SendHorizontalIcon,
  XIcon,
  ReplyIcon,
  PencilIcon,
  PlusIcon,
  FileTextIcon,
  CameraIcon,
  HeadphonesIcon,
  UserIcon,
  BarChart2Icon,
  CalendarIcon,
  StickerIcon
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import toast from "react-hot-toast";

export function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const replyingToMessage = useChatStore((state) => state.replyingToMessage);
  const editingMessage = useChatStore((state) => state.editingMessage);
  const clearComposerMode = useChatStore((state) => state.clearComposerMode);

  const { activeConversationId, activeConversation } = useSelectedConversation();
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const mediaInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const menuRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const menuItems = [
    {
      icon: <FileTextIcon className="size-5 text-violet-500 shrink-0" />,
      label: "Document",
      action: () => documentInputRef.current?.click(),
    },
    {
      icon: <ImageIcon className="size-5 text-blue-500 shrink-0" />,
      label: "Photos & videos",
      action: () => mediaInputRef.current?.click(),
    },
    {
      icon: <CameraIcon className="size-5 text-rose-500 shrink-0" />,
      label: "Camera",
      action: () => cameraInputRef.current?.click(),
    },
    {
      icon: <HeadphonesIcon className="size-5 text-orange-500 shrink-0" />,
      label: "Audio",
      action: () => audioInputRef.current?.click(),
    },
    {
      icon: <UserIcon className="size-5 text-sky-400 shrink-0" />,
      label: "Contact",
      action: () => toast("Share contacts coming soon!", { icon: "👤" }),
    },
    {
      icon: <BarChart2Icon className="size-5 text-amber-500 shrink-0" />,
      label: "Poll",
      action: () => toast("Polls coming soon!", { icon: "📊" }),
    },
    {
      icon: <CalendarIcon className="size-5 text-pink-500 shrink-0" />,
      label: "Event",
      action: () => toast("Events coming soon!", { icon: "📅" }),
    },
    {
      icon: <StickerIcon className="size-5 text-emerald-500 shrink-0" />,
      label: "New sticker",
      action: () => toast("Stickers coming soon!", { icon: "✨" }),
    },
  ];

  const peerName = activeConversation?.peer?.name || "";

  const playSoundIfEnabled = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const handleSend = async () => {
    const didSendMessage = await sendTextMessage(activeConversationId);
    if (didSendMessage) playSoundIfEnabled();
  };

  const handleComposerTextChange = (event) => {
    setComposerText(event.target.value);
    playSoundIfEnabled();
  };

  const handleMediaPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const didSendMessage = await sendMediaMessage({
      conversationId: activeConversationId,
      file,
    });

    if (didSendMessage) playSoundIfEnabled();
  };

  const contextBanner = replyingToMessage
    ? {
        icon: <ReplyIcon className="size-4 text-accent shrink-0" />,
        label: `Replying to ${replyingToMessage.role === "me" ? "yourself" : peerName}`,
        preview: replyingToMessage.imageUrl
          ? "📷 Photo"
          : replyingToMessage.videoUrl
          ? "🎥 Video"
          : replyingToMessage.audioUrl
          ? "🎵 Audio"
          : replyingToMessage.documentUrl
          ? "📄 Document"
          : replyingToMessage.text || "",
      }
    : editingMessage
    ? {
        icon: <PencilIcon className="size-4 text-blue-400 shrink-0" />,
        label: "Editing message",
        preview: editingMessage.text || (editingMessage.imageUrl ? "📷 Photo" : editingMessage.videoUrl ? "🎥 Video" : editingMessage.audioUrl ? "🎵 Audio" : editingMessage.documentUrl ? "📄 Document" : ""),
      }
    : null;

  return (
    <footer className="shrink-0 border-t border-border px-1.5 pb-2 pt-2 sm:px-2">
      {/* Reply / Edit Banner */}
      {contextBanner && (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
          {contextBanner.icon}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-accent">{contextBanner.label}</p>
            <p className="truncate text-xs text-muted">{contextBanner.preview}</p>
          </div>
          <button
            onClick={clearComposerMode}
            className="shrink-0 rounded-full p-1 hover:bg-surface-hover transition-colors"
            aria-label="Cancel"
          >
            <XIcon className="size-4 text-muted" />
          </button>
        </div>
      )}

      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon
            className="size-4 shrink-0 animate-spin text-accent"
            strokeWidth={2}
            aria-hidden
          />
          <span className="truncate">Uploading media...</span>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <div className="relative self-end">
          <Button
            variant="ghost"
            isIconOnly
            isDisabled={isSendingMedia || !!editingMessage}
            className="size-9 shrink-0 touch-manipulation text-accent rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            onPress={() => setShowMenu(!showMenu)}
          >
            <PlusIcon
              className={`size-5 sm:size-6 transition-transform duration-200 ${
                showMenu ? "rotate-45 text-red-400" : ""
              }`}
              strokeWidth={2.5}
            />
          </Button>

          {showMenu && (
            <div
              ref={menuRef}
              className="absolute bottom-11 left-0 z-50 w-56 overflow-hidden rounded-[20px] border border-border bg-surface shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <TextArea
          fullWidth
          variant="secondary"
          placeholder={editingMessage ? "Edit message..." : replyingToMessage ? "Write a reply..." : "iMessage"}
          rows={1}
          value={composerText}
          onChange={handleComposerTextChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
            if (event.key === "Escape") {
              clearComposerMode();
            }
          }}
          className="flex-1 rounded-full"
        />

        <Button variant="primary" isIconOnly isDisabled={!composerText.trim()} onPress={handleSend}>
          <SendHorizontalIcon className="size-5" />
        </Button>
      </div>
    </footer>
  );
}