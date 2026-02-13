import type { AssetClass } from './types';

export const GAME_YEARS = [2021, 2022, 2023, 2024] as const;
export type GameYear = (typeof GAME_YEARS)[number];

export const ASSET_CLASSES: AssetClass[] = ['cash', 'bonds', 'equities', 'commodities', 'reits'];

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  cash: 'Cash',
  bonds: 'Bonds',
  equities: 'Equities',
  commodities: 'Commodities',
  reits: 'REITs',
};

export const DEFAULT_INITIAL_CAPITAL = 100_000;

export const ASSET_RETURNS: Record<number, Record<AssetClass, number>> = {
  2021: { cash: 0.1, bonds: -1.5, equities: 22.35, commodities: 40.1, reits: 41.3 },
  2022: { cash: 0.4, bonds: -12.3, equities: -17.73, commodities: 16.3, reits: -24.4 },
  2023: { cash: 4.5, bonds: 5.3, equities: 24.42, commodities: -10.3, reits: 10.6 },
  2024: { cash: 5.0, bonds: -1.7, equities: 19.2, commodities: 3.0, reits: 8.8 },
};

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
