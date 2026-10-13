/**
 * Text wordmark used as the site's brand mark ("ZMR Mobility"), set in the site font.
 * `stacked` puts "Mobility" under "ZMR" for narrow headers.
 */
export default function BrandWordmark({
  tone = "dark",
  stacked = false,
  className = "",
}: {
  tone?: "dark" | "light";
  stacked?: boolean;
  className?: string;
}) {
  const zmr = tone === "dark" ? "text-forest" : "text-cream";
  const rest = tone === "dark" ? "text-primary" : "text-lime";
  return (
    <span className={`inline-flex leading-none tracking-tight whitespace-nowrap ${stacked ? "flex-col" : "items-baseline gap-[0.28em]"} ${className}`}>
      <span className={`font-black ${zmr}`}>ZMR</span>
      <span className={`font-semibold ${rest} ${stacked ? "text-[0.62em] mt-0.5" : ""}`}>Mobility</span>
    </span>
  );
}
