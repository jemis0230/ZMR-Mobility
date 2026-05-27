import Link from "next/link";
import { ArrowRight, CalendarDays, ShoppingBag, Clock } from "lucide-react";
import { slugifyVehicle } from "@/lib/vehicleSlug";

interface Props {
  vehicle: {
    id: string;
    make: string;
    model: string;
    showInLeasing: boolean;
    showInBuying: boolean;
    showInRent: boolean;
    buyingPrice?: number | null;
    leasePlans: { isActive: boolean; monthlyPriceRs: number }[];
    rentPlans: { isActive: boolean; pricePerDayRs: number }[];
  };
  currentSection: 'leasing' | 'buying' | 'rent';
}

interface SectionCard {
  key: 'leasing' | 'buying' | 'rent';
  label: string;
  sublabel: string;
  price: string | null;
  href: string;
  borderCls: string;
  textCls: string;
  bgCls: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export default function VehicleSectionLinks({ vehicle, currentSection }: Props) {
  const slug = slugifyVehicle(vehicle.make, vehicle.model, vehicle.id);

  const lowestLeasePlan = vehicle.leasePlans
    .filter((p) => p.isActive)
    .sort((a, b) => a.monthlyPriceRs - b.monthlyPriceRs)[0];

  const lowestRentPlan = vehicle.rentPlans
    .filter((p) => p.isActive)
    .sort((a, b) => a.pricePerDayRs - b.pricePerDayRs)[0];

  const allSections: SectionCard[] = [
    {
      key: 'leasing',
      label: 'Lease this vehicle',
      sublabel: 'Monthly lease plans',
      price: lowestLeasePlan
        ? `From ₹${lowestLeasePlan.monthlyPriceRs.toLocaleString('en-IN')}/mo`
        : 'Contact for pricing',
      href: `/vehicles/${slug}`,
      borderCls: 'border-primary/30',
      textCls: 'text-primary',
      bgCls: 'bg-primary/5',
      Icon: CalendarDays,
    },
    {
      key: 'buying',
      label: 'Buy this vehicle',
      sublabel: 'One-time purchase',
      price: vehicle.buyingPrice
        ? `₹${vehicle.buyingPrice.toLocaleString('en-IN')}`
        : 'Contact for pricing',
      href: `/buying/vehicles/detail/${slug}`,
      borderCls: 'border-emerald-500/30',
      textCls: 'text-emerald-400',
      bgCls: 'bg-emerald-500/5',
      Icon: ShoppingBag,
    },
    {
      key: 'rent',
      label: 'Rent this vehicle',
      sublabel: 'Flexible daily rentals',
      price: lowestRentPlan
        ? `From ₹${lowestRentPlan.pricePerDayRs.toLocaleString('en-IN')}/day`
        : 'Contact for pricing',
      href: `/rent/vehicles/detail/${slug}`,
      borderCls: 'border-orange-500/30',
      textCls: 'text-orange-400',
      bgCls: 'bg-orange-500/5',
      Icon: Clock,
    },
  ];

  const visible = allSections.filter(
    (s) =>
      s.key !== currentSection &&
      (s.key === 'leasing' ? vehicle.showInLeasing : s.key === 'buying' ? vehicle.showInBuying : vehicle.showInRent)
  );

  if (visible.length === 0) return null;

  return (
    <div className="pt-2 space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/30">Also available as</p>
      {visible.map(({ key, label, sublabel, price, href, borderCls, textCls, bgCls, Icon }) => (
        <Link
          key={key}
          href={href}
          className={`flex items-center gap-4 glass-card p-4 border ${borderCls} ${bgCls} hover:brightness-110 transition-all group`}
        >
          <div className={`p-2 rounded-lg ${bgCls} border ${borderCls} shrink-0`}>
            <Icon className={`w-4 h-4 ${textCls}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${textCls}`}>{label}</p>
            <p className="text-xs text-white/40">{sublabel}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-white/80">{price}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}
