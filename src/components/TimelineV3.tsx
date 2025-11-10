"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// Add SVG type declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      svg: React.SVGProps<SVGSVGElement>;
      g: React.SVGProps<SVGGElement>;
      line: React.SVGProps<SVGLineElement>;
      text: React.SVGProps<SVGTextElement>;
      rect: React.SVGProps<SVGRectElement>;
      circle: React.SVGProps<SVGCircleElement>;
    }
  }
}

type Era = { 
  id: string; 
  name?: string|null; 
  title?: string|null; 
  label?: string|null; 
  startYear?: number|null; 
  endYear?: number|null; 
  color?: string|null;
  description?: string|null;
};

type Setting = { 
  id: string; 
  name?: string|null; 
  title?: string|null; 
  label?: string|null; 
  startYear?: number|null; 
  endYear?: number|null; 
  color?: string|null;
  eraId?: string|null;
  regionScope?: 'city' | 'province' | 'front' | 'bubble';
  summary?: string;
};

type Marker = { 
  id: string; 
  name?: string|null; 
  title?: string|null; 
  label?: string|null; 
  year?: number|null;
  description?: string|null;
  type?: 'political' | 'military' | 'magical' | 'natural' | 'cultural' | 'economic';
};

type ViewMode = 'linear' | 'detailed' | 'compact';

const L = (o: { name?: any; title?: any; label?: any }, fb = "") => (o?.name ?? o?.title ?? o?.label ?? fb) as string;

function useContainerWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(1200);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const cw = Math.round(entry.contentRect.width);
      if (cw > 0) setW(cw);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

