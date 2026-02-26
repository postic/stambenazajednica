"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AlertBanner from "@/components/AlertBanner";
import ObavestenjaList from "@/components/ObavestenjaList";

export default function ObavestenjaPage() {
  const [obavestenja, setObavestenja] = useState([]);

  useEffect(() => {
    fetch("/api/obavestenja")
      .then((res) => res.json())
      .then((data) => setObavestenja(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {/* ALERT ide full width, van padding-a */}
          <AlertBanner />

          {/* Sadržaj sa padding-om */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Obaveštenja</h1>
            <ObavestenjaList obavestenja={obavestenja} />
          </div>
        </main>
      </div>
    </div>
  );
}
