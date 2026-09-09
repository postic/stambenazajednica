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

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
  // CLEANUP KAMERE
  // ==================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==================================================
  // OTVARANJE KAMERE
  // ==================================================

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        "Kamera nije podržana u ovom browseru."
      );

      return;
    }

    try {
      setCameraLoading(true);
      setCameraOpen(true);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1920,
            },
            height: {
              ideal: 1080,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setCameraLoading(false);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraOpen(false);
      setCameraLoading(false);

      if (
        error instanceof DOMException &&
        error.name === "NotAllowedError"
      ) {
        toast.error(
          "Dozvolite pristup kameri za aplikaciju."
        );
      } else if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        toast.error(
          "Kamera nije pronađena na uređaju."
        );
      } else {
        toast.error(
          "Nije moguće pokrenuti kameru."
        );
      }
    }
  };

  // ==================================================
  // SNIMANJE FOTOGRAFIJE
  // ==================================================

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video) {
      toast.error("Kamera nije spremna.");
      return;
    }

    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      toast.error("Kamera još nije spremna.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      toast.error(
        "Nije moguće napraviti fotografiju."
      );

      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error(
            "Nije moguće napraviti fotografiju."
          );

          return;
        }

        const file = new File(
          [blob],
          `obavestenje-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          }
        );

        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }

        const previewUrl =
          URL.createObjectURL(file);

        setImage(file);
        setImagePreview(previewUrl);

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // ==================================================
  // IZBOR SLIKE IZ GALERIJE
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

      e.target.value = "";

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);

    const previewUrl =
      URL.createObjectURL(file);

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

        {!image && !cameraOpen && (
          <>
            {/* INPUT ZA GALERIJU */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* DUGMAD */}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={openCamera}
                disabled={cameraLoading}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition disabled:opacity-50"
              >
                📷 Slikaj
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                🖼️ Izaberi iz galerije
              </button>
            </div>
          </>
        )}

        {/* ==================================================
            KAMERA
        ================================================== */}

        {cameraOpen && !image && (
          <div className="flex flex-col gap-3">
            <div className="relative w-full overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="block w-full aspect-[4/3] object-cover"
              />

              {cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
                  Pokretanje kamere...
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={takePhoto}
                disabled={cameraLoading}
                className="flex-1 bg-primary text-white px-4 py-3 rounded-lg disabled:opacity-50"
              >
                📸 Snimi fotografiju
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-3 rounded-lg border border-slate-300 text-slate-700"
              >
                Otkaži
              </button>
            </div>
          </div>
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
          loadingTipovi ||
          cameraOpen
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
