import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useT } from '@/i18n';
import type { BoxRegion, DrawnPolygon, Point, WorkspaceProps } from '../../types/workspace';

/**
 * Object Annotation workspace — rendered when task.type === 'object_annotation'.
 *
 * A Roboflow-style annotation editor on a FIXED canvas: the image always fits
 * the viewport and never shifts; zoom in/out (buttons or mouse wheel, at the
 * cursor) and pan (Hand tool, or drag empty canvas with Select) move the view.
 *
 * Tools: Select (V), Bounding box (B), Polygon (P), Hand/pan (H).
 * - Box: drag to draw with the active class, drag to move, corners resize,
 *   Delete/Backspace or the row button removes it.
 * - Polygon: click vertices, click the first point / double-click / Enter to
 *   close; polygons are contributor state and can be deleted.
 * - Classes panel (right): click or 1–9 activates a class; with a shape
 *   selected it assigns instead. Annotations list below.
 *
 * Data: box geometry in `answer.shapes` (falls back to `item.regions`), box
 * classes in `answer.boxes`, drawn polygons in `answer.polygons` with their
 * classes in `answer.segments` (item masks share that map). Region ids start
 * with "r", item mask ids with "s", drawn polygon ids with "p".
 */
const MIN_SIZE = 2;      // percent of canvas — smallest allowed box
const DRAW_MIN = 1.5;    // percent — a smaller drag counts as a click, not a draw
const MOVE_NOISE = 0.6;  // percent — pointer travel below this is a click, not a drag
const CLOSE_DIST = 2.5;  // percent — clicking this near the first vertex closes a polygon
const HANDLES = ['nw', 'ne', 'sw', 'se'] as const;
const CLASS_COLORS = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#ef4444'];
const UNLABELLED_COLOR = '#94a3b8';

type Tool = 'select' | 'box' | 'poly' | 'hand';
type Handle = (typeof HANDLES)[number];
type ShapeKind = 'box' | 'mask' | 'poly';

/** Pointer position in percent of the stage */
interface Pct {
  x: number;
  y: number;
}

type Rect = Omit<BoxRegion, 'id'>;

interface MoveDrag {
  mode: 'move';
  id: string;
  start: Pct;
  origin: Rect;
}

interface ResizeDrag {
  mode: 'resize';
  id: string;
  handle: Handle;
  start: Pct;
  origin: Rect;
}

type Drag = { mode: 'draw'; start: Pct } | MoveDrag | ResizeDrag | { mode: 'pan'; start: Pct; origin: Pct };

/** Live preview of a box drag */
type Edit = ({ mode: 'draw' } | Omit<MoveDrag, 'start'> | Omit<ResizeDrag, 'start'>) & { start: Pct; current: Pct };

interface Selection {
  kind: ShapeKind;
  id: string;
}

/** Every contributor-editable field, for undo/redo */
interface Snapshot {
  shapes: BoxRegion[];
  boxes: Record<string, string>;
  segments: Record<string, string>;
  polygons: DrawnPolygon[];
}

