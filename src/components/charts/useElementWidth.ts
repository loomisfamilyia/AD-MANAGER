import { useEffect, useRef, useState } from "react";

/**
 * Tracks a container's rendered width so charts can be drawn at real pixel
 * sizes.
 *
 * The alternative — a fixed viewBox with preserveAspectRatio — scales text and
 * stroke widths along with the geometry, so a chart in a narrow column ends up
 * with 6px axis labels and hairline marks. Measuring instead keeps type and
 * strokes at their specified size at every width.
 */
export function useElementWidth<T extends HTMLElement>(): [
  React.RefObject<T>,
  number,
] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });

    observer.observe(element);
    setWidth(element.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

/**
 * Rounds an axis maximum up to a readable number.
 *
 * The candidate steps are deliberately finer than the usual 1/2/5 set. With
 * only those three, a peak of $60 rounds to $100 and the tallest bar fills
 * barely half the plot — the chart reads as a quiet month when it wasn't.
 * Every step here still divides evenly by four, so the tick labels stay whole
 * numbers rather than becoming $16.67.
 */
const NICE_STEPS = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];

export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = NICE_STEPS.find((candidate) => normalized <= candidate) ?? 10;
  return step * magnitude;
}

export function ticksFor(max: number, count = 4): number[] {
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) ticks.push((max / count) * i);
  return ticks;
}
