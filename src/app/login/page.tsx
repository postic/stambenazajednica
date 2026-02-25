"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // putanja do AuthContext
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // ← ovde dobijaš login funkciju
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      credentials: "include", // 🔥 OBAVEZNO
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      await login();   // ← ovo je ključno
      router.push("/dashboard");
    } else {
      alert(data.error);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Prijava</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="identifier">Korisničko ime ili email</Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Unesite korisničko ime ili email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Unesite lozinku"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Učitavanje..." : "Prijava"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
