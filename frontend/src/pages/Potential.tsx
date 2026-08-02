import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { MetricGrid, MetricTile } from '../components/MetricTile'
import { PageHeader } from '../components/PageHeader'
import { useECharts } from '../hooks/useECharts'
import { apiFetch, qs } from '../lib/api'
import type { Curve, DutyCycleEstimate, Estimate, Measure, OutputUnit } from '../lib/types'

const GTA_BUILDING_TYPES = ['SmallOffice', 'MediumOffice']
const CYCLE_BUILDING_TYPES = ['SmallOffice', 'MediumOffice', 'Retail']
const CEC_ZONES = ['CZ03', 'CZ04', 'CZ12', 'CZ13']
const HOURS = [1, 2, 3, 4]

function fmt(x: number | null | undefined, digits = 2): string {
  return x === null || x === undefined ? '—' : x.toFixed(digits)
}

// ── GTA temperature reset (basic regression) ────────────────────────────────
function GtaSection() {
  const [buildingType, setBuildingType] = useState('SmallOffice')
  const [measureId, setMeasureId] = useState('')
  const [eventHour, setEventHour] = useState(1)
  const [oat, setOat] = useState(90)
  const [unit, setUnit] = useState<OutputUnit>('wft2')

  const measures = useQuery({
    queryKey: ['measures', buildingType],
    queryFn: () => apiFetch<Measure[]>(`/potential/measures${qs({ building_type: buildingType })}`),
  })

  // keep the selected measure valid when the building type changes
  useEffect(() => {
    const list = measures.data
    if (list && list.length && !list.some((m) => m.measure_id === measureId)) {
      setMeasureId(list[0].measure_id)
    }
  }, [measures.data, measureId])

  const ready = Boolean(measureId)
  const params = { building_type: buildingType, measure_id: measureId, event_hour: eventHour, output_unit: unit }

  const estimate = useQuery({
    queryKey: ['estimate', params, oat],
    queryFn: () => apiFetch<Estimate>(`/potential/estimate${qs({ ...params, oat_f: oat })}`),
    enabled: ready,
  })
  const curve = useQuery({
    queryKey: ['curve', params],
    queryFn: () => apiFetch<Curve>(`/potential/curve${qs(params)}`),
    enabled: ready,
  })

  const unitLabel = unit === 'wft2' ? 'W/ft²' : '%'
  const selected = measures.data?.find((m) => m.measure_id === measureId)

  const chartOption = useMemo(() => {
    if (!curve.data) return null
    return {
      grid: { left: 48, right: 16, top: 24, bottom: 36 },
      tooltip: { trigger: 'axis' as const },
      xAxis: {
        type: 'value' as const,
        name: 'OAT (°F)',
        nameLocation: 'middle' as const,
        nameGap: 24,
        min: 'dataMin' as const,
        max: 'dataMax' as const,
      },
      yAxis: { type: 'value' as const, name: unitLabel },
      series: [
        {
          type: 'line' as const,
          data: curve.data.points.map((p) => [p.oat_f, Number(p.value.toFixed(4))]),
          showSymbol: false,
          lineStyle: { width: 2 },
          color: '#007681',
          markLine: {
            symbol: 'none',
            label: { formatter: `OAT ${oat}°F` },
            lineStyle: { type: 'dashed' as const, color: '#C9821B' },
            data: [{ xAxis: oat }],
          },
        },
      ],
    }
  }, [curve.data, oat, unitLabel])
  const chartRef = useECharts(chartOption)

  return (
    <Card title="HVAC temperature reset (GTA) — regression estimator" shadow>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Building type">
          <select value={buildingType} onChange={(e) => setBuildingType(e.target.value)}>
            {GTA_BUILDING_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Measure (precool / reset)">
          <select value={measureId} onChange={(e) => setMeasureId(e.target.value)} style={{ maxWidth: 240 }}>
            {(measures.data ?? []).map((m) => (
              <option key={m.measure_id} value={m.measure_id}>
                precool {m.precool_deg}°F / reset {m.reset_deg}°F
              </option>
            ))}
          </select>
        </Field>
        <Field label="Event hour">
          <select value={eventHour} onChange={(e) => setEventHour(Number(e.target.value))}>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                hour {h}
              </option>
            ))}
          </select>
        </Field>
        <Field label="OAT (°F)">
          <input type="number" value={oat} min={50} max={115} onChange={(e) => setOat(Number(e.target.value))} style={{ width: 90 }} />
        </Field>
        <Field label="Output">
          <select value={unit} onChange={(e) => setUnit(e.target.value as OutputUnit)}>
            <option value="wft2">Shed W/ft²</option>
            <option value="pct">DR potential %</option>
          </select>
        </Field>
      </div>

      <MetricGrid cols={3}>
        <MetricTile
          label={`Estimated shed @ ${oat}°F`}
          value={estimate.data ? fmt(estimate.data.value, unit === 'wft2' ? 3 : 1) : '…'}
          unit={unitLabel}
        />
        <MetricTile label="Pre-cool" value={selected ? selected.precool_deg : '—'} unit="°F" />
        <MetricTile label="Setpoint reset" value={selected ? selected.reset_deg : '—'} unit="°F" />
      </MetricGrid>

      {estimate.isError && (
        <p className="mt-2 text-[13px] text-act">Estimate unavailable — is the API running and data loaded?</p>
      )}

      <div className="mt-4">
        <div className="mb-1 text-[13px] text-text-muted">Shed vs outside air temperature</div>
        <div ref={chartRef} style={{ height: 280 }} />
      </div>
    </Card>
  )
}

