import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { DataTable, Td } from '../components/DataTable'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import { useECharts } from '../hooks/useECharts'
import { useBuildingTypes, useClimateZones, useDataSources } from '../hooks/useReference'
import { apiFetch, qs } from '../lib/api'
import type { CohortRow, ScatterPoint } from '../lib/types'

const PALETTE = ['#007681', '#C9821B', '#1E6FA8', '#2E9E6B', '#C4453B', '#7A5BA6', '#5B6B7A']

function fmt(x: number | null | undefined, d = 3): string {
  return x === null || x === undefined ? '—' : x.toFixed(d)
}

export default function Benchmarking() {
  const [bldgType, setBldgType] = useState('')
  const [zone, setZone] = useState('')
  const [source, setSource] = useState('')

  const types = useBuildingTypes()
  const zones = useClimateZones()
  const sources = useDataSources()

  const filters = {
    bldg_type: bldgType || null,
    climate_zone: zone || null,
  }

  const cohorts = useQuery({
    queryKey: ['cohorts', filters],
    queryFn: () => apiFetch<CohortRow[]>(`/benchmarking/cohorts${qs(filters)}`),
  })
  const scatter = useQuery({
    queryKey: ['scatter', filters, source],
    queryFn: () =>
      apiFetch<ScatterPoint[]>(
        `/benchmarking/scatter${qs({ ...filters, data_source: source || null })}`,
      ),
  })

  const chartOption = useMemo(() => {
    const pts = (scatter.data ?? []).filter((p) => p.oat_f != null && p.shed_avg_wft2 != null)
    if (!pts.length) return null
    const byType = new Map<string, ScatterPoint[]>()
    for (const p of pts) {
      const k = p.bldg_type ?? 'Unknown'
      if (!byType.has(k)) byType.set(k, [])
      byType.get(k)!.push(p)
    }
    return {
      grid: { left: 52, right: 16, top: 32, bottom: 40 },
      legend: { top: 0 },
      tooltip: {
        trigger: 'item' as const,
        formatter: (raw: unknown) => {
          const p = raw as { seriesName?: string; data?: { value: number[]; site?: string } }
          return `${p.data?.site ?? ''} (${p.seriesName})<br/>OAT ${p.data?.value[0]?.toFixed(1)} °F — shed ${p.data?.value[1]?.toFixed(3)} W/ft²`
        },
      },
      xAxis: {
        type: 'value' as const, name: 'OAT (°F)',
        nameLocation: 'middle' as const, nameGap: 26, min: 'dataMin' as const,
      },
      yAxis: { type: 'value' as const, name: 'Shed W/ft²' },
      series: [...byType.entries()].map(([name, list], i) => ({
        name,
        type: 'scatter' as const,
        symbolSize: 5,
        itemStyle: { color: PALETTE[i % PALETTE.length], opacity: 0.65 },
        data: list.map((p) => ({ value: [p.oat_f, p.shed_avg_wft2], site: p.site_code })),
      })),
    }
  }, [scatter.data])
  const chartRef = useECharts(chartOption)

  return (
    <>
      <PageHeader
        icon="benchmark"
        title="Benchmarking"
        subtitle="Compare demand-flexibility performance across cohorts of like buildings"
      />

      <Card className="mb-4" shadow>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Building type">
            <select value={bldgType} onChange={(e) => setBldgType(e.target.value)}>
              <option value="">All</option>
              {(types.data ?? []).map((t) => (
                <option key={t.bldg_type_id} value={t.description}>
                  {t.description}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Climate zone">
            <select value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="">All</option>
              {(zones.data ?? []).map((z) => (
                <option key={z.climate_zone_id} value={z.climate_zone_description}>
                  {z.climate_zone_description}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data source (scatter)">
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">All</option>
              {(sources.data ?? []).map((s) => (
                <option key={s.data_source}>{s.data_source}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Event shed vs outside air temperature" shadow className="mb-4">
        {scatter.isError ? (
          <p className="text-[13px] text-act">Could not load scatter — is the API running and ETL loaded?</p>
        ) : (
          <div ref={chartRef} style={{ height: 340 }} />
        )}
      </Card>

      <Card title="Cohorts (building type × vintage × climate × size)" shadow>
        {cohorts.isError ? (
          <p className="text-[13px] text-act">Could not load cohorts.</p>
        ) : (
          <DataTable
            headers={[
              'Type', 'Vintage', 'CZ', 'Size', 'n',
              'p25', 'Median', 'p75', 'p90', 'Mean', 'PDI mean',
            ]}
          >
            {(cohorts.data ?? []).map((c, i) => (
              <tr key={i} className="hover:bg-[var(--bg-subtle)]">
                <Td>{c.bldg_type ?? '—'}</Td>
                <Td>{c.vintage_code ?? '—'}</Td>
                <Td>{c.climate_zone ?? '—'}</Td>
                <Td>{c.size_bucket}</Td>
                <Td num>{c.n}</Td>
                <Td num>{fmt(c.shed_wft2_p25)}</Td>
                <Td num>{fmt(c.shed_wft2_median)}</Td>
                <Td num>{fmt(c.shed_wft2_p75)}</Td>
                <Td num>{fmt(c.shed_wft2_p90)}</Td>
                <Td num>{fmt(c.shed_wft2_mean)}</Td>
                <Td num>{fmt(c.pdi_wft2_mean, 2)}</Td>
              </tr>
            ))}
          </DataTable>
        )}
        <p className="mt-2 text-[12px] text-text-faint">
          Shed statistics in W/ft² over Tier B curated events; cohorts with fewer than 3 events hidden.
        </p>
      </Card>
    </>
  )
}
