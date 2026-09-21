"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ThumbsUp,
  Loader2,
  MessageCircle,
  Send,
  User,
} from "lucide-react";

type ReplyItem = {
  id: string;
  body: string;
  created: string;
  changed: string;
  topic?: string;
  parentId?: string | null;
  author?: string;
  authorId?: string;
};

type Topic = {
  id: string;
  title: string;
  body: string;
  created: string;
  changed: string;
  author: string;
  replies: ReplyItem[];
};

type ForumTopicPageProps = {
  id: string;
};

export default function ForumTopicPage({
  id,
}: ForumTopicPageProps) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // LAJKOVI
  const [replyLikes, setReplyLikes] = useState<
    Record<string, number>
  >({});

  const [replyLiked, setReplyLiked] = useState<
    Record<string, boolean>
  >({});

  const [likeLoading, setLikeLoading] = useState<
    Record<string, boolean>
  >({});

  function formatDate(date: string) {
    if (!date) return "";

    return new Date(date).toLocaleString("sr-RS", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadReplyLikes(replies: ReplyItem[]) {
    try {
      const results = await Promise.all(
        replies.map(async (reply) => {
          try {
            const response = await fetch(
              `/api/forum/reply/${reply.id}/like`,
              {
                cache: "no-store",
              }
            );

            if (!response.ok) {
              return {
                id: reply.id,
                likes: 0,
                liked: false,
              };
            }

            const data = await response.json();

            return {
              id: reply.id,
              likes: Number(data.likes || 0),
              liked: Boolean(data.liked),
            };
          } catch {
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

      results.forEach((item) => {
        likesMap[item.id] = item.likes;
        likedMap[item.id] = item.liked;
      });

      setReplyLikes(likesMap);
      setReplyLiked(likedMap);
    } catch (error) {
      console.error("Greška pri učitavanju lajkova:", error);
    }
  }

  async function loadTopic() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/forum/${id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Greška pri učitavanju teme.");
      }

      const data = await response.json();

      const loadedTopic = data.topic || data;

      setTopic(loadedTopic);

      if (loadedTopic.replies) {
        await loadReplyLikes(loadedTopic.replies);
      }
    } catch (error) {
      console.error(error);
      setError("Nije moguće učitati temu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopic();
  }, [id]);

  async function handleLike(replyId: string) {
    if (likeLoading[replyId]) {
      return;
    }

    try {
      setLikeLoading((prev) => ({
        ...prev,
        [replyId]: true,
      }));

      const currentlyLiked = Boolean(replyLiked[replyId]);

      const response = await fetch(
        `/api/forum/reply/${replyId}/like`,
        {
          method: currentlyLiked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Greška pri promeni lajka."
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
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Nije moguće promeniti lajk."
      );
    } finally {
      setLikeLoading((prev) => ({
        ...prev,
        [replyId]: false,
      }));
    }
  }

  async function handleReplySubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const text = replyText.trim();

    if (!text) {
      return;
    }

    try {
      setSending(true);

      const response = await fetch(`/api/forum/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: text,
          parentId: replyingTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Greška pri slanju odgovora."
        );
      }

      setReplyText("");
      setReplyingTo(null);

      await loadTopic();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Nije moguće poslati odgovor."
      );
    } finally {
      setSending(false);
    }
  }

  function renderReplies(
    replies: ReplyItem[],
    parentId: string | null = null,
    level = 0
  ) {
    const currentReplies = replies.filter(
      (reply) =>
        (reply.parentId || null) === parentId
    );

    if (currentReplies.length === 0) {
      return null;
    }

    return (
      <div className="space-y-3">
        {currentReplies.map((reply) => (
          <div
            key={reply.id}
            className={`rounded-xl border bg-white p-4 shadow-sm ${
              level > 0 ? "ml-5 sm:ml-10" : ""
            }`}
          >
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

            {/* TEKST */}
            <div
              className="text-sm leading-6 text-slate-700"
              dangerouslySetInnerHTML={{
                __html: reply.body,
              }}
            />

            {/* AKCIJE */}
            <div className="mt-3 flex items-center gap-4">
              {/* LAJK */}
              <button
                type="button"
                onClick={() =>
                  handleLike(reply.id)
                }
                disabled={likeLoading[reply.id]}
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

                  window.scrollTo({
                    top:
                      document.body.scrollHeight,
                    behavior: "smooth",
                  });
                }}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
              >
                <MessageCircle className="h-4 w-4" />
                Odgovori
              </button>
            </div>

            {/* PODODGOVORI */}
            <div className="mt-3">
              {renderReplies(
                replies,
                reply.id,
                level + 1
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full py-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />

          <div className="text-sm text-slate-400">
            Tema se učitava...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-600">
          {error}
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Tema nije pronađena.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* NAZAD */}
      <div className="mb-5">
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad na forum
        </Link>
      </div>

      {/* TEMA */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          {topic.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" />

            <span className="font-medium text-slate-600">
              {topic.author || "Komšija"}
            </span>
          </span>

          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(topic.created)}
          </span>

          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {topic.replies?.length || 0}
          </span>
        </div>

        <div
          className="mt-5 text-sm leading-7 text-slate-700"
          dangerouslySetInnerHTML={{
            __html: topic.body,
          }}
        />
      </div>

      {/* ODGOVORI */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-500" />

          <h2 className="font-semibold text-slate-800">
            Odgovori
          </h2>

          <span className="text-sm text-slate-400">
            ({topic.replies?.length || 0})
          </span>
        </div>

        {topic.replies?.length > 0 ? (
          renderReplies(topic.replies)
        ) : (
          <div className="rounded-xl border bg-white p-8 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm text-slate-500">
              Još nema odgovora.
            </p>
          </div>
        )}
      </div>

      {/* ODGOVOR FORMA */}
      <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3">
          <h2 className="font-semibold text-slate-800">
            {replyingTo
              ? "Odgovor na komentar"
              : "Napiši odgovor"}
          </h2>

          {replyingTo && (
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="mt-1 text-xs text-slate-500 hover:text-slate-900"
            >
              Otkaži odgovor
            </button>
          )}
        </div>

        <form
          onSubmit={handleReplySubmit}
          className="space-y-3"
        >
          <textarea
            value={replyText}
            onChange={(event) =>
              setReplyText(event.target.value)
            }
            placeholder="Napiši svoj odgovor..."
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                sending || !replyText.trim()
              }
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              {sending
                ? "Šaljem..."
                : "Pošalji odgovor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
