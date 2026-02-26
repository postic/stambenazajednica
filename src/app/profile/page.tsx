"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AlertBanner from "@/components/AlertBanner";
import UserAvatar from "@/components/UserAvatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ActivitiesList from "@/components/ActivitiesList";

export default function ProfilePage() {
  const { user: authUser, loading } = useAuth();
  const router = useRouter();

  // Protected route
  useEffect(() => {
    if (!loading && !authUser) {
      router.push("/login");
    }
  }, [authUser, loading, router]);

  if (loading || !authUser) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          {/* ALERT full-width */}
          <AlertBanner />

          {/* Sadržaj sa padding-om */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* PROFIL */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Moj profil</CardTitle>
                </CardHeader>
                <div className="flex flex-col items-center text-center gap-4 p-6">
                  <UserAvatar
                    name={authUser.name}
                    picture={authUser.picture}
                    size={150}
                  />
                  <p className="text-lg font-semibold">{authUser.name}</p>
                  <p className="text-sm text-muted-foreground">{authUser.mail}</p>
                  <p className="text-sm text-muted-foreground">
                    Član od {authUser.created}
                  </p>
                </div>
              </Card>

              {/* AKTIVNOSTI */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Aktivnosti</CardTitle>
                </CardHeader>
                <ActivitiesList />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
