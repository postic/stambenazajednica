"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Plus,
  ThumbsUp,
  Clock,
  TrendingUp,
  Loader2,
  User,
  CalendarDays,
} from "lucide-react";

type Topic = {
  id: string;
  title: string;
  body: string;
  created: string;
  changed: string;
  replies: number;
  likes: number;
  author: string;
};

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sort, setSort] = useState<
    "newest" | "active" | "likes"
  >("newest");

  useEffect(() => {
    async function loadTopics() {
      try {
        setLoading(true);

        const response = await fetch("/api/forum");

        if (!response.ok) {
          throw new Error("Greška");
        }

        const data = await response.json();

        setTopics(data.topics || []);
      } catch (error) {
        console.error(error);
        setError("Nije moguće učitati teme.");
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, []);

  const sortedTopics = [...topics].sort((a, b) => {
    if (sort === "active") {
      return b.replies - a.replies;
    }

    if (sort === "likes") {
      return b.likes - a.likes;
    }

    return (
      new Date(b.created).getTime() -
      new Date(a.created).getTime()
    );
  });

  return (
    <div className="max-w-4xl">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            Komšijske teme
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Razgovori i predlozi stanara
          </p>
        </div>

        <Link
          href="/forum/nova"
          className="bg-primary !text-white px-4 py-2 rounded text-sm whitespace-nowrap"
        >
          Nova tema
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="w-full py-6 text-center text-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />

            <div className="text-sm text-gray-400">
              Podaci se učitavaju...
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-600">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        topics.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 font-medium text-slate-800">
              Još nema tema
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Budi prvi koji će pokrenuti razgovor.
            </p>

            <Link
              href="/forum/nova"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Nova tema
            </Link>
          </div>
        )}

      {/* TOPICS */}
      {!loading &&
        !error &&
        sortedTopics.length > 0 && (
          <div className="space-y-3">
            {sortedTopics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* ICON */}
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 sm:flex">
                    <MessageCircle className="h-5 w-5 text-slate-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* TITLE */}
                    <h2 className="text-base font-semibold">
                      <Link
                        href={`/forum/${topic.id}`}
                        className="text-slate-900 hover:text-green-700"
                      >
                        {topic.title}
                      </Link>
                    </h2>

                    {/* OPIS */}
                    <p
                      className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500"
                      dangerouslySetInnerHTML={{
                        __html: topic.body,
                      }}
                    />

                    {/* META */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      {/* AUTOR */}
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium text-slate-600">
                          {topic.author}
                        </span>
                      </span>

                      {/* DATUM */}
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {topic.created
                        ? new Date(topic.created).toLocaleString("sr-RS", {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                      </span>

                      {/* ODGOVORI */}
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {topic.replies}
                      </span>

                      {/* LAJKOVI */}
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {topic.likes}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
