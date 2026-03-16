import { Column } from "@/components/table/DataTable";
import { Obavestenje } from "./types";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export const obavestenjaColumns: Column<Obavestenje>[] = [
  {
    key: "title",
    header: "Naslov", // običan tekst, bez linka ili ikonice
    render: (item) => item.title, // samo plain text
  },
  {
    key: "date",
    header: "Datum",
    render: (item) => item.date || "-",
  },
  {
    key: "status",
    header: "Status",
    render: (item) =>
      item.status ? (
        <span
          className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
          title={item.status}
        >
          {item.status}
        </span>
      ) : (
        "-"
      ),
  },
  {
    key: "actions",
    header: "Akcije",
    render: (item) => (
      <div className="flex gap-2 justify-center">
        <button
          className="text-blue-600 hover:text-blue-800"
          title="View"
        >
          <FaEye />
        </button>
        <button
          className="text-yellow-600 hover:text-yellow-800"
          title="Edit"
        >
          <FaEdit />
        </button>
        <button
          className="text-red-600 hover:text-red-800"
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    ),
  },
];
