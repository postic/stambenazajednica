"use client";

import { useState, useEffect } from "react";
import { CardContent } from "@/components/ui/card";

type Activity = {
  id: string;
  title: string;
  date: string;
  type?: string;
};

type ActivitiesListProps = {
  userId?: string;
};

export default function ActivitiesList({ userId }: ActivitiesListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const limit = 5;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        const url = userId
          ? `/api/activities?userId=${userId}&page=${page}&limit=${limit}`
          : `/api/my-activities?page=${page}&limit=${limit}`;

        const res = await fetch(url);
        const data = await res.json();

        setActivities(data.activities ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setActivities([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

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
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prethodna
              </button>

              <span className="px-2 py-1">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
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
