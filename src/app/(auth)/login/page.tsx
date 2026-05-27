"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

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

import {
  Loader2,
  ShieldAlert,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [lockedUntil] = useState<number | null>(null);

  const isLocked =
    !!(lockedUntil && Date.now() < lockedUntil);

  const remainingSeconds = lockedUntil
    ? Math.max(
        0,
        Math.ceil((lockedUntil - Date.now()) / 1000)
      )
    : 0;

  const isDisabled =
    loading || isLocked || !identifier || !password;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: identifier,
          pass: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Neispravni podaci");
        setLoading(false);
        return;
      }

      await refreshUser();

      const roles = data?.user?.roles || [];

      if (roles.includes("upravnik")) {
        router.replace("/dashboard");
      } else if (roles.includes("stanar")) {
        router.replace("/transakcije");
      } else {
        router.replace("/");
      }

    } catch (err) {
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
            Unesite korisničke podatke
          </CardDescription>

        </CardHeader>

        <CardContent className="px-5 pb-6">

          <form
            className="flex flex-col gap-3 text-center"
            onSubmit={handleLogin}
          >

            {/* IDENTIFIER */}
            <div className="space-y-2 text-center">

              <Label className="text-gray-600 text-sm block">
                Korisničko ime ili email
              </Label>

              <Input
                value={identifier}
                onChange={(e) =>
                  setIdentifier(e.target.value)
                }
                type="text"
                autoComplete="username"
                className="h-11 text-sm text-center"
              />

            </div>

            {/* PASSWORD */}
            <div className="space-y-2 text-center">

              <Label className="text-gray-600 text-sm block">
                Lozinka
              </Label>

              <Input
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                type="password"
                autoComplete="current-password"
                className="h-11 text-sm text-center"
              />

            </div>

            {/* LOCK */}
            {isLocked && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-100 p-2 rounded-lg">
                <ShieldAlert size={16} />
                Sačekajte {remainingSeconds}s
              </div>
            )}

            {/* SUBMIT */}
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

          {/* FOOTER LINK */}
          <div className="mt-5 text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-500 hover:text-gray-900 transition"
            >
              Zaboravljena lozinka?
            </Link>
          </div>

        </CardContent>

      </Card>

    </div>
  );
}
