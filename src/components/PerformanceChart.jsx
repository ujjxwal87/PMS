import { useLayoutEffect, useRef, useState } from 'react'

// Growth of ₹100, strategy against its benchmark. Both series are named in the
// legend and labelled at the line end — identity is never colour alone.
//
// The benchmark is optional. Live filings carry no benchmark return series yet,
// so the chart draws the strategy alone rather than inventing a line to sit
// next to it.

export const SERIES = {
  strategy: '#009184',
  benchmark: '#b07a12',
}

const PAD = { top: 16, right: 64, bottom: 28, left: 46 }

function niceTicks(lo, hi, count = 4) {
  const span = hi - lo || 1
  const rough = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rough) || mag * 10
  const start = Math.floor(lo / step) * step
  const ticks = []
  for (let v = start; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(6))
  return ticks
}

export default function PerformanceChart({ series, strategyName, benchmarkName, height = 300 }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(880)
  const [hover, setHover] = useState(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const measure = () => setWidth(el.clientWidth || 880)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { points, labels } = series
  const hasBench = Boolean(benchmarkName) && points.some((p) => p.benchmark != null)
  const values = points.flatMap((p) => (hasBench ? [p.strategy, p.benchmark] : [p.strategy]))
  const ticks = niceTicks(Math.min(...values), Math.max(...values))
  const lo = Math.min(ticks[0], ...values)
  const hi = Math.max(ticks[ticks.length - 1], ...values)

  const plotW = Math.max(width - PAD.left - PAD.right, 120)
  const plotH = height - PAD.top - PAD.bottom
  const x = (i) => PAD.left + (i / (points.length - 1)) * plotW
  const y = (v) => PAD.top + plotH - ((v - lo) / (hi - lo || 1)) * plotH

  const path = (key) => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ')

  const last = points[points.length - 1]
  const labelStep = Math.max(1, Math.round((points.length - 1) / 4))

  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - box.left
    const i = Math.round(((px - PAD.left) / plotW) * (points.length - 1))
    if (i >= 0 && i < points.length) setHover(i)
  }

  return (
    <div className="chart" ref={wrapRef}>
      <div className="chart__legend">
        <span className="chart__key">
          <span className="chart__swatch" style={{ background: SERIES.strategy }} />
          {strategyName}
        </span>
        {hasBench && (
          <span className="chart__key">
            <span className="chart__swatch" style={{ background: SERIES.benchmark }} />
            {benchmarkName}
          </span>
        )}
        <span className="chart__axis-note">Growth of ₹100</span>
      </div>

      <svg
        width={width}
        height={height}
        role="img"
        aria-label={
          hasBench
            ? `${strategyName} against ${benchmarkName}, growth of ₹100 over the window`
            : `${strategyName}, growth of ₹100 over the window`
        }
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        style={{ display: 'block', touchAction: 'pan-y' }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + plotW} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.left - 9} y={y(t) + 4} textAnchor="end" className="chart__tick">
              {t}
            </text>
          </g>
        ))}

        {points.map((p, i) =>
          i % labelStep === 0 || i === points.length - 1 ? (
            <text key={i} x={x(i)} y={height - 8} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} className="chart__tick">
              {labels[i]}
            </text>
          ) : null,
        )}

        {hasBench && (
          <path d={path('benchmark')} fill="none" stroke={SERIES.benchmark} strokeWidth="2" strokeLinejoin="round" />
        )}
        <path d={path('strategy')} fill="none" stroke={SERIES.strategy} strokeWidth="2" strokeLinejoin="round" />

        {/* direct labels, so the lines are readable without the legend */}
        <text x={x(points.length - 1) + 8} y={y(last.strategy) + 4} className="chart__endlabel">
          {Math.round(last.strategy)}
        </text>
        {hasBench && (
          <text x={x(points.length - 1) + 8} y={y(last.benchmark) + 4} className="chart__endlabel">
            {Math.round(last.benchmark)}
          </text>
        )}

        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--muted-2)" strokeWidth="1" />
            {(hasBench ? ['benchmark', 'strategy'] : ['strategy']).map((key) => (
              <circle
                key={key}
                cx={x(hover)}
                cy={y(points[hover][key])}
                r="4.5"
                fill={SERIES[key]}
                stroke="var(--surface)"
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>

      {hover != null && (
        <div
          className="chart__tip"
          style={{
            left: Math.min(Math.max(x(hover), 70), width - 70),
            top: PAD.top,
          }}
        >
          <span className="chart__tip-when">{labels[hover]}</span>
          <span className="chart__tip-row">
            <span className="chart__swatch" style={{ background: SERIES.strategy }} />
            ₹{points[hover].strategy.toFixed(1)}
          </span>
          {hasBench && (
            <span className="chart__tip-row">
              <span className="chart__swatch" style={{ background: SERIES.benchmark }} />
              ₹{points[hover].benchmark.toFixed(1)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
