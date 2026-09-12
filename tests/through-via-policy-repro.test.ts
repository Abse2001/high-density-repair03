import { expect, test } from "bun:test"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import {
  getSvgFromGraphicsObject,
  stackGraphicsHorizontally,
  type GraphicsObject,
} from "graphics-debug"
import { AutoroutingDrcEngine } from "../lib/drc/AutoroutingDrcEngine"
import type { SimpleRouteJson, SimplifiedPcbTraces } from "../lib/types"
import { convertToCircuitJson } from "../lib/utils/convertToCircuitJson"

const srj = {
  layerCount: 4,
  minTraceWidth: 0.1,
  minViaDiameter: 0.3,
  allowBlindAndBuriedVias: false,
  bounds: { minX: -2, minY: -2, maxX: 2, maxY: 2 },
  obstacles: [],
  connections: [],
} satisfies SimpleRouteJson & { allowBlindAndBuriedVias: boolean }

const traces: SimplifiedPcbTraces = [
  {
    type: "pcb_trace",
    pcb_trace_id: "usb",
    connection_name: "usb",
    route: [
      {
        route_type: "via",
        x: 0,
        y: 0,
        from_layer: "top",
        to_layer: "inner2",
      },
    ],
  },
  {
    type: "pcb_trace",
    pcb_trace_id: "supply",
    connection_name: "supply",
    route: [
      { route_type: "wire", x: -1.5, y: 0, width: 0.1, layer: "bottom" },
      { route_type: "wire", x: 1.5, y: 0, width: 0.1, layer: "bottom" },
    ],
  },
]

const createPanel = ({
  throughVia,
  showsCollision,
}: {
  throughVia: boolean
  showsCollision: boolean
}): GraphicsObject => ({
  coordinateSystem: "cartesian",
  lines: [
    {
      points: [
        { x: -1.5, y: 0 },
        { x: 1.5, y: 0 },
      ],
      strokeColor: "#2563eb",
      strokeWidth: 0.1,
      label: "bottom-layer supply trace",
    },
  ],
  circles: [
    {
      center: { x: 0, y: 0 },
      radius: 0.15,
      fill: throughVia ? "rgba(220, 38, 38, 0.55)" : "rgba(245, 158, 11, 0.55)",
      stroke: throughVia ? "#dc2626" : "#d97706",
      label: throughVia
        ? "physical through-via reaches bottom"
        : "Repair03 only evaluates top through inner2",
    },
    ...(showsCollision
      ? [
          {
            center: { x: 0, y: 0 },
            radius: 0.28,
            fill: "rgba(220, 38, 38, 0.12)",
            stroke: "#dc2626",
            label: "different-net collision",
          },
        ]
      : []),
  ],
  rects: [
    {
      center: { x: 0, y: 0 },
      width: 3.5,
      height: 1.2,
      fill: "rgba(255, 255, 255, 0)",
      stroke: "#475569",
      label: "four-layer board",
    },
  ],
  points: [],
})

test("captures the default through-via policy mismatch", () => {
  const repair03Errors = new AutoroutingDrcEngine(srj).evaluate(traces).errors
  const exportedVia = convertToCircuitJson(srj, traces).find(
    (element) => element.type === "pcb_via",
  )

  expect(repair03Errors).toEqual([])
  expect(exportedVia).toMatchObject({ layers: ["top", "inner1", "inner2"] })

  const snapshotSvg = getSvgFromGraphicsObject(
    stackGraphicsHorizontally(
      [
        createPanel({ throughVia: true, showsCollision: true }),
        createPanel({ throughVia: false, showsCollision: false }),
      ],
      {
        titles: [
          "Board policy: through-via · DRC",
          "Repair03 today: blind span · no DRC",
        ],
      },
    ),
    { backgroundColor: "white", svgWidth: 2400, svgHeight: 420 },
  ).replace(/[ \t]+$/gm, "")
  const snapshotPath = new URL(
    "./__snapshots__/through-via-policy-repro.snap.svg",
    import.meta.url,
  ).pathname
  if (process.env.BUN_UPDATE_SNAPSHOTS) {
    mkdirSync(dirname(snapshotPath), { recursive: true })
    writeFileSync(snapshotPath, snapshotSvg)
  }
  expect(snapshotSvg).toBe(readFileSync(snapshotPath, "utf8"))
})

test.failing(
  "detects the bottom-layer collision when blind and buried vias are disabled",
  () => {
    expect(new AutoroutingDrcEngine(srj).evaluate(traces).errors).toHaveLength(1)
    expect(
      convertToCircuitJson(srj, traces).find(
        (element) => element.type === "pcb_via",
      ),
    ).toMatchObject({ layers: ["top", "inner1", "inner2", "bottom"] })
  },
)
