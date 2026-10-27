interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-md border border-red-300 px-3 py-1 font-medium hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
      >
        Retry
      </button>
    </div>
  );
}
