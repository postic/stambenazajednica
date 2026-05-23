"use client";

import { useState } from "react";
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
  const { refresh } = useAuth();

  const [role, setRole] = useState<Role>("stanar");

  const [stanarPin, setStanarPin] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const isLocked = !!(lockedUntil && Date.now() < lockedUntil);

  const remainingSeconds = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
    : 0;

  const isDisabled =
    loading ||
    isLocked ||
    (role === "stanar" ? !stanarPin : !identifier || !password);

  // 🔐 CSRF TOKEN
  async function getCsrfToken() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/session/token`,
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error("CSRF token error");
    }

    return await res.text();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      let endpoint = "";
      let payload: any = {};
      let csrfToken = "";

      // 🔐 DRUPAL LOGIN REQUIRES CSRF
      if (role === "upravnik") {
        csrfToken = await getCsrfToken();
      }

      // 🔀 ROLE ROUTING
      if (role === "stanar") {
        endpoint = `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/login-stanar`;
        payload = { pin: stanarPin };
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/user/login?_format=json`;
        payload = {
          name: identifier,
          pass: password,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(role === "upravnik" && {
            "X-CSRF-Token": csrfToken,
          }),
        },
        body: JSON.stringify(payload),
      });

      // 🔥 safe parse (Drupal sometimes returns HTML on error)
      const text = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!res.ok) {
        toast.error(data?.message || data?.error || "Neispravni podaci");
        return;
      }

      // 🔄 refresh auth context
      await refresh();

      // 👤 ROLE CHECK
      const resMe = await fetch(
        `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/me`,
        {
          credentials: "include",
        }
      );

      const me = await resMe.json();
      const roles = me?.user?.roles || [];

      const isUpravnik = roles.includes("upravnik");
      const isStanar = roles.includes("stanar");

      if (isUpravnik) {
        router.replace("/dashboard");
      } else if (isStanar) {
        router.replace("/transakcije");
      } else {
        router.replace("/");
      }
    } catch (err) {
      //console.error(err);
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
          <form
            className="flex flex-col gap-3 text-center"
            onSubmit={handleLogin}
          >
            {role === "stanar" && (
              <div className="space-y-2 text-center">
                <Label className="text-gray-600 text-sm block">
                  PIN <span className="text-red-500">*</span>
                </Label>

                <Input
                  value={stanarPin}
                  onChange={(e) => setStanarPin(e.target.value)}
                  type="password"
                  maxLength={4}
                  className="h-11 text-sm text-center"
                  autoComplete="current-password"
                />
              </div>
            )}

            {role === "upravnik" && (
              <>
                <div className="space-y-2 text-center">
                  <Label className="text-gray-600 text-sm block">
                    Korisničko ime ili email{" "}
                    <span className="text-red-500">*</span>
                  </Label>

                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    type="text"
                    className="h-11 text-sm text-center"
                    autoComplete="username"
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
                    autoComplete="current-password"
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
