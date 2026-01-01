'use client';

import dynamic from 'next/dynamic';
import type { NodeWithStats } from '@/lib/types';

// Dynamic import to avoid SSR issues with Leaflet
const NetworkMap = dynamic(
  () => import('./NetworkMap').then((mod) => mod.NetworkMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-night-800 rounded-lg animate-pulse" style={{ height: '500px' }}>
        <div className="flex items-center justify-center h-full text-foreground-muted">
          <div className="flex items-center gap-3">
            <svg
              className="h-6 w-6 animate-spin text-mesh"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading map...
          </div>
        </div>
      </div>
    ),
  }
);

interface NetworkMapWrapperProps {
  nodes?: NodeWithStats[];
  className?: string;
}

export function NetworkMapWrapper(props: NetworkMapWrapperProps) {
  return <NetworkMap {...props} />;
}
