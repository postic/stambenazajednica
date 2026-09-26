"use client";

import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import {
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AiPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Došlo je do greške."
        );
      }

      setAnswer(data.answer || "");
    } catch (error) {
      console.error("AI greška:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Došlo je do greške prilikom komunikacije sa AI servisom."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <Sparkles className="h-6 w-6 text-gray-700" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          AI pomoćnik
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Postavite pitanje o finansijama vaše
          stambene zajednice.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <Input
            value={question}
            onChange={(event) =>
            setQuestion(event.target.value)
            }
            placeholder="Na primer: Koliko trenutno imamo na računu?"
            disabled={loading}
            className="h-11 rounded-xl"
          />

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              disabled={
                loading || !question.trim()
              }
              className="rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Razmišljam...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Pitaj AI
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-6 rounded-2xl border bg-gray-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gray-600" />

            <span className="text-sm font-semibold text-gray-700">
              Odgovor
            </span>
          </div>

          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-900">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}
