"use client";

import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";

type Activity = {
  id: string;
  title: string;
  date: string;
  type?: string;
};

interface ActivitiesListProps {
  userId?: string;
}

export default function ActivitiesList({ userId }: ActivitiesListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 5;

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);

      try {
        const url = userId
          ? `/api/activities?userId=${userId}&page=${page}&limit=${limit}`
          : `/api/my-activities?page=${page}&limit=${limit}`;

        const res = await fetch(url);
        const data = await res.json();

        setActivities(data.activities || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [userId, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <CardContent>
      {loading && (
        <p className="text-sm text-muted-foreground">
          Učitavanje aktivnosti...
        </p>
      )}

      {!loading && activities.length > 0 && (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 rounded-xl border hover:bg-muted/50 transition"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium">{activity.title}</p>

                {activity.type && (
                  <span className="text-xs bg-muted px-2 py-1 rounded-md">
                    {activity.type}
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {activity.date}
              </p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prethodna
              </button>

              <span className="px-2 py-1">
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
          )}
        </div>
      )}

      {!loading && activities.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nemate još aktivnosti.
        </p>
      )}
    </CardContent>
  );
}
