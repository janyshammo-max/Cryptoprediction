export default function LoadingState({ label = "Data laden" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <span className="h-3 w-3 animate-ping rounded-full bg-slate-400" aria-hidden />
      <span>{label}…</span>
    </div>
  );
}
