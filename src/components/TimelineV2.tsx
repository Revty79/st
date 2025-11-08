"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Era = { id: string; name?: string|null; title?: string|null; label?: string|null; startYear?: number|null; endYear?: number|null; color?: string|null; };
type Setting = { id: string; name?: string|null; title?: string|null; label?: string|null; startYear?: number|null; endYear?: number|null; color?: string|null; };
type Marker = { id: string; name?: string|null; title?: string|null; label?: string|null; year?: number|null; };

const L = (o: { name?: any; title?: any; label?: any }, fb = "") => (o?.name ?? o?.title ?? o?.label ?? fb) as string;
const w12 = (t: string) => Math.max(12, Math.round(t.length * 7.2));
const w11 = (t: string) => Math.max(12, Math.round(t.length * 6.6));

function useContainerWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(900);
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

export function TimelineV2({
  eras, settings, markers,
  height = 380,
  pad = 60,
}: {
  eras: Era[]; settings: Setting[]; markers: Marker[];
  height?: number; pad?: number;
}) {
  const { ref, width } = useContainerWidth();

  const nums: number[] = [];
  eras.forEach(e => { if (e.startYear!=null) nums.push(e.startYear); if (e.endYear!=null) nums.push(e.endYear); });
  settings.forEach(s => { if (s.startYear!=null) nums.push(s.startYear); if (s.endYear!=null) nums.push(s.endYear!); });
  markers.forEach(m => { if (m.year!=null) nums.push(m.year); });

  const { min, max } = useMemo(() => {
    const mn = nums.length ? Math.min(...nums) : 0;
    const rx = nums.length ? Math.max(...nums) : 1;
    return { min: mn, max: mn === rx ? mn + 1 : rx };
  }, [JSON.stringify(nums)]);

  const x = (v: number) => pad + ((v - min) / (max - min)) * (width - pad * 2);

  const axisY = Math.floor(height / 2);
  const topTickH = 80;
  const laneTop = axisY - topTickH - 16;
  const laneGap = 18;
  const maxLanes = 4;
  const leaderDx = 18;
  const leaderDy = 12;
  const fontEra = 12;
  const fontSet = 11;

  type Anchor = {
    key: string; tickX: number; side: "left"|"right"; text: string; estWidth: number; color: string; fontPx: number;
  };
  const anchors: Anchor[] = [];
  eras.forEach(e => {
    const t = L(e, "Era"); const color = e.color ?? "#8b5cf6";
    if (e.startYear!=null) anchors.push({ key:`${e.id}:es`, tickX:x(e.startYear), side:"left",  text:t, estWidth:w12(t), color, fontPx:fontEra });
    if (e.endYear  !=null) anchors.push({ key:`${e.id}:ee`, tickX:x(e.endYear),   side:"right", text:t, estWidth:w12(t), color, fontPx:fontEra });
  });
  settings.forEach(s => {
    const t = L(s, "Setting"); const color = s.color ?? "#7ea6ff";
    if (s.startYear!=null) anchors.push({ key:`${s.id}:ss`, tickX:x(s.startYear), side:"left",  text:t, estWidth:w11(t), color, fontPx:fontSet });
    if (s.endYear  !=null) anchors.push({ key:`${s.id}:se`, tickX:x(s.endYear),   side:"right", text:t, estWidth:w11(t), color, fontPx:fontSet });
  });
  anchors.sort((a,b)=>a.tickX-b.tickX);

  const laneRight: number[] = Array.from({ length: maxLanes }, () => -Infinity);
  type Placed = Anchor & { lane: number; labelX: number; labelY: number; textAnchor: "start"|"end" };
  const placed: Placed[] = [];
  anchors.forEach(a => {
    const textPad = 6;
    const boxW = a.estWidth + textPad;
    const boxLeft = a.side === "left"  ? a.tickX - leaderDx - boxW : a.tickX + leaderDx;
    const boxRight= a.side === "left"  ? a.tickX - leaderDx        : a.tickX + leaderDx + boxW;

    let lane = 0;
    while (lane < maxLanes && laneRight[lane] > boxLeft) lane++;
    if (lane >= maxLanes) lane = maxLanes - 1;

    laneRight[lane] = Math.max(laneRight[lane], boxRight);

    const baseY = laneTop - lane * laneGap;
    const labelX = a.side === "left" ? a.tickX - leaderDx : a.tickX + leaderDx;
    const labelY = baseY - leaderDy - 6;

    placed.push({
      ...a, lane, labelX, labelY, textAnchor: a.side === "left" ? "end" : "start",
    });
  });

  const bucket = new Map<number, number>();
  const placeBelow = (xp: number, base: number) => {
    const k = Math.round(xp);
    const next = (bucket.get(k) ?? base) + 14;
    bucket.set(k, next);
    return next;
  };

  function trunc(text: string, pxWidth: number, fontPx: number) {
    const meas = fontPx === 12 ? w12 : w11;
    if (meas(text) <= pxWidth) return text;
    const avg = fontPx === 12 ? 7.2 : 6.6;
    const maxChars = Math.max(4, Math.floor(pxWidth / avg) - 1);
    return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
  }

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={width} height={height}>
        <line x1={pad} y1={axisY} x2={width - pad} y2={axisY} stroke="#888" strokeWidth={2} />

        {eras.map(e => {
          const color = e.color ?? "#8b5cf6";
          const s = e.startYear, nd = e.endYear;
          return (
            <g key={e.id} stroke={color}>
              {s!=null && <line x1={x(s)} y1={axisY - topTickH} x2={x(s)} y2={axisY} strokeWidth={2} />}
              {nd!=null && <line x1={x(nd)} y1={axisY - topTickH} x2={x(nd)} y2={axisY} strokeWidth={2} />}
              {s!=null && nd!=null && (
                <rect x={Math.min(x(s), x(nd))} y={axisY - topTickH - 10} width={Math.max(2, Math.abs(x(nd)-x(s)))} height={6} fill={color} opacity={0.35} rx={2}/>
              )}
            </g>
          );
        })}

        {settings.map(s => {
          const color = s.color ?? "#7ea6ff";
          const st = s.startYear, nd = s.endYear;
          return (
            <g key={s.id} stroke={color}>
              {st!=null && <line x1={x(st)} y1={axisY - topTickH} x2={x(st)} y2={axisY} strokeWidth={1.25} />}
              {nd!=null && <line x1={x(nd)} y1={axisY - topTickH} x2={x(nd)} y2={axisY} strokeWidth={1.25} />}
              {st!=null && nd!=null && (
                <rect x={Math.min(x(st), x(nd))} y={axisY - topTickH - 6} width={Math.max(2, Math.abs(x(nd)-x(st)))} height={4} fill={color} opacity={0.35} rx={2}/>
              )}
            </g>
          );
        })}

        {placed.map(p => {
          const laneYBase = laneTop - p.lane * laneGap;
          const leaderEndX = p.side === "left" ? p.tickX - leaderDx : p.tickX + leaderDx;
          const leaderEndY = laneYBase - leaderDy;
          const maxTextPx = 160;

          return (
            <g key={p.key} stroke={p.color} fill="none">
              <line x1={p.tickX} y1={axisY - 8} x2={leaderEndX} y2={leaderEndY} strokeWidth={1.2}/>
              <line x1={leaderEndX} y1={leaderEndY} x2={leaderEndX} y2={leaderEndY - 6} strokeWidth={1.2}/>
              <text
                x={p.labelX}
                y={p.labelY - p.lane * 0.5}
                textAnchor={p.textAnchor}
                fontSize={p.fontPx}
                fill="#fff"
              >
                <title>{p.text}</title>
                {trunc(p.text, maxTextPx, p.fontPx)}
              </text>
            </g>
          );
        })}

        {markers.map(m => {
          if (m.year == null) return null;
          const xm = x(m.year);
          const y1 = Math.floor(height/2) + 4, y2 = Math.floor(height/2) + 28;
          const ty = placeBelow(xm, y2 + 10);
          const label = L(m, "Event");
          return (
            <g key={m.id}>
              <line x1={xm} y1={y1} x2={xm} y2={y2} stroke="#ccc" />
              <text x={xm} y={ty} textAnchor="middle" fontSize={11} fill="#fff">
                <title>{label}</title>
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
