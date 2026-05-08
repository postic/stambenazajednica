"use client";

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
    <div className="space-y-4">
      {opcije.map((o) => {
        const percent = totalVotes
          ? Math.round((o.votes / totalVotes) * 100)
          : 0;

        return (
          <button
            key={o.id}
            onClick={() => onVote(o.id)}
            disabled={disabled}
            className="
              w-full text-left rounded-xl border
              bg-white p-4 transition
              hover:bg-gray-50 hover:border-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-800">
                {o.label}
              </span>

              <span className="text-sm text-gray-500 font-medium">
                {percent}%
              </span>
            </div>

            {/* BIGGER PROGRESS BAR */}
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="
                  h-full rounded-full
                  bg-gradient-to-r from-blue-400 to-blue-600
                  transition-all duration-500
                "
                style={{ width: `${percent}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
