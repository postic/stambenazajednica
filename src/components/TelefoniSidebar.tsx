"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type Telefon = {
  id: string;
  title: string;
  phone: string;
  kategorija: string;
};

export default function TelefoniSidebar() {
  const [telefoni, setTelefoni] = useState<Telefon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/telefon?include=field_kategorija`,
          {
            headers: {
              Accept: "application/vnd.api+json",
            },
          }
        );

        if (!res.ok) {
          console.error("Fetch failed", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();

        const mapped: Telefon[] = (data.data || []).map((t: any) => {
          let kategorija = "Ostalo";

          const rel = t.relationships?.field_kategorija?.data;

          if (rel && !Array.isArray(rel)) {
            const term = data.included?.find((inc: any) => inc.id === rel.id);
            if (term) kategorija = term.attributes?.name || "Ostalo";
          }

          return {
            id: t.id,
            title: t.attributes?.title || "Bez naziva",
            phone: t.attributes?.field_phone || "",
            kategorija,
          };
        });

        setTelefoni(mapped);

        const initialState: Record<string, boolean> = {};
        mapped.forEach((t) => {
          initialState[t.kategorija] = false;
        });
        setOpenCategories(initialState);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  }

  function groupByCategory(items: Telefon[]) {
    return items.reduce<Record<string, Telefon[]>>((acc, t) => {
      const key = t.kategorija || "Ostalo";
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});
  }

  const grouped = groupByCategory(telefoni);

  return (
    <aside className="hidden xl:flex h-full bg-slate-50 text-slate-900 flex-col shadow-sm">

      <div className="px-3 py-3 overflow-y-auto pb-8">

        {loading ? (
          <div className="text-sm text-slate-500 mt-2">
            Učitavanje...
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([kategorija, items]) => {
              const isOpen = openCategories[kategorija];

              return (
                <div key={kategorija} className="mb-3">

                  {/* HEADER */}
                  <button
                    onClick={() => toggleCategory(kategorija)}
                    className="w-full sticky top-0 z-10 bg-slate-50 flex justify-between items-center text-[13px] font-semibold text-slate-800 uppercase py-2 px-1 hover:text-slate-900"
                  >
                    <span>{kategorija}</span>

                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* TELEFONI */}
                  {isOpen && (
                    <nav className="mt-1 space-y-1">
                      {items.map((t) => (
                        <a
                          key={t.id}
                          href={`tel:${t.phone}`}
                          className="flex items-center justify-between px-2 py-1.5 text-[14px] rounded-lg hover:bg-slate-100 transition"
                        >
                          <span className="truncate">{t.title}</span>

                          <span className="text-slate-500 text-sm ml-2">
                            {t.phone}
                          </span>
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              );
            })}

            {telefoni.length === 0 && (
              <div className="text-sm text-red-500 mt-2">
                Nema dostupnih telefona
              </div>
            )}
          </>
        )}

      </div>
    </aside>
  );
}
