"use client";

import React, { useState } from "react";
import { Dokument } from "./types";
import { DataTable, Column } from "@/components/table/DataTable";
import Link from "next/link";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

interface DokumentiTableProps {
  dokumenti: Dokument[];
}

export default function DokumentiTable({ dokumenti }: DokumentiTableProps) {
  const [docs, setDocs] = useState(dokumenti);

  const handleDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj dokument?")) return;

    try {
      const res = await fetch(`/api/dokumenti/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Greška pri brisanju dokumenta");

      setDocs(docs.filter((d) => d.id !== id));
      alert("Dokument obrisan!");
    } catch (err) {
      console.error(err);
      alert("Brisanje nije uspelo");
    }
  };

  const columns: Column<Dokument>[] = [
    {
      key: "title",
      header: <span title="Naziv dokumenta">Naziv</span>,
      render: (doc) => (
        <Link
          href={`/dokumenti/${doc.id}`}
          className="flex items-center gap-1 text-blue-600 hover:underline"
          title={doc.title}
        >
          <FaEye />
        </Link>
      ),
    },
    {
      key: "date",
      header: <span title="Datum kreiranja dokumenta">Datum</span>,
      render: (doc) => doc.date || "-",
    },
    {
      key: "status",
      header: <span title="Status dokumenta">Status</span>,
      render: (doc) =>
        doc.status ? (
          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded" title={doc.status}>
            {doc.status}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "files",
      header: <span title="Broj fajlova u dokumentu">Broj fajlova</span>,
      render: (doc) => doc.files.length,
    },
    {
      key: "actions",
      header: <span title="Akcije dokumenta">Akcije</span>,
      render: (doc) => (
        <div className="flex gap-2 justify-center">
          <Link href={`/dokumenti/${doc.id}`} className="text-blue-600 hover:text-blue-800" title="View dokumenta">
            <FaEye />
          </Link>
          <Link href={`/dokumenti/${doc.id}/edit`} className="text-yellow-600 hover:text-yellow-800" title="Edit dokumenta">
            <FaEdit />
          </Link>
          <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-800" title="Delete dokumenta">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return <DataTable data={docs} columns={columns} />;
}
