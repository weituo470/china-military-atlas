import type { Copy } from './sources'
import type { Unit } from './content'

export type DossierStop = {
  id: string; by: number; breakBefore?: boolean; date: Copy; place: Copy; lon: number; lat: number; body: Copy; refs: string[]
}
export type DossierSource = { id: string; title: Copy; publisher: Copy; url: string; locator: Copy }
export type RouteDossier = { id: Unit; title: Copy; lead: Copy; scope: Copy; stops: DossierStop[]; sources: DossierSource[] }

