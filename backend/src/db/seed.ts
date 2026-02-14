import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { fundBenchmarks, users } from './schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  console.log('Seeding database...');

  // ── Seed dev users (for DISABLE_LOGIN mode) ──
  const devUsers = [
    { id: '00000000-0000-0000-0000-000000000001', email: 'admin@dev.local', displayName: 'Admin User', role: 'admin' as const, organizationalUnit: 'Development' },
    { id: '00000000-0000-0000-0000-000000000002', email: 'player1@dev.local', displayName: 'Alice Investor', role: 'player' as const, organizationalUnit: 'Investments' },
    { id: '00000000-0000-0000-0000-000000000003', email: 'player2@dev.local', displayName: 'Bob Trader', role: 'player' as const, organizationalUnit: 'Trading' },
    { id: '00000000-0000-0000-0000-000000000004', email: 'player3@dev.local', displayName: 'Carol Analyst', role: 'player' as const, organizationalUnit: 'Research' },
    { id: '00000000-0000-0000-0000-000000000005', email: 'player4@dev.local', displayName: 'Dave Banker', role: 'player' as const, organizationalUnit: 'Banking' },
    { id: '00000000-0000-0000-0000-000000000006', email: 'player5@dev.local', displayName: 'Eve Advisor', role: 'player' as const, organizationalUnit: 'Advisory' },
  ];

  for (const u of devUsers) {
    await db.insert(users).values(u).onConflictDoNothing();
  }
  console.log(`  Inserted ${devUsers.length} dev users`);

  // ── Seed Fund Benchmarks (12 funds × 4 years = 48 rows) ──
  // Fund type classification based on equity allocation:
  //   0% equity → "Bond", <50% → "Mixed", ≥50% → "Equity"

  const funds = [
    {
      fundId: 965, fundName: 'DELOS Strategic Investments', fundType: 'Mixed',
      years: [
        { year: 2021, cashPct: '16.00', fixedIncomePct: '32.70', equityPct: '51.30', returnPct: '10.8500', sharpeRatio: '0.8100' },
        { year: 2022, cashPct: '21.30', fixedIncomePct: '26.60', equityPct: '52.10', returnPct: '-8.8400', sharpeRatio: '0.0200' },
        { year: 2023, cashPct: '18.90', fixedIncomePct: '37.70', equityPct: '43.40', returnPct: '13.3100', sharpeRatio: '0.5200' },
        { year: 2024, cashPct: '11.00', fixedIncomePct: '39.10', equityPct: '49.90', returnPct: '6.2700', sharpeRatio: '0.3700' },
      ],
    },
    {
      fundId: 962, fundName: 'DELOS Short & Medium-Term', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '21.90', fixedIncomePct: '78.10', equityPct: '0.00', returnPct: '-0.0400', sharpeRatio: '-0.0600' },
        { year: 2022, cashPct: '21.40', fixedIncomePct: '78.60', equityPct: '0.00', returnPct: '-3.9200', sharpeRatio: '-0.3800' },
        { year: 2023, cashPct: '16.50', fixedIncomePct: '83.50', equityPct: '0.00', returnPct: '4.3100', sharpeRatio: '0.0300' },
        { year: 2024, cashPct: '25.90', fixedIncomePct: '74.10', equityPct: '0.00', returnPct: '3.3600', sharpeRatio: '0.5900' },
      ],
    },
    {
      fundId: 970, fundName: 'DELOS Greek Growth', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '15.40', fixedIncomePct: '84.60', equityPct: '0.00', returnPct: '0.9200', sharpeRatio: '0.6900' },
        { year: 2022, cashPct: '10.10', fixedIncomePct: '89.90', equityPct: '0.00', returnPct: '-9.6200', sharpeRatio: '-0.3200' },
        { year: 2023, cashPct: '8.20', fixedIncomePct: '91.80', equityPct: '0.00', returnPct: '6.4900', sharpeRatio: '-0.2200' },
        { year: 2024, cashPct: '12.20', fixedIncomePct: '87.80', equityPct: '0.00', returnPct: '4.6900', sharpeRatio: '0.0600' },
      ],
    },
    {
      fundId: 953, fundName: 'DELOS Blue Chips', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '4.60', fixedIncomePct: '2.40', equityPct: '93.00', returnPct: '13.4700', sharpeRatio: '0.6000' },
        { year: 2022, cashPct: '2.00', fixedIncomePct: '1.00', equityPct: '97.00', returnPct: '4.2700', sharpeRatio: '0.0700' },
        { year: 2023, cashPct: '3.20', fixedIncomePct: '0.70', equityPct: '96.10', returnPct: '38.3400', sharpeRatio: '1.0600' },
        { year: 2024, cashPct: '1.70', fixedIncomePct: '0.00', equityPct: '98.30', returnPct: '14.2500', sharpeRatio: '1.1500' },
      ],
    },
    {
      fundId: 916, fundName: 'DELOS Small Cap', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '1.50', fixedIncomePct: '0.00', equityPct: '98.50', returnPct: '12.3500', sharpeRatio: '0.5900' },
        { year: 2022, cashPct: '1.70', fixedIncomePct: '0.00', equityPct: '98.30', returnPct: '-3.2400', sharpeRatio: '0.0200' },
        { year: 2023, cashPct: '1.30', fixedIncomePct: '0.00', equityPct: '98.70', returnPct: '38.3900', sharpeRatio: '0.8900' },
        { year: 2024, cashPct: '1.50', fixedIncomePct: '0.00', equityPct: '98.50', returnPct: '8.4900', sharpeRatio: '0.8700' },
      ],
    },
    {
      fundId: 951, fundName: 'DELOS Mixed', fundType: 'Mixed',
      years: [
        { year: 2021, cashPct: '6.90', fixedIncomePct: '43.30', equityPct: '49.80', returnPct: '6.2400', sharpeRatio: '0.9100' },
        { year: 2022, cashPct: '16.70', fixedIncomePct: '36.30', equityPct: '47.00', returnPct: '-3.5300', sharpeRatio: '0.0500' },
        { year: 2023, cashPct: '12.70', fixedIncomePct: '42.80', equityPct: '44.50', returnPct: '22.4000', sharpeRatio: '0.7700' },
        { year: 2024, cashPct: '2.70', fixedIncomePct: '47.40', equityPct: '49.90', returnPct: '7.4300', sharpeRatio: '0.8500' },
      ],
    },
    {
      fundId: 750, fundName: 'DELOS Synthesis Best Blue', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '18.50', fixedIncomePct: '81.50', equityPct: '0.00', returnPct: '-0.8800', sharpeRatio: '0.1600' },
        { year: 2022, cashPct: '12.30', fixedIncomePct: '87.70', equityPct: '0.00', returnPct: '-4.9600', sharpeRatio: '-0.9600' },
        { year: 2023, cashPct: '10.30', fixedIncomePct: '89.70', equityPct: '0.00', returnPct: '3.6900', sharpeRatio: '-0.3900' },
        { year: 2024, cashPct: '1.90', fixedIncomePct: '98.10', equityPct: '0.00', returnPct: '3.1400', sharpeRatio: '0.2600' },
      ],
    },
    {
      fundId: 752, fundName: 'DELOS Synthesis Best Yellow', fundType: 'Mixed',
      years: [
        { year: 2021, cashPct: '7.60', fixedIncomePct: '45.90', equityPct: '46.50', returnPct: '10.1600', sharpeRatio: '1.3400' },
        { year: 2022, cashPct: '5.00', fixedIncomePct: '49.00', equityPct: '46.00', returnPct: '-8.9400', sharpeRatio: '0.1300' },
        { year: 2023, cashPct: '17.10', fixedIncomePct: '38.40', equityPct: '44.50', returnPct: '7.7500', sharpeRatio: '0.4200' },
        { year: 2024, cashPct: '12.90', fixedIncomePct: '40.20', equityPct: '46.90', returnPct: '12.0500', sharpeRatio: '0.4900' },
      ],
    },
    {
      fundId: 753, fundName: 'DELOS Synthesis Best Red', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '4.70', fixedIncomePct: '3.70', equityPct: '91.50', returnPct: '22.0900', sharpeRatio: '1.5700' },
        { year: 2022, cashPct: '5.60', fixedIncomePct: '2.30', equityPct: '92.10', returnPct: '-11.9900', sharpeRatio: '0.3000' },
        { year: 2023, cashPct: '8.50', fixedIncomePct: '1.20', equityPct: '90.30', returnPct: '11.2100', sharpeRatio: '0.5600' },
        { year: 2024, cashPct: '7.70', fixedIncomePct: '1.40', equityPct: '90.90', returnPct: '21.2300', sharpeRatio: '0.5200' },
      ],
    },
    {
      fundId: 782, fundName: 'DELOS Fixed Income Plus', fundType: 'Bond',
      years: [
        { year: 2021, cashPct: '16.00', fixedIncomePct: '84.00', equityPct: '0.00', returnPct: '-2.8000', sharpeRatio: '0.2000' },
        { year: 2022, cashPct: '13.20', fixedIncomePct: '86.80', equityPct: '0.00', returnPct: '-17.1300', sharpeRatio: '-0.9200' },
        { year: 2023, cashPct: '14.60', fixedIncomePct: '85.40', equityPct: '0.00', returnPct: '8.4000', sharpeRatio: '-0.6100' },
        { year: 2024, cashPct: '3.80', fixedIncomePct: '96.20', equityPct: '0.00', returnPct: '1.4500', sharpeRatio: '-0.4000' },
      ],
    },
    {
      fundId: 924, fundName: 'NBG Global Equity', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '1.90', fixedIncomePct: '0.00', equityPct: '98.10', returnPct: '28.2700', sharpeRatio: '1.5600' },
        { year: 2022, cashPct: '3.30', fixedIncomePct: '0.00', equityPct: '96.70', returnPct: '-11.7100', sharpeRatio: '0.3400' },
        { year: 2023, cashPct: '2.90', fixedIncomePct: '0.00', equityPct: '97.10', returnPct: '16.5300', sharpeRatio: '0.9300' },
        { year: 2024, cashPct: '2.20', fixedIncomePct: '0.00', equityPct: '97.80', returnPct: '16.6600', sharpeRatio: '0.6000' },
      ],
    },
    {
      fundId: 940, fundName: 'NBG European Allstars', fundType: 'Equity',
      years: [
        { year: 2021, cashPct: '9.00', fixedIncomePct: '0.00', equityPct: '91.00', returnPct: '19.6500', sharpeRatio: '0.7100' },
        { year: 2022, cashPct: '6.30', fixedIncomePct: '0.00', equityPct: '93.70', returnPct: '-10.7200', sharpeRatio: '0.0100' },
        { year: 2023, cashPct: '6.30', fixedIncomePct: '0.00', equityPct: '93.70', returnPct: '16.1500', sharpeRatio: '0.5700' },
        { year: 2024, cashPct: '6.30', fixedIncomePct: '0.00', equityPct: '93.70', returnPct: '7.1000', sharpeRatio: '0.2700' },
      ],
    },
  ];

  const fundRows = funds.flatMap((fund) =>
    fund.years.map((yearData) => ({
      fundId: fund.fundId,
      fundName: fund.fundName,
      fundType: fund.fundType,
      ...yearData,
    }))
  );

  await db.insert(fundBenchmarks).values(fundRows).onConflictDoNothing();
  console.log(`  Inserted ${fundRows.length} fund benchmark records`);

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
