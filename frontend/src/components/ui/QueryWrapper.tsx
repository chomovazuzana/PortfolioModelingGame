import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Spinner } from './Spinner';
import { Button } from './Button';

interface QueryWrapperProps<T> {
  query: UseQueryResult<T>;
  loadingLabel?: string;
  children: (data: T) => ReactNode;
  emptyCheck?: (data: T) => boolean;
  emptyMessage?: string;
}

export function QueryWrapper<T>({
  query,
  loadingLabel = 'Loading',
  children,
  emptyCheck,
  emptyMessage = 'No data available.',
}: QueryWrapperProps<T>) {
  if (query.isLoading) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label={loadingLabel}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">Failed to load data</p>
          <p className="mt-1 text-sm text-red-600">
            Please check your connection and try again.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => query.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!query.data) return null;

  if (emptyCheck && emptyCheck(query.data)) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children(query.data)}</>;
}
