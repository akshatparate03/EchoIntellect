import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ConversationSummary, ModelKey } from "../utils/api";

const SHORT: Record<ModelKey, string> = {
  gpt: "GPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  deepseek: "DeepSeek",
};

function groupLabel(iso: string): string {
  const d = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = Math.floor((startOfToday.getTime() - d.getTime()) / 86400000) + 1;
  if (d >= startOfToday) return "Today";
  if (days <= 1) return "Yesterday";
  if (days <= 7) return "Previous 7 days";
  if (days <= 30) return "Previous 30 days";
  return "Older";
}

export default function ChatSidebar({
  chats,
  loading,
  activeId,
  onDelete,
  onNavigate,
}: {
  chats: ConversationSummary[];
  loading: boolean;
  activeId?: string;
  onDelete: (id: string) => Promise<void>;
  onNavigate?: () => void;
}) {
  const nav = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const groups: { label: string; items: ConversationSummary[] }[] = [];
  chats.forEach((c) => {
    const label = groupLabel(c.updated_at);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(c);
    else groups.push({ label, items: [c] });
  });

  async function confirmDelete(id: string) {
    setBusyId(id);
    try {
      await onDelete(id);
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="h-full flex flex-col bg-panel/90 border-r border-panel">
      <div className="p-3 flex-shrink-0">
        <button
          className="btn btn-primary w-full"
          onClick={() => {
            nav("/");
            onNavigate?.();
          }}
        >
          + New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-3 min-h-0">
        {loading && <div className="text-muted text-sm px-2 py-3">Loading chats…</div>}
        {!loading && chats.length === 0 && (
          <div className="text-muted text-sm px-2 py-3">
            No chats yet. Ask something on the home page to start one.
          </div>
        )}

        {groups.map((g) => (
          <div key={g.label} className="mb-3">
            <div className="text-[11px] uppercase tracking-wide text-muted px-2 py-1">{g.label}</div>

            {g.items.map((c) => {
              const active = c.id === activeId;
              return (
                <div
                  key={c.id}
                  className={`group flex items-center gap-1 rounded-lg px-2 py-2 cursor-pointer transition-colors ${
                    active ? "bg-gray-800" : "hover:bg-gray-800/60"
                  }`}
                  onClick={() => {
                    nav(`/chat/${c.id}`);
                    onNavigate?.();
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{c.title}</div>
                    <div className="truncate text-[11px] text-muted">
                      {c.models.map((m) => SHORT[m]).join(" · ")}
                    </div>
                  </div>

                  {confirmId === c.id ? (
                    <div className="flex items-center gap-1 text-xs flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50"
                        disabled={busyId === c.id}
                        onClick={() => confirmDelete(c.id)}
                      >
                        {busyId === c.id ? "…" : "Delete"}
                      </button>
                      <button
                        className="px-2 py-1 rounded hover:bg-gray-700"
                        disabled={busyId === c.id}
                        onClick={() => setConfirmId(null)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      aria-label="Delete chat"
                      title="Delete chat"
                      className="flex-shrink-0 p-1.5 rounded text-muted hover:text-red-300 hover:bg-gray-700 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(c.id);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                        <path d="M10 11v6M14 11v6"></path>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
