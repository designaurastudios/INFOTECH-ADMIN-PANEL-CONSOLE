import React, { useState } from 'react';

export interface PieSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
  formattedValue?: string;
  count?: number;
}

interface SolidPieChartProps {
  slices: PieSlice[];
  totalValue: number;
  emptyText?: string;
}

export const SolidPieChart: React.FC<SolidPieChartProps> = ({
  slices,
  totalValue,
  emptyText = 'No data recorded yet',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const size = 126;
  const cx = size / 2;
  const cy = size / 2;
  const r = 54;

  const activeSlices = slices.filter((s) => s.value > 0);

  if (activeSlices.length === 0 || totalValue <= 0) {
    return (
      <div className="solid-pie-container">
        <div className="pie-svg-wrapper">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="var(--color-surface-secondary)"
              stroke="var(--color-border)"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-text-muted)"
              fontSize="12"
              fontWeight="600"
            >
              ₹0 / 0%
            </text>
          </svg>
        </div>
        <div className="pie-legend-empty">
          <span>{emptyText}</span>
        </div>
      </div>
    );
  }

  // Pre-calculate SVG paths & centroid text positions
  let startAngle = -Math.PI / 2; // 12 o'clock

  const isSingleCompleteSlice = activeSlices.length === 1 && activeSlices[0].percentage >= 99;

  const renderedSlices = activeSlices.map((slice, index) => {
    const fraction = totalValue > 0 ? slice.value / totalValue : 0;
    const angleSpan = fraction * 2 * Math.PI;
    const endAngle = startAngle + angleSpan;

    const midAngle = startAngle + angleSpan / 2;
    const textRadius = r * 0.62;
    const textX = cx + textRadius * Math.cos(midAngle);
    const textY = cy + textRadius * Math.sin(midAngle);

    let pathD = '';
    if (!isSingleCompleteSlice) {
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = angleSpan > Math.PI ? 1 : 0;
      pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    const currentStart = startAngle;
    startAngle = endAngle;

    return {
      slice,
      index,
      pathD,
      textX,
      textY,
      startAngle: currentStart,
      endAngle,
      angleSpan,
    };
  });

  const activeHoveredSlice = hoveredIndex !== null ? activeSlices[hoveredIndex] : null;

  return (
    <div className="solid-pie-container">
      <div className="pie-svg-wrapper">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="solid-pie-svg"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {isSingleCompleteSlice ? (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={activeSlices[0].color}
              stroke="var(--color-surface)"
              strokeWidth={2}
              onMouseEnter={() => setHoveredIndex(0)}
              className="pie-slice"
            />
          ) : (
            renderedSlices.map((item) => (
              <path
                key={item.slice.label + item.index}
                d={item.pathD}
                fill={item.slice.color}
                stroke="var(--color-surface)"
                strokeWidth={2}
                onMouseEnter={() => setHoveredIndex(item.index)}
                className={`pie-slice ${hoveredIndex === item.index ? 'hovered' : ''}`}
              />
            ))
          )}

          {/* Centroid Percentage Text directly on slice */}
          {isSingleCompleteSlice ? (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="13"
              fontWeight="800"
              pointerEvents="none"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              100%
            </text>
          ) : (
            renderedSlices.map((item) => {
              if (item.slice.percentage < 6) return null;
              return (
                <text
                  key={'txt-' + item.slice.label + item.index}
                  x={item.textX}
                  y={item.textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize={item.slice.percentage >= 15 ? '11' : '10'}
                  fontWeight="700"
                  pointerEvents="none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                >
                  {item.slice.percentage}%
                </text>
              );
            })
          )}
        </svg>

        {/* Hover Tooltip Overlay with Real Value & Percentage */}
        {activeHoveredSlice && (
          <div className="pie-hover-tooltip">
            <span className="tooltip-title">{activeHoveredSlice.label}</span>
            <div className="tooltip-metrics">
              <strong style={{ color: activeHoveredSlice.color }}>
                {activeHoveredSlice.formattedValue || `₹${activeHoveredSlice.value.toLocaleString('en-IN')}`}
              </strong>
              <span className="tooltip-pct">({activeHoveredSlice.percentage}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend with Real Values & Percentages (No Truncation) */}
      <div className="pie-legend-list">
        {slices.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={slice.label + index}
              className={`legend-row ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="legend-row-top">
                <div className="legend-row-label-group">
                  <span className="legend-dot" style={{ backgroundColor: slice.color }} />
                  <span className="legend-label" title={slice.label}>
                    {slice.label}
                  </span>
                </div>
                {slice.count !== undefined && (
                  <span className="legend-count-pill">
                    {slice.count} {slice.count === 1 ? 'client' : 'clients'}
                  </span>
                )}
              </div>
              <div className="legend-row-bottom">
                <span className="legend-val-num font-mono">
                  {slice.formattedValue || `₹${slice.value.toLocaleString('en-IN')}`}
                </span>
                <span
                  className="legend-pct-pill font-mono"
                  style={{
                    color: slice.color,
                    border: `1px solid ${slice.color}35`,
                    backgroundColor: `${slice.color}15`,
                  }}
                >
                  {slice.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .solid-pie-container {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        @media (max-width: 480px) {
          .solid-pie-container {
            flex-direction: column;
            align-items: center;
          }
        }

        .pie-svg-wrapper {
          flex-shrink: 0;
          width: 126px;
          height: 126px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .solid-pie-svg {
          width: 126px;
          height: 126px;
          cursor: pointer;
          filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.15));
        }

        .pie-slice {
          transition: filter 0.15s ease, opacity 0.15s ease;
        }

        .pie-slice:hover, .pie-slice.hovered {
          filter: brightness(1.15);
          opacity: 0.95;
        }

        .pie-hover-tooltip {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) translateY(100%);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 6px 10px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          pointer-events: none;
          z-index: 50;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          animation: fadeIn 0.15s ease;
        }

        .tooltip-title {
          font-size: 0.70rem;
          color: var(--color-heading);
          font-weight: 700;
        }

        .tooltip-metrics {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.76rem;
        }

        .tooltip-pct {
          font-size: 0.70rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .pie-legend-list {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
          max-height: 140px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .pie-legend-empty {
          flex: 1;
          padding: 16px 8px;
          font-size: 0.74rem;
          color: var(--color-text-muted);
          text-align: center;
        }

        .legend-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 5px 8px;
          border-radius: 8px;
          background-color: var(--color-surface-secondary);
          border: 1px solid var(--color-border-subtle);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .legend-row:hover, .legend-row.hovered {
          background-color: var(--color-border-subtle);
          border-color: var(--color-border);
        }

        .legend-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .legend-row-label-group {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          flex: 1;
        }

        .legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-label {
          font-size: 0.73rem;
          font-weight: 600;
          color: var(--color-heading);
          line-height: 1.25;
          word-break: break-word;
        }

        .legend-count-pill {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          background-color: var(--color-surface);
          border: 1px solid var(--color-border-subtle);
          padding: 1px 5px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .legend-row-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 13px;
          gap: 6px;
        }

        .legend-val-num {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .legend-pct-pill {
          font-size: 0.64rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 999px;
          white-space: nowrap;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(95%); }
          to { opacity: 1; transform: translateX(-50%) translateY(100%); }
        }
      `}</style>
    </div>
  );
};
