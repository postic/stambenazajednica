"use client";

import { DataTable } from "@/components/table/DataTable";
import { transakcijeColumns } from "./TransakcijeColumns";
import type { Transakcija } from "@/types/transakcija";
import type { TransakcijaWithBalance } from "@/types/transakcija";
import { addRunningBalance } from "@/lib/transactions";

interface Props {
  transakcije?: Transakcija[];
  initialBalance?: number;
  loading?: boolean;
}

export default function TransakcijeTable({
  transakcije = [],
  initialBalance = 0,
  loading = false,
}: Props) {
  const safeData = addRunningBalance(transakcije, initialBalance);

  return (
    <DataTable<TransakcijaWithBalance>
      loading={loading}
      data={safeData}
      columns={transakcijeColumns}
    />
  );
}
