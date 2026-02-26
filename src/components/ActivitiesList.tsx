"use client";
import { useState, useEffect } from "react";

export default function ActivitiesList() {
  const [activities, setActivities] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetch(`/api/activities?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities);
        setTotal(data.total);
      });
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <ul>
        {activities.map((act) => (
          <li key={act.id}>{act.attributes.title}</li>
        ))}
      </ul>

      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prethodna
        </button>

        <span>
          {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Sledeća
        </button>
      </div>
    </div>
  );
}