interface MaskShape {
  id: string;
  clip: string;
  /** Comes with the item (cannot be deleted) */
  fixed: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const hexToRgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const toClip = (pts: Point[]) => `polygon(${pts.map((p) => `${p[0]}% ${p[1]}%`).join(', ')})`;

/** Box geometry for a drag in progress, given the drag origin and pointer. */
const geometryFromDrag = (d: MoveDrag | ResizeDrag, p: Pct): Rect => {
  if (d.mode === 'move') {
    return {
      x: clamp(d.origin.x + (p.x - d.start.x), 0, 100 - d.origin.w),
      y: clamp(d.origin.y + (p.y - d.start.y), 0, 100 - d.origin.h),
      w: d.origin.w,
      h: d.origin.h,
    };
  }
  let { x, y, w, h } = d.origin;
  const dx = p.x - d.start.x;
  const dy = p.y - d.start.y;
  if (d.handle === 'nw' || d.handle === 'sw') {
    x = clamp(d.origin.x + dx, 0, d.origin.x + d.origin.w - MIN_SIZE);
    w = d.origin.x + d.origin.w - x;
  }
  if (d.handle === 'ne' || d.handle === 'se') {
    w = clamp(d.origin.w + dx, MIN_SIZE, 100 - d.origin.x);
  }
  if (d.handle === 'nw' || d.handle === 'ne') {
    y = clamp(d.origin.y + dy, 0, d.origin.y + d.origin.h - MIN_SIZE);
    h = d.origin.y + d.origin.h - y;
  }
  if (d.handle === 'sw' || d.handle === 'se') {
    h = clamp(d.origin.h + dy, MIN_SIZE, 100 - d.origin.y);
  }
  return { x, y, w, h };
};

const ObjectAnnotation = ({ item, answer, onChange }: WorkspaceProps<'object_annotation'>) => {
  const { t } = useT();
  const [tool, setTool] = useState<Tool>('select');
  const [activeClassRaw, setActiveClass] = useState<string | null>(null);
  const [scale, setScale] = useState<number | null>(null); // px per natural px; null until fitted
  const [pan, setPan] = useState({ x: 0, y: 0 });   // stage offset inside the viewport
  const [vp, setVp] = useState({ w: 0, h: 0 });     // viewport size
  const [imgNat, setImgNat] = useState({ w: 0, h: 0 });
  const [selected, setSelected] = useState<Selection | null>(null);
  const [edit, setEdit] = useState<Edit | null>(null); // live box-drag preview
  const [polyPts, setPolyPts] = useState<Point[]>([]); // polygon being drawn (percent)
  const [, setHistTick] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const draggedRef = useRef(false);
  const historyRef = useRef<{ stack: Snapshot[]; idx: number }>({ stack: [], idx: -1 });

  const classes = item.classes || ['Object', 'Other'];
  const activeClass = activeClassRaw !== null && classes.includes(activeClassRaw) ? activeClassRaw : classes[0];
  const regions = answer?.shapes ?? item.regions ?? [];
  const polygons = answer?.polygons ?? [];
  const maskList: MaskShape[] = [
    ...(item.segments || []).map((s) => ({ id: s.id, clip: s.clip, fixed: true })),
    ...polygons.map((p) => ({ id: p.id, clip: toClip(p.points), fixed: false })),
  ];

  const colorOf = (cls: string | undefined) =>
    cls ? CLASS_COLORS[Math.max(0, classes.indexOf(cls)) % CLASS_COLORS.length] : UNLABELLED_COLOR;

  const classOf = (kind: ShapeKind, id: string) =>
    kind === 'box' ? answer?.boxes?.[id] : answer?.segments?.[id];

  const fit = imgNat.w && vp.w ? Math.min(vp.w / imgNat.w, vp.h / imgNat.h) : null;

  /* ---------- viewport measurement + fit ---------- */

  useEffect(() => {
    const measure = () => {
      if (!viewportRef.current) return;
      const r = viewportRef.current.getBoundingClientRect();
      setVp({ w: r.width, h: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Fit the image (centered) whenever the viewport or image changes — the
  // canvas is fixed, so this is the only thing that ever moves the image.
  useEffect(() => {
    if (!fit) return;
    setScale(fit);
    setPan({ x: (vp.w - imgNat.w * fit) / 2, y: (vp.h - imgNat.h * fit) / 2 });
  }, [fit, item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset per-item working state (history, selection, polygon draft).
  useEffect(() => {
    const initial = answer?.shapes ?? item.regions ?? [];
    historyRef.current = {
      stack: [snapFrom(initial, answer?.boxes || {}, answer?.segments || {}, answer?.polygons || [])],
      idx: 0,
    };
    setSelected(null);
    setEdit(null);
    setPolyPts([]);
    // a cached image may already be complete before React attaches onLoad
    const im = stageRef.current?.querySelector('img');
    if (im && im.complete && im.naturalWidth) setImgNat({ w: im.naturalWidth, h: im.naturalHeight });
    else setImgNat({ w: 0, h: 0 });
    setHistTick((t) => t + 1);
  }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- zoom / pan ---------- */

  const zoomAt = (cx: number, cy: number, factor: number) => {
    if (!scale || !fit) return;
    const z2 = clamp(scale * factor, fit * 0.4, fit * 8);
    const r = z2 / scale;
    setPan((p) => ({ x: cx - (cx - p.x) * r, y: cy - (cy - p.y) * r }));
    setScale(z2);
  };

  const fitView = () => {
    if (!fit) return;
    setScale(fit);
    setPan({ x: (vp.w - imgNat.w * fit) / 2, y: (vp.h - imgNat.h * fit) / 2 });
  };

  // Wheel zooms at the cursor; needs a non-passive listener to preventDefault.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }); // re-attached per render — keeps the zoomAt closure fresh

  /* ---------- pointer plumbing ---------- */

  const pct = (e: { clientX: number; clientY: number }): Pct => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const startDraw = (e: ReactPointerEvent<Element>) => {
    const p = pct(e);
    dragRef.current = { mode: 'draw', start: p };
    setEdit({ mode: 'draw', start: p, current: p });
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const startMove = (e: ReactPointerEvent<Element>, r: BoxRegion) => {
    e.stopPropagation();
    const p = pct(e);
    const origin = { x: r.x, y: r.y, w: r.w, h: r.h };
    dragRef.current = { mode: 'move', id: r.id, start: p, origin };
    setEdit({ mode: 'move', id: r.id, start: p, current: p, origin });
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const startResize = (e: ReactPointerEvent<Element>, r: BoxRegion, handle: Handle) => {
    e.stopPropagation();
    const p = pct(e);
    const origin = { x: r.x, y: r.y, w: r.w, h: r.h };
    dragRef.current = { mode: 'resize', id: r.id, handle, start: p, origin };
    setEdit({ mode: 'resize', id: r.id, handle, start: p, current: p, origin });
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const startPan = (e: ReactPointerEvent<Element>) => {
    dragRef.current = { mode: 'pan', start: { x: e.clientX, y: e.clientY }, origin: { ...pan } };
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const onStagePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!scale) return;
    if (tool === 'box') return startDraw(e);
    if (tool === 'hand') return startPan(e);
    if (tool === 'select') return startPan(e); // drag empty canvas pans; click deselects
    if (tool === 'poly') {
      const p = pct(e);
      if (polyPts.length >= 3 && Math.hypot(p.x - polyPts[0][0], p.y - polyPts[0][1]) <= CLOSE_DIST) {
        finishPolygon();
        return;
      }
      setPolyPts((pts) => [...pts, [p.x, p.y]]);
    }
  };

  const onStagePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (tool === 'poly') return;
    const d = dragRef.current;
    if (!d) return;
    if (d.mode === 'pan') {
      const dx = e.clientX - d.start.x;
      const dy = e.clientY - d.start.y;
      if (Math.hypot(dx, dy) > 3) draggedRef.current = true;
      setPan({ x: d.origin.x + dx, y: d.origin.y + dy });
      return;
    }
    setEdit((cur) => (cur ? { ...cur, current: pct(e) } : cur));
  };

  const commitShapes = (next: BoxRegion[], extra: Partial<Snapshot> = {}) => onChange({ ...answer, ...extra, shapes: next });

  const onStagePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.mode === 'pan') { setEdit(null); return; }
    const p = pct(e);
    const travelled = Math.hypot(p.x - d.start.x, p.y - d.start.y);
    setEdit(null);

    if (d.mode !== 'draw' && travelled <= MOVE_NOISE) return; // plain click

    const nums = regions
      .map((r) => /^r(\d+)$/.exec(r.id))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => +m[1]);
    const id = `r${(nums.length ? Math.max(...nums) : 0) + 1}`;

    if (d.mode === 'draw') {
      if (travelled < DRAW_MIN) return;
      const nextShapes = [...regions, {
        id,
        x: Math.min(p.x, d.start.x),
        y: Math.min(p.y, d.start.y),
        w: Math.max(Math.abs(p.x - d.start.x), MIN_SIZE),
        h: Math.max(Math.abs(p.y - d.start.y), MIN_SIZE),
      }];
      const nextBoxes = { ...answer?.boxes, [id]: activeClass };
      commitShapes(nextShapes, { boxes: nextBoxes });
      pushHistory(snapFrom(nextShapes, nextBoxes, answer?.segments || {}, polygons));
      setSelected({ kind: 'box', id });
    } else {
      const geo = geometryFromDrag(d, p);
      const nextShapes = regions.map((r) => (r.id === d.id ? { ...r, ...geo } : r));
      commitShapes(nextShapes);
      pushHistory(snapFrom(nextShapes, answer?.boxes || {}, answer?.segments || {}, polygons));
      setSelected({ kind: 'box', id: d.id });
    }
    draggedRef.current = true;
  };

  const onStageClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) { draggedRef.current = false; return; }
    if (tool !== 'select') return;
    if (e.target === stageRef.current || (e.target instanceof HTMLElement && e.target.tagName === 'IMG')) setSelected(null);
  };

  const onStageDoubleClick = () => {
    if (tool === 'poly' && polyPts.length >= 3) finishPolygon();
  };

  /* ---------- history (undo/redo) ---------- */

  // Deep-cloned snapshot of every contributor-editable field. The stack holds
  // each committed state INCLUDING the current one; idx points at the live
  // state, so undo applies stack[idx-1] and redo stack[idx+1].
  const snapFrom = (
    shapes: BoxRegion[],
    boxes: Record<string, string>,
    segments: Record<string, string>,
    polygons: DrawnPolygon[],
  ): Snapshot => ({
    shapes: shapes.map((r) => ({ ...r })),
    boxes: { ...boxes },
    segments: { ...segments },
    polygons: (polygons || []).map((p) => ({ ...p, points: p.points.map((q): Point => [q[0], q[1]]) })),
  });

  // Record the POST-change state (the caller passes what it just committed).
  const pushHistory = (snapshot: Snapshot) => {
    const h = historyRef.current;
    h.stack = h.stack.slice(0, h.idx + 1);
    h.stack.push(snapshot);
    if (h.stack.length > 40) h.stack.shift();
    h.idx = h.stack.length - 1;
    setHistTick((t) => t + 1);
  };

  const undo = () => {
    const h = historyRef.current;
    if (h.idx <= 0) return;
    h.idx -= 1;
    const s = h.stack[h.idx];
    onChange({ ...answer, shapes: s.shapes, boxes: s.boxes, segments: s.segments, polygons: s.polygons });
    setHistTick((t) => t + 1);
  };

  const redo = () => {
    const h = historyRef.current;
    if (h.idx + 1 >= h.stack.length) return;
    h.idx += 1;
    const s = h.stack[h.idx];
    onChange({ ...answer, shapes: s.shapes, boxes: s.boxes, segments: s.segments, polygons: s.polygons });
    setHistTick((t) => t + 1);
  };

  /* ---------- edits ---------- */

  const assignClass = (cls: string) => {
    if (!selected) return;
    if (selected.kind === 'box') {
      const nextBoxes = { ...answer?.boxes, [selected.id]: cls };
      onChange({ ...answer, boxes: nextBoxes, shapes: regions });
      pushHistory(snapFrom(regions, nextBoxes, answer?.segments || {}, polygons));
    } else {
      const nextSegments = { ...answer?.segments, [selected.id]: cls };
      onChange({ ...answer, segments: nextSegments });
      pushHistory(snapFrom(regions, answer?.boxes || {}, nextSegments, polygons));
    }
    setActiveClass(cls);
  };

  const onClassClick = (cls: string) => {
    if (selected) assignClass(cls);
    else setActiveClass(cls);
  };

  const deleteShape = (kind: ShapeKind, id: string) => {
    if (kind === 'box') {
      const nextShapes = regions.filter((r) => r.id !== id);
      const nextBoxes = { ...answer?.boxes };
      delete nextBoxes[id];
      onChange({ ...answer, boxes: nextBoxes, shapes: nextShapes });
      pushHistory(snapFrom(nextShapes, nextBoxes, answer?.segments || {}, polygons));
    } else if (kind === 'poly') {
      const nextPolygons = polygons.filter((p) => p.id !== id);
      const nextSegments = { ...answer?.segments };
      delete nextSegments[id];
      onChange({ ...answer, polygons: nextPolygons, segments: nextSegments });
      pushHistory(snapFrom(regions, answer?.boxes || {}, nextSegments, nextPolygons));
    } // item masks come with the item and stay fixed
    if (selected?.id === id) setSelected(null);
  };

  const finishPolygon = () => {
    if (polyPts.length < 3) { setPolyPts([]); return; }
    const nums = polygons
      .map((p) => /^p(\d+)$/.exec(p.id))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => +m[1]);
    const id = `p${(nums.length ? Math.max(...nums) : 0) + 1}`;
    const nextPolygons = [...polygons, { id, points: polyPts }];
    const nextSegments = { ...answer?.segments, [id]: activeClass };
    onChange({ ...answer, polygons: nextPolygons, segments: nextSegments });
    pushHistory(snapFrom(regions, answer?.boxes || {}, nextSegments, nextPolygons));
    setSelected({ kind: 'poly', id });
    setPolyPts([]);
  };

  // Shortcuts: V/B/P/H tools, 1–9 classes, Delete, Esc cancels polygon,
  // Enter closes it, Ctrl+Z / Ctrl+Shift+Z history.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : undefined;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const meta = e.ctrlKey || e.metaKey;
      if (meta && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (meta && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected) { e.preventDefault(); deleteShape(selected.kind, selected.id); }
        return;
      }
      if (e.key === 'Escape') { setPolyPts([]); return; }
      if (e.key === 'Enter' && tool === 'poly') { finishPolygon(); return; }
      if (meta || e.altKey) return;
      if (e.key === 'v' || e.key === 'V') setTool('select');
      else if (e.key === 'b' || e.key === 'B') setTool('box');
      else if (e.key === 'p' || e.key === 'P') setTool('poly');
      else if (e.key === 'h' || e.key === 'H') setTool('hand');
      else if (/^[1-9]$/.test(e.key)) {
        const cls = classes[+e.key - 1];
        if (cls) {
          if (selected) assignClass(cls);
          else setActiveClass(cls);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // re-attached per render — cheap, keeps closures fresh

  /* ---------- render ---------- */

  const dragData = dragRef.current;
  // Known issue: the preview of the box being dragged is geometry only (no id), so while dragging it renders
  // unlabelled and without handles; it gets its class back on release
  const geoFor = (r: BoxRegion): Rect & { id?: string } =>
    dragData && (dragData.mode === 'move' || dragData.mode === 'resize') && dragData.id === r.id && edit
      ? geometryFromDrag(dragData, edit.current)
      : r;

  const shapes: Selection[] = [
    ...regions.map((r): Selection => ({ kind: 'box', id: r.id })),
    ...maskList.map((m): Selection => ({ kind: m.fixed ? 'mask' : 'poly', id: m.id })),
  ];

  const stageStyle: CSSProperties = scale
    ? { left: `${pan.x}px`, top: `${pan.y}px`, width: `${imgNat.w * scale}px`, height: `${imgNat.h * scale}px` }
    : { visibility: 'hidden' };

  const cursorClass =
    tool === 'box' || tool === 'poly' ? ' tflow-anno-viewport-cross' :
    tool === 'hand' ? ' tflow-anno-viewport-grab' : '';

  return (
    <div className="tflow-anno">
      <div className="tflow-anno-rail">
        {([
          { id: 'select', icon: 'fa-arrow-pointer', key: 'V', title: 'Select / move (V)' },
          { id: 'box', icon: 'fa-vector-square', key: 'B', title: 'Draw bounding box (B)' },
          { id: 'poly', icon: 'fa-draw-polygon', key: 'P', title: 'Draw polygon (P)' },
          { id: 'hand', icon: 'fa-hand', key: 'H', title: 'Pan canvas (H) — or scroll to zoom' },
        ] as const).map((tb) => (
          <button
            key={tb.id}
            type="button"
            title={t(tb.title)}
            className={`tflow-anno-tool${tool === tb.id ? ' tflow-anno-tool-on' : ''}`}
            onClick={() => setTool(tb.id)}
          >
            <i className={`fa-solid ${tb.icon}`}></i><span>{tb.key}</span>
          </button>
        ))}
      </div>

      <div className="tflow-anno-main">
        <div className="tflow-anno-canvasbar">
          <span className="tflow-anno-file"><i className="fa-regular fa-image"></i> {item.id}</span>
          <div className="tflow-anno-cbar-actions">
            <button type="button" className="tflow-anno-cbtn" disabled={historyRef.current.idx <= 0} onClick={undo} title={t('Undo (Ctrl+Z)')}>
              <i className="fa-solid fa-rotate-left"></i>
            </button>
            <button type="button" className="tflow-anno-cbtn" disabled={historyRef.current.idx + 1 >= historyRef.current.stack.length} onClick={redo} title={t('Redo (Ctrl+Shift+Z)')}>
              <i className="fa-solid fa-rotate-right"></i>
            </button>
            <span className="tflow-anno-sep" />
            <button type="button" className="tflow-anno-cbtn" onClick={() => zoomAt(vp.w / 2, vp.h / 2, 0.8)} title={t('Zoom out')}>
              <i className="fa-solid fa-magnifying-glass-minus"></i>
            </button>
            <button type="button" className="tflow-anno-cbtn" onClick={fitView} title={t('Fit to canvas')}>
              {fit ? Math.round(((scale ?? 0) / fit) * 100) : 100}%
            </button>
            <button type="button" className="tflow-anno-cbtn" onClick={() => zoomAt(vp.w / 2, vp.h / 2, 1.25)} title={t('Zoom in')}>
              <i className="fa-solid fa-magnifying-glass-plus"></i>
            </button>
          </div>
        </div>

        <div ref={viewportRef} className={`tflow-anno-viewport${cursorClass}`}>
          <div
            ref={stageRef}
            className="tflow-anno-stage"
            style={stageStyle}
            onPointerDown={onStagePointerDown}
            onPointerMove={onStagePointerMove}
            onPointerUp={onStagePointerUp}
            onClick={onStageClick}
            onDoubleClick={onStageDoubleClick}
          >
            <img
              src={item.image}
              alt={item.id}
              draggable={false}
              onLoad={(e) => setImgNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            />
            {regions.map((raw) => {
              const r = geoFor(raw);
              const cls = r.id ? answer.boxes?.[r.id] : undefined;
              const color = colorOf(cls);
              const active = selected?.kind === 'box' && selected.id === r.id;
              return (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  className={`tflow-anno-box${active ? ' tflow-anno-box-active' : ''}`}
                  style={{
                    left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`,
                    borderColor: color, background: hexToRgba(color, 0.1),
                  }}
                  onPointerDown={(e) => { if (tool === 'select') startMove(e, raw); }}
                  onClick={() => {
                    if (tool !== 'select') return;
                    if (draggedRef.current) { draggedRef.current = false; return; }
                    setSelected((cur) => (cur && cur.kind === 'box' && cur.id === raw.id ? null : { kind: 'box', id: raw.id }));
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected({ kind: 'box', id: raw.id }); }}
                >
                  <span className="tflow-anno-boxtag" style={{ background: color, top: r.y < 4 ? '2px' : '-22px' }}>
                    {cls ? t(cls) : r.id}
                  </span>
                  {active && tool === 'select' && HANDLES.map((h) => (
                    <span
                      key={h}
                      className={`tflow-anno-handle tflow-anno-handle-${h}`}
                      onPointerDown={(e) => startResize(e, raw, h)}
                    />
                  ))}
                </div>
              );
            })}
            {maskList.map((m) => {
              const cls = answer?.segments?.[m.id];
              const color = colorOf(cls);
              const active = (selected?.kind === 'mask' || selected?.kind === 'poly') && selected.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`tflow-anno-mask${active ? ' tflow-anno-mask-active' : ''}`}
                  style={{ clipPath: m.clip, background: hexToRgba(color, cls ? 0.3 : 0.16), outlineColor: color }}
                  onClick={() => { if (tool === 'select') setSelected((cur) => (cur && cur.id === m.id ? null : { kind: m.fixed ? 'mask' : 'poly', id: m.id })); }}
                >
                  <span className="tflow-anno-masktag" style={{ background: color }}>{cls ? t(cls) : m.id}</span>
                </button>
              );
            })}
            {edit?.mode === 'draw' && (
              <div
                className="tflow-anno-draft"
                style={{
                  left: `${Math.min(edit.start.x, edit.current.x)}%`,
                  top: `${Math.min(edit.start.y, edit.current.y)}%`,
                  width: `${Math.abs(edit.current.x - edit.start.x)}%`,
                  height: `${Math.abs(edit.current.y - edit.start.y)}%`,
                }}
              />
            )}
            {tool === 'poly' && polyPts.length > 0 && (
              <svg className="tflow-anno-polydraft" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Only placed vertices are drawn; there is no live segment to the cursor */}
                <polygon
                  points={polyPts.map((p) => `${p[0]},${p[1]}`).join(' ')}
                  fill="rgba(56, 189, 248, .12)"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
                {polyPts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p[0]} cy={p[1]} r={i === 0 && polyPts.length >= 3 ? 1.1 : 0.7}
                    fill={i === 0 && polyPts.length >= 3 ? '#22c55e' : '#38bdf8'}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      <aside className="tflow-anno-side">
        <div className="tflow-anno-sec">
          <h5><i className="fa-solid fa-tags"></i> {t('Classes')}</h5>
          {classes.map((cls, i) => {
            const count = shapes.filter((s) => classOf(s.kind, s.id) === cls).length;
            return (
              <button
                key={cls}
                type="button"
                className={`tflow-anno-classrow${activeClass === cls ? ' tflow-anno-row-on' : ''}`}
                onClick={() => onClassClick(cls)}
              >
                <span className="tflow-anno-classdot" style={{ background: colorOf(cls) }} />
                <span className="tflow-anno-classname">{t(cls)}</span>
                <span className="tflow-anno-count">{count}</span>
                <span className="tflow-anno-key">{i + 1}</span>
              </button>
            );
          })}
        </div>

        <div className="tflow-anno-sec">
          <h5><i className="fa-solid fa-layer-group"></i> {t('Annotations')} <span>({shapes.length})</span></h5>
          {shapes.length === 0 && (
            <p className="tflow-anno-empty">{t('No annotations yet — pick Box (B) or Polygon (P), then click or drag on the image.')}</p>
          )}
          {shapes.map(({ kind, id }) => {
            const cls = classOf(kind, id);
            const isSel = selected?.kind === kind && selected.id === id;
            const label = kind === 'box' ? id : kind === 'poly' ? t('{id} · polygon', { id }) : t('{id} · mask', { id });
            return (
              <div
                key={`${kind}-${id}`}
                role="button"
                tabIndex={0}
                className={`tflow-anno-annrow${isSel ? ' tflow-anno-row-on' : ''}`}
                onClick={() => setSelected({ kind, id })}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelected({ kind, id }); }}
              >
                <span className="tflow-anno-sw" style={{ borderColor: colorOf(cls) }} />
                <span className="tflow-anno-annname">{label}</span>
                <span className="tflow-anno-anncls">{cls ? t(cls) : t('unlabelled')}</span>
                {kind !== 'mask' && (
                  <span
                    role="button"
                    tabIndex={-1}
                    className="tflow-anno-del"
                    title={t('Delete {id}', { id })}
                    onClick={(e) => { e.stopPropagation(); deleteShape(kind, id); }}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

export default ObjectAnnotation;
