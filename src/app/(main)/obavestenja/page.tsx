"use client";

import { useEffect, useState } from "react";
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Obaveštenja</h1>
      <ObavestenjaList obavestenja={obavestenja} />
    </div>
  );
}
