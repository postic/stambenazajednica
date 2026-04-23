"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Loader2, ShieldAlert, Home, Shield } from "lucide-react";

type Role = "stanar" | "upravnik";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [role, setRole] = useState<Role>("stanar");

  // STANAR
  const [stanarPin, setStanarPin] = useState("");

  // UPRAVNIK (OSTAJE KAO PRE)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const isLocked = !!(lockedUntil && Date.now() < lockedUntil);

  const remainingSeconds = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
    : 0;

  const isDisabled =
    loading ||
    isLocked ||
    (role === "stanar"
      ? !stanarPin
      : !identifier || !password);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);

    try {
      const payload =
        role === "stanar"
          ? { role, pin: stanarPin }
          : { role, identifier, password };

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Uspešno ste prijavljeni");

        router.push(role === "upravnik" ? "/transakcije" : "/kvarovi");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        toast.error(data.error || "Neispravni podaci.");

        if (newAttempts >= 3) {
          setLockedUntil(Date.now() + 30000);
        }
      }
    } catch {
      toast.error("Greška pri povezivanju sa serverom.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3">

      <Card className="w-[340px] max-w-[92vw] shadow-xl rounded-2xl border-0 bg-white">

        <CardHeader className="text-center pt-6 pb-3">

          <CardTitle className="text-2xl font-bold text-gray-800">
            Prijava
          </CardTitle>

          <CardDescription className="text-sm text-gray-500 mt-1">
            Izaberite tip pristupa
          </CardDescription>

          <div className="flex bg-gray-100 rounded-xl p-1 mt-4">

            <button
              type="button"
              onClick={() => setRole("stanar")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition font-medium ${
                role === "stanar"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              <Home size={16} />
              Stanar
            </button>

            <button
              type="button"
              onClick={() => setRole("upravnik")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition font-medium ${
                role === "upravnik"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
            >
              <Shield size={16} />
              Upravnik
            </button>

          </div>
        </CardHeader>

        <CardContent className="px-5 pb-7">

          <form className="flex flex-col gap-3 text-center" onSubmit={handleLogin}>

            {/* STANAR */}
            {role === "stanar" && (
              <div className="space-y-2 text-center">

                <Label className="text-gray-600 text-sm block">
                  PIN <span className="text-red-500">*</span>
                </Label>

                <Input
                  value={stanarPin}
                  onChange={(e) => setStanarPin(e.target.value)}
                  type="password"
                  className="h-11 text-sm text-center"
                  required
                  maxLength={4}
                />
              </div>
            )}

            {/* UPRAVNIK (NE MENJA SE) */}
            {role === "upravnik" && (
              <>
                <div className="space-y-2 text-center">

                  <Label className="text-gray-600 text-sm block">
                    Korisničko ime ili email <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    type="text"
                    className="h-11 text-sm text-center"
                    required
                  />
                </div>

                <div className="space-y-2 text-center">

                  <Label className="text-gray-600 text-sm block">
                    Lozinka <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="h-11 text-sm text-center"
                    required
                  />
                </div>
              </>
            )}

            {isLocked && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-100 p-2 rounded-lg">
                <ShieldAlert size={16} />
                Sačekajte {remainingSeconds}s
              </div>
            )}

            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full h-11 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-semibold mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prijavljivanje...
                </>
              ) : (
                "Prijava"
              )}
            </Button>

          </form>

        </CardContent>
      </Card>

    </div>
  );
}
