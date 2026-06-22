"use client";

import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { obavestenjaColumns } from "@/features/obavestenja/ObavestenjaColumns";
import type { Obavestenje } from "@/types/obavestenje";

interface ObavestenjaTableProps {
  obavestenja?: Obavestenje[] | null;
  loading?: boolean;
}

export default function ObavestenjaTable({
  obavestenja,
  loading = false,
}: ObavestenjaTableProps) {
  const safeData = obavestenja ?? [];

  return (
    <DataTable<Obavestenje>
      loading={loading}
      data={safeData}
      columns={obavestenjaColumns}
    />
  );
}
