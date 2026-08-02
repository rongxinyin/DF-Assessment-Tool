import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { RefBuildingType, RefClimateZone } from '../lib/types'

// Reference dimensions for filter dropdowns; cached aggressively (they change
// only when ETL runs).
export function useBuildingTypes() {
  return useQuery({
    queryKey: ['ref', 'building-types'],
    queryFn: () => apiFetch<RefBuildingType[]>('/reference/building-types'),
    staleTime: Infinity,
  })
}

export function useClimateZones() {
  return useQuery({
    queryKey: ['ref', 'climate-zones'],
    queryFn: () => apiFetch<RefClimateZone[]>('/reference/climate-zones'),
    staleTime: Infinity,
  })
}

export function useDataSources() {
  return useQuery({
    queryKey: ['ref', 'data-sources'],
    queryFn: () => apiFetch<{ data_source: string }[]>('/reference/data-sources'),
    staleTime: Infinity,
  })
}
