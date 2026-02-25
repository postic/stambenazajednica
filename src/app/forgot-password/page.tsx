"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow p-6 rounded">
      <h1 className="text-xl font-semibold mb-4">
        Reset lozinke
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Unesite email"
          className="w-full border p-2 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Pošalji link
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
