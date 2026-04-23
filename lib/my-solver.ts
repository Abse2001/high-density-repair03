import { BaseSolver } from "@tscircuit/solver-utils"
import type { GraphicsObject } from "graphics-debug"

export class MySolver extends BaseSolver {
  constructor(private readonly params: Record<string, never> = {}) {
    super()
  }

  override _step() {
    this.solved = true
  }

  override getConstructorParams() {
    return [this.params]
  }

  override visualize(): GraphicsObject {
    return {
      points: [],
      lines: [],
      rects: [],
      circles: [],
      texts: [],
    }
  }
}
