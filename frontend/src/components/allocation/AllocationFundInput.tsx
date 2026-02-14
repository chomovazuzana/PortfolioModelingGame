interface AllocationFundInputProps {
  fundId: number;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const STEP = 5;

export function AllocationFundInput({ fundId, label, value, onChange }: AllocationFundInputProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <label
        htmlFor={`fund-${fundId}`}
        className="min-w-0 flex-1 truncate text-sm text-gray-700"
        title={label}
      >
        {label}
      </label>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - STEP))}
          disabled={value <= 0}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label={`Decrease ${label} by ${STEP} percent`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <input
          id={`fund-${fundId}`}
          type="number"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          aria-label={`${label} allocation: ${value} percent`}
          className="h-7 w-14 rounded border border-gray-300 text-center text-sm tabular-nums text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => onChange(Math.min(100, value + STEP))}
          disabled={value >= 100}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label={`Increase ${label} by ${STEP} percent`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <span className="w-10 text-right text-sm font-medium tabular-nums text-gray-500">
          {value}%
        </span>
      </div>
    </div>
  );
}
