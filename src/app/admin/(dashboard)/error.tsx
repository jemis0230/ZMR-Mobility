'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
      <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
      <p className="text-ink/60 text-sm max-w-md">
        {error.message || 'An unexpected error occurred in the admin panel.'}
      </p>
      {error.digest && (
        <p className="text-ink/40 text-xs font-mono">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
