import React, { useMemo, useState } from 'react'

const TEETH = [
  'Upper 1',
  'Upper 2',
  'Upper 3',
  'Upper 4',
  'Upper 5',
  'Upper 16',
  'Upper 15',
  'Upper 14',
  'Upper 13',
  'Upper 12',
  'Upper 11',
  'Upper 10',
  'Upper 9',
  'Upper 8',
  'Upper 7',
  'Upper 6',
  'Lower 1',
  'Lower 2',
  'Lower 3',
  'Lower 4',
  'Lower 5',
  'Lower 16',
  'Lower 15',
  'Lower 14',
  'Lower 13',
  'Lower 12',
  'Lower 11',
  'Lower 10',
  'Lower 9',
  'Lower 8',
  'Lower 7',
  'Lower 6',
]

export default function ToothMap({ selected = [], readOnly = true, onSelectionChange }) {
  const selectedSet = useMemo(() => new Set(selected || []), [selected])
  const [internalSelected, setInternalSelected] = useState(() => selected || [])

  const effectiveSelected = readOnly ? selected || [] : internalSelected
  const effectiveSet = useMemo(() => new Set(effectiveSelected || []), [effectiveSelected])

  function toggleTooth(name) {
    if (readOnly) return
    setInternalSelected((cur) => {
      const next = effectiveSet.has(name) ? cur.filter((x) => x !== name) : [...cur, name]
      if (typeof onSelectionChange === 'function') onSelectionChange(next)
      return next
    })
  }

  const top = TEETH.slice(0, 16)
  const bottom = TEETH.slice(16, 32)
  const cx = 210
  const rx = 175
  const topY = 120
  const bottomY = 230

  return (
    <div className="w-full max-w-[420px] bg-surface-container-low p-md rounded-xl border border-outline-variant">
      <svg className="w-full h-auto select-none" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid meet">
        <g>
          {top.map((t, idx) => {
            const a = (idx / (top.length - 1)) * Math.PI
            const x = cx + Math.cos(Math.PI - a) * rx
            const y = topY - Math.sin(Math.PI - a) * 28
            const active = effectiveSet.has(t)

            return (
              <rect
                key={t}
                x={x - 8}
                y={y - 11}
                width={12}
                height={20}
                rx={4}
                fill={active ? '#1976d2' : 'transparent'}
                stroke={active ? '#005dac' : '#717783'}
                strokeWidth={1}
                style={{ cursor: readOnly ? 'default' : 'pointer' }}
                onClick={() => toggleTooth(t)}
              />
            )
          })}

          {bottom.map((t, idx) => {
            const a = (idx / (bottom.length - 1)) * Math.PI
            const x = cx + Math.cos(Math.PI - a) * rx
            const y = bottomY + Math.sin(Math.PI - a) * 16
            const active = effectiveSet.has(t)

            return (
              <rect
                key={t}
                x={x - 8}
                y={y - 11}
                width={12}
                height={20}
                rx={4}
                fill={active ? '#1976d2' : 'transparent'}
                stroke={active ? '#005dac' : '#717783'}
                strokeWidth={1}
                style={{ cursor: readOnly ? 'default' : 'pointer' }}
                onClick={() => toggleTooth(t)}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}

