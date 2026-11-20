import { eastRoutes } from './route-east'
import { westRoutes } from './route-west'
import type { Unit } from './content'
import type { RouteDossier } from './dossier-types'

export const dossiers: RouteDossier[] = (['first','red25','fourth','second'] as const).map(id => {
  const route = [...eastRoutes,...westRoutes].find(r=>r.id===id)
  if (!route) throw Error('Missing route dossier: ' + id)
  return route
})
export function getDossier(id:Unit) { return dossiers.find(r=>r.id===id)! }

