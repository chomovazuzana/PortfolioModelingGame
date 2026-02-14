# Game Requirements

> **Original concept**: Google Drive document "Game requirements" (ID: `1HGYHi5rYA9cK5lyhQ9yZaELhz4FN3e9KyoCPnSehjpY`) — described a 5-asset-class model (Cash, Bonds, Equities, Commodities, REITs).
>
> **Current implementation**: Adapted to use 12 real DELOS/NBG mutual funds. Fund performance data sourced from Google Drive spreadsheet "Game data" (ID: `15x2BcjHTkxNODFzYnk6Ii3vG8J9i7H_RGBVO6o5hpQQ`). See [game-data-reference.md](game-data-reference.md) for the full fund benchmark dataset including Sharpe ratios and asset composition breakdowns.

## Investment Game: The Returns Challenge

Participants are invited to allocate a total amount (e.g. EUR 100,000) across twelve DELOS/NBG mutual funds for each year (2021-2024). The goal is for the total value of their portfolio at the end of the period to come as close as possible to the value of an "ideal" portfolio that had the optimal allocation each year.

## Game Rules

- **Initial Capital**: All players start with the same initial capital (e.g. EUR 100,000) at the beginning of 2021.
- **Fund Allocation**: At the beginning of each year, players must decide how to allocate 100% of their assets across the twelve DELOS/NBG mutual funds. Allocations must be whole percentages (integers) and must sum to exactly 100%.
- **Returns**: At the end of each year, the player's portfolio is adjusted based on actual historical fund returns.
- **Compounding**: Each year's starting value equals the previous year's ending value.
- **Information**: During gameplay, players see only fund names and types (Bond/Mixed/Equity). Detailed fund composition and Sharpe ratios are revealed only in the final results.
- **Winner**: The winner is the player who, at the end of 2024, has the highest total portfolio value.

## The 12 DELOS/NBG Mutual Funds

Players allocate across three categories of funds:

### Bond Funds (4)
| Fund ID | Fund Name |
|---------|-----------|
| 750 | DELOS Synthesis Best Blue |
| 782 | DELOS Fixed Income Plus |
| 962 | DELOS Short & Medium-Term |
| 970 | DELOS Greek Growth |

### Mixed Funds (3)
| Fund ID | Fund Name |
|---------|-----------|
| 752 | DELOS Synthesis Best Yellow |
| 951 | DELOS Mixed |
| 965 | DELOS Strategic Investments |

### Equity Funds (5)
| Fund ID | Fund Name |
|---------|-----------|
| 753 | DELOS Synthesis Best Red |
| 916 | DELOS Small Cap |
| 924 | NBG Global Equity |
| 940 | NBG European Allstars |
| 953 | DELOS Blue Chips |

## Historical Fund Returns (2021-2024)

| Fund ID | Fund Name | 2021 | 2022 | 2023 | 2024 |
|---------|-----------|------|------|------|------|
| **Bond Funds** | | | | | |
| 750 | DELOS Synthesis Best Blue | -0.88% | -4.96% | +3.69% | +3.14% |
| 782 | DELOS Fixed Income Plus | -2.80% | -17.13% | +8.40% | +1.45% |
| 962 | DELOS Short & Medium-Term | -0.04% | -3.92% | +4.31% | +3.36% |
| 970 | DELOS Greek Growth | +0.92% | -9.62% | +6.49% | +4.69% |
| **Mixed Funds** | | | | | |
| 752 | DELOS Synthesis Best Yellow | +10.16% | -8.94% | +7.75% | +12.05% |
| 951 | DELOS Mixed | +6.24% | -3.53% | +22.40% | +7.43% |
| 965 | DELOS Strategic Investments | +10.85% | -8.84% | +13.31% | +6.27% |
| **Equity Funds** | | | | | |
| 753 | DELOS Synthesis Best Red | +22.09% | -11.99% | +11.21% | +21.23% |
| 916 | DELOS Small Cap | +12.35% | -3.24% | +38.39% | +8.49% |
| 924 | NBG Global Equity | +28.27% | -11.71% | +16.53% | +16.66% |
| 940 | NBG European Allstars | +19.65% | -10.72% | +16.15% | +7.10% |
| 953 | DELOS Blue Chips | +13.47% | +4.27% | +38.34% | +14.25% |

## Yearly Scenarios

### 2021: The Year of Strong Recovery
The global economy bounces back from COVID-19. Vaccination programs accelerate, economies reopen, and consumer spending surges. Supply chains struggle to keep up with demand. Energy prices rise. Central banks keep interest rates near zero to support recovery. Real estate markets heat up as remote work reshapes housing demand.

**Best-performing fund**: NBG Global Equity (924) at +28.27%

### 2022: The Year of Inflation and Tightening
Inflation reaches multi-decade highs across the globe. Central banks respond with aggressive interest rate hikes. The war in Ukraine disrupts energy and food supplies. Bond markets suffer historic losses as yields spike. Technology stocks retreat from pandemic highs. Energy commodities surge on supply fears.

**Best-performing fund**: DELOS Blue Chips (953) at +4.27% — the only fund with positive returns

### 2023: The Year of Stabilization and Artificial Intelligence
Inflation begins to ease and markets anticipate the end of the rate-hiking cycle. The AI revolution, led by breakthroughs in large language models, drives a tech stock rally. Corporate earnings stabilize. Bond markets begin to recover. Real estate markets cool but remain resilient in key segments.

**Best-performing fund**: DELOS Small Cap (916) at +38.39%

### 2024: The Year of Resilience
The economy proves more resilient than expected. Central banks begin cautious rate cuts. Equity markets continue upward, driven by technology and AI adoption. Bond markets remain volatile with mixed signals on inflation. Commodities stabilize. REITs benefit from the rate-cutting outlook.

**Best-performing fund**: DELOS Synthesis Best Red (753) at +21.23%

## Optimal Portfolio (Hindsight)

The ideal portfolio allocates 100% to the best-performing fund each year:

| Year | Best Fund | Return | Portfolio Value |
|------|-----------|--------|-----------------|
| Start | — | — | EUR 100,000.00 |
| 2021 | NBG Global Equity (924) | +28.27% | EUR 128,270.00 |
| 2022 | DELOS Blue Chips (953) | +4.27% | EUR 133,747.13 |
| 2023 | DELOS Small Cap (916) | +38.39% | EUR 185,092.65 |
| 2024 | DELOS Synthesis Best Red (753) | +21.23% | EUR 224,387.82 |

Starting with EUR 100,000, the optimal portfolio reaches **EUR 224,387.82** after four years.

> Values computed by `calculateOptimalPath()` in `shared/calculations.ts`, which picks the highest-returning fund each year and compounds with currency rounding (2 decimal places) at each step.
