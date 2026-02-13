import type { ScenarioBriefing as ScenarioBriefingType } from '../../shared/types';

interface ScenarioBriefingProps {
  scenario: ScenarioBriefingType;
}

export function ScenarioBriefing({ scenario }: ScenarioBriefingProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {scenario.year}: {scenario.title}
          </h3>
          <p className="mt-2 leading-relaxed text-gray-600">
            {scenario.description}
          </p>
        </div>
      </div>
    </div>
  );
}
