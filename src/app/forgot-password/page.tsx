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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Reset lozinke
          </CardTitle>
          <CardDescription className="text-center">
            Unesite email adresu i poslaćemo vam link za reset.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email adresa
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ime@primer.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Pošalji link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
