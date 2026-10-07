// Demo catalogue for the Buying / Explore section.
// Run: node prisma/seed-demo.js   (or: npm run seed:demo)
//
// Adds a sample set of pre-owned EVs with price, manufacture year and KM driven,
// so the Price Range / Make & Model / Year / KM Driven / Body Type filters have
// data to show. Idempotent — vehicles whose make + model already exist are skipped,
// and nothing is ever deleted. Replace images and details from the admin panel.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IMG = {
  TWO_WHEELER: '/category-images/2-wheeler.webp',
  THREE_WHEELER_PASSENGER: '/category-images/3-wheeler-passenger.webp',
  THREE_WHEELER_CARGO: '/category-images/3-wheeler-cargo.webp',
  FOUR_WHEELER_PASSENGER: '/category-images/4-wheeler-passenger.webp',
  FOUR_WHEELER_CARGO: '/category-images/4-wheeler-cargo.webp',
};

// [make, model, category, price ₹, year, km driven, certified range km, top speed, battery kWh, charging mins, warranty]
const VEHICLES = [
  ['Ather', '450X Gen 3', 'TWO_WHEELER', 98000, 2023, 8200, 150, 90, 3.7, 340, '3 years or 30,000 km'],
  ['Ather', 'Rizta Z', 'TWO_WHEELER', 118000, 2025, 1200, 160, 80, 3.7, 360, '3 years or 30,000 km'],
  ['Ola', 'S1 Pro', 'TWO_WHEELER', 89000, 2022, 14500, 181, 116, 4.0, 390, '3 years or 40,000 km'],
  ['TVS', 'iQube S', 'TWO_WHEELER', 92000, 2024, 4100, 100, 78, 3.04, 270, '3 years or 50,000 km'],
  ['Bajaj', 'Chetak Premium', 'TWO_WHEELER', 105000, 2024, 2600, 127, 73, 3.2, 300, '3 years or 50,000 km'],
  ['Hero', 'Vida V1 Pro', 'TWO_WHEELER', 85000, 2023, 11000, 165, 80, 3.94, 350, '3 years or 30,000 km'],
  ['Mahindra', 'Treo', 'THREE_WHEELER_PASSENGER', 245000, 2022, 38000, 130, 55, 7.37, 230, '3 years or 80,000 km'],
  ['Piaggio', 'Ape E-City FX', 'THREE_WHEELER_PASSENGER', 210000, 2021, 52000, 110, 45, 8.0, 240, '3 years or 1,00,000 km'],
  ['Bajaj', 'RE E-TEC 9.0', 'THREE_WHEELER_PASSENGER', 285000, 2024, 9500, 178, 45, 8.9, 270, '5 years or 1,20,000 km'],
  ['Mahindra', 'Treo Zor', 'THREE_WHEELER_CARGO', 295000, 2023, 21000, 125, 50, 7.37, 230, '3 years or 80,000 km'],
  ['Euler', 'HiLoad EV', 'THREE_WHEELER_CARGO', 340000, 2023, 18500, 151, 42, 12.4, 240, '3 years or 80,000 km'],
  ['Montra Electric', 'Super Cargo', 'THREE_WHEELER_CARGO', 320000, 2024, 7800, 170, 55, 13.8, 240, '5 years or 1,50,000 km'],
  ['Tata', 'Nexon EV', 'FOUR_WHEELER_PASSENGER', 1150000, 2022, 34000, 312, 120, 30.2, 510, '8 years or 1,60,000 km (battery)'],
  ['Tata', 'Tiago EV', 'FOUR_WHEELER_PASSENGER', 640000, 2023, 19000, 250, 120, 24.0, 480, '8 years or 1,60,000 km (battery)'],
  ['Tata', 'Punch EV', 'FOUR_WHEELER_PASSENGER', 920000, 2024, 12000, 315, 140, 25.0, 480, '8 years or 1,60,000 km (battery)'],
  ['MG', 'Comet EV', 'FOUR_WHEELER_PASSENGER', 560000, 2024, 6500, 230, 100, 17.3, 420, '8 years or 1,20,000 km (battery)'],
  ['MG', 'ZS EV', 'FOUR_WHEELER_PASSENGER', 1580000, 2021, 48000, 461, 175, 50.3, 540, '8 years or 1,50,000 km (battery)'],
  ['BYD', 'Atto 3', 'FOUR_WHEELER_PASSENGER', 2250000, 2023, 22000, 521, 160, 60.48, 600, '8 years or 1,60,000 km (battery)'],
  ['Citroen', 'eC3', 'FOUR_WHEELER_PASSENGER', 740000, 2023, 16000, 320, 107, 29.2, 600, '7 years or 1,40,000 km (battery)'],
  ['Tata', 'Ace EV', 'FOUR_WHEELER_CARGO', 790000, 2023, 26000, 154, 60, 21.3, 420, '5 years or 1,75,000 km'],
  ['Tata', 'Ace EV 1000', 'FOUR_WHEELER_CARGO', 890000, 2024, 9000, 161, 60, 21.3, 420, '5 years or 1,75,000 km'],
];

async function main() {
  let created = 0;
  for (const [make, model, category, price, year, km, range, speed, battery, chargeMins, warranty] of VEHICLES) {
    const exists = await prisma.vehicle.findFirst({ where: { make, model } });
    if (exists) continue;

    await prisma.vehicle.create({
      data: {
        make,
        model,
        category,
        warranty,
        mainImage: IMG[category],
        showInBuying: true,
        buyingPrice: price,
        manufactureYear: year,
        kmDriven: km,
        certifiedRangeKm: range,
        realWorldRangeKm: Math.round(range * 0.8),
        topSpeedKmh: speed,
        batteryCapKwh: battery,
        chargingTimeMinutes: chargeMins,
        transmission: 'AUTO',
        chargerType: category === 'FOUR_WHEELER_PASSENGER' ? 'BOTH' : 'NORMAL',
        overview: `Demo listing: ${year} ${make} ${model}, ${km.toLocaleString('en-IN')} km driven.`,
        buyingInfo: 'Demo listing. Contact ZMR Mobility to confirm warranty, ownership transfer, insurance and financing terms for this vehicle.',
      },
    });
    created++;
  }
  console.log(`Demo catalogue: ${created} vehicle(s) added, ${VEHICLES.length - created} already present.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
