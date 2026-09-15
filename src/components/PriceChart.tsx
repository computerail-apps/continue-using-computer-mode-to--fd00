import { useMemo, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/coingecko';

interface Props {
  prices: [number, number][];
}

export function PriceChart({ prices }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; price: number; time: number } | null>(null);

  const width = 800;
  const height = 280;
  const padding = 24;

  const { points, min, max, positive } = useMemo(() => {
    if (prices.length === 0) return { points: [] as [number, number][], min: 0, max: 0, positive: true };
    const values = prices.map((p) => p[1]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points: [number, number][] = prices.map(([t, v], i) => {
      const x = padding + (i / (prices.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (v - min) / range) * (height - padding * 2);
      return [x, y];
    });
    const positive = prices[prices.length - 1][1] >= prices[0][1];
    return { points, min, max, positive };
  }, [prices]);

  if (prices.length === 0) {
    return <div className="py-12 text-center text-small text-muted-foreground">No chart data available.</div>;
  }

  const pathD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const strokeColor = positive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach(([x], i) => {
      const d = Math.abs(x - relX);
      if (d < closestDist) {
        closestDist = d;
        closest = i;
      }
    });
    setHover({ x: points[closest][0], y: points[closest][1], price: prices[closest][1], time: prices[closest][0] });
  }

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={padding} y2={height - padding} stroke="hsl(var(--border))" strokeWidth={1} />
            <circle cx={hover.x} cy={hover.y} r={4} fill={strokeColor} />
          </>
        )}
      </svg>
      <div className="flex items-center justify-between text-small text-muted-foreground">
        <span>{hover ? new Date(hover.time).toLocaleString() : 'Hover the chart for details'}</span>
        <span className="tabular-nums text-foreground">{hover ? formatCurrency(hover.price) : formatCurrency(prices[prices.length - 1][1])}</span>
      </div>
      <div className="flex items-center justify-between text-small text-muted-foreground">
        <span>Low {formatCurrency(min)}</span>
        <span>High {formatCurrency(max)}</span>
      </div>
    </div>
  );
}
