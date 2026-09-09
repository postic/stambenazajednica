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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!file.type.startsWith("image/")) {
      toast.error("Molimo izaberite sliku.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
            <option key={tip.id} value={tip.id}>
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
          <input
            ref={fileInputRef}
            id="obavestenje-slika"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="block w-full text-sm text-slate-600
              file:mr-4
              file:py-2
              file:px-4
              file:rounded-lg
              file:border-0
              file:text-sm
              file:font-medium
              file:bg-slate-100
              file:text-slate-700
              hover:file:bg-slate-200"
          />
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
