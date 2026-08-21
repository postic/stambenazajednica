"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Scaling,
  Layers3,
  Users,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface Prostor {
  id: string;
  title: string;
  tip: string | null;
  sprat: string | null;
  redniBroj: number | null;
  broj_prostora: string | null;
  kvadratura: number | null;
  broj_stanara: number | null;
  vlasnik: string | null;
  korisnik: string | null;
  telefon: string | null;
  email: string | null;
}

interface ProfileData {
  user: {
    uid: string;
    name: string;
  };

  prostor: Prostor | null;
}

type EditField =
  | "mail"
  | "phone"
  | null;

// --------------------------------------------------
// SKRATI TIP
// --------------------------------------------------

function skratiTip(
  tip: string | null | undefined
) {
  if (!tip) return "-";

  return tip
    .trim()
    .split(/\s+/)
    .map((rec) =>
      rec.charAt(0).toUpperCase()
    )
    .join("");
}

// ==================================================
// PAGE
// ==================================================

export default function ProfilePage() {
  const {
    user: authUser,
    loading: authLoading,
  } = useAuth();

  const router = useRouter();

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState<EditField>(null);

  const [editValue, setEditValue] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  // ==================================================
  // AUTH
  // ==================================================

  useEffect(() => {
    if (
      !authLoading &&
      !authUser
    ) {
      router.push("/login");
    }
  }, [
    authUser,
    authLoading,
    router,
  ]);

  // ==================================================
  // LOAD PROFILE
  // ==================================================

  useEffect(() => {
    if (!authUser) return;

    async function loadProfile() {
      try {
        const response =
          await fetch(
            "/api/profile",
            {
              credentials:
                "include",

              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Greška pri učitavanju profila"
          );
        }

        const data =
          await response.json();

        setProfile(data);
      } catch (error) {
        console.error(
          "Profile error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [authUser]);

  // ==================================================
  // START EDIT
  // ==================================================

  function startEdit(
    field: "mail" | "phone"
  ) {
    const prostor =
      profile?.prostor;

    if (!prostor) return;

    const value =
      field === "mail"
        ? prostor.email || ""
        : prostor.telefon || "";

    setEditValue(value);
    setEditing(field);
  }

  // ==================================================
  // CANCEL
  // ==================================================

  function cancelEdit() {
    setEditing(null);
    setEditValue("");
  }

  // ==================================================
  // SAVE
  // ==================================================

  async function saveField() {
    if (!editing) return;

    try {
      setSaving(true);

      const response =
        await fetch(
          "/api/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({
              field: editing,
              value: editValue,
            }),
          }
        );

      if (!response.ok) {
        const error =
          await response.json().catch(
            () => null
          );

        throw new Error(
          error?.error ||
            "Greška pri čuvanju"
        );
      }

      // ------------------------------------------------
      // Ažuriramo lokalni Prostor
      // ------------------------------------------------

      setProfile((current) => {
        if (
          !current ||
          !current.prostor
        ) {
          return current;
        }

        return {
          ...current,

          prostor: {
            ...current.prostor,

            ...(editing === "mail"
              ? {
                  email:
                    editValue.trim() ||
                    null,
                }
              : {
                  telefon:
                    editValue.trim() ||
                    null,
                }),
          },
        };
      });

      cancelEdit();
    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Greška pri čuvanju"
      );
    } finally {
      setSaving(false);
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (
    authLoading ||
    loading ||
    !authUser
  ) {
    return (
      <div className="w-full py-6 text-sm text-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <div className="text-gray-400 text-sm">
            Podaci se učitavaju...
          </div>
        </div>
      </div>
    );
  }

  const prostor =
    profile?.prostor;

  // ==================================================
  // NEMA PROSTORA
  // ==================================================

  if (!prostor) {
    return (
      <div className="max-w-4xl">

        <div className="mb-6">

          <h1 className="text-xl font-semibold">
            {authUser.name}
          </h1>

        </div>

        <div className="border border-gray-300 bg-gray-50 p-4 text-sm">
          Nije pronađen prostor povezan sa ovim korisnikom.
        </div>

      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="max-w-4xl">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6">

        <h1 className="text-xl font-semibold">

          {skratiTip(
            prostor.tip
          )}

          {prostor.broj_prostora ??
            prostor.redniBroj}

        </h1>

        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">

          {!!prostor.broj_stanara && (
            <div className="flex items-center gap-1.5">

              <Users className="h-4 w-4" />

              <span>
                {prostor.broj_stanara}
              </span>

            </div>
          )}

          {prostor.sprat && (
            <div className="flex items-center gap-1.5">

              <Layers3 className="h-4 w-4" />

              <span>
                {prostor.sprat}
              </span>

            </div>
          )}

          {!!prostor.kvadratura && (
            <div className="flex items-center gap-1.5">

              <Scaling className="h-4 w-4" />

              <span>
                {prostor.kvadratura} m²
              </span>

            </div>
          )}

        </div>

      </div>

      {/* ==================================================
          GRID
      ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">

        {/* ==================================================
            INFO
        ================================================== */}

        <div className="border border-gray-300 bg-gray-50 p-3">

          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Info
          </h3>

          <div className="text-sm space-y-2">

            {/* VLASNIK */}

            <div className="border-b border-gray-200 py-2">

              <p className="text-xs text-gray-500">
                Vlasnik
              </p>

              <p className="leading-7">
                {prostor.vlasnik ??
                  "-"}
              </p>

            </div>

            {/* KORISNIK */}

            <div className="border-b border-gray-200 py-2">

              <p className="text-xs text-gray-500">
                Korisnik
              </p>

              <p className="leading-7">
                {prostor.korisnik ??
                  authUser.name ??
                  "-"}
              </p>

            </div>

            {/* SPRAT */}

            <div className="border-b border-gray-200 py-2">

              <p className="text-xs text-gray-500">
                Sprat
              </p>

              <p className="leading-7">
                {prostor.sprat ??
                  "-"}
              </p>

            </div>

            {/* KVADRATURA */}

            <div className="py-2">

              <p className="text-xs text-gray-500">
                Kvadratura
              </p>

              <p className="leading-7">

                {prostor.kvadratura !=
                null
                  ? `${Number(
                      prostor.kvadratura
                    ).toLocaleString(
                      "sr-Latn-RS"
                    )} m²`
                  : "-"}

              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            KONTAKT
        ================================================== */}

        <div className="border border-gray-300 bg-gray-50 p-3">

          <h3 className="text-sm font-semibold mb-2 border-b border-gray-300 pb-1">
            Kontakt
          </h3>

          <div className="text-sm space-y-2">

            {/* TIP */}

            <div className="border-b border-gray-200 py-2">

              <p className="text-xs text-gray-500">
                Tip
              </p>

              <p className="leading-7">
                {prostor.tip ??
                  "-"}
              </p>

            </div>

            {/* STANARI */}

            <div className="border-b border-gray-200 py-2">

              <p className="text-xs text-gray-500">
                Stanari
              </p>

              <p className="leading-7">
                {prostor.broj_stanara ??
                  "-"}
              </p>

            </div>

            {/* ==================================================
                TELEFON
            ================================================== */}

            <div className="border-b border-gray-200 py-2">

              <p className="text-xs text-gray-500">
                Telefon
              </p>

              {editing ===
              "phone" ? (

                <div className="flex items-center gap-2 mt-1">

                  <input
                    type="tel"
                    value={
                      editValue
                    }
                    onChange={(e) =>
                      setEditValue(
                        e.target.value
                      )
                    }
                    autoFocus
                    disabled={
                      saving
                    }
                    className="flex-1 bg-white border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-400"
                  />

                  <button
                    type="button"
                    onClick={
                      saveField
                    }
                    disabled={
                      saving
                    }
                    className="text-green-600 hover:text-green-700 disabled:opacity-50"
                    title="Sačuvaj"
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      cancelEdit
                    }
                    disabled={
                      saving
                    }
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    title="Otkaži"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

              ) : (

                <div className="flex items-center justify-between">

                  <p className="leading-7">
                    {prostor.telefon ??
                      "-"}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      startEdit(
                        "phone"
                      )
                    }
                    className="text-gray-400 hover:text-gray-700"
                    title="Izmeni telefon"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                </div>

              )}

            </div>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <div className="py-2">

              <p className="text-xs text-gray-500">
                E-mail
              </p>

              {editing ===
              "mail" ? (

                <div className="flex items-center gap-2 mt-1">

                  <input
                    type="email"
                    value={
                      editValue
                    }
                    onChange={(e) =>
                      setEditValue(
                        e.target.value
                      )
                    }
                    autoFocus
                    disabled={
                      saving
                    }
                    className="flex-1 bg-white border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:border-gray-400"
                  />

                  <button
                    type="button"
                    onClick={
                      saveField
                    }
                    disabled={
                      saving
                    }
                    className="text-green-600 hover:text-green-700 disabled:opacity-50"
                    title="Sačuvaj"
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      cancelEdit
                    }
                    disabled={
                      saving
                    }
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    title="Otkaži"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

              ) : (

                <div className="flex items-center justify-between">

                  <p className="leading-7">
                    {prostor.email ??
                      "-"}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      startEdit(
                        "mail"
                      )
                    }
                    className="text-gray-400 hover:text-gray-700"
                    title="Izmeni e-mail"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
