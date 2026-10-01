import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChatSidebar from "../components/ChatSidebar";
import ModelPanel from "../components/ModelPanel";
import PromptInput from "../components/PromptInput";
import LogoutToast from "../components/LogoutToast";
import { isAuthenticated } from "../utils/auth";
import {
  askTurn,
  createTurn,
  deleteConversation,
  fetchUsage,
  getConversation,
  listConversations,
  type ConversationDetail,
  type ConversationSummary,
  type ModelKey,
  type Turn,
} from "../utils/api";

export default function Chat() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const [chats, setChats] = useState<ConversationSummary[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [conv, setConv] = useState<ConversationDetail | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [animateKeys, setAnimateKeys] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState<Partial<Record<ModelKey, number>>>({});
  const [sending, setSending] = useState(false);

  const [fullscreen, setFullscreen] = useState<ModelKey | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const activeIdRef = useRef<string | undefined>(id);
  const startedRef = useRef<string | null>(null);

  /** Auth check */
  useEffect(() => {
    if (!isAuthenticated()) {
      nav(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [nav, location.pathname]);

  /** Sidebar list + daily usage (once) */
  useEffect(() => {
    if (!isAuthenticated()) return;
    let alive = true;
    listConversations()
      .then((rows) => alive && setChats(rows))
      .catch((e) => alive && setToast(e?.message || "Could not load chats"))
      .finally(() => alive && setChatsLoading(false));
    fetchUsage()
      .then((u) => alive && setRemaining(u.remaining))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // ---------- state helpers (all ignore results of a chat the user already left) ----------
  const patchTurn = useCallback((cid: string, turnNo: number, fn: (t: Turn) => Turn) => {
    if (activeIdRef.current !== cid) return;
    setConv((prev) =>
      prev && prev.id === cid
        ? { ...prev, turns: prev.turns.map((t) => (t.turn === turnNo ? fn(t) : t)) }
        : prev
    );
  }, []);

  const touchChat = useCallback((cid: string, title?: string) => {
    setChats((prev) => {
      const existing = prev.find((c) => c.id === cid);
      if (!existing) return prev;
      const updated = {
        ...existing,
        title: title ?? existing.title,
        updated_at: new Date().toISOString(),
      };
      return [updated, ...prev.filter((c) => c.id !== cid)];
    });
  }, []);

  /** Ask one model for one turn */
  const askOne = useCallback(
    async (cid: string, turnNo: number, model: ModelKey) => {
      const key = `${turnNo}:${model}`;
      setPending((p) => ({ ...p, [key]: true }));
      setLocalErrors((p) => {
        const { [key]: _drop, ...rest } = p;
        return rest;
      });
      try {
        const r = await askTurn(cid, turnNo, model);
        patchTurn(cid, turnNo, (t) => ({
          ...t,
          responses: { ...t.responses, [model]: { content: r.text, is_error: r.is_error } },
        }));
        if (!r.is_error && activeIdRef.current === cid) {
          setAnimateKeys((prev) => new Set(prev).add(key));
        }
        setRemaining((p) => ({ ...p, [model]: r.remaining }));
      } catch (e: any) {
        if (e?.status === 429) setRemaining((p) => ({ ...p, [model]: 0 }));
        if (activeIdRef.current === cid) {
          setLocalErrors((p) => ({ ...p, [key]: e?.message || "Failed" }));
        }
      } finally {
        if (activeIdRef.current === cid) {
          setPending((p) => {
            const { [key]: _drop, ...rest } = p;
            return rest;
          });
        }
        touchChat(cid);
      }
    },
    [patchTurn, touchChat]
  );

  /** Save a new prompt and send it to one model (panel input) or all models (bottom input) */
  const sendPrompt = useCallback(
    async (cid: string, models: ModelKey[], prompt: string, only: ModelKey | null = null) => {
      setSending(true);
      try {
        const t = await createTurn(cid, prompt, only);
        if (activeIdRef.current !== cid) return;
        const newTurn: Turn = {
          turn: t.turn,
          prompt,
          target: only,
          created_at: t.created_at,
          responses: {},
        };
        setConv((prev) =>
          prev && prev.id === cid ? { ...prev, title: t.title, turns: [...prev.turns, newTurn] } : prev
        );
        touchChat(cid, t.title);
        (only ? [only] : models).forEach((m) => askOne(cid, t.turn, m));
      } catch (e: any) {
        setToast(e?.message || "Failed to send");
      } finally {
        setSending(false);
      }
    },
    [askOne, touchChat]
  );

  /** Load the chat whenever the URL id changes */
  useEffect(() => {
    activeIdRef.current = id;
    setConv(null);
    setLoadError(null);
    setPending({});
    setLocalErrors({});
    setAnimateKeys(new Set());
    setFullscreen(null);
    setDrawerOpen(false);
    if (!id || !isAuthenticated()) return;

    let alive = true;
    setLoadingConv(true);
    getConversation(id)
      .then((c) => {
        if (!alive) return;
        setConv(c);
        // chat just created from the home page -> send its first prompt
        const first = (location.state as { firstPrompt?: string } | null)?.firstPrompt;
        if (first && c.turns.length === 0 && startedRef.current !== id) {
          startedRef.current = id;
          nav(location.pathname, { replace: true, state: null });
          sendPrompt(id, c.models, first);
        }
      })
      .catch((e) => alive && setLoadError(e?.message || "Chat not found."))
      .finally(() => alive && setLoadingConv(false));

    return () => {
      alive = false;
    };
  }, [id]);

  async function handleDelete(cid: string) {
    try {
      await deleteConversation(cid);
      setChats((prev) => prev.filter((c) => c.id !== cid));
      if (cid === id) nav("/chat", { replace: true });
    } catch (e: any) {
      setToast(e?.message || "Could not delete chat");
    }
  }

  // turns visible in each model's column
  const turnsFor = useMemo(() => {
    return (m: ModelKey) => (conv?.turns ?? []).filter((t) => t.target === null || t.target === m);
  }, [conv]);

  const gridCols = !conv
    ? ""
    : conv.models.length === 1
    ? "grid-cols-1"
    : conv.models.length === 2
    ? "grid-cols-1 lg:grid-cols-2"
    : conv.models.length === 3
    ? "grid-cols-1 lg:grid-cols-3"
    : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4";

  const sidebar = (
    <ChatSidebar
      chats={chats}
      loading={chatsLoading}
      activeId={id}
      onDelete={handleDelete}
      onNavigate={() => setDrawerOpen(false)}
    />
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-app text-fg">
      {/* Background */}
      <div className="bg-grid fixed inset-0" />
      <div className="bg-ai-gradient fixed inset-0" />

      {/* Spacer for navbar */}
      <div style={{ height: "var(--header-height)", flexShrink: 0 }} />

      <div className="relative z-10 flex-1 flex min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0 min-h-0">{sidebar}</div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex" style={{ top: "var(--header-height)" }}>
            <div className="w-72 max-w-[85%] h-full shadow-2xl">{sidebar}</div>
            <div className="flex-1 bg-black/60" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-2 px-4 pt-3 flex-shrink-0">
            <button className="btn btn-ghost border border-panel px-3" onClick={() => setDrawerOpen(true)}>
              ☰ Chats
            </button>
            <div className="truncate text-sm text-muted">{conv?.title}</div>
          </div>

          {!id && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-3">
              <h2 className="text-2xl font-semibold">Your chats</h2>
              <p className="text-muted text-sm max-w-md">
                Open a previous chat from the list to continue it, or start a new one.
              </p>
              <button className="btn btn-primary" onClick={() => nav("/")}>
                + New chat
              </button>
            </div>
          )}

          {id && loadingConv && (
            <div className="flex-1 flex items-center justify-center text-muted">Loading chat…</div>
          )}

          {id && loadError && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-3">
              <p className="text-red-400">{loadError}</p>
              <button className="btn btn-primary" onClick={() => nav("/chat")}>
                Back to chats
              </button>
            </div>
          )}

          {conv && (
            <div className="flex-1 min-h-0 flex flex-col px-4 py-4 max-w-[99%] w-full mx-auto">
              <div
                className={`flex-1 min-h-0 ${
                  fullscreen
                    ? "flex flex-col overflow-hidden"
                    : `grid gap-3 lg:gap-4 overflow-y-auto custom-scrollbar lg:auto-rows-[minmax(28rem,1fr)] ${gridCols}`
                }`}
              >
                {conv.models.map((m) => (
                  <div
                    key={m}
                    className={`min-h-0 ${fullscreen && fullscreen !== m ? "hidden" : ""} ${
                      fullscreen ? "flex-1 flex flex-col overflow-hidden" : ""
                    }`}
                  >
                    <ModelPanel
                      model={m}
                      conversationId={conv.id}
                      turns={turnsFor(m)}
                      pending={pending}
                      localErrors={localErrors}
                      animateKeys={animateKeys}
                      onTypingDone={(k) =>
                        setAnimateKeys((prev) => {
                          const next = new Set(prev);
                          next.delete(k);
                          return next;
                        })
                      }
                      remaining={remaining[m]}
                      onAsk={(p) => sendPrompt(conv.id, conv.models, p, m)}
                      onRetry={(turnNo) => askOne(conv.id, turnNo, m)}
                      onHeaderClick={() => setFullscreen((fs) => (fs === m ? null : m))}
                      isFullscreen={fullscreen === m}
                    />
                  </div>
                ))}
              </div>

              {/* Input at bottom - hidden in fullscreen mode */}
              {!fullscreen && (
                <div className="mt-4 max-w-[800px] mx-auto w-full flex-shrink-0">
                  <PromptInput
                    placeholder="Ask all models in this chat..."
                    onSubmit={(p) => sendPrompt(conv.id, conv.models, p)}
                    disabled={sending}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spacer for footer */}
      <div style={{ height: "var(--footer-height)", flexShrink: 0 }} />

      <LogoutToast show={!!toast} message={toast || ""} onClose={() => setToast(null)} />
    </div>
  );
}
