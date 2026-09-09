"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createObavestenje } from "@/lib/obavestenje";

type TipObavestenja = {
  id: string;
  naziv: string;
};

export default function ObavestenjeForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kategorija, setKategorija] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [tipovi, setTipovi] = useState<TipObavestenja[]>([]);
  const [loadingTipovi, setLoadingTipovi] = useState(true);
  const [loading, setLoading] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // ==================================================
  // UČITAVANJE TIPOVA OBAVEŠTENJA
  // ==================================================

  useEffect(() => {
    let ignore = false;

    fetch("/api/obavestenja/tipovi")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Greška pri učitavanju tipova obaveštenja"
          );
        }

        return res.json();
      })
      .then((data) => {
        if (ignore) return;

        setTipovi(data.data ?? []);
      })
      .catch((err) => {
        if (ignore) return;

        console.error(err);

        toast.error(
          "Nije moguće učitati tipove obaveštenja"
        );

        setTipovi([]);
      })
      .finally(() => {
        if (!ignore) {
          setLoadingTipovi(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // ==================================================
  // CLEANUP IMAGE PREVIEW
  // ==================================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==================================================
  // IZBOR SLIKE
  // ==================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    // Provera da je slika
    if (!file.type.startsWith("image/")) {
      toast.error("Molimo izaberite sliku.");

      e.target.value = "";

      return;
    }

    // Oslobodi prethodni preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ==================================================
  // UKLANJANJE SLIKE
  // ==================================================

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);

    // Omogućava ponovno biranje iste slike
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await createObavestenje({
        title,
        description,
        kategorija,
        image,
      });

      toast.success(
        "Obaveštenje je uspešno kreirano!"
      );

      router.push("/obavestenja");
    } catch (err: any) {
      toast.error(
        err.message ||
          "Greška prilikom kreiranja obaveštenja"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* ==================================================
          NASLOV
      ================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Naslov
        </label>

        <input
          type="text"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* ==================================================
          TIP OBAVEŠTENJA
      ================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Tip obaveštenja
        </label>

        <select
          value={kategorija}
          required
          disabled={loadingTipovi}
          onChange={(e) =>
            setKategorija(e.target.value)
          }
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent disabled:opacity-50"
        >
          <option value="">
            {loadingTipovi
              ? "Učitavanje..."
              : "Izaberi tip obaveštenja"}
          </option>

          {tipovi.map((tip) => (
            <option
              key={tip.id}
              value={tip.id}
            >
              {tip.naziv}
            </option>
          ))}
        </select>
      </div>

      {/* ==================================================
          TEKST
      ================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Tekst obaveštenja
        </label>

        <textarea
          value={description}
          required
          onChange={(e) =>
            setDescription(e.target.value)
          }
          rows={6}
          className="w-full border-b py-2 outline-none resize-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* ==================================================
          SLIKA
      ================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-2">
          Slika
        </label>

        {!image && (
          <>
            {/* ==========================================
                SKRIVENI INPUT ZA KAMERU
            ========================================== */}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* ==========================================
                SKRIVENI INPUT ZA GALERIJU
            ========================================== */}

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* ==========================================
                DUGMAD
            ========================================== */}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() =>
                  cameraInputRef.current?.click()
                }
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                📷 Slikaj
              </button>

              <button
                type="button"
                onClick={() =>
                  galleryInputRef.current?.click()
                }
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                🖼️ Izaberi iz galerije
              </button>
            </div>
          </>
        )}

        {/* ==================================================
            PREVIEW
        ================================================== */}

        {image && imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Pregled slike"
              className="w-full max-h-80 object-contain rounded-lg border border-slate-200 bg-slate-50"
            />

            <div className="flex items-center justify-between mt-2 gap-3">
              <p className="text-sm text-slate-500 truncate">
                {image.name}
              </p>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="shrink-0 text-sm text-red-600 hover:text-red-700"
              >
                Ukloni
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          DUGME
      ================================================== */}

      <button
        type="submit"
        disabled={
          loading ||
          loadingTipovi
        }
        className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading
          ? "Šaljem..."
          : "Sačuvaj"}
      </button>
    </form>
  );
}
