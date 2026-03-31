export default function AnketeResults({
  opcije,
  userVote,
}: {
  opcije: { id: string; label: string; votes: number }[];
  userVote?: string;
}) {
  const total = opcije.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div style={{ width: "100%", padding: "1rem 0", fontFamily: "Arial, sans-serif" }}>
      {opcije.map((o) => {
        const percent = total ? Math.round((o.votes / total) * 100) : 0;
        const isUserVote = userVote === o.id;

        return (
          <div
            key={o.id}
            style={{
              marginBottom: "16px",
              padding: "12px",
              borderRadius: "12px",
              background: isUserVote ? "#e6f4ea" : "#f7f7f7",
              boxShadow: isUserVote ? "0 2px 8px rgba(0, 128, 0, 0.2)" : "0 1px 4px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontWeight: isUserVote ? "bold" : "normal",
                color: isUserVote ? "#007b00" : "#333",
              }}
            >
              <span>{o.label} {isUserVote && "✔"}</span>
              <span>{percent}% ({o.votes})</span>
            </div>

            <div style={{ background: "#ddd", height: "16px", borderRadius: "8px", overflow: "hidden", width: "100%" }}>
              <div
                style={{
                  width: `${percent}%`,
                  background: isUserVote ? "#4caf50" : "#007bff",
                  height: "100%",
                  borderRadius: "8px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
