import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'

// Bind an ECharts instance to a div; re-applies `option` when it changes and
// resizes with the window. Returns the container ref.
export function useECharts(option: echarts.EChartsOption | null) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chartRef.current = chart
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (option && chartRef.current) chartRef.current.setOption(option, true)
  }, [option])

  return ref
}
