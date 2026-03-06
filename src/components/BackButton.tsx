// components/BackButton.tsx
'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 mb-2 text-gray-600 hover:text-gray-900 hover:underline transition-all"
    >
      <ArrowLeft size={18} />
      Nazad
    </button>
  );
}
