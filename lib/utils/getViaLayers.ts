import { mapZToLayerName } from "./mapZToLayerName"

type ViaLayers = {
  layers?: string[]
  from_layer?: string
  to_layer?: string
}

/** Read explicit layers or expand endpoints into an inclusive board-layer span. */
export const getViaLayers = (via: ViaLayers, layerCount: number): string[] => {
  if (via.layers !== undefined) return via.layers
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
  return boardLayers.slice(Math.min(from, to), Math.max(from, to) + 1)
}

/** Layers crossed by the via drill for DRC; route endpoints describe travel. */
export const getViaDrillLayers = (
  via: ViaLayers,
  layerCount: number,
  allowBlindAndBuriedVias = false,
): string[] => {
  const routeLayers = getViaLayers(via, layerCount)
  if (allowBlindAndBuriedVias) return routeLayers
  return getViaLayers(
    {
      from_layer: "top",
      to_layer: mapZToLayerName(layerCount - 1, layerCount),
    },
    layerCount,
  )
}
