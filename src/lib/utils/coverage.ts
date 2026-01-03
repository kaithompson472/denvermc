/**
 * Coverage utility functions for mesh network locations
 * Shared helpers for displaying coverage status badges and labels
 */

import type { Location } from '@/lib/data/locations';

/**
 * Get the display label for a coverage level
 */
export function getCoverageLabel(coverage: Location['meshCoverage']): string {
  switch (coverage) {
    case 'excellent':
      return 'Excellent Coverage';
    case 'good':
      return 'Good Coverage';
    case 'growing':
      return 'Growing Network';
    case 'planned':
      return 'Coming Soon';
    default:
      return 'Coverage Status';
  }
}

/**
 * Get Tailwind CSS classes for coverage badge styling
 */
export function getCoverageBadgeColor(coverage: Location['meshCoverage']): string {
  switch (coverage) {
    case 'excellent':
      return 'bg-forest-500/10 text-forest-500 border-forest-500/30';
    case 'good':
      return 'bg-mesh/10 text-mesh border-mesh/30';
    case 'growing':
      return 'bg-sunset-500/10 text-sunset-500 border-sunset-500/30';
    case 'planned':
      return 'bg-foreground-muted/10 text-foreground-muted border-foreground-muted/30';
    default:
      return 'bg-foreground-muted/10 text-foreground-muted border-foreground-muted/30';
  }
}

/**
 * Get Tailwind CSS text color class for a coverage level
 */
export function getCoverageColor(coverage: Location['meshCoverage']): string {
  switch (coverage) {
    case 'excellent':
      return 'text-forest-500';
    case 'good':
      return 'text-mesh';
    case 'growing':
      return 'text-sunset-500';
    case 'planned':
      return 'text-foreground-muted';
    default:
      return 'text-foreground-muted';
  }
}

/**
 * Get a description of coverage for a specific location
 */
export function getCoverageDescription(coverage: Location['meshCoverage'], name: string): string {
  switch (coverage) {
    case 'excellent':
      return `${name} has excellent mesh network coverage with dense node distribution across the city. Most areas have reliable connectivity with multiple routing paths.`;
    case 'good':
      return `${name} has good mesh network coverage with nodes distributed throughout key areas. Coverage continues to expand with new nodes being added regularly.`;
    case 'growing':
      return `The mesh network in ${name} is actively growing. Early adopters are establishing the initial node infrastructure, and coverage is expanding rapidly.`;
    case 'planned':
      return `Mesh network coverage in ${name} is planned for the near future. Be among the first to establish nodes and help build the local network.`;
    default:
      return `Mesh network coverage information for ${name}.`;
  }
}
