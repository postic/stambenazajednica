import AllowNotifications from "@/components/AllowNotifications";

export default function PodesavanjePage() {
  return (
    <div className="space-y-6">
      {/* postojeći sadržaj */}

      <section>
        <h2 className="text-lg font-semibold">
          Podešavanje
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Uključi push obaveštenja na ovom uređaju.
        </p>

        <div className="mt-4">
          <AllowNotifications />
        </div>
      </section>
    </div>
  );
}
