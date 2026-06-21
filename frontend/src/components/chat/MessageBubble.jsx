import { useState, useRef, useEffect, useCallback } from "react";
import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";
import { useChatStore } from "../../store/useChatStore";
import { PencilIcon, Trash2Icon, ReplyIcon, XIcon, FileTextIcon } from "lucide-react";

const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

function ReplyPreview({ replyTo, peerName }) {
  if (!replyTo) return null;
  return (
    <div className="mb-1.5 flex items-start gap-1.5 rounded-lg border-l-2 border-accent bg-black/10 px-2 py-1 text-xs">
      <ReplyIcon className="mt-0.5 size-3 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="font-semibold text-accent">{replyTo.isMe ? "You" : peerName}</p>
        {replyTo.isDeleted ? (
          <p className="italic text-muted">This message was deleted</p>
        ) : replyTo.imageUrl ? (
          <p className="italic text-muted">📷 Photo</p>
        ) : replyTo.videoUrl ? (
          <p className="italic text-muted">🎥 Video</p>
        ) : replyTo.audioUrl ? (
          <p className="italic text-muted">🎵 Audio</p>
        ) : replyTo.documentUrl ? (
          <p className="italic text-muted">📄 Document</p>
        ) : (
          <p className="truncate text-muted">{replyTo.text}</p>
        )}
      </div>
    </div>
  );
}

function MessageContextMenu({ isOwnMessage, onReply, onEdit, onDelete, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    // Close when clicking anywhere outside menu
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    // Use capture phase with a small delay so the triggering click doesn't immediately close it
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-[140px] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        ...(isOwnMessage
          ? { right: "calc(100% + 8px)" }
          : { left: "calc(100% + 8px)" }),
      }}
      // Prevent clicks inside menu from toggling the bubble
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onReply}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      >
        <ReplyIcon className="size-4 text-accent shrink-0" />
        <span>Reply</span>
      </button>
      {isOwnMessage && (
        <>
          <div className="border-t border-border/50" />
          <button
            onClick={onEdit}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
          >
            <PencilIcon className="size-4 text-blue-400 shrink-0" />
            <span>Edit</span>
          </button>
          <div className="border-t border-border/50" />
          <button
            onClick={onDelete}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <Trash2Icon className="size-4 shrink-0" />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  );
}

export function MessageBubble({ message, avatarUrl, initials, peerName }) {
  const isOwnMessage = message.role === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);
  const hasAudio = Boolean(message.audioUrl);
  const hasDocument = Boolean(message.documentUrl);
  const [showMenu, setShowMenu] = useState(false);

  // Use _id if available, fall back to id (the view model uses id)
  const messageId = message._id || message.id;

  const setReplyingToMessage = useChatStore((s) => s.setReplyingToMessage);
  const setEditingMessage = useChatStore((s) => s.setEditingMessage);
  const deleteMessageAction = useChatStore((s) => s.deleteMessageAction);

  const handleReply = useCallback(() => {
    // Pass the raw message with correct _id for store usage
    setReplyingToMessage({ ...message, _id: messageId });
    setShowMenu(false);
  }, [message, messageId, setReplyingToMessage]);

  const handleEdit = useCallback(() => {
    setEditingMessage({ ...message, _id: messageId });
    setShowMenu(false);
  }, [message, messageId, setEditingMessage]);

  const handleDelete = useCallback(() => {
    deleteMessageAction(messageId);
    setShowMenu(false);
  }, [messageId, deleteMessageAction]);

  const handleClose = useCallback(() => setShowMenu(false), []);

  // Deleted message placeholder
  if (message.isDeleted) {
    return (
      <div className={`flex w-full gap-2 mt-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[min(85%,28rem)] rounded-2xl px-3 py-2 text-[13px] italic text-muted bg-surface/50 border border-border/50">
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex w-full gap-2 mt-1 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar — only for received messages */}
      {!isOwnMessage && (
        <div className="size-8 shrink-0 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold overflow-hidden self-end">
          {avatarUrl ? (
            <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      )}

      {/*
        Bubble + Toolbar wrapper
        Own     → flex-row-reverse: [toolbar | bubble]  toolbar left of bubble, bubble at right edge
        Received → flex-row:        [bubble | toolbar]  bubble at left, toolbar to its right
      */}
      <div className={`flex items-end gap-1 max-w-[min(85%,28rem)] ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}>

        {/* ── Bubble ── */}
        <div className="relative min-w-0">
          <div
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={showMenu}
            className={`cursor-pointer rounded-2xl px-3 py-2 text-[15px] leading-snug sm:px-3.5 select-none transition-all duration-150 ${
              showMenu ? "ring-2 ring-accent/50 ring-offset-1 ring-offset-background" : ""
            } ${
              isOwnMessage
                ? "rounded-br-md bg-accent text-accent-foreground"
                : "rounded-bl-md bg-surface"
            }`}
            onClick={() => setShowMenu((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowMenu((v) => !v);
              if (e.key === "Escape") setShowMenu(false);
            }}
          >
            {/* Reply preview quote */}
            {message.replyTo && (
              <ReplyPreview replyTo={message.replyTo} peerName={peerName} />
            )}

            {/* Image */}
            {hasImage && (
              <img
                src={withTransform(message.imageUrl, IMAGE_TRANSFORM)}
                alt=""
                className="mb-1.5 max-h-52 max-w-full rounded-lg object-cover sm:rounded-xl"
              />
            )}
            {/* Video */}
            {hasVideo && <MessageVideo src={message.videoUrl} />}
            {/* Audio */}
            {hasAudio && (
              <audio src={message.audioUrl} controls className="max-w-full my-1 rounded-lg outline-none" />
            )}
            {/* Document */}
            {hasDocument && (
              <a
                href={message.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`my-1.5 flex items-center gap-3 rounded-xl border p-2.5 hover:opacity-90 transition-opacity ${
                  isOwnMessage
                    ? "border-accent-foreground/20 bg-black/10 text-accent-foreground"
                    : "border-border bg-black/5 text-foreground"
                }`}
              >
                <FileTextIcon className="size-8 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {message.documentUrl.split("/").pop() || "Document"}
                  </p>
                  <p className="text-[10px] opacity-75">Click to view/download</p>
                </div>
              </a>
            )}
            {/* Text */}
            {message.text && (
              <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
            )}
            {/* Time + edited badge */}
            <p
              className={`mt-1 text-[11px] tabular-nums flex items-center gap-1 ${
                isOwnMessage ? "text-accent-foreground/75 justify-end" : "text-muted"
              }`}
            >
              {message.isEdited && (
                <span className="italic opacity-80">(edited)</span>
              )}
              {message.time}
            </p>
          </div>

          {/* Click context menu */}
          {showMenu && (
            <MessageContextMenu
              isOwnMessage={isOwnMessage}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClose={handleClose}
            />
          )}
        </div>

        {/* ── Hover Quick-Action Toolbar ── */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-150 shrink-0 pb-1">
          <button
            onClick={handleReply}
            type="button"
            title="Reply"
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-accent transition-colors"
          >
            <ReplyIcon className="size-3.5" />
          </button>
          {isOwnMessage && (
            <>
              <button
                onClick={handleEdit}
                type="button"
                title="Edit"
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-blue-400 transition-colors"
              >
                <PencilIcon className="size-3.5" />
              </button>
              <button
                onClick={handleDelete}
                type="button"
                title="Delete"
                className="p-1.5 rounded-full hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2Icon className="size-3.5" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}