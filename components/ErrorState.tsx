interface ErrorStateProps {
  title?: string;
  message?: string;
}

export default function ErrorState({
  title = "Er ging iets mis",
  message = "Kon de data niet laden. Probeer het later opnieuw."
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
