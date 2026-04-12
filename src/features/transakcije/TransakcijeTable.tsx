import { DataTable } from "@/components/table/DataTable";
import { transakcijeColumns } from "./TransakcijeColumns";
import { Transakcija } from "./types";
import { addRunningBalance } from "@/lib/transactions";

export default function TransakcijeTable({
  transakcije = [],
  initialBalance = 0,
}: {
  transakcije?: Transakcija[];
  initialBalance?: number;
}) {

  const data = addRunningBalance(transakcije, initialBalance);

  return (
    <DataTable
      data={data}
      columns={transakcijeColumns}
      emptyMessage="Nema transakcija."
    />
  );
}
