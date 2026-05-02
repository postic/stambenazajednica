'use client';

type Opcija = {
  id: string;
  label: string;
  votes: number;
};

type VotingProps = {
  anketaId: string;
  opcije: Opcija[];
  onVote: (opcijaId: string) => Promise<void>;
  disabled?: boolean;
};

export default function Voting({
  opcije,
  onVote,
  disabled,
}: VotingProps) {
  const totalVotes = opcije.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="space-y-2">
      {opcije.map((o) => {
        const percent = totalVotes
          ? Math.round((o.votes / totalVotes) * 100)
          : 0;

        return (
          <button
            key={o.id}
            onClick={() => onVote(o.id)}
            disabled={disabled}
            className="w-full text-left border rounded p-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex justify-between text-sm">
              <span>{o.label}</span>
              <span>{percent}%</span>
            </div>

            <div className="h-2 bg-gray-200 rounded mt-1 overflow-hidden">
              <div
                className="h-2 bg-black"
                style={{ width: `${percent}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
