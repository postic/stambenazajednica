interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string;
}

export default function ObavestenjaList({ obavestenja }: { obavestenja?: Obavestenje[] }) {
  if (!obavestenja || obavestenja.length === 0) {
    return <p className="text-gray-500">Nema obaveštenja.</p>;
  }

  return (
    <ul className="space-y-6">
      {obavestenja.map((o) => (
        <li key={o.id} className="p-4 bg-white shadow rounded flex flex-col md:flex-row gap-4">
          {o.image && (
            <img src={o.image} alt={o.title} className="w-32 h-32 object-cover rounded" />
          )}
          <div>
            <h2 className="font-semibold text-lg">{o.title}</h2>
            <p className="text-sm text-gray-600 mb-2">
              {new Date(o.created).toLocaleDateString()}
            </p>
            <p className="text-gray-700">{o.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
