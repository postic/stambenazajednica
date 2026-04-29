"use client";

import { useState } from "react";

export default function AnketeVotingForm({
  anketaId,
  opcije,
}: {
  anketaId: string;
  opcije: { id: string; label: string }[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);

  const handleVote = async () => {
    if (!selected) return;

    setLoading(true);

    const res = await fetch("/api/ankete/glas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anketaId,
        opcijaId: selected,
        // ❌ NIKAD HARDCODE 581
        // stanId dolazi iz JWT na serveru
        stanId: '0d0d96d6-6ef4-4dc7-be4b-2eb6e68030a6'
      }),
    });

    setLoading(false);

    if (res.ok) {
      setVoted(true);
    } else {
      const status = res.status;

      let errorBody = "";

      try {
        errorBody = await res.text();
      } catch {
        errorBody = "Could not read response body";
      }

      console.error("❌ VOTE FAILED");
      console.error("Status:", status);
      console.error("Body:", errorBody);

      alert(`Greška pri glasanju!\nStatus: ${status}\n${errorBody}`);
    }
  };

  // ✅ nakon glasanja
  if (voted) {
    return (
      <div className="mt-3 border p-3 bg-slate-50">
        Hvala na glasu!
      </div>
    );
  }

  return (
    <div className="mt-3 border p-3 bg-slate-50">
      {/* OPCIJE */}
      {opcije.map((o) => {
        const isSelected = selected === o.id;

        return (
          <button
            key={o.id}
            onClick={() => setSelected(o.id)}
            className={`
              w-full text-left px-4 py-3 rounded-full border transition
              flex items-center justify-between
              ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            <span className="font-medium text-slate-800">
              {o.label}
            </span>

            {isSelected && (
              <span className="text-blue-500 text-sm font-semibold">
                ✔
              </span>
            )}
          </button>
        );
      })}

      {/* BUTTON */}
      <button
        onClick={handleVote}
        disabled={!selected || loading}
        className="
          mt-3 w-full bg-blue-500 text-white py-2 rounded-full
          font-semibold transition
          hover:bg-blue-600
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? "Glasam..." : "Glasaj"}
      </button>
    </div>
  );
}
