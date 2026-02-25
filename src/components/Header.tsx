'use client'

import { useRouter } from 'next/navigation'

export default function Header() {
  return (
    <header className="h-16 border-b flex items-center px-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>
    </header>
  );
}
