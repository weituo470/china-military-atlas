const TERRAIN_SCALE = 0.92

/** The local loess plane is tangent to the globe, not wrapped around it. */
export const BATTLE_SURFACE_LIFT = 0.0018

// Shared by the mesh, soldiers and close camera so they agree on ground level.
export function groundHeight(x: number, z: number) {
  const u = x / TERRAIN_SCALE
  const v = z / TERRAIN_SCALE
  const r = Math.hypot(u * 1.05, v)
  const hillL = Math.exp(-((u + 0.38) ** 2) / 0.05 - ((v - 0.15) ** 2) / 0.08) * 0.0075
  const hillR = Math.exp(-((u - 0.42) ** 2) / 0.06 - ((v - 0.08) ** 2) / 0.07) * 0.0065
  const far = Math.exp(-((v - 0.42) ** 2) / 0.06 - (u ** 2) / 0.15) * 0.008
  const nearRidge = Math.exp(-((v + 0.36) ** 2) / 0.04 - ((u - 0.1) ** 2) / 0.12) * 0.0035
  const rolls = Math.sin(u * 9.1) * Math.cos(v * 7.4) * 0.00055 + Math.sin(u * 21 + v * 13) * 0.00018
  const stream = -Math.exp(-((u * 0.7 + Math.sin(v * 8) * 0.04 + 0.05) ** 2) / 0.0018) * 0.0016
  const bowl = -Math.exp(-(r * r) / 0.12) * 0.0009
  return hillL + hillR + far + nearRidge + rolls + stream + bowl
}
