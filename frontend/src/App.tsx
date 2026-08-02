import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import Benchmarking from './pages/Benchmarking'
import Landing from './pages/Landing'
import Overview from './pages/Overview'
import Performance from './pages/Performance'
import Placeholder from './pages/Placeholder'
import Potential from './pages/Potential'
import { useUIStore } from './store/ui'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
})

// Commercial-sector layout: AppShell (header + sidebar) around nested routes.
function CommercialShell() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export default function App() {
  const theme = useUIStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* sector landing — no shell */}
          <Route path="/" element={<Landing />} />

          {/* commercial sector */}
          <Route element={<CommercialShell />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/potential" element={<Potential />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/benchmarking" element={<Benchmarking />} />
            <Route
              path="/sites"
              element={<Placeholder icon="sites" title="Sites" note="Site explorer and map arrive in Phase 1c." />}
            />
            <Route
              path="/reports"
              element={<Placeholder icon="reports" title="Reports" note="CSV/PDF exports arrive in Phase 1d." />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
