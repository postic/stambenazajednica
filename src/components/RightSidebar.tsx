"use client";

export default function RightSidebar() {
  return (
    <aside
      className="
        hidden xl:flex
        w-64
        h-screen
        bg-slate-50
        text-slate-900
        border-l border-slate-200
        flex-col
        p-4
      "
    >
      <div className="text-base uppercase tracking-wide font-bold text-slate-700 mt-3 mb-5">
        Info
      </div>

      <nav className="space-y-2">
        <a
          href="tel:193"
          className="w-full flex justify-start items-center text-sm"
        >
          Upravnik
        </a>

        <a
          href="tel:193"
          className="w-full flex justify-start items-center text-sm"
        >
          Lift Mont
        </a>

        <a
          href="tel:193"
          className="w-full flex justify-start items-center text-sm"
        >
          Lift Mont
        </a>

        <a
          href="tel:194"
          className="w-full flex justify-start items-center text-sm"
        >
          JKP Informatika
        </a>

        <a
          href="tel:195"
          className="w-full flex justify-start items-center text-sm"
        >
          JKP Urbanizam
        </a>
      </nav>

      <div className="text-base uppercase tracking-wide font-bold text-slate-700 mt-8 mb-5">
        Taxi
      </div>

      <nav className="space-y-2">
        <a
          href="tel:192"
          className="w-full flex justify-start items-center text-sm"
        >
          Hitna pomoć — 192
        </a>

        <a
          href="tel:193"
          className="w-full flex justify-start items-center text-sm"
        >
          Vatrogasci — 193
        </a>

        <a
          href="tel:194"
          className="w-full flex justify-start items-centerv text-sm"
        >
          Policija — 194
        </a>

        <a
          href="tel:195"
          className="w-full flex justify-start items-center text-sm"
        >
          Upravnik — 195
        </a>

        <a
          href="tel:195"
          className="w-full flex justify-start items-center text-sm"
        >
          Upravnik — 195
        </a>
      </nav>

      <div className="text-base uppercase tracking-wide font-bold text-slate-700 mt-8 mb-5">
        Info
      </div>

      <nav className="space-y-2">
        <a
          href="tel:192"
          className="w-full flex justify-start items-center text-sm"
        >
          Hitna pomoć — 192
        </a>

        <a
          href="tel:193"
          className="w-full flex justify-start items-center text-sm"
        >
          Vatrogasci — 193
        </a>

      </nav>
    </aside>
  );
}
