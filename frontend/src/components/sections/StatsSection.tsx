"use client";

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div className="text-left">
      <p className="font-serif text-4xl font-semibold leading-none text-forest-700 sm:text-5xl lg:text-6xl">
        {value.toLocaleString("id-ID")}
        {suffix}
      </p>
      <p className="mt-2 text-sm uppercase tracking-[0.13em] text-ink-muted">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="border-b border-cream-darker/40 bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <Stat value={10000} suffix="+" label="Petani Terbantu" />
          <Stat value={9} suffix="" label="Penyakit Dideteksi" />
          <Stat value={34} suffix="" label="Provinsi Terjangkau" />
          <Stat value={85} suffix="%+" label="Akurasi AI" />
        </div>
      </div>
    </section>
  );
}

