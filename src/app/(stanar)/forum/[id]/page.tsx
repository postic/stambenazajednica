"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ThumbsUp,
  Loader2,
  User,
} from "lucide-react";

interface Topic {
  id: string;
  title: string;
  body: string;
  created: string;
  changed: string;
  prostor: string | null;
}

interface ReplyItem {
  id: string;
  body: string;
  created: string;
  changed: string;
  prostor: string | null;
  topic: string | null;
  parentId: string | null;
  author: string | null;
}

export default function ForumTopicPage() {
  const params = useParams();
  const id = String(params.id);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // ==========================================
  // LAJKOVI
  // ==========================================

  const [replyLikes, setReplyLikes] = useState<
    Record<string, number>
  >({});

  const [replyLiked, setReplyLiked] = useState<
    Record<string, boolean>
  >({});

  const [likeLoading, setLikeLoading] = useState<
    Record<string, boolean>
  >({});

  // ==========================================
  // UČITAVANJE TEME
  // ==========================================

  async function loadTopic() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/forum/${id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Greška pri učitavanju teme."
        );
      }

      setTopic(data.topic || null);
      setReplies(data.replies || []);

      // Učitaj lajkove za sve odgovore
      await loadReplyLikes(data.replies || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Greška pri učitavanju teme."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    loadTopic();
  }, [id]);

  // ==========================================
  // UČITAVANJE LAJKOVA
  // ==========================================

  async function loadReplyLikes(
    replyItems: ReplyItem[]
  ) {
    if (replyItems.length === 0) {
      setReplyLikes({});
      setReplyLiked({});
      return;
    }

    try {
      const results = await Promise.all(
        replyItems.map(async (reply) => {
          try {
            const res = await fetch(
              `/api/forum/reply/${reply.id}/like`,
              {
                cache: "no-store",
              }
            );

            if (!res.ok) {
              return {
                id: reply.id,
                likes: 0,
                liked: false,
              };
            }

            const data = await res.json();

            return {
              id: reply.id,
              likes: Number(data.likes || 0),
              liked: Boolean(data.liked),
            };
          } catch (err) {
            console.error(
              `Greška pri učitavanju lajka za reply ${reply.id}:`,
              err
            );

            return {
              id: reply.id,
              likes: 0,
              liked: false,
            };
          }
        })
      );

      const likesMap: Record<string, number> = {};
      const likedMap: Record<string, boolean> = {};

      for (const item of results) {
        likesMap[item.id] = item.likes;
        likedMap[item.id] = item.liked;
      }

      setReplyLikes(likesMap);
      setReplyLiked(likedMap);
    } catch (err) {
      console.error(
        "Greška pri učitavanju lajkova:",
        err
      );
    }
  }

  // ==========================================
  // LAJK / UNLAJK
  // ==========================================

  async function handleLike(replyId: string) {
    if (likeLoading[replyId]) {
      return;
    }

    const currentlyLiked =
      replyLiked[replyId] === true;

    try {
      setLikeLoading((prev) => ({
        ...prev,
        [replyId]: true,
      }));

      const res = await fetch(
        `/api/forum/reply/${replyId}/like`,
        {
          method: currentlyLiked
            ? "DELETE"
            : "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Greška pri promeni lajka."
        );
      }

      setReplyLikes((prev) => ({
        ...prev,
        [replyId]: Number(data.likes || 0),
      }));

      setReplyLiked((prev) => ({
        ...prev,
        [replyId]: Boolean(data.liked),
      }));
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Greška pri promeni lajka."
      );
    } finally {
      setLikeLoading((prev) => ({
        ...prev,
        [replyId]: false,
      }));
    }
  }

  // ==========================================
  // GRUPISANJE REPLY-JEVA
  // ==========================================

  const repliesByParent = useMemo(() => {
    const map = new Map<
      string | null,
      ReplyItem[]
    >();

    for (const reply of replies) {
      const parentId = reply.parentId || null;

      if (!map.has(parentId)) {
        map.set(parentId, []);
      }

      map.get(parentId)!.push(reply);
    }

    return map;
  }, [replies]);

  // ==========================================
  // SLANJE ODGOVORA
  // ==========================================

  async function handleReply() {
    const text = replyText.trim();

    if (!text) return;

    try {
      setSending(true);

      const res = await fetch(`/api/forum/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: text,
          parentId: replyingTo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Greška pri slanju odgovora."
        );
      }

      setReplyText("");
      setReplyingTo(null);

      await loadTopic();
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Greška pri slanju odgovora."
      );
    } finally {
      setSending(false);
    }
  }

  // ==========================================
  // DATUM
  // ==========================================

  function formatDate(date: string) {
    try {
      return new Date(date).toLocaleString("sr-RS", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  }

  // ==========================================
  // REPLY-JEVI
  // ==========================================

  function renderReplies(
    parentId: string | null,
    level = 0
  ): React.ReactNode {
    const items =
      repliesByParent.get(parentId) || [];

    if (items.length === 0) {
      return null;
    }

    return (
      <div
        className={
          level > 0
            ? "ml-6 mt-4 border-l pl-4"
            : ""
        }
      >
        {items.map((reply) => (
          <div key={reply.id} className="mb-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              {/* HEADER */}
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>

                  <span>
                    {reply.author || "Komšija"}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  {formatDate(reply.created)}
                </div>
              </div>

              {/* BODY */}
              <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {reply.body}
              </div>

              {/* AKCIJE */}
              <div className="mt-3 flex items-center gap-4">
                {/* LAJK */}
                <button
                  type="button"
                  onClick={() =>
                    handleLike(reply.id)
                  }
                  disabled={
                    likeLoading[reply.id]
                  }
                  className={`inline-flex items-center gap-1.5 text-sm transition ${
                    replyLiked[reply.id]
                      ? "text-yellow-500"
                      : "text-slate-500 hover:text-yellow-500"
                  }`}
                >
                  {likeLoading[reply.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsUp
                      className="h-4 w-4"
                      fill={
                        replyLiked[reply.id]
                          ? "currentColor"
                          : "none"
                      }
                    />
                  )}

                  {replyLikes[reply.id] > 0 && (
                    <span>
                      {replyLikes[reply.id]}
                    </span>
                  )}
                </button>

                {/* ODGOVORI */}
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(reply.id);
                    setReplyText("");
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Odgovori
                </button>
              </div>
            </div>

            {/* CHILD REPLIES */}
            {renderReplies(
              reply.id,
              level + 1
            )}
          </div>
        ))}
      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="w-full py-6 text-center text-sm">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />

          <div className="text-sm text-gray-400">
            Podaci se učitavaju...
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          {error}
        </div>
      </main>
    );
  }

  // ==========================================
  // TEMA NE POSTOJI
  // ==========================================

  if (!topic) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border bg-white p-6 text-center text-slate-500">
          Tema nije pronađena.
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="max-w-4xl">
      {/* TOPIC */}
      <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          {topic.title}
        </h1>

        <div className="mt-2 text-xs text-slate-400">
          {formatDate(topic.created)}
        </div>

        <div
          className="mt-4 text-sm leading-7 text-slate-700"
          dangerouslySetInnerHTML={{
            __html: topic.body,
          }}
        />
      </div>

      {/* REPLIES */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Odgovori
        </h2>

        {replies.length === 0 ? (
          <div className="rounded-xl border bg-white p-5 text-sm text-slate-500">
            Još nema odgovora.
          </div>
        ) : (
          renderReplies(id)
        )}
      </div>

      {/* REPLY FORM */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        {replyingTo && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span>
              Odgovaraš na komentar.
            </span>

            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
              className="font-medium text-slate-500 hover:text-slate-700"
            >
              Otkaži
            </button>
          </div>
        )}

        <textarea
          value={replyText}
          onChange={(e) =>
            setReplyText(e.target.value)
          }
          placeholder={
            replyingTo
              ? "Napiši odgovor..."
              : "Napiši odgovor na temu..."
          }
          rows={4}
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleReply}
            disabled={
              sending || !replyText.trim()
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending
              ? "Slanje..."
              : "Pošalji odgovor"}
          </button>
        </div>
      </div>
    </main>
  );
}
