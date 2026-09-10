"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateObavestenje } from "@/lib/obavestenje";

type TipObavestenja = {
  id: string;
  naziv: string;
};

type ExistingImage = {
  id: string;
  url: string;
};

interface ObavestenjeEditFormProps {
  slug: string;
  id: string;
  initialTitle: string;
  initialDescription: string;
  initialKategorija: string;
  initialImages: ExistingImage[];
}

export default function ObavestenjeEditForm({
  slug,
  id,
  initialTitle,
  initialDescription,
  initialKategorija,
  initialImages,
}: ObavestenjeEditFormProps) {
  const router = useRouter();

  const [title, setTitle] =
    useState(initialTitle);

  const [description, setDescription] =
    useState(initialDescription);

  const [kategorija, setKategorija] =
    useState(initialKategorija);

  const [tipovi, setTipovi] =
    useState<TipObavestenja[]>([]);

  const [loadingTipovi, setLoadingTipovi] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [images, setImages] =
    useState<ExistingImage[]>(
      initialImages || []
    );

  const [removeImageIds, setRemoveImageIds] =
    useState<string[]>([]);

  const [newImage, setNewImage] =
    useState<File | null>(null);

  const [newImagePreview, setNewImagePreview] =
    useState<string | null>(null);

  // ==================================================
  // UČITAVANJE TIPOVA OBAVEŠTENJA
  // ==================================================

  useEffect(() => {
    let ignore = false;

    fetch("/api/obavestenja/tipovi")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Greška pri učitavanju tipova obaveštenja"
          );
        }

        return response.json();
      })
      .then((data) => {
        if (ignore) {
          return;
        }

        setTipovi(
          data?.data ?? []
        );
      })
      .catch((error) => {
        if (ignore) {
          return;
        }

        console.error(error);

        toast.error(
          "Nije moguće učitati tipove obaveštenja."
        );
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
  // CLEANUP PREVIEW URL
  // ==================================================

  useEffect(() => {
    return () => {
      if (newImagePreview) {
        URL.revokeObjectURL(
          newImagePreview
        );
      }
    };
  }, [newImagePreview]);

  // ==================================================
  // IZBOR NOVE SLIKE
  // ==================================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Molimo izaberite sliku."
      );

      e.target.value = "";

      return;
    }

    if (newImagePreview) {
      URL.revokeObjectURL(
        newImagePreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setNewImage(file);
    setNewImagePreview(
      previewUrl
    );

    // Omogućava da se ista slika
    // ponovo izabere ako je potrebno.
    e.target.value = "";
  };

  // ==================================================
  // UKLONI NOVU SLIKU
  // ==================================================

  const handleRemoveNewImage = () => {
    if (newImagePreview) {
      URL.revokeObjectURL(
        newImagePreview
      );
    }

    setNewImage(null);
    setNewImagePreview(null);
  };

  // ==================================================
  // UKLONI POSTOJEĆU SLIKU
  // ==================================================

  const handleRemoveExistingImage = (
    imageId: string
  ) => {
    setImages((current) =>
      current.filter(
        (image) =>
          image.id !== imageId
      )
    );

    setRemoveImageIds(
      (current) => {
        if (
          current.includes(imageId)
        ) {
          return current;
        }

        return [
          ...current,
          imageId,
        ];
      }
    );
  };

  // ==================================================
  // SAČUVAJ IZMENE
  // ==================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(
        "Naslov je obavezan."
      );

      return;
    }

    if (!description.trim()) {
      toast.error(
        "Tekst obaveštenja je obavezan."
      );

      return;
    }

    if (!kategorija) {
      toast.error(
        "Tip obaveštenja je obavezan."
      );

      return;
    }

    setLoading(true);

    try {
      await updateObavestenje(
        slug,
        id,
        {
          title,
          description,
          kategorija,
          image: newImage,
          removeImageIds,
        }
      );

      toast.success(
        "Obaveštenje je uspešno izmenjeno."
      );

      router.push(
        `/obavestenja/${slug}/${id}`
      );

      router.refresh();
    } catch (error: any) {
      console.error(
        "Greška pri izmeni obaveštenja:",
        error
      );

      toast.error(
        error?.message ||
          "Greška prilikom izmene obaveštenja."
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
          onChange={(e) =>
            setTitle(e.target.value)
          }
          disabled={loading}
          className="w-full border-b py-2 outline-none border-slate-300 focus:border-blue-500 bg-transparent disabled:opacity-50"
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
          disabled={
            loading ||
            loadingTipovi
          }
          onChange={(e) =>
            setKategorija(
              e.target.value
            )
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
          TEKST OBAVEŠTENJA
      ================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-1">
          Tekst obaveštenja
        </label>

        <textarea
          value={description}
          required
          disabled={loading}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          rows={6}
          className="w-full border-b py-2 outline-none resize-none border-slate-300 focus:border-blue-500 bg-transparent disabled:opacity-50"
        />
      </div>

      {/* ==================================================
          POSTOJEĆE FOTOGRAFIJE
      ================================================== */}

      {images.length > 0 && (
        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Postojeće fotografije
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
              >
                <div className="aspect-video bg-slate-100">
                  <img
                    src={image.url}
                    alt="Fotografija obaveštenja"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    Fotografija
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveExistingImage(
                        image.id
                      )
                    }
                    disabled={loading}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Obriši
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================
          DODAVANJE NOVE FOTOGRAFIJE
      ================================================== */}

      <div>
        <label className="block text-sm text-slate-600 mb-2">
          Dodaj fotografiju
        </label>

        {!newImage && (
          <>
            {/* Kamera */}

            <input
              id="edit-camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={
                handleImageChange
              }
              className="absolute w-px h-px opacity-0 pointer-events-none"
            />

            {/* Galerija */}

            <input
              id="edit-gallery-input"
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
              className="absolute w-px h-px opacity-0 pointer-events-none"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <label
                htmlFor="edit-camera-input"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer text-center"
              >
                📷 Slikaj
              </label>

              <label
                htmlFor="edit-gallery-input"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer text-center"
              >
                🖼️ Izaberi iz galerije
              </label>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Fotografija će biti
              uploadovana kada sačuvate
              izmene.
            </p>
          </>
        )}

        {/* ==================================================
            PREGLED NOVE FOTOGRAFIJE
        ================================================== */}

        {newImage &&
          newImagePreview && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <img
                src={newImagePreview}
                alt="Nova fotografija"
                className="w-full max-h-80 object-contain bg-slate-50"
              />

              <div className="p-3 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500 truncate">
                  {newImage.name}
                </p>

                <button
                  type="button"
                  onClick={
                    handleRemoveNewImage
                  }
                  disabled={loading}
                  className="shrink-0 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Ukloni
                </button>
              </div>
            </div>
          )}
      </div>

      {/* ==================================================
          DUGMAD
      ================================================== */}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={
            loading ||
            loadingTipovi
          }
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading
            ? "Čuvam..."
            : "Sačuvaj izmene"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            router.push(
              `/obavestenja/${slug}/${id}`
            )
          }
          className="border border-slate-300 px-4 py-2 rounded text-sm text-slate-700 disabled:opacity-50"
        >
          Otkaži
        </button>
      </div>
    </form>
  );
}
