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

import {
  Loader2,
  Home,
  Shield,
  ShieldAlert,
} from "lucide-react";

type Role = "stanar" | "upravnik";

export default function LoginPage() {

  const router = useRouter();
  const { refreshUser } = useAuth();

  const [role, setRole] = useState<Role>("stanar");

  const [stanarPin, setStanarPin] = useState("");
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
    loading ||
    isLocked ||
    (role === "stanar"
      ? !stanarPin
      : !identifier || !password);

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {

      let payload: any = {};

      if (role === "stanar") {

        payload = {
          role,
          pin: stanarPin,
        };

      } else {

        payload = {
          role,
          name: identifier,
          pass: password,
        };
      }

      // ✅ IDE SAMO NA NEXT API
      const res = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        toast.error(
          data?.message ||
          "Neispravni podaci"
        );

        return;
      }

      // 🔄 refresh auth state
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

      toast.error(
        "Greška pri povezivanju sa serverom."
      );

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

          {/* ROLE SWITCH */}
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

            {/* STANAR */}
            {role === "stanar" && (

              <div className="space-y-2 text-center">

                <Label className="text-gray-600 text-sm block">
                  PIN
                </Label>

                <Input
                  value={stanarPin}
                  onChange={(e) =>
                    setStanarPin(e.target.value)
                  }
                  type="password"
                  maxLength={4}
                  className="h-11 text-sm text-center"
                />

              </div>
            )}

            {/* UPRAVNIK */}
            {role === "upravnik" && (
              <>

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
                    className="h-11 text-sm text-center"
                  />

                </div>

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
                    className="h-11 text-sm text-center"
                  />

                </div>

              </>
            )}

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

        </CardContent>

      </Card>

    </div>
  );
}
