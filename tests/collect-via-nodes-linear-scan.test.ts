import { expect, test } from "bun:test"
import { collectViaNodes } from "../lib/solvers/GlobalDrcForceImproveSolver/solverHelpers"
import type { HighDensityRoute } from "../lib/types/high-density-types"
import type { SimpleRouteJson } from "../lib/types"

test("collects each coincident via run once", (): void => {
  const route: HighDensityRoute = {
    connectionName: "signal",
    rootConnectionName: "signal_root",
    traceThickness: 0.1,
    viaDiameter: 0.4,
    vias: [{ x: 0, y: 0 }],
    route: [
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 3 },
      { x: 1, y: 0, z: 3 },
    ],
  }
  const srj: SimpleRouteJson = {
    bounds: { minX: -2, minY: -2, maxX: 2, maxY: 2 },
    layerCount: 4,
    minTraceWidth: 0.1,
    minViaDiameter: 0.3,
    allowBlindAndBuriedVias: true,
    connections: [],
    obstacles: [],
  }

  expect(collectViaNodes([route], srj)).toEqual([
    {
      routeIndex: 0,
      rootConnectionName: "signal_root",
      pointIndexes: [2, 3, 1, 4],
      zLayers: [0, 1, 2, 3],
      x: 0,
      y: 0,
      radius: 0.2,
      movable: true,
      canCanonicalize: true,
    },
  ])
})
