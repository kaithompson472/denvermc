interface LoadingSkeletonProps {
  variant?: 'node-detail' | 'default';
}

export function LoadingSkeleton({ variant = 'default' }: LoadingSkeletonProps) {
  if (variant === 'node-detail') {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero skeleton */}
        <section className="bg-mountain-gradient px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="h-6 w-24 bg-white/20 rounded mb-4 animate-pulse" />
            <div className="h-10 w-64 bg-white/30 rounded mb-2 animate-pulse" />
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info card skeleton */}
            <div className="lg:col-span-2">
              <div className="card-mesh p-6 space-y-4">
                <div className="h-6 w-32 bg-night-700 rounded animate-pulse" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-24 bg-night-700 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-night-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-mesh p-6">
                  <div className="h-4 w-20 bg-night-700 rounded animate-pulse mb-2" />
                  <div className="h-8 w-16 bg-night-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Packets table skeleton */}
          <div className="mt-8 card-mesh p-6">
            <div className="h-6 w-40 bg-night-700 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-night-700/50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-6">
        <div className="h-8 bg-night-700 rounded animate-pulse" />
        <div className="h-4 bg-night-700 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-night-700 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
