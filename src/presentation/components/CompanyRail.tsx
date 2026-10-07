import Image from "next/image";

const companies = [
  { name: "Bajaj", logo: "/companies/bajaj.webp" },
  { name: "BGauss", logo: "/companies/bgauss.webp" },
  { name: "MG", logo: "/companies/mg.webp" },
  { name: "Montra Electric", logo: "/companies/montra_electric.webp" },
  { name: "Piaggio", logo: "/companies/piaggio.webp" },
  { name: "Tata Motors", logo: "/companies/tataMotors-ezgif.com-png-to-webp-converter.webp" },
  { name: "TVS", logo: "/companies/tvs-ezgif.com-png-to-webp-converter.webp" },
];

/** OEM partners (White section) — CSS-only marquee that pauses on hover/focus and for reduced motion. */
export default function CompanyRail() {
  const doubled = [...companies, ...companies];

  return (
    <section className="py-16 bg-white overflow-hidden" aria-labelledby="oem-title">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <p className="text-primary text-xs font-bold uppercase tracking-widest">Trusted OEM partners</p>
        <h2 id="oem-title" className="text-2xl md:text-3xl font-black mt-2 text-forest">
          Powering Bharat&apos;s EV revolution with industry leaders
        </h2>
      </div>

      <div className="marquee-row relative">
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <ul className="flex w-max items-center gap-16 md:gap-24 animate-marquee-left" aria-label="OEM partners">
          {doubled.map((c, i) => (
            <li key={`${c.name}-${i}`} aria-hidden={i >= companies.length} className="flex items-center justify-center w-[120px] md:w-[160px] h-16">
              <Image src={c.logo} alt={i < companies.length ? c.name : ""} width={160} height={64} sizes="160px" className="max-h-[48px] w-auto object-contain mix-blend-multiply" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
