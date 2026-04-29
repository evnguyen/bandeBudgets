interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const PageLoader = ({ label = 'Loading...', fullScreen = false }: PageLoaderProps) => {
  const containerClass = fullScreen
    ? 'flex min-h-screen items-center justify-center bg-background'
    : 'flex flex-1 items-center justify-center';

  return (
    <main className={containerClass}>
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      </div>
    </main>
  );
};
