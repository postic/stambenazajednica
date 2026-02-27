"use client";

export default function RightSidebar() {
  return (
    <aside
      className="
        hidden xl:flex
        w-64
        h-screen
        bg-gray-800
        text-white
        flex-col
        p-4
      "
    >
      <div className="text-2xl font-bold tracking-wide mb-6">
        Info
      </div>

      <nav className="space-y-1">
        <a
          href="tel:192"
          className="w-full flex items-center p-4 rounded transition hover:bg-gray-700"
        >
          Hitna pomoć — 192
        </a>

        <a
          href="tel:193"
          className="w-full flex items-center p-4 rounded transition hover:bg-gray-700"
        >
          Vatrogasci — 193
        </a>

        <a
          href="tel:194"
          className="w-full flex items-center p-4 rounded transition hover:bg-gray-700"
        >
          Policija — 194
        </a>

        <a
          href="tel:195"
          className="w-full flex items-center p-4 rounded transition hover:bg-gray-700"
        >
          Upravnik — 195
        </a>
      </nav>
    </aside>
  );
}
