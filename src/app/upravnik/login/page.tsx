"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Loader2 } from "lucide-react";

export default function UpravnikLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled =
    loading || !username.trim() || !password;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/upravnik/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data?.message ||
            "Neispravno korisničko ime ili lozinka."
        );
        return;
      }

      toast.success("Uspešno ste prijavljeni.");

      router.replace("/upravnik");
      router.refresh();
    } catch (error) {
      console.error("Upravnik login error:", error);

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
            Upravnik
          </CardTitle>

          <CardDescription className="mt-1 text-sm text-gray-500">
            Prijavite se svojim korisničkim imenom i lozinkom
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-6">
          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-3 text-center"
          >
            {/* KORISNIČKO IME */}
            <div className="flex flex-col items-center gap-2">
              <Label
                htmlFor="username"
                className="text-center text-sm text-gray-600"
              >
                Korisničko ime
              </Label>

              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                autoComplete="username"
                autoFocus
                disabled={loading}
                className="h-11 text-sm text-center"
              />
            </div>

            {/* LOZINKA */}
            <div className="flex flex-col items-center gap-2">
              <Label
                htmlFor="password"
                className="text-center text-sm text-gray-600"
              >
                Lozinka
              </Label>

              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                disabled={loading}
                className="h-11 text-sm text-center"
              />
            </div>

            {/* PRIJAVA */}
            <Button
              type="submit"
              disabled={isDisabled}
              className="mt-1 h-11 w-full rounded-xl bg-gray-800 font-semibold text-white hover:bg-gray-900"
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

            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Logujte se kao stanar
            </Link>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
