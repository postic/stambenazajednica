"use client";

import { useState } from "react";
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

import { Loader2, ShieldAlert, X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const [lockedUntil] = useState<number | null>(null);

  // Popup za zaboravljeni PIN
  const [showForgotPin, setShowForgotPin] = useState(false);

  const isLocked = !!(lockedUntil && Date.now() < lockedUntil);

  const remainingSeconds = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
    : 0;

  const isDisabled = loading || isLocked || !pin;

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
          pin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Došlo je do greške");
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
            Unesite Vaš PIN
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-6">
          <form
            className="flex flex-col gap-3 text-center"
            onSubmit={handleLogin}
          >
            {/* PIN */}
            <div className="space-y-2 text-center">
              <Label className="text-gray-600 text-sm block">
                PIN
              </Label>

              <Input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                type="password"
                maxLength={4}
                autoComplete="one-time-code"
                className="h-11 text-sm text-center tracking-widest"
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

            {/* ZABORAVLJENI PIN */}
            <button
              type="button"
              onClick={() => setShowForgotPin(true)}
              className="text-sm text-gray-500 hover:text-gray-800 mt-1"
            >
              Zaboravili ste PIN?
            </button>
          </form>
        </CardContent>
      </Card>

      {/* POPUP */}
      {showForgotPin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowForgotPin(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* X */}
            <button
              type="button"
              onClick={() => setShowForgotPin(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
              aria-label="Zatvori"
            >
              <X size={20} />
            </button>

            <div className="text-center pt-2">
              <h2 className="text-xl font-bold text-gray-800">
                Zaboravili ste PIN?
              </h2>

              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Za dobijanje Vašeg PIN-a kontaktirajte administratora na telefon: 064 2302636.
              </p>

              <Button
                type="button"
                onClick={() => setShowForgotPin(false)}
                className="w-full h-11 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-semibold mt-5"
              >
                Zatvori
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
