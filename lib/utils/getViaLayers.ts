import { mapZToLayerName } from "./mapZToLayerName"

type ViaSpan = {
  from_layer: string
  to_layer: string
}

/**
 * Resolve the physical copper layers occupied by an autorouted via.
 *
 * Boards use through-vias unless blind and buried vias are explicitly
 * enabled. In that default case, a route transition such as top -> inner2
 * still drills through the bottom layer.
 */
export const getViaLayers = (
  via: ViaSpan,
  layerCount: number,
  allowBlindAndBuriedVias = false,
): string[] => {
  if (!Number.isInteger(layerCount) || layerCount < 1) {
    throw new Error(`Invalid board layer count: ${layerCount}`)
  }
  const boardLayers = Array.from({ length: layerCount }, (_, z) =>
    mapZToLayerName(z, layerCount),
  )
  const from = boardLayers.findIndex((layer) => layer === via.from_layer)
  const to = boardLayers.findIndex((layer) => layer === via.to_layer)
  if (from < 0 || to < 0) {
    throw new Error(
      `Via span ${via.from_layer} -> ${via.to_layer} is outside the board`,
    )
  }
  if (!allowBlindAndBuriedVias) {
    return boardLayers
  }
  return boardLayers.slice(Math.min(from, to), Math.max(from, to) + 1)
}
