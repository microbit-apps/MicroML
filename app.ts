/**
* Define a namespace for your project
* so you don't have to prepend it to everything.
*/
namespace micro_ml {
  export const runtime = new ui.UiRuntime(new ui.DisplayShieldFrameAdapter(), new AppAssets())

  export class App {
    constructor() {
      // One interval delay to ensure all static constructors have executed.
      basic.pause(5)

      // Progress to the next screen if the arcade shield is present:
      if (shieldhelpers.shieldPresent()) {
        runtime.push(new micro_ml.Home(runtime))
        runtime.start()
      }
    }
  }

  export const SCREEN_WIDTH = ui.STANDARD_DISPLAY_WIDTH
  export const SCREEN_HEIGHT = ui.STANDARD_DISPLAY_HEIGHT
  export const HALF_WIDTH = SCREEN_WIDTH >> 1
  export const HALF_HEIGHT = SCREEN_HEIGHT >> 1

  // Replicates ui-controls' focus ring geometry (button.ts renderFocus) so
  // screens that used the old cursor's green outline can overpaint it:
  export function drawFocusRing(surface: ui.DrawSurface, rect: ui.Rect, color: number): void {
    const left = rect.x
    const top = rect.y
    const right = rect.x + rect.width - 1
    const bottom = rect.y + rect.height - 1
    const thickness = 3
    for (let dist = 1; dist <= thickness; dist++) {
      surface.drawLine(left - dist, top, left - dist, bottom, color)
      surface.drawLine(right + dist, top, right + dist, bottom, color)
      surface.drawLine(left, top - dist, right, top - dist, color)
      surface.drawLine(left, bottom + dist, right, bottom + dist, color)
      if (dist > 1) {
        surface.drawLine(left - dist, top, left, top - dist, color)
        surface.drawLine(right + dist, top, right, top - dist, color)
        surface.drawLine(left - dist, bottom, left, bottom + dist, color)
        surface.drawLine(right + dist, bottom, right, bottom + dist, color)
      }
    }
  }

  // Focus target ids are registered as "<scopeId>/<controlId>"; resolve the
  // active target back to its control id (undefined when not from this scope):
  export function focusedControlId(scopeId: string, focus: ui.UiFocusState): string {
    const targetId = focus.getActiveTargetId()
    if (targetId === undefined) return undefined
    const prefix = scopeId + "/"
    if (targetId.length > prefix.length && targetId.slice(0, prefix.length) == prefix)
      return targetId.slice(prefix.length)
    return undefined
  }

  export function drawFocusedRing(surface: ui.DrawSurface, row: ui.UiRow<any>, focus: ui.UiFocusState, color: number): void {
    const controlId = focusedControlId(row.scopeId, focus)
    if (controlId === undefined) return
    const rect = new ui.Rect(0, 0, 0, 0)
    if (!row.getControlRect(controlId, rect)) return
    drawFocusRing(surface, rect, color)
    drawFocusLabel(surface, row, controlId, rect)
  }

  // Mirrors ui-controls' label rendering (button.ts renderFocus) so the label
  // bar lands on top of the overpainted ring: (bitmap, ring, label).
  function drawFocusLabel(surface: ui.DrawSurface, row: ui.UiRow<any>, controlId: string, rect: ui.Rect): void {
    const controls = row.controls
    let text: string = undefined
    for (let i = 0; i < controls.length; i++) {
      if (controls[i].id == controlId) {
        text = controls[i].focusLabel
        break
      }
    }
    if (!text || !text.length) return

    const font = bitmaps.font8
    const textWidth = font.charWidth * text.length
    const textHeight = font.charHeight
    const padding = 1
    const centerX = rect.x + (rect.width >> 1)
    const labelTop = rect.y + rect.height + 4
    const x = Math.max(padding, Math.min(SCREEN_WIDTH - padding - textWidth, centerX - (textWidth >> 1)))
    const y = Math.max(padding, Math.min(SCREEN_HEIGHT - padding - textHeight, labelTop))
    surface.fillRect(new ui.Rect(x - padding, y - padding, textWidth + padding * 2, textHeight + padding * 2), 15)
    surface.drawText(text, x, y, { color: 1 })
  }
}
