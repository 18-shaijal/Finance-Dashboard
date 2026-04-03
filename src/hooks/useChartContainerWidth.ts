import { useLayoutEffect, useRef, useState } from "react";

const DEFAULT = 520;

// ResponsiveContainer was coming up blank in flex rows, measure the wrapper instead
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
