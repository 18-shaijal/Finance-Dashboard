import { useLayoutEffect, useRef, useState } from "react";

const DEFAULT = 520;

/**
 * Recharts v3 ResponsiveContainer often renders nothing when flex parents briefly report width 0.
 * Measure the wrapper and pass explicit pixel width to LineChart/PieChart instead.
 */
export function useChartContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = (w: number) => {
      const rounded = Math.floor(w);
      if (rounded > 0) setWidth(rounded);
    };

    apply(el.getBoundingClientRect().width);

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      apply(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { containerRef, width };
}
