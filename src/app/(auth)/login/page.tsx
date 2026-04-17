"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";

type Role = "stanar" | "upravnik";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [role, setRole] = useState<Role>("stanar");

  // STANAR
  const [brojStana, setBrojStana] = useState("");
  const [stanarPin, setStanarPin] = useState("");

  // UPRAVNIK
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      if (Date.now() > lockedUntil) {
        setLockedUntil(null);
        setAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (lockedUntil) return;

    setLoading(true);

    try {
      const payload =
        role === "stanar"
          ? {
              role,
              identifier: brojStana,
              pin: stanarPin,
              remember,
            }
          : {
              role,
              identifier,
              password,
              remember,
            };

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Uspešno ste prijavljeni");
        await login();

        if (role === "upravnik") {
          router.push("/transakcije");
        }
        else if (role === "stanar") {
          router.push("/kvarovi");
        }
        else {
          router.push("/dashboard");
        }

      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        toast.error(data.error || "Neispravni podaci.");

        if (newAttempts >= 3) {
          const lockTime = Date.now() + 30_000;
          setLockedUntil(lockTime);
          toast.warning("Previše pokušaja. Pokušajte ponovo za 30s.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Greška pri povezivanju sa serverom.");
    } finally {
      setLoading(false);
    }
  }

  const isLocked = !!(lockedUntil && Date.now() < lockedUntil);

  const isDisabled =
    loading ||
    isLocked ||
    (role === "stanar"
      ? !brojStana || !stanarPin
      : !identifier || !password);

  const remainingSeconds = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
    : 0;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-xl shadow-lg rounded-2xl border-0">
        <CardHeader className="pb-3 pt-8">
          <CardTitle className="text-2xl font-bold text-center">
            Prijava
          </CardTitle>
          <CardDescription className="text-center text-sm mt-1">
            Izaberite tip pristupa
          </CardDescription>

          {/* SWITCH */}
          <div className="flex bg-gray-100 rounded-lg p-1 mt-4">
            <button
              type="button"
              onClick={() => setRole("stanar")}
              className={`flex-1 py-2 text-sm rounded-md transition ${
                role === "stanar" ? "bg-white shadow" : ""
              }`}
            >
              Stanar
            </button>

            <button
              type="button"
              onClick={() => setRole("upravnik")}
              className={`flex-1 py-2 text-sm rounded-md transition ${
                role === "upravnik" ? "bg-white shadow" : ""
              }`}
            >
              Upravnik
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form
            className="flex flex-col gap-4 max-w-md mx-auto w-full"
            onSubmit={handleLogin}
          >
            {/* STANAR FORM */}
            {role === "stanar" && (
              <>
                <div className="space-y-1">
                  <Label>Broj stana</Label>
                  <Input
                    value={brojStana}
                    onChange={(e) => setBrojStana(e.target.value)}
                    type="text"
                    placeholder="npr. 12"
                    className="h-12 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label>PIN</Label>
                  <Input
                    value={stanarPin}
                    onChange={(e) => setStanarPin(e.target.value)}
                    type="password"
                    placeholder="••••"
                    className="h-12 text-sm"
                  />
                </div>
              </>
            )}

            {/* UPRAVNIK FORM */}
            {role === "upravnik" && (
              <>
                <div className="space-y-1">
                  <Label>Korisničko ime ili email</Label>
                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    type="text"
                    placeholder="Unesite korisničko ime ili email"
                    className="h-12 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Lozinka</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* REMEMBER */}
            <div className="flex items-center justify-between text-xs mt-1">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="h-3 w-3"
                />
                Zapamti me
              </label>

              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-primary ml-6"
              >
                Zaboravili ste lozinku?
              </Link>
            </div>

            {/* LOCK */}
            {isLocked && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                <ShieldAlert size={16} />
                Pokušajte ponovo za {remainingSeconds}s
              </div>
            )}

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full h-12 text-sm font-semibold mt-2"
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {loading
                ? "Prijavljivanje..."
                : isLocked
                ? "Zaključano"
                : "Prijava"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