// ── RTU duty cycling (basic regression) ─────────────────────────────────────
function DutyCycleSection() {
  const [buildingType, setBuildingType] = useState('SmallOffice')
  const [zone, setZone] = useState('CZ03')
  const [eventHour, setEventHour] = useState(1)
  const [oat, setOat] = useState(90)
  const [minutesOff, setMinutesOff] = useState(30)
  const [compressorOnly, setCompressorOnly] = useState(true)
  const [meterKw, setMeterKw] = useState<number | ''>(240)

  const estimate = useQuery({
    queryKey: ['duty-cycle', buildingType, zone, eventHour, oat, minutesOff, compressorOnly, meterKw],
    queryFn: () =>
      apiFetch<DutyCycleEstimate>(
        `/potential/estimate/duty-cycle${qs({
          building_type: buildingType,
          climate_zone: zone,
          event_hour: eventHour,
          oat_f: oat,
          minutes_off_per_hour: minutesOff,
          compressor_only: compressorOnly,
          meter_kw: meterKw === '' ? null : meterKw,
        })}`,
      ),
  })

  return (
    <Card title="RTU duty cycling — regression estimator" shadow>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Building type">
          <select value={buildingType} onChange={(e) => setBuildingType(e.target.value)}>
            {CYCLE_BUILDING_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="CEC climate zone">
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            {CEC_ZONES.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </Field>
        <Field label="Event hour">
          <select value={eventHour} onChange={(e) => setEventHour(Number(e.target.value))}>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                hour {h}
              </option>
            ))}
          </select>
        </Field>
        <Field label="OAT (°F)">
          <input type="number" value={oat} min={50} max={115} onChange={(e) => setOat(Number(e.target.value))} style={{ width: 90 }} />
        </Field>
        <Field label="Minutes off / hr">
          <select value={minutesOff} onChange={(e) => setMinutesOff(Number(e.target.value))}>
            {[15, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </Field>
        <Field label="Scope">
          <select value={compressorOnly ? 'yes' : 'no'} onChange={(e) => setCompressorOnly(e.target.value === 'yes')}>
            <option value="yes">Compressor only</option>
            <option value="no">Whole RTU</option>
          </select>
        </Field>
        <Field label="Meter kW (optional)">
          <input
            type="number"
            value={meterKw}
            min={0}
            onChange={(e) => setMeterKw(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ width: 110 }}
          />
        </Field>
      </div>

      <MetricGrid cols={3}>
        <MetricTile
          label="DR potential @ full-hour cycling"
          value={estimate.data ? fmt(estimate.data.dr_pct_full_cycle, 1) : '…'}
          unit="%"
        />
        <MetricTile
          label={`Scaled DR fraction (${minutesOff} min off/hr)`}
          value={estimate.data ? fmt(estimate.data.dr_fraction * 100, 1) : '…'}
          unit="%"
        />
        <MetricTile
          label="Estimated shed"
          value={estimate.data?.dr_kw != null ? fmt(estimate.data.dr_kw, 1) : '—'}
          unit="kW"
        />
      </MetricGrid>

      {estimate.isError && (
        <p className="mt-2 text-[13px] text-act">Estimate unavailable — is the API running and data loaded?</p>
      )}
    </Card>
  )
}

export default function Potential() {
  return (
    <>
      <PageHeader
        icon="potential"
        title="DF Potential"
        subtitle="Building HVAC demand-flexibility potential from EnergyPlus-derived regression models"
      />
      <div className="flex flex-col gap-4">
        <GtaSection />
        <DutyCycleSection />
      </div>
    </>
  )
}
