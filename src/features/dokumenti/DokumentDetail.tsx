"use client";

import React from "react";
import { Dokument } from "./types";
import { getFileIcon } from "./utils";

interface DokumentDetailProps {
  dokument: Dokument;
}

export default function DokumentDetail({ dokument }: DokumentDetailProps) {
  return (
    <div className="p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">{dokument.title}</h1>
      {dokument.date && <p className="mb-2">Datum: {dokument.date}</p>}
      {dokument.status && (
        <p className="mb-4">
          Status:{" "}
          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {dokument.status}
          </span>
        </p>
      )}

      <h2 className="text-xl font-semibold mb-2">Fajlovi</h2>
      <ul className="space-y-2">
        {dokument.files.map((file) => (
          <li key={file.id} className="flex items-center gap-3">
            {getFileIcon(file.mimeType)}
            <a href={file.url} target="_blank" className="text-blue-600 underline">
              View
            </a>
            <a href={file.url} download className="text-green-600 underline">
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
