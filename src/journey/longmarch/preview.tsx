import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LongMarch } from './LongMarch'
createRoot(document.getElementById('root')!).render(
  <StrictMode><LongMarch returnHref={location.protocol==='file:'?location.href.split('#')[0]:import.meta.env.BASE_URL} /></StrictMode>
)

