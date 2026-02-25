"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserAvatar from "@/components/UserAvatar";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AlertBanner from "@/components/AlertBanner";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Protected route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar />
        <AlertBanner />
        <main className="p-6 space-y-6">
          {/* Profilna kartica */}
          <div className="bg-white shadow rounded p-6 flex flex-col md:flex-row items-center md:items-start mb-6 gap-6">
  {/* Avatar */}
  <UserAvatar
    name={user?.name}
    picture={user?.picture}
    size={100}
  />

  {/* Info */}
  <div className="flex-1 text-center md:text-left">
    <h1 className="text-2xl font-bold">{user?.name}</h1>
    <p className="text-gray-600">{user?.mail}</p>
    <p className="text-gray-500 mt-1">UID: {user?.uid}</p>
  </div>

  {/* Logout dugme */}
  <div className="mt-4 md:mt-0 md:ml-auto">
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Logout
    </button>
  </div>
</div>

          {/* Detalji korisnika */}
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Detalji korisnika</h2>
            <ul className="space-y-2">
              <li>
                <strong>Ime:</strong> {user.name}
              </li>
              <li>
                <strong>Email:</strong> {user.mail}
              </li>
              <li>
                <strong>UID:</strong> {user.uid}
              </li>
              {/* Ostala polja iz Drupal user entiteta */}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
