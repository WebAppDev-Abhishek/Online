"use client";

import { useEffect, useRef, useState } from "react";
import { Pin, Flag, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
  sender: { id: string; name: string; role: string };
};

type Conversation = {
  id: string;
  pinned?: boolean;
  flagged?: boolean;
  student?: { id: string; name: string; phone: string };
  messages?: { body: string; createdAt: string }[];
};

export function ChatWindow({
  role,
  currentUserId,
}: {
  role: "STUDENT" | "ADMIN";
  currentUserId: string;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [typing, setTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<import("socket.io-client").Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (role === "ADMIN") {
        const res = await fetch("/api/chat");
        const data = await res.json();
        if (!cancelled && data.conversations) {
          setConversations(data.conversations);
          if (data.conversations[0] && !activeId) {
            setActiveId(data.conversations[0].id);
          }
        }
      } else {
        const res = await fetch("/api/chat");
        const data = await res.json();
        if (!cancelled) {
          if (data.conversation) setActiveId(data.conversation.id);
          setMessages(data.messages || []);
        }
      }
    }
    load();

    // Optional Socket.io — falls back to polling if server not available
    import("socket.io-client")
      .then(({ io }) => {
        const socket = io({ path: "/api/socketio", autoConnect: true });
        socketRef.current = socket;
        socket.emit("join", { userId: currentUserId, role });
        socket.on("message", (msg: Message & { conversationId: string }) => {
          if (role === "STUDENT" || msg.conversationId === activeId) {
            setMessages((m) =>
              m.some((x) => x.id === msg.id) ? m : [...m, msg]
            );
          }
          setPeerTyping(false);
        });
        socket.on("typing", (payload: { conversationId: string; typing: boolean }) => {
          if (!activeId || payload.conversationId === activeId) {
            setPeerTyping(payload.typing);
          }
        });
      })
      .catch(() => {});

    const poll = setInterval(async () => {
      if (role === "STUDENT") {
        const res = await fetch("/api/chat");
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } else if (activeId) {
        const res = await fetch(`/api/chat?conversationId=${activeId}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, currentUserId]);

  useEffect(() => {
    if (!activeId || role !== "ADMIN") return;
    fetch(`/api/chat?conversationId=${activeId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []));
  }, [activeId, role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!body.trim()) return;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: body.trim(),
        conversationId: role === "ADMIN" ? activeId : undefined,
      }),
    });
    const data = await res.json();
    if (res.ok && data.message) {
      setMessages((m) => [...m, data.message]);
      setBody("");
      socketRef.current?.emit("message", {
        ...data.message,
        conversationId: activeId,
      });
    }
  }

  function onTyping(value: string) {
    setBody(value);
    if (!typing) {
      setTyping(true);
      socketRef.current?.emit("typing", {
        conversationId: activeId,
        typing: true,
      });
      setTimeout(() => {
        setTyping(false);
        socketRef.current?.emit("typing", {
          conversationId: activeId,
          typing: false,
        });
      }, 1200);
    }
  }

  async function toggleFlag(field: "pinned" | "flagged") {
    if (!activeId) return;
    const conv = conversations.find((c) => c.id === activeId);
    await fetch("/api/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeId,
        [field]: !conv?.[field],
      }),
    });
    setConversations((list) =>
      list.map((c) =>
        c.id === activeId ? { ...c, [field]: !c[field] } : c
      )
    );
  }

  return (
    <div
      className={cn(
        "card-surface flex overflow-hidden",
        role === "ADMIN" ? "min-h-[480px] flex-col md:flex-row" : "min-h-[420px] flex-col"
      )}
    >
      {role === "ADMIN" && (
        <div className="w-full border-b border-line md:w-64 md:border-b-0 md:border-r">
          <div className="border-b border-line px-4 py-3 text-sm font-semibold">
            Conversations
          </div>
          <ul className="max-h-48 overflow-y-auto md:max-h-[420px]">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition",
                    activeId === c.id
                      ? "bg-trace/10 text-trace"
                      : "hover:bg-elevated"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink">
                      {c.student?.name}
                    </span>
                    <span className="flex gap-1">
                      {c.pinned && <Pin className="h-3 w-3 text-copper" />}
                      {c.flagged && <Flag className="h-3 w-3 text-danger" />}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted">
                    {c.messages?.[0]?.body || "No messages yet"}
                  </p>
                </button>
              </li>
            ))}
            {conversations.length === 0 && (
              <li className="px-4 py-6 text-sm text-muted">
                No student chats yet.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-semibold text-ink">
            {role === "ADMIN"
              ? conversations.find((c) => c.id === activeId)?.student?.name ||
                "Select a chat"
              : "Instructor chat"}
          </p>
          {role === "ADMIN" && activeId && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleFlag("pinned")}
                className="rounded border border-line p-1.5 hover:border-copper"
                title="Pin"
              >
                <Pin className="h-4 w-4 text-copper" />
              </button>
              <button
                type="button"
                onClick={() => toggleFlag("flagged")}
                className="rounded border border-line p-1.5 hover:border-danger"
                title="Flag"
              >
                <Flag className="h-4 w-4 text-danger" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => {
            const mine = m.sender.id === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    mine
                      ? "rounded-br-md bg-trace/20 text-ink"
                      : "rounded-bl-md bg-elevated text-ink"
                  )}
                >
                  {!mine && (
                    <p className="mb-0.5 text-[10px] uppercase text-muted">
                      {m.sender.name}
                    </p>
                  )}
                  <p>{m.body}</p>
                  <p className="mt-1 text-[10px] text-muted">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {mine && m.readAt ? " · Read" : mine ? " · Sent" : ""}
                  </p>
                </div>
              </div>
            );
          })}
          {peerTyping && (
            <p className="text-xs text-muted">Typing…</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 border-t border-line p-3">
          <input
            className="input-field"
            placeholder="Type a message…"
            value={body}
            onChange={(e) => onTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={role === "ADMIN" && !activeId}
          />
          <button
            type="button"
            onClick={send}
            className="btn-primary !px-3"
            disabled={role === "ADMIN" && !activeId}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
