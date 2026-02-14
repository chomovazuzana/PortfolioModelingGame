export const GAME_YEARS = [2021, 2022, 2023, 2024] as const;
export type GameYear = (typeof GAME_YEARS)[number];

/** All 12 DELOS/NBG mutual fund IDs */
export const FUND_IDS: number[] = [750, 752, 753, 782, 916, 924, 940, 951, 953, 962, 965, 970];

/** Fund ID → English name */
export const FUND_NAMES: Record<number, string> = {
  750: 'DELOS Synthesis Best Blue',
  752: 'DELOS Synthesis Best Yellow',
  753: 'DELOS Synthesis Best Red',
  782: 'DELOS Fixed Income Plus',
  916: 'DELOS Small Cap',
  924: 'NBG Global Equity',
  940: 'NBG European Allstars',
  951: 'DELOS Mixed',
  953: 'DELOS Blue Chips',
  962: 'DELOS Short & Medium-Term',
  965: 'DELOS Strategic Investments',
  970: 'DELOS Greek Growth',
};

/** Fund ID → classification */
export const FUND_TYPES: Record<number, 'Bond' | 'Mixed' | 'Equity'> = {
  750: 'Bond',
  752: 'Mixed',
  753: 'Equity',
  782: 'Bond',
  916: 'Equity',
  924: 'Equity',
  940: 'Equity',
  951: 'Mixed',
  953: 'Equity',
  962: 'Bond',
  965: 'Mixed',
  970: 'Bond',
};

/** Fund returns by year: year → fundId → returnPct */
export const FUND_RETURNS: Record<number, Record<number, number>> = {
  2021: {
    750: -0.88,
    752: 10.16,
    753: 22.09,
    782: -2.80,
    916: 12.35,
    924: 28.27,
    940: 19.65,
    951: 6.24,
    953: 13.47,
    962: -0.04,
    965: 10.85,
    970: 0.92,
  },
  2022: {
    750: -4.96,
    752: -8.94,
    753: -11.99,
    782: -17.13,
    916: -3.24,
    924: -11.71,
    940: -10.72,
    951: -3.53,
    953: 4.27,
    962: -3.92,
    965: -8.84,
    970: -9.62,
  },
  2023: {
    750: 3.69,
    752: 7.75,
    753: 11.21,
    782: 8.40,
    916: 38.39,
    924: 16.53,
    940: 16.15,
    951: 22.40,
    953: 38.34,
    962: 4.31,
    965: 13.31,
    970: 6.49,
  },
  2024: {
    750: 3.14,
    752: 12.05,
    753: 21.23,
    782: 1.45,
    916: 8.49,
    924: 16.66,
    940: 7.10,
    951: 7.43,
    953: 14.25,
    962: 3.36,
    965: 6.27,
    970: 4.69,
  },
};

export const DEFAULT_INITIAL_CAPITAL = 100_000;

export const SCENARIO_BRIEFINGS: Record<number, { title: string; description: string }> = {
  2021: {
    title: 'The Year of Strong Recovery',
    description:
      'The global economy bounces back from COVID-19. Vaccination programs accelerate, economies reopen, and consumer spending surges. Supply chains struggle to keep up with demand. Energy prices rise. Central banks keep interest rates near zero to support recovery. Real estate markets heat up as remote work reshapes housing demand.',
  },
  2022: {
    title: 'The Year of Inflation and Tightening',
    description:
      'Inflation reaches multi-decade highs across the globe. Central banks respond with aggressive interest rate hikes. The war in Ukraine disrupts energy and food supplies. Bond markets suffer historic losses as yields spike. Technology stocks retreat from pandemic highs. Energy commodities surge on supply fears.',
  },
  2023: {
    title: 'The Year of Stabilization and Artificial Intelligence',
    description:
      'Inflation begins to ease and markets anticipate the end of the rate-hiking cycle. The AI revolution, led by breakthroughs in large language models, drives a tech stock rally. Corporate earnings stabilize. Bond markets begin to recover. Real estate markets cool but remain resilient in key segments.',
  },
  2024: {
    title: 'The Year of Resilience',
    description:
      'The economy proves more resilient than expected. Central banks begin cautious rate cuts. Equity markets continue upward, driven by technology and AI adoption. Bond markets remain volatile with mixed signals on inflation. Commodities stabilize. REITs benefit from the rate-cutting outlook.',
  },
};

/** Maximum year value representing "all years completed" */
export const COMPLETED_YEAR_MARKER = 2025;

/** Game code length */
export const GAME_CODE_LENGTH = 6;
