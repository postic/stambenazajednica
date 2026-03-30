"use client";
import { useState, useEffect } from "react";
import { Anketa, Opcija } from "../types";

interface Props {
  anketa: Anketa;
}

export default function AnketeVotingForm({ anketa }: Props) {
  const [options, setOptions] = useState<Opcija[]>(anketa.options || []);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  // Fetch opcija, ali u slučaju greške ili praznog niza, options ostaju prazne
  useEffect(() => {
    if (options.length === 0) {
      fetch(`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/opcija?filter[field_opcija_anketa.id][value]=${anketa.id}`, { cache: "no-store" })
        .then(res => res.ok ? res.json() : { data: [] })
        .then(data => {
          const opts: Opcija[] = (data.data || []).map((opt: any, index: number) => ({
            id: opt.id,
            title: opt.attributes.title || "Bez naslova",
            anketaId: anketa.id,
            order: index,
            votes: 0,
          }));
          setOptions(opts);
        })
        .catch(err => {
          console.error("Greška pri učitavanju opcija:", err);
          setOptions([]); // uvek prikazujemo, čak i ako je prazno
        });
    }
  }, [anketa.id, options.length]);

  return (
    <div className="bg-white p-5 rounded-2xl border mt-4">
      <ul className="space-y-2">
        {options.length > 0 ? (
          options.map(opt => (
            <li key={opt.id}>
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded hover:bg-gray-100">
                <input
                  type="radio"
                  name="anketaOption"
                  value={opt.id}
                  checked={selectedOption === opt.id}
                  onChange={() => setSelectedOption(opt.id)}
                  disabled={submitted}
                />
                <span>{opt.title}</span>
              </label>
            </li>
          ))
        ) : (
          <li className="text-gray-500">Opcije trenutno nisu unete, ali možete glasati.</li>
        )}
      </ul>

      {!submitted ? (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setSubmitted(true)}
        >
          Glasaj
        </button>
      ) : (
        <p className="mt-4 text-green-600 font-semibold">Hvala na glasu!</p>
      )}
    </div>
  );
}
