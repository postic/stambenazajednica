export default function NewsList({ news }: { news: any[] }) {
  if (!news.length) {
    return <p className="text-gray-500">Nema obaveštenja.</p>;
  }

  return (
    <div className="space-y-6">
      {news.map((item) => (
        <div
          key={item.id}
          className="bg-white shadow rounded p-6 hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">{item.title}</h2>

          <p className="text-sm text-gray-400 mb-3">
            {new Date(item.created).toLocaleDateString()}
          </p>

          {item.image && (
            <img
              src={`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}${item.image}`}
              className="mb-4 rounded"
            />
          )}

          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: item.body }}
          />
        </div>
      ))}
    </div>
  );
}
