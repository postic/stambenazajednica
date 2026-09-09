"use client";

import { useEffect, useState } from "react";
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

  const router = useRouter();

  // =========================================================
  // UČITAVANJE TIPOVA OBAVEŠTENJA
  // =========================================================

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

  // =========================================================
  // ČIŠĆENJE PREVIEW URL-A
  // =========================================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // =========================================================
  // POSTAVLJANJE SLIKE
  // =========================================================

  const setSelectedImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Molimo izaberite sliku.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImage(file);
    setImagePreview(previewUrl);
  };

  // =========================================================
  // IZBOR / SNIMANJE SLIKE
  // =========================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);

    // Omogućava ponovno biranje iste slike
    e.target.value = "";
  };

  // =========================================================
  // UKLANJANJE SLIKE
  // =========================================================

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
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

  // =========================================================
  // UI
  // =========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* =====================================================
          NASLOV
      ====================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Naslov
        </label>

        <input
          type="text"
          value={title}
          required
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent"
        />
      </div>

      {/* =====================================================
          TIP OBAVEŠTENJA
      ====================================================== */}

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

      {/* =====================================================
          TEKST OBAVEŠTENJA
      ====================================================== */}

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

      {/* =====================================================
          SLIKA
      ====================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-2">
          Slika
        </label>

        {!image && (
          <>
            {/* =================================================
                KAMERA

                capture="environment" traži zadnju kameru
                na telefonu.
            ================================================== */}

            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="absolute w-px h-px opacity-0 pointer-events-none"
            />

            {/* =================================================
                GALERIJA
            ================================================== */}

            <input
              id="gallery-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute w-px h-px opacity-0 pointer-events-none"
            />

            {/* =================================================
                DUGMAD
            ================================================== */}

            <div className="flex flex-col sm:flex-row gap-3">
              <label
                htmlFor="camera-input"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer text-center"
              >
                📷 Slikaj
              </label>

              <label
                htmlFor="gallery-input"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer text-center"
              >
                🖼️ Izaberi iz galerije
              </label>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              „Slikaj“ otvara kameru uređaja.
            </p>
          </>
        )}

        {/* =====================================================
            PREVIEW SLIKE
        ====================================================== */}

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

      {/* =====================================================
          SAČUVAJ
      ====================================================== */}

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
