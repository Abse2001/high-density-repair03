import { expect, spyOn, test } from "bun:test"
import { ConnectivityMap } from "circuit-json-to-connectivity-map"
import { GlobalDrcForceImproveSolver } from "../lib"
import type { SimpleRouteJson } from "../lib/types"

test("reuses connection-aware SRJ data across DRC snapshots", (): void => {
  const srj: SimpleRouteJson = {
    bounds: { minX: -1, minY: -1, maxX: 1, maxY: 1 },
    layerCount: 2,
    minTraceWidth: 0.1,
    connections: [{ name: "connection_a", pointsToConnect: [] }],
    obstacles: [
      {
        type: "rect",
        layers: ["top"],
        center: { x: 0, y: 0 },
        width: 0.5,
        height: 0.5,
        connectedTo: ["pad_a"],
      },
    ],
  }
  const connMap = new ConnectivityMap({})
  connMap.addConnections([["connection_a", "pad_a"]])
  const getNetConnectedToId = spyOn(connMap, "getNetConnectedToId")

  try {
    const solver = new GlobalDrcForceImproveSolver({
      srj,
      hdRoutes: [],
      connMap,
      drcEvaluator: () => [],
    })
    const resolutionCountAfterConstruction =
      getNetConnectedToId.mock.calls.length

    expect(resolutionCountAfterConstruction).toBeGreaterThan(0)
    solver.step()
    expect(getNetConnectedToId).toHaveBeenCalledTimes(
      resolutionCountAfterConstruction,
    )
  } finally {
    getNetConnectedToId.mockRestore()
  }
})
