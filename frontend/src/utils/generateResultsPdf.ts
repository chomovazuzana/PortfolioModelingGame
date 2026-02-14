import type { FinalResults } from '../shared/types';
import { FUND_NAMES } from '../shared/constants';

export async function generateResultsPdf(
  results: FinalResults,
  gameName: string,
  playerName: string
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default;

  const doc = new jsPDF();
  const { playerResult, optimalPath } = results;
  const initialCapital = playerResult.snapshots[0]?.valueStart ?? 100_000;

  // Header
  doc.setFontSize(18);
  doc.text('Portfolio Modeling Game - Results', 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Game: ${gameName}`, 14, 28);
  doc.text(`Player: ${playerName}`, 14, 34);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Summary', 14, 52);

  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text(`Initial Capital: EUR ${initialCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, 60);
  doc.text(`Final Value: EUR ${playerResult.finalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, 66);
  doc.text(`Total Return: ${playerResult.totalReturnPct >= 0 ? '+' : ''}${playerResult.totalReturnPct.toFixed(2)}%`, 14, 72);
  doc.text(
    playerResult.rank > 0
      ? `Rank: ${playerResult.rank} / ${playerResult.totalPlayers}`
      : 'Rank: Unranked (hidden)',
    14,
    78
  );

  // Allocations per year (fund-based, vertical list per year)
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Allocations', 14, 92);

  const allocBody: string[][] = [];
  for (const a of playerResult.allocations) {
    const fundEntries = Object.entries(a.allocations)
      .filter(([, pct]) => pct > 0)
      .map(([fundId, pct]) => `${FUND_NAMES[Number(fundId)] ?? fundId}: ${pct}%`)
      .join(', ');

    allocBody.push([a.year.toString(), fundEntries || 'None']);
  }

  autoTable(doc, {
    startY: 96,
    head: [['Year', 'Fund Allocations']],
    body: allocBody,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
    columnStyles: { 1: { cellWidth: 140 } },
  });

  // Portfolio table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allocTableEnd = ((doc as any).lastAutoTable?.finalY as number) ?? 140;
  const portfolioY = allocTableEnd + 12;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Portfolio Performance', 14, portfolioY);

  autoTable(doc, {
    startY: portfolioY + 4,
    head: [['Year', 'Start Value', 'End Value', 'Return %']],
    body: playerResult.snapshots.map((s) => [
      s.year.toString(),
      `EUR ${s.valueStart.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `EUR ${s.valueEnd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${s.returnPct >= 0 ? '+' : ''}${s.returnPct.toFixed(2)}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Generated from Portfolio Modeling Game', 14, pageHeight - 10);

  doc.save(`results-${gameName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
