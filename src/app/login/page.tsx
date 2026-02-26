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
} from "@/components/ui/card";

import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // ✅ Auto redirect ako je već login
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // ✅ Lock countdown
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

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, remember }),
      credentials: "include",
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Uspešno ste prijavljeni");
      await login();
      router.push("/dashboard");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      toast.error(data.error || "Neispravni podaci.");

      if (newAttempts >= 3) {
        const lockTime = Date.now() + 30000; // 30 sekundi
        setLockedUntil(lockTime);
        toast.warning("Previše pokušaja. Pokušajte ponovo za 30s.");
      }
    }
  }

  const isLocked = lockedUntil && Date.now() < lockedUntil;
  const isDisabled =
    !identifier || !password || loading || isLocked;

  const remainingSeconds = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
    : 0;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Prijava
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {/* Identifier */}
            <div className="space-y-2">
              <Label htmlFor="identifier">
                Korisničko ime ili email
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Unesite korisničko ime ili email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Unesite lozinku"
                  required
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

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="h-4 w-4"
                />
                Zapamti me
              </label>

              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Zaboravili ste lozinku?
              </Link>
            </div>

            {/* Lock warning */}
            {isLocked && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                <ShieldAlert size={16} />
                Pokušajte ponovo za {remainingSeconds}s
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isDisabled}
              className="w-full"
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
