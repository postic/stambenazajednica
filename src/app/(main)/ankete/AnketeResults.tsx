export default function AnketeResults({
  opcije,
  userVote,
}: {
  opcije: { id: string; label: string; votes: number }[];
  userVote?: string;
}) {
  const total = opcije.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div>
      {opcije.map((o) => {
        const percent = total ? Math.round((o.votes / total) * 100) : 0;

        return (
          <div key={o.id} style={{ marginBottom: 12 }}>
            <div>
              {o.label} {userVote === o.id && "✔"}
            </div>

            <div style={{ background: "#eee", height: 10 }}>
              <div
                style={{
                  width: `${percent}%`,
                  background: "#007bff",
                  height: "100%",
                }}
              />
            </div>

            <small>
              {percent}% ({o.votes})
            </small>
          </div>
        );
      })}
    </div>
  );
}
