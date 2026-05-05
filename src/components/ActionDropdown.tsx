"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

type Props = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ActionDropdown({
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 text-gray-600 hover:text-black">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[140px] border bg-white"
      >
        {onView && (
          <DropdownMenuItem
            onClick={onView}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Eye size={16} />
            Pregled
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem
            onClick={onEdit}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Pencil size={16} />
            Izmeni
          </DropdownMenuItem>
        )}

        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="flex items-center gap-2 text-red-600 cursor-pointer"
          >
            <Trash2 size={16} />
            Obriši
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
