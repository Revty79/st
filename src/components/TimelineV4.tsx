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
      path: React.SVGProps<SVGPathElement>;
      defs: React.SVGProps<SVGDefsElement>;
      linearGradient: React.SVGProps<SVGLinearGradientElement>;
      stop: React.SVGProps<SVGStopElement>;
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

type TimelineEvent = {
  id: string;
  name: string;
  year: number;
  type: 'era-start' | 'era-end' | 'setting-start' | 'setting-end' | 'marker';
  category: 'era' | 'setting' | 'marker';
  sourceData: Era | Setting | Marker;
  color: string;
  description?: string;
  eraContext?: string;
};

type ViewMode = 'overview' | 'detailed' | 'compact';

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

export function TimelineV4({
  eras,
  settings,
  markers,
  onEraClick,
  onSettingClick,
  onMarkerClick,
  viewMode = 'detailed',
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
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusYear, setFocusYear] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; scrollLeft: number } | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Calculate timeline bounds and chronological events
  const { timelineBounds, chronologicalEvents } = useMemo(() => {
    const allYears: number[] = [];
    const events: TimelineEvent[] = [];
    
    // Collect all years and create timeline events
    eras.forEach(era => {
      if (era.startYear !== null && era.startYear !== undefined) {
        allYears.push(era.startYear);
        events.push({
          id: `era-start-${era.id}`,
          name: `${L(era, 'Era')} begins`,
          year: era.startYear,
          type: 'era-start',
          category: 'era',
          sourceData: era,
          color: era.color || '#8b5cf6',
          description: era.description || undefined,
        });
      }
      if (era.endYear !== null && era.endYear !== undefined) {
        allYears.push(era.endYear);
        events.push({
          id: `era-end-${era.id}`,
          name: `${L(era, 'Era')} ends`,
          year: era.endYear,
          type: 'era-end',
          category: 'era',
          sourceData: era,
          color: era.color || '#8b5cf6',
          description: era.description || undefined,
        });
      }
    });
    
    settings.forEach(setting => {
      const eraContext = setting.eraId ? eras.find(e => e.id === setting.eraId)?.name || undefined : undefined;
      
      if (setting.startYear !== null && setting.startYear !== undefined) {
        allYears.push(setting.startYear);
        events.push({
          id: `setting-start-${setting.id}`,
          name: `${L(setting, 'Setting')} established`,
          year: setting.startYear,
          type: 'setting-start',
          category: 'setting',
          sourceData: setting,
          color: setting.color || '#3b82f6',
          description: setting.summary || undefined,
          eraContext,
        });
      }
      if (setting.endYear !== null && setting.endYear !== undefined) {
        allYears.push(setting.endYear);
        events.push({
          id: `setting-end-${setting.id}`,
          name: `${L(setting, 'Setting')} concluded`,
          year: setting.endYear,
          type: 'setting-end',
          category: 'setting',
          sourceData: setting,
          color: setting.color || '#3b82f6',
          description: setting.summary || undefined,
          eraContext,
        });
      }
    });
    
    markers.forEach(marker => {
      if (marker.year !== null && marker.year !== undefined) {
        allYears.push(marker.year);
        const eraContext = marker.type ? `${marker.type} event` : 'Event';
        events.push({
          id: `marker-${marker.id}`,
          name: L(marker, 'Event'),
          year: marker.year,
          type: 'marker',
          category: 'marker',
          sourceData: marker,
          color: getMarkerColor(marker.type),
          description: marker.description || undefined,
          eraContext,
        });
      }
    });

    if (allYears.length === 0) {
      return { 
        timelineBounds: { min: 0, max: 100, span: 100 }, 
        chronologicalEvents: [] 
      };
    }

    const min = Math.min(...allYears);
    const max = Math.max(...allYears);
    const span = max - min || 1;
    
    // Add 10% padding on each side for better visualization
    const padding = span * 0.1;
    
    const bounds = {
      min: min - padding,
      max: max + padding,
      span: span + (padding * 2)
    };

    // Sort events chronologically
    const sortedEvents = events.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      
      // Sub-sort by event type priority for same year
      const typePriority = {
        'era-start': 1,
        'setting-start': 2,
        'marker': 3,
        'setting-end': 4,
        'era-end': 5,
      };
      
      return (typePriority[a.type] || 3) - (typePriority[b.type] || 3);
    });
    
    return { timelineBounds: bounds, chronologicalEvents: sortedEvents };
  }, [eras, settings, markers]);

  // Convert year to x-coordinate with zoom
  const yearToX = useMemo(() => {
    return (year: number) => {
      const padding = 80;
      const baseTimelineWidth = width - (padding * 2);
      const zoomedTimelineWidth = baseTimelineWidth * zoomLevel;
      
      if (focusYear !== null) {
        // When focused on a specific year, center that year
        const offsetFromFocus = year - focusYear;
        const ratio = offsetFromFocus / timelineBounds.span;
        return (width / 2) + (ratio * zoomedTimelineWidth);
      } else {
        // Normal linear mapping
        const ratio = (year - timelineBounds.min) / timelineBounds.span;
        return padding + (ratio * zoomedTimelineWidth);
      }
    };
  }, [width, timelineBounds, zoomLevel, focusYear]);

  // Generate major time markers
  const timeMarkers = useMemo(() => {
    const span = timelineBounds.span;
    const rawMin = Math.min(...chronologicalEvents.map(e => e.year));
    const rawMax = Math.max(...chronologicalEvents.map(e => e.year));
    
    // Determine step size based on span
    let step = 100;
    if (span <= 20) step = 1;
    else if (span <= 50) step = 5;
    else if (span <= 200) step = 10;
    else if (span <= 500) step = 25;
    else if (span <= 1000) step = 50;
    else if (span <= 2000) step = 100;
    else step = 500;

    const markers = [];
    const startYear = Math.floor(rawMin / step) * step;
    const endYear = Math.ceil(rawMax / step) * step;
    
    for (let year = startYear; year <= endYear; year += step) {
      const x = yearToX(year);
      if (x >= 0 && x <= width) {
        markers.push({
          year,
          x,
          label: year.toString(),
          isMajor: year % (step * 2) === 0
        });
      }
    }
    
    return markers;
  }, [timelineBounds, chronologicalEvents, yearToX, width]);

  const height = viewMode === 'compact' ? 200 : viewMode === 'detailed' ? 500 : 350;
  const mainTimelineY = height * 0.4; // Position main timeline 40% down

  // Handle mouse dragging for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return; // Only allow dragging when zoomed
    setIsDragging(true);
    setDragStart({
      x: e.pageX,
      scrollLeft: timelineContainerRef.current?.scrollLeft || 0
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !timelineContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - dragStart.x;
    timelineContainerRef.current.scrollLeft = dragStart.scrollLeft - x;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  return (
    <div ref={ref} className="w-full space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-600/50 p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">View:</span>
                <select
                  value={viewMode}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newMode = e.target.value as ViewMode;
                    onViewModeChange?.(newMode);
                  }}
                  className="px-3 py-1 bg-zinc-700 text-white rounded-lg text-sm border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="compact">Compact</option>
                  <option value="overview">Overview</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Zoom:</span>
                <button
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  className="px-2 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                  disabled={zoomLevel <= 0.5}
                >
                  -
                </button>
                <span className="text-sm text-zinc-300 min-w-[3ch] text-center">{zoomLevel.toFixed(1)}x</span>
                <button
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                  className="px-2 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                  disabled={zoomLevel >= 3}
                >
                  +
                </button>
                <button
                  onClick={() => { setZoomLevel(1); setFocusYear(null); }}
                  className="px-2 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="text-sm text-zinc-400">
              <span className="mr-4">📅 {timelineBounds.span.toFixed(0)} year span</span>
              <span className="mr-4">⚡ {chronologicalEvents.length} events</span>
              <span className="mr-4">🏛️ {eras.length} eras</span>
              <span>🏘️ {settings.length} settings</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Timeline */}
      <div className="relative bg-gradient-to-br from-zinc-900/80 via-black/60 to-zinc-800/40 rounded-lg border border-zinc-600/50 overflow-hidden">
        <div 
          ref={timelineContainerRef}
          className={`overflow-x-auto ${zoomLevel > 1 ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            scrollBehavior: isDragging ? 'auto' : 'smooth'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <svg 
            width={Math.max(width, width * zoomLevel * 1.2)} 
            height={height} 
            className="block"
            style={{ minWidth: width }}
          >
          {/* Background pattern */}
          <defs>
            <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1f2937" stopOpacity="0.3"/>
              <stop offset="50%" stopColor="#374151" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#1f2937" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          
          {/* Main timeline axis */}
          <line 
            x1={0} 
            y1={mainTimelineY} 
            x2={width} 
            y2={mainTimelineY} 
            stroke="url(#timelineGradient)" 
            strokeWidth={4}
          />
          
          {/* Enhanced timeline backbone */}
          <line 
            x1={0} 
            y1={mainTimelineY} 
            x2={width} 
            y2={mainTimelineY} 
            stroke="#4f46e5" 
            strokeWidth={2}
            opacity={0.6}
          />

          {/* Time markers */}
          {timeMarkers.map((marker, i) => (
            <g key={i}>
              <line
                x1={marker.x}
                y1={mainTimelineY - (marker.isMajor ? 15 : 8)}
                x2={marker.x}
                y2={mainTimelineY + (marker.isMajor ? 15 : 8)}
                stroke={marker.isMajor ? "#9ca3af" : "#6b7280"}
                strokeWidth={marker.isMajor ? 2 : 1}
                opacity={0.7}
              />
              {viewMode !== 'compact' && (
                <text
                  x={marker.x - 10}
                  y={mainTimelineY + 50}
                  textAnchor="middle"
                  fontSize={marker.isMajor ? 12 : 10}
                  fill={marker.isMajor ? "#e5e7eb" : "#9ca3af"}
                  fontWeight={marker.isMajor ? "bold" : "normal"}
                  className="select-none"
                  transform={`rotate(-90, ${marker.x - 10}, ${mainTimelineY + 50})`}
                >
                  {marker.label}
                </text>
              )}
            </g>
          ))}

          {/* Era spans (background bands) */}
          {eras.map(era => {
            if (!era.startYear || !era.endYear) return null;
            const startX = yearToX(era.startYear);
            const endX = yearToX(era.endYear);
            const color = era.color || '#8b5cf6';
            
            // Skip if completely outside view
            if (endX < 0 || startX > width) return null;
            
            const visibleStartX = Math.max(0, startX);
            const visibleEndX = Math.min(width, endX);
            
            return (
              <g key={`era-span-${era.id}`}>
                {/* Era background band */}
                <rect
                  x={visibleStartX}
                  y={0}
                  width={visibleEndX - visibleStartX}
                  height={height}
                  fill={color}
                  opacity={0.08}
                  className="pointer-events-none"
                />
                
                {/* Era label (only if significant width) */}
                {viewMode === 'detailed' && (endX - startX) > 100 && (
                  <text
                    x={(startX + endX) / 2}
                    y={30}
                    textAnchor="middle"
                    fontSize={16}
                    fill={color}
                    fontWeight="bold"
                    opacity={0.4}
                    className="select-none pointer-events-none"
                  >
                    {L(era, 'Era')}
                  </text>
                )}
              </g>
            );
          })}

          {/* Chronological events */}
          {chronologicalEvents.map((event, index) => {
            const x = yearToX(event.year);
            
            // Skip events outside visible area
            if (x < -20 || x > width + 20) return null;
            
            const isHovered = hoveredEvent === event.id;
            const isSelected = selectedEvent === event.id;
            
            // Determine y position based on event type and index to avoid overlaps
            let yOffset = 0;
            const baseSpacing = viewMode === 'compact' ? 25 : 40;
            
            if (event.category === 'era') {
              yOffset = event.type === 'era-start' ? -baseSpacing : -baseSpacing * 1.5;
            } else if (event.category === 'setting') {
              yOffset = event.type === 'setting-start' ? baseSpacing : baseSpacing * 1.5;
            } else {
              // Markers alternate above and below
              yOffset = (index % 2 === 0) ? -baseSpacing * 0.7 : baseSpacing * 0.7;
            }
            
            const eventY = mainTimelineY + yOffset;
            const radius = isHovered || isSelected ? 8 : 6;
            
            return (
              <g key={event.id}>
                {/* Connection line to main timeline */}
                <line
                  x1={x}
                  y1={mainTimelineY}
                  x2={x}
                  y2={eventY}
                  stroke={event.color}
                  strokeWidth={2}
                  opacity={0.6}
                  strokeDasharray={event.category === 'marker' ? '3,2' : 'none'}
                />
                
                {/* Event circle */}
                <circle
                  cx={x}
                  cy={eventY}
                  r={radius}
                  fill={event.color}
                  stroke="#000"
                  strokeWidth={isSelected ? 3 : 1}
                  opacity={isHovered ? 1 : 0.9}
                  className="cursor-pointer transition-all"
                  onClick={() => {
                    setSelectedEvent(event.id);
                    setFocusYear(event.year);
                    if (event.category === 'era') onEraClick?.(event.sourceData as Era);
                    else if (event.category === 'setting') onSettingClick?.(event.sourceData as Setting);
                    else if (event.category === 'marker') onMarkerClick?.(event.sourceData as Marker);
                  }}
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                />
                
                {/* Event label - angled to prevent overlap */}
                {viewMode !== 'compact' && (
                  <text
                    x={x + (yOffset < 0 ? 20 : -5)}
                    y={eventY + (yOffset < 0 ? -20 : 25)}
                    textAnchor={yOffset < 0 ? "start" : "end"}
                    fontSize={11}
                    fill={event.color}
                    fontWeight="medium"
                    className="cursor-pointer select-none"
                    transform={`rotate(${yOffset < 0 ? -45 : -45}, ${x + (yOffset < 0 ? 20 : -5)}, ${eventY + (yOffset < 0 ? -20 : 25)})`}
                    onClick={() => {
                      setSelectedEvent(event.id);
                      setFocusYear(event.year);
                      if (event.category === 'era') onEraClick?.(event.sourceData as Era);
                      else if (event.category === 'setting') onSettingClick?.(event.sourceData as Setting);
                      else if (event.category === 'marker') onMarkerClick?.(event.sourceData as Marker);
                    }}
                    onMouseEnter={() => setHoveredEvent(event.id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                  >
                    {event.name}
                  </text>
                )}
                
                {/* Angled connector line for label */}
                {viewMode !== 'compact' && (
                  <line
                    x1={x + (radius * (yOffset < 0 ? 0.7 : -0.7))}
                    y1={eventY + (yOffset < 0 ? -radius * 0.7 : radius * 0.7)}
                    x2={x + (yOffset < 0 ? 18 : -8)}
                    y2={eventY + (yOffset < 0 ? -18 : 22)}
                    stroke={event.color}
                    strokeWidth={1}
                    opacity={0.5}
                  />
                )}
                
                {/* Year label */}
                {(viewMode === 'detailed' || isHovered) && (
                  <text
                    x={x}
                    y={eventY + (yOffset < 0 ? -25 : 35)}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#9ca3af"
                    className="select-none"
                  >
                    {event.year}
                  </text>
                )}
              </g>
            );
          })}
          </svg>
        </div>

        {/* Enhanced Tooltip */}
        {hoveredEvent && (
          <div className="absolute pointer-events-none z-20 bg-zinc-900/95 border border-zinc-600 rounded-lg p-4 shadow-2xl max-w-sm left-4 top-4 backdrop-blur-sm">
            {(() => {
              const event = chronologicalEvents.find(e => e.id === hoveredEvent);
              if (!event) return null;
              
              return (
                <div>
                  <div className="font-semibold text-white text-lg mb-2">{event.name}</div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="text-blue-300">Year {event.year}</span>
                    </div>
                    
                    {event.eraContext && (
                      <div className="text-purple-300">
                        📖 {event.eraContext}
                      </div>
                    )}
                    
                    {event.description && (
                      <div className="text-zinc-300 mt-2 text-xs leading-relaxed">
                        {event.description}
                      </div>
                    )}
                    
                    <div className="text-amber-300 text-xs capitalize">
                      🏷️ {event.category} {event.type.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Timeline Navigation */}
      {viewMode === 'detailed' && chronologicalEvents.length > 0 && (
        <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/30 p-4">
          <h4 className="text-sm font-medium text-zinc-300 mb-3">Timeline Navigation</h4>
          <div className="flex flex-wrap gap-2">
            {chronologicalEvents.slice(0, 12).map((event) => (
              <button
                key={event.id}
                onClick={() => {
                  setFocusYear(event.year);
                  setSelectedEvent(event.id);
                }}
                className={`px-3 py-1 rounded-md text-xs transition-colors ${
                  selectedEvent === event.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
                style={{ borderLeft: `3px solid ${event.color}` }}
              >
                {event.year}: {event.name.slice(0, 20)}...
              </button>
            ))}
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