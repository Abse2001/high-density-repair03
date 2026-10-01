import { expect, test } from "bun:test"
import { ConnectivityMap } from "circuit-json-to-connectivity-map"
import { AutoroutingDrcEngine } from "../lib/drc/AutoroutingDrcEngine"
import type { SimpleRouteJson, SimplifiedPcbTraces } from "../lib/types"

test("immutable connectivity maps retain their aliases with geometry caches", (): void => {
  const srj: SimpleRouteJson = {
    bounds: { minX: -2, minY: -2, maxX: 2, maxY: 2 },
    layerCount: 2,
    minTraceWidth: 0.1,
    connections: [],
    obstacles: [
      {
        type: "rect",
        layers: ["top"],
        center: { x: 0, y: 0 },
        width: 0.5,
        height: 0.5,
        connectedTo: ["pcb_smtpad_immutable", "pad_alias"],
      },
    ],
  }
  const traces: SimplifiedPcbTraces = [
    {
      type: "pcb_trace",
      pcb_trace_id: "trace_immutable",
      connection_name: "trace_alias",
      route: [
        { route_type: "wire", x: -1, y: 0, width: 0.1, layer: "top" },
        { route_type: "wire", x: 1, y: 0, width: 0.1, layer: "top" },
      ],
    },
  ]
  const connMap = new ConnectivityMap({})
  connMap.addConnections([["trace_alias", "pad_alias"]])
  const ordinary = new AutoroutingDrcEngine(srj, { connMap })
  const cached = new AutoroutingDrcEngine(srj, {
    connMap,
    connectivityMapIsImmutable: true,
    cacheStaticObstacleNetMembership: true,
    cacheImmutableTraceGeometry: true,
  })

  expect(cached.evaluate(traces)).toEqual(ordinary.evaluate(traces))
  expect(cached.evaluate(traces)).toEqual(ordinary.evaluate(traces))
  expect(cached.evaluate(traces).errors).toHaveLength(0)
})
