import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card } from '../components/Card'
import { DataTable, Td } from '../components/DataTable'
import { Field } from '../components/Field'
import { MetricGrid, MetricTile } from '../components/MetricTile'
import { PageHeader } from '../components/PageHeader'
import { useBuildingTypes, useClimateZones, useDataSources } from '../hooks/useReference'
import { apiFetch, qs } from '../lib/api'
import type { EventPage, EventSummary } from '../lib/types'

const PAGE_SIZE = 25

function fmt(x: number | null | undefined, d = 2): string {
  return x === null || x === undefined ? '—' : x.toFixed(d)
}

export default function Performance() {
  const [bldgType, setBldgType] = useState('')
  const [zone, setZone] = useState('')
  const [source, setSource] = useState('')
  const [siteCode, setSiteCode] = useState('')
  const [page, setPage] = useState(0)

  const types = useBuildingTypes()
  const zones = useClimateZones()
  const sources = useDataSources()

  const filters = {
    bldg_type: bldgType || null,
    climate_zone: zone || null,
    data_source: source || null,
    site_code: siteCode || null,
  }

  const summary = useQuery({
    queryKey: ['events-summary', filters],
    queryFn: () => apiFetch<EventSummary>(`/performance/events/summary${qs(filters)}`),
  })
  const events = useQuery({
    queryKey: ['events', filters, page],
    queryFn: () =>
      apiFetch<EventPage>(
        `/performance/events${qs({ ...filters, limit: PAGE_SIZE, offset: page * PAGE_SIZE })}`,
      ),
  })

  const total = events.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const setFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(0)
  }

  return (
    <>
      <PageHeader
        icon="performance"
        title="Field Performance"
        subtitle="Post-processed DR event performance from field studies (Tier B curated data)"
      />

      <Card className="mb-4" shadow>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Building type">
            <select value={bldgType} onChange={(e) => setFilter(setBldgType)(e.target.value)}>
              <option value="">All</option>
              {(types.data ?? []).map((t) => (
                <option key={t.bldg_type_id} value={t.description}>
                  {t.description}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Climate zone">
            <select value={zone} onChange={(e) => setFilter(setZone)(e.target.value)}>
              <option value="">All</option>
              {(zones.data ?? []).map((z) => (
                <option key={z.climate_zone_id} value={z.climate_zone_description}>
                  {z.climate_zone_description}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data source">
            <select value={source} onChange={(e) => setFilter(setSource)(e.target.value)}>
              <option value="">All</option>
              {(sources.data ?? []).map((s) => (
                <option key={s.data_source}>{s.data_source}</option>
              ))}
            </select>
          </Field>
          <Field label="Site code">
            <input
              value={siteCode}
              placeholder="e.g. T0363"
              onChange={(e) => setFilter(setSiteCode)(e.target.value.trim())}
              style={{ width: 110 }}
            />
          </Field>
        </div>
      </Card>

      <div className="mb-4">
        <MetricGrid cols={4}>
          <MetricTile label="Events" value={summary.data?.n_events ?? '…'} />
          <MetricTile label="Sites" value={summary.data?.n_sites ?? '…'} />
          <MetricTile
            label="Avg shed intensity"
            value={fmt(summary.data?.shed_avg_wft2_mean)}
            unit="W/ft²"
          />
          <MetricTile
            label="Median shed intensity"
            value={fmt(summary.data?.shed_avg_wft2_median)}
            unit="W/ft²"
          />
        </MetricGrid>
      </div>

      <Card
        title="DR events"
        shadow
        action={
          <div className="flex items-center gap-2 text-[13px] text-text-muted">
            <button
              className="rounded px-2 py-0.5 hover:text-accent disabled:opacity-40"
              style={{ border: '0.5px solid var(--border)' }}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ‹
            </button>
            page {page + 1} / {pages}
            <button
              className="rounded px-2 py-0.5 hover:text-accent disabled:opacity-40"
              style={{ border: '0.5px solid var(--border)' }}
              disabled={page + 1 >= pages}
              onClick={() => setPage(page + 1)}
            >
              ›
            </button>
          </div>
        }
      >
        {events.isError ? (
          <p className="text-[13px] text-act">Could not load events — is the API running and ETL loaded?</p>
        ) : (
          <DataTable
            headers={[
              'Date', 'Site', 'Type', 'CZ', 'Source', 'Baseline',
              'OAT °F', 'Shed W/ft²', 'PDI W/ft²', 'WBP %',
            ]}
          >
            {(events.data?.items ?? []).map((e) => (
              <tr key={e.id} className="hover:bg-[var(--bg-subtle)]">
                <Td>{e.event_date ?? '—'}</Td>
                <Td>
                  <span title={e.site_name ?? undefined}>{e.site_code ?? e.site_name ?? '—'}</span>
                </Td>
                <Td>{e.bldg_type ?? '—'}</Td>
                <Td>{e.climate_zone ?? '—'}</Td>
                <Td>{e.data_source ?? '—'}</Td>
                <Td>
                  <span title={e.baseline_type ?? undefined}>{e.baseline_code ?? '—'}</span>
                </Td>
                <Td num>{fmt(e.peak_oat_f ?? e.max_oat_f ?? e.event_avg_oat_f, 1)}</Td>
                <Td num>{fmt(e.shed_avg_wft2, 3)}</Td>
                <Td num>{fmt(e.peak_demand_intensity_wft2, 2)}</Td>
                <Td num>{e.wbp_pct_avg != null ? fmt(e.wbp_pct_avg * 100, 1) : '—'}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>

      <p className="mt-3 text-[12px] text-text-faint">
        Tier A (run your own baseline analysis on interval meter data) uses the same engine via
        POST /api/performance/analyses — UI arrives with the self-service upload phase.
      </p>
    </>
  )
}
