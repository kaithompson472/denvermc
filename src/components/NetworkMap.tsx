'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { NodeWithStats } from '@/lib/types';
import { MAP_VISIBILITY_THRESHOLD_MS, OBSERVER_REFRESH_INTERVAL } from '@/lib/constants';

// Fix for default marker icons in Next.js - only run on client
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
}

// Custom marker icons by node type
const createIcon = (color: string, isOnline: boolean) => {
  if (typeof window === 'undefined') return undefined;
  const opacity = isOnline ? 1 : 0.5;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        opacity: ${opacity};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isOnline ? '<div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>' : ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const NODE_COLORS: Record<string, string> = {
  gateway: '#f97316', // orange - observers/gateways
  companion: '#8b5cf6', // purple
  repeater: '#22c55e', // forest-500
  room_server: '#0ea5e9', // mesh
};

// Display names for the legend
const NODE_TYPE_LABELS: Record<string, string> = {
  gateway: 'Observer',
  companion: 'Companion',
  repeater: 'Repeater',
  room_server: 'Room Server',
};

const DEFAULT_NODE_COLOR = '#6b7280'; // gray for unknown types

/**
 * Get the color for a node based on type or name pattern
 * Observers are detected by name even if node_type isn't 'gateway'
 */
function getNodeColor(node: NodeWithStats): string {
  // Check if name indicates this is an observer
  const name = node.name?.toLowerCase() || '';
  if (name.includes('observer') || name.includes('0bserver') ||
      name.includes('obs3rver') || name.includes('0bs3rver')) {
    return NODE_COLORS.gateway;
  }
  return NODE_COLORS[node.node_type] || DEFAULT_NODE_COLOR;
}

/**
 * Check if a node was seen within the map visibility threshold (24 hours)
 */
function isNodeRecentlyActive(node: NodeWithStats): boolean {
  if (!node.last_seen) return false;
  const lastSeenTime = node.last_seen.endsWith('Z')
    ? new Date(node.last_seen).getTime()
    : new Date(node.last_seen + 'Z').getTime();
  return Date.now() - lastSeenTime < MAP_VISIBILITY_THRESHOLD_MS;
}

interface NetworkMapProps {
  nodes?: NodeWithStats[];
  className?: string;
}

export function NetworkMap({ nodes, className = '' }: NetworkMapProps) {
  const [mapNodes, setMapNodes] = useState<NodeWithStats[]>(nodes || []);
  const [loading, setLoading] = useState(!nodes);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Denver area center coordinates
  const denverCenter: [number, number] = [39.7392, -104.9903];

  // Ensure component is mounted before rendering map
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (nodes) {
      setMapNodes(nodes);
      return;
    }

    async function fetchNodes() {
      try {
        const res = await fetch('/api/nodes', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data) {
          setMapNodes(data.data);
        } else {
          setError(data.error || 'Failed to fetch nodes');
        }
      } catch (err) {
        setError('Failed to load map data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchNodes();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNodes, OBSERVER_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [nodes]);

  // Filter nodes with valid coordinates AND seen within 24 hours
  const nodesWithLocation = mapNodes.filter(
    (node) => node.latitude !== null && node.longitude !== null && isNodeRecentlyActive(node)
  );

  // Calculate map bounds if we have nodes
  const bounds = nodesWithLocation.length > 0
    ? L.latLngBounds(
        nodesWithLocation.map((node) => [node.latitude!, node.longitude!])
      )
    : null;

  if (!mounted || loading) {
    return (
      <div className={`bg-night-800 rounded-lg animate-pulse ${className}`} style={{ height: '500px' }}>
        <div className="flex items-center justify-center h-full text-foreground-muted">
          Loading map...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-night-800 rounded-lg ${className}`} style={{ height: '500px' }}>
        <div className="flex items-center justify-center h-full text-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden relative z-0 ${className}`} style={{ height: '500px' }}>
      <MapContainer
        center={bounds ? bounds.getCenter() : denverCenter}
        zoom={bounds ? undefined : 10}
        bounds={bounds || undefined}
        boundsOptions={{ padding: [50, 50] }}
        className="h-full w-full"
        style={{ background: '#1a1a2e' }}
      >
        {/* Dark mode tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Node markers */}
        {nodesWithLocation.map((node) => (
          <Marker
            key={node.id}
            position={[node.latitude!, node.longitude!]}
            icon={createIcon(
              getNodeColor(node),
              node.is_online
            )}
          >
            <Popup className="node-popup">
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      node.is_online ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  />
                  <span className="font-bold text-gray-900">
                    {node.name || 'Unnamed Node'}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{node.node_type.replace('_', ' ')}</span>
                  </div>

                  {node.firmware_version && (
                    <div className="flex justify-between">
                      <span>Firmware:</span>
                      <span className="font-mono">{node.firmware_version}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Packets Today:</span>
                    <span className="font-mono">{node.packets_today}</span>
                  </div>

                  {node.last_seen && (
                    <div className="flex justify-between">
                      <span>Last Seen:</span>
                      <span>{new Date(node.last_seen.endsWith('Z') ? node.last_seen : node.last_seen + 'Z').toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200">
                  <code className="text-[10px] text-gray-500 break-all">
                    {node.public_key.slice(0, 16)}...
                  </code>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-night-900/90 backdrop-blur-sm rounded-lg p-3 z-[1000]">
        <div className="text-xs text-foreground-muted mb-2 font-medium">Node Types</div>
        <div className="space-y-1">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-foreground">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: color }}
              />
              <span>{NODE_TYPE_LABELS[type] || type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-night-900/90 backdrop-blur-sm rounded-lg p-3 z-[1000]">
        <div className="text-sm text-foreground">
          <span className="text-mesh font-bold">{nodesWithLocation.length}</span>
          <span className="text-foreground-muted"> active nodes</span>
        </div>
        <div className="text-xs text-foreground-muted">
          {nodesWithLocation.filter(n => n.is_online).length} online now
        </div>
        <div className="text-[10px] text-foreground-muted/70 mt-1">
          Showing nodes seen in last 24h
        </div>
      </div>
    </div>
  );
}
