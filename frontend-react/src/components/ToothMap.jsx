import React, { useMemo, useState } from 'react'
import colors from '../theme/colors.js'

const TEETH = [
  // Upper jaw (left -> right): 16 15 14 13 12 11 10  9 |  8  7  6  5  4  3  2  1
  '16 - Third Molar (Wisdom Tooth)',
  '15 - Second Molar',
  '14 - First Molar',
  '13 - Second Premolar (Second Bicuspid)',
  '12 - First Premolar (First Bicuspid)',
  '11 - Canine (Cuspid)',
  '10 - Lateral Incisor',
  '9 - Central Incisor',
  '8 - Central Incisor',
  '7 - Lateral Incisor',
  '6 - Canine (Cuspid)',
  '5 - First Premolar (First Bicuspid)',
  '4 - Second Premolar (Second Bicuspid)',
  '3 - First Molar',
  '2 - Second Molar',
  '1 - Third Molar (Wisdom Tooth)',

  // Lower jaw (left -> right): 17 18 19 20 21 22 23 24 | 25 26 27 28 29 30 31 32
  '17 - Third Molar (Wisdom Tooth)',
  '18 - Second Molar',
  '19 - First Molar',
  '20 - Second Premolar',
  '21 - First Premolar',
  '22 - Canine',
  '23 - Lateral Incisor',
  '24 - Central Incisor',
  '25 - Central Incisor',
  '26 - Lateral Incisor',
  '27 - Canine',
  '28 - First Premolar',
  '29 - Second Premolar',
  '30 - First Molar',
  '31 - Second Molar',
  '32 - Third Molar (Wisdom Tooth)',
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
      <svg className="w-full h-auto select-none" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: 420 }}>
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
                width={18}
                height={28}
                rx={6}

                fill={active ? colors.primaryContainer : 'transparent'}
                stroke={active ? colors.primary : colors.outline}
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
                x={x - 9}
                y={y - 14}
                width={18}
                height={28}
                rx={6}
                fill={active ? colors.primaryContainer : 'transparent'}
                stroke={active ? colors.primary : colors.outline}
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

