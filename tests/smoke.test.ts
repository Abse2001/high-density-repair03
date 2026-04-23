import { describe, expect, test } from "bun:test"
import { MySolver } from "../lib/my-solver"

describe("MySolver", () => {
  test("solves in a single step", () => {
    const solver = new MySolver()

    solver.step()

    expect(solver.solved).toBe(true)
  })
})
