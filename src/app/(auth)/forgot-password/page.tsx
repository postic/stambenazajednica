"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || "Link za reset je poslat.");
    } else {
      toast.error(data.error || "Došlo je do greške.");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-xl shadow-lg rounded-2xl border-0">
        <CardHeader className="pb-3 pt-8">
          <CardTitle className="text-2xl font-bold text-center">
            Reset lozinke
          </CardTitle>
          <CardDescription className="text-center text-sm mt-1 break-words">
            Unesite email adresu i poslaćemo vam link za reset.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form className="flex flex-col gap-4 max-w-md mx-auto w-full" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">
                Email adresa
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ime@primer.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-sm"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold mt-2"
            >
              Pošalji link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
