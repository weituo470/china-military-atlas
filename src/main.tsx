import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { isLongMarchRoute, longMarchReturnHref } from './journey/routes'

const longMarch = isLongMarchRoute(new URL(location.href))
const GlobeApp = lazy(() => import('./App'))
const LongMarch = lazy(() => import('./journey/longmarch/LongMarch').then(module => ({ default: module.LongMarch })))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {longMarch ? <LongMarch returnHref={longMarchReturnHref()} /> : <GlobeApp />}
    </Suspense>
  </StrictMode>,
)
