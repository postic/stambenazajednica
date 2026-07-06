"use client";

export default function AnketeResults({
  opcije,
  userVote,
}: {
  opcije: { id: string; label: string; votes: number }[];
  userVote?: string;
}) {
  const total = opcije.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div
      style={{
        width: "100%",
        padding: "1rem 0",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {opcije.map((o) => {
        const percent = total ? Math.round((o.votes / total) * 100) : 0;
        const isUserVote = userVote === o.id;

        return (
          <div
            key={o.id}
            style={{
              marginBottom: "16px",
              padding: "12px 0",
              borderBottom: "1px solid #eee",
              width: "100%",
            }}
          >
            {/* LABEL + RESULT */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontWeight: isUserVote ? "bold" : "normal",
                color: isUserVote ? "#007b00" : "#333",
              }}
            >
              <span>
                {o.label} {isUserVote && "✔"}
              </span>
              <span>
                {percent}%xxxxxxx ({o.votes})
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div
              style={{
                background: "#e5e7eb",
                height: "14px",
                borderRadius: "999px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  background: isUserVote ? "#22c55e" : "#3b82f6",
                  height: "100%",
                  borderRadius: "999px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
