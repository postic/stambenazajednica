"use client";

import { useEffect, useState } from "react";
import AnketeVotingForm from "./AnketeVotingForm";
import AnketeResults from "./AnketeResults";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import Voting from '@/components/Voting';

type Props = {
  anketaId: string;
  opcije: {
    id: string;
    label: string;
    votes: number;
  }[];
};

export default function VotingClient({ anketaId, opcije }: Props) {
  const [userVote, setUserVote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  // ---------------- CHECK VOTE ----------------
  useEffect(() => {
    async function checkVote() {
      try {
        const res = await fetch("/api/my-vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anketaId }),
        });

        const data = await res.json();
        setUserVote(data.vote || null);
      } catch (err) {
        console.error(err);
        setUserVote(null);
      } finally {
        setLoading(false);
      }
    }

    checkVote();
  }, [anketaId]);

  // ---------------- VOTE ----------------
  async function handleVote(opcijaId: string) {
    try {
      setVoting(true);

      const res = await fetch("/api/glas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anketaId, opcijaId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Greška pri glasanju");
        return;
      }

      setUserVote({ opcijaId });
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  }

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="w-full py-6 text-gray-500 text-sm text-center">
        <span className="animate-pulse">Podaci se učitavaju...</span>
      </div>
    );
  }

  // ---------------- RESULTS STATE ----------------
  if (userVote) {
    return (
      <div className="mt-3">

        {/* STATUS + ACTION */}
        <div className="flex items-center justify-between text-green-700 px-3 py-2">

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" />
            Glasanje završeno
          </div>

          {/* LINK TO RESULTS */}
          <Link
            href={`/ankete/${anketaId}`}
            className="text-blue-600 hover:underline"
          >
            Pogledaj rezultate
          </Link>

        </div>

        {/* CHART */}
        <div className="p-3 mt-3 border p-3 bg-slate-50">
          <AnketeResults opcije={opcije} userVote={userVote} />
        </div>

      </div>
    );
  }

  // ---------------- VOTING FORM ----------------
  return (
    <Voting
      anketaId={anketaId}
      opcije={opcije}
      onVote={handleVote}
      disabled={voting}
    />
  );
}
