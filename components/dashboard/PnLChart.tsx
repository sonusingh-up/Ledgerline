'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, AreaSeries, IChartApi, ISeriesApi } from 'lightweight-charts'

export interface PnLChartDataPoint {
  time: string // Format: 'YYYY-MM-DD'
  value: number
}

export interface PnLChartProps {
  data?: PnLChartDataPoint[]
  height?: number
  className?: string
}

export function PnLChart({ data = [], height = 300, className = '' }: PnLChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverData, setHoverData] = useState<{ time?: string; value?: number } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth || 600

    // Initialize TradingView lightweight-chart with exact container width
    const chart = createChart(containerRef.current, {
      width: containerWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8B96A6',
        fontSize: 11,
        fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(37, 46, 57, 0.35)' },
        horzLines: { color: 'rgba(37, 46, 57, 0.35)' },
      },
      crosshair: {
        vertLine: { color: '#6E8CFA', width: 1, style: 3, labelBackgroundColor: '#1E2633' },
        horzLine: { color: '#6E8CFA', width: 1, style: 3, labelBackgroundColor: '#1E2633' },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
      },
      handleScroll: true,
      handleScale: true,
    })

    // Determine trend direction
    const latestVal = data.length > 0 ? data[data.length - 1].value : 0
    const isProfit = latestVal >= 0

    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: isProfit ? 'rgba(79, 168, 138, 0.45)' : 'rgba(196, 97, 74, 0.45)',
      bottomColor: isProfit ? 'rgba(79, 168, 138, 0.01)' : 'rgba(196, 97, 74, 0.01)',
      lineColor: isProfit ? '#4FA88A' : '#C4614A',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (val: number) => {
          const sign = val < 0 ? '-' : val > 0 ? '+' : ''
          return `${sign}$${Math.abs(Math.round(val)).toLocaleString()}`
        },
      },
    })

    if (data.length > 0) {
      // Filter valid YYYY-MM-DD dates (ignoring non-date strings like 'start')
      const validItems = data.filter(
        (item) => item.time && item.time !== 'start' && /^\d{4}-\d{2}-\d{2}$/.test(item.time)
      )

      let pointsToProcess: PnLChartDataPoint[] = []

      if (validItems.length > 0) {
        const sortedValid = [...validItems].sort((a, b) => a.time.localeCompare(b.time))
        const earliestDate = sortedValid[0].time

        // 0 baseline point on the day before the first trade
        const prevDt = new Date(earliestDate + 'T12:00:00Z')
        prevDt.setUTCDate(prevDt.getUTCDate() - 1)
        const baselineDate = prevDt.toISOString().slice(0, 10)

        pointsToProcess = [{ time: baselineDate, value: 0 }, ...sortedValid]
      } else {
        const today = new Date().toISOString().split('T')[0]
        pointsToProcess = [{ time: today, value: 0 }]
      }

      // Deduplicate timestamps
      const uniqueMap = new Map<string, number>()
      pointsToProcess.forEach((item) => {
        uniqueMap.set(item.time, item.value)
      })

      const sanitizedData: PnLChartDataPoint[] = Array.from(uniqueMap.entries()).map(
        ([time, value]) => ({ time, value })
      )

      if (sanitizedData.length > 0) {
        areaSeries.setData(sanitizedData)
        chart.timeScale().fitContent()
      }
    }

    // Subscribe to crosshair move for tooltip overlay
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > containerWidth ||
        param.point.y < 0 ||
        param.point.y > height
      ) {
        setHoverData(null)
      } else {
        const dateStr = typeof param.time === 'string' ? param.time : ''
        const dataPoint = param.seriesData.get(areaSeries) as any
        if (dataPoint) {
          setHoverData({ time: dateStr, value: dataPoint.value })
        }
      }
    })

    // ResizeObserver for dynamic width changes (e.g. sidebar collapse)
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return
      const newWidth = entries[0].contentRect.width
      if (newWidth > 0) {
        chart.applyOptions({ width: newWidth })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [data, height])

  const latestValue = data.length > 0 ? data[data.length - 1].value : 0
  const displayVal = hoverData?.value !== undefined ? hoverData.value : latestValue
  const displayTime = hoverData?.time || (data.length > 0 ? data[data.length - 1].time : '')

  return (
    <div className={`w-full relative min-h-[220px] ${className}`}>
      {/* TradingView Floating Legend Overlay */}
      <div className="absolute top-2 left-3 z-10 pointer-events-none flex items-center gap-3 bg-[var(--color-surface-alt)]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--color-border-soft)] text-xs font-mono">
        <span className="text-[var(--color-muted-dark)] font-semibold">CUMULATIVE P&L</span>
        <span
          className={`font-bold ${
            displayVal >= 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-loss)]'
          }`}
        >
          {displayVal >= 0 ? '+' : ''}${Math.abs(Math.round(displayVal)).toLocaleString()}
        </span>
        {displayTime && (
          <span className="text-[var(--color-muted-dark)] text-[11px] border-l border-[var(--color-border-soft)] pl-2.5">
            {displayTime}
          </span>
        )}
      </div>

      <div ref={containerRef} className="w-full" />
    </div>
  )
}

export default PnLChart