export function TimelineV3({
  eras,
  settings,
  markers,
  onEraClick,
  onSettingClick,
  onMarkerClick,
  viewMode = 'linear',
  onViewModeChange,
  showControls = true,
}: {
  eras: Era[];
  settings: Setting[];
  markers: Marker[];
  onEraClick?: (era: Era) => void;
  onSettingClick?: (setting: Setting) => void;
  onMarkerClick?: (marker: Marker) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showControls?: boolean;
}) {
  const { ref, width } = useContainerWidth();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    const allYears: number[] = [];
    
    eras.forEach(era => {
      if (era.startYear !== null && era.startYear !== undefined) allYears.push(era.startYear);
      if (era.endYear !== null && era.endYear !== undefined) allYears.push(era.endYear);
    });
    
    settings.forEach(setting => {
      if (setting.startYear !== null && setting.startYear !== undefined) allYears.push(setting.startYear);
      if (setting.endYear !== null && setting.endYear !== undefined) allYears.push(setting.endYear);
    });
    
    markers.forEach(marker => {
      if (marker.year !== null && marker.year !== undefined) allYears.push(marker.year);
    });

    if (allYears.length === 0) return { min: 0, max: 100, span: 100 };

    const min = Math.min(...allYears);
    const max = Math.max(...allYears);
    const span = max - min || 1;
    
    // Add 5% padding on each side
    const padding = span * 0.05;
    
    return {
      min: min - padding,
      max: max + padding,
      span: span + (padding * 2)
    };
  }, [eras, settings, markers]);

  // Convert year to x-coordinate
  const yearToX = useMemo(() => {
    return (year: number) => {
      const padding = 60;
      const timelineWidth = width - (padding * 2);
      const ratio = (year - timelineBounds.min) / timelineBounds.span;
      return padding + (ratio * timelineWidth);
    };
  }, [width, timelineBounds]);

  // Generate year markers for the timeline
  const yearMarkers = useMemo(() => {
    const span = timelineBounds.span;
    const rawMin = Math.min(...eras.map((e: Era) => e.startYear || 0).concat(settings.map((s: Setting) => s.startYear || 0), markers.map((m: Marker) => m.year || 0)));
    const rawMax = Math.max(...eras.map((e: Era) => e.endYear || 0).concat(settings.map((s: Setting) => s.endYear || 0), markers.map((m: Marker) => m.year || 0)));
    
    // Determine step size based on span
    let step = 100;
    if (span <= 50) step = 5;
    else if (span <= 200) step = 25;
    else if (span <= 500) step = 50;
    else if (span <= 1000) step = 100;
    else if (span <= 2000) step = 250;
    else step = 500;

    const yearMarkers = [];
    const startYear = Math.floor(rawMin / step) * step;
    const endYear = Math.ceil(rawMax / step) * step;
    
    for (let year = startYear; year <= endYear; year += step) {
      if (year >= timelineBounds.min && year <= timelineBounds.max) {
        yearMarkers.push({
          year,
          x: yearToX(year),
          label: year.toString()
        });
      }
    }
    
    return yearMarkers;
  }, [timelineBounds, eras, settings, markers, yearToX]);

  // Process timeline events in chronological order
  const timelineEvents = useMemo(() => {
    const events: Array<{
      year: number;
      x: number;
      type: 'era-start' | 'era-end' | 'setting-start' | 'setting-end' | 'marker';
      item: Era | Setting | Marker;
      id: string;
    }> = [];

    // Add era events
    eras.forEach(era => {
      if (era.startYear !== null && era.startYear !== undefined) {
        events.push({
          year: era.startYear,
          x: yearToX(era.startYear),
          type: 'era-start',
          item: era,
          id: `era-start-${era.id}`
        });
      }
      if (era.endYear !== null && era.endYear !== undefined) {
        events.push({
          year: era.endYear,
          x: yearToX(era.endYear),
          type: 'era-end',
          item: era,
          id: `era-end-${era.id}`
        });
      }
    });

    // Add setting events
    settings.forEach(setting => {
      if (setting.startYear !== null && setting.startYear !== undefined) {
        events.push({
          year: setting.startYear,
          x: yearToX(setting.startYear),
          type: 'setting-start',
          item: setting,
          id: `setting-start-${setting.id}`
        });
      }
      if (setting.endYear !== null && setting.endYear !== undefined) {
        events.push({
          year: setting.endYear,
          x: yearToX(setting.endYear),
          type: 'setting-end',
          item: setting,
          id: `setting-end-${setting.id}`
        });
      }
    });

    // Add marker events
    markers.forEach(marker => {
      if (marker.year !== null && marker.year !== undefined) {
        events.push({
          year: marker.year,
          x: yearToX(marker.year),
          type: 'marker',
          item: marker,
          id: `marker-${marker.id}`
        });
      }
    });

    return events.sort((a, b) => a.year - b.year);
  }, [eras, settings, markers, timelineBounds, width]);

  const height = viewMode === 'compact' ? 300 : viewMode === 'detailed' ? 600 : 450;
  const timelineY = height / 2;

  return (
    <div ref={ref} className="w-full space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-600/50 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">Timeline View:</span>
              <select
                value={viewMode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newMode = e.target.value as ViewMode;
                  onViewModeChange?.(newMode);
                }}
                className="px-3 py-1 bg-zinc-700 text-white rounded-lg text-sm border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="compact">Compact</option>
                <option value="linear">Linear Timeline</option>
                <option value="detailed">Detailed View</option>
              </select>
            </div>
            
            <div className="text-sm text-zinc-400">
              <span className="mr-4">📅 {timelineBounds.span.toFixed(0)} years</span>
              <span className="mr-4">🏛️ {eras.length} eras</span>
              <span className="mr-4">🏘️ {settings.length} settings</span>
              <span>⭐ {markers.length} events</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Timeline */}
      <div className="relative bg-gradient-to-b from-zinc-900/50 to-black/50 rounded-lg border border-zinc-600/50 overflow-hidden">
        <svg width={width} height={height} className="w-full">
          {/* Main timeline axis */}
          <line 
            x1={60} 
            y1={timelineY} 
            x2={width - 60} 
            y2={timelineY} 
            stroke="#444" 
            strokeWidth={3}
            className="drop-shadow-sm"
          />

          {/* Year markers */}
          {yearMarkers.map((marker, i) => (
            <g key={i}>
              <line
                x1={marker.x}
                y1={timelineY - 8}
                x2={marker.x}
                y2={timelineY + 8}
                stroke="#666"
                strokeWidth={2}
              />
              <text
                x={marker.x}
                y={timelineY + 25}
                textAnchor="middle"
                fontSize={12}
                fill="#888"
                className="select-none"
              >
                {marker.label}
              </text>
            </g>
          ))}

          {/* Era spans */}
          {eras.map(era => {
            if (!era.startYear || !era.endYear) return null;
            const startX = yearToX(era.startYear);
            const endX = yearToX(era.endYear);
            const color = era.color || '#8b5cf6';
            const isHovered = hoveredItem === `era-${era.id}`;
            
            return (
              <g key={era.id}>
                {/* Era span bar */}
                <rect
                  x={startX}
                  y={timelineY - 20}
                  width={Math.max(2, endX - startX)}
                  height={8}
                  fill={color}
                  opacity={isHovered ? 0.8 : 0.6}
                  rx={4}
                  className="cursor-pointer transition-opacity"
                  onClick={() => onEraClick?.(era)}
                  onMouseEnter={() => setHoveredItem(`era-${era.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                />
                
                {/* Era label */}
                <text
                  x={(startX + endX) / 2}
                  y={timelineY - 28}
                  textAnchor="middle"
                  fontSize={14}
                  fill={color}
                  fontWeight="bold"
                  className="cursor-pointer select-none"
                  onClick={() => onEraClick?.(era)}
                  onMouseEnter={() => setHoveredItem(`era-${era.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {L(era, 'Era')}
                </text>
                
                {/* Era start/end markers */}
                <circle
                  cx={startX}
                  cy={timelineY}
                  r={4}
                  fill={color}
                  stroke="#000"
                  strokeWidth={1}
                  className="cursor-pointer"
                  onClick={() => onEraClick?.(era)}
                />
                <circle
                  cx={endX}
                  cy={timelineY}
                  r={4}
                  fill={color}
                  stroke="#000"
                  strokeWidth={1}
                  className="cursor-pointer"
                  onClick={() => onEraClick?.(era)}
                />
              </g>
            );
          })}

          {/* Settings */}
          {settings.map((setting, index) => {
            if (!setting.startYear || !setting.endYear) return null;
            const startX = yearToX(setting.startYear);
            const endX = yearToX(setting.endYear);
            const color = setting.color || '#7ea6ff';
            const isHovered = hoveredItem === `setting-${setting.id}`;
            
            // Offset settings below the main timeline
            const offsetY = timelineY + 30 + (index % 3) * 25;
            
            return (
              <g key={setting.id}>
                {/* Setting span bar */}
                <rect
                  x={startX}
                  y={offsetY - 4}
                  width={Math.max(2, endX - startX)}
                  height={6}
                  fill={color}
                  opacity={isHovered ? 0.8 : 0.5}
                  rx={3}
                  className="cursor-pointer transition-opacity"
                  onClick={() => onSettingClick?.(setting)}
                  onMouseEnter={() => setHoveredItem(`setting-${setting.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                />
                
                {/* Connection line to main timeline */}
                <line
                  x1={(startX + endX) / 2}
                  y1={timelineY + 4}
                  x2={(startX + endX) / 2}
                  y2={offsetY - 8}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="2,2"
                  opacity={0.6}
                />
                
                {/* Setting label */}
                {viewMode !== 'compact' && (
                  <text
                    x={(startX + endX) / 2}
                    y={offsetY + 12}
                    textAnchor="middle"
                    fontSize={11}
                    fill={color}
                    className="cursor-pointer select-none"
                    onClick={() => onSettingClick?.(setting)}
                    onMouseEnter={() => setHoveredItem(`setting-${setting.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {L(setting, 'Setting')}
                  </text>
                )}
              </g>
            );
          })}

          {/* Markers */}
          {markers.map((marker, index) => {
            if (!marker.year) return null;
            const x = yearToX(marker.year);
            const color = getMarkerColor(marker.type);
            const isHovered = hoveredItem === `marker-${marker.id}`;
            
            // Alternate markers above and below timeline
            const isAbove = index % 2 === 0;
            const markerY = isAbove ? timelineY - 40 : timelineY + 40;
            
            return (
              <g key={marker.id}>
                {/* Connection line */}
                <line
                  x1={x}
                  y1={timelineY + (isAbove ? -4 : 4)}
                  x2={x}
                  y2={markerY + (isAbove ? 8 : -8)}
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.8}
                />
                
                {/* Marker circle */}
                <circle
                  cx={x}
                  cy={markerY}
                  r={isHovered ? 6 : 4}
                  fill={color}
                  stroke="#000"
                  strokeWidth={1}
                  className="cursor-pointer transition-all"
                  onClick={() => onMarkerClick?.(marker)}
                  onMouseEnter={() => setHoveredItem(`marker-${marker.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                />
                
                {/* Marker label */}
                {viewMode !== 'compact' && (
                  <text
                    x={x}
                    y={markerY + (isAbove ? -12 : 18)}
                    textAnchor="middle"
                    fontSize={10}
                    fill={color}
                    className="cursor-pointer select-none"
                    onClick={() => onMarkerClick?.(marker)}
                    onMouseEnter={() => setHoveredItem(`marker-${marker.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {L(marker, 'Event')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Enhanced Tooltip */}
        {hoveredItem && (
          <div className="absolute pointer-events-none z-20 bg-zinc-800 border border-zinc-600 rounded-lg p-3 shadow-xl max-w-xs left-4 top-4">
            {hoveredItem.startsWith('era-') && (() => {
              const era = eras.find(e => `era-${e.id}` === hoveredItem);
              if (!era) return null;
              return (
                <div>
                  <div className="font-semibold text-white text-lg">{L(era, 'Era')}</div>
                  {era.description && (
                    <p className="text-sm text-zinc-300 mt-2">{era.description}</p>
                  )}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="text-blue-300">
                      📅 {era.startYear} - {era.endYear}
                    </div>
                    <div className="text-green-300">
                      ⏱️ {era.endYear && era.startYear ? (era.endYear - era.startYear) : 0} years
                    </div>
                    <div className="text-purple-300">
                      🏘️ {settings.filter(s => s.eraId === era.id).length} settings
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {hoveredItem.startsWith('setting-') && (() => {
              const setting = settings.find(s => `setting-${s.id}` === hoveredItem);
              if (!setting) return null;
              return (
                <div>
                  <div className="font-semibold text-white text-lg">{L(setting, 'Setting')}</div>
                  {setting.summary && (
                    <p className="text-sm text-zinc-300 mt-2">{setting.summary}</p>
                  )}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="text-blue-300">
                      📅 {setting.startYear} - {setting.endYear}
                    </div>
                    {setting.regionScope && (
                      <div className="text-amber-300">
                        🗺️ {setting.regionScope}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {hoveredItem.startsWith('marker-') && (() => {
              const marker = markers.find(m => `marker-${m.id}` === hoveredItem);
              if (!marker) return null;
              return (
                <div>
                  <div className="font-semibold text-white text-lg">{L(marker, 'Event')}</div>
                  {marker.description && (
                    <p className="text-sm text-zinc-300 mt-2">{marker.description}</p>
                  )}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="text-blue-300">
                      📅 {marker.year}
                    </div>
                    {marker.type && (
                      <div className="text-orange-300">
                        🏷️ {marker.type}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      {viewMode === 'detailed' && (
        <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/30 p-4">
          <h4 className="text-sm font-medium text-zinc-300 mb-3">Timeline Legend</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-purple-500 rounded opacity-60"></div>
              <span className="text-zinc-400">Eras</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-blue-400 rounded opacity-50"></div>
              <span className="text-zinc-400">Settings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-zinc-400">Political Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-zinc-400">Natural Events</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for marker colors
function getMarkerColor(type?: string) {
  switch (type) {
    case 'political': return '#ef4444';
    case 'military': return '#dc2626';
    case 'magical': return '#a855f7';
    case 'natural': return '#22c55e';
    case 'cultural': return '#f59e0b';
    case 'economic': return '#06b6d4';
    default: return '#94a3b8';
  }
}