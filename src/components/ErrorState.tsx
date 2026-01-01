import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message: string;
  backHref?: string;
  backLabel?: string;
}

export function ErrorState({
  title = 'Error',
  message,
  backHref = '/',
  backLabel = 'Go Back',
}: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/20 mb-6">
          <svg
            className="h-10 w-10 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-foreground-muted mb-8 max-w-md">{message}</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 btn-primary px-6 py-3 focus-ring"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
