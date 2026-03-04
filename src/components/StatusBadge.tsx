interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = "bg-gray-200 text-gray-800"; // default

  switch (status.toLowerCase()) {
    case "otvoren":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "u radu":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "na čekanju":
      colorClass = "bg-orange-100 text-orange-800";
      break;
    case "zatvoren":
      colorClass = "bg-red-100 text-red-800";
      break;
  }

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}
    >
      {status}
    </span>
  );
}
