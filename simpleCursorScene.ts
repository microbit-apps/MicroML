namespace micro_ml {
  export class SimpleCursorScene extends ui.UiScreen {
    private actions: ui.UiRow<string>

    constructor(runtime: ui.UiRuntime) {
      super(runtime)

      const bmp = ui.accelerometer
      const control = ui.button<string>("example", { bitmap: bmp }, () => {
        runtime.push(new ExampleScene(runtime))
      })
      control.focusLabel = "Enter ExampleScene"
      control.style = ui.UiButtonStyles.Transparent

      this.actions = new ui.UiRow<string>({
        scopeId: "simple-cursor-actions",
        controls: [control],
        controlSize: { width: bmp.width + 2, height: bmp.height + 2 },
        wrap: true
      })

      this.add(this.actions, { centerX: HALF_WIDTH, centerY: HALF_HEIGHT })
    }

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      switch (event.action) {
        case "cancel": {
          this.runtime.pop()
          return true
        }
      }

      return undefined
    }

    render(surface: ui.DrawSurface) {
      surface.fillRect(
        new ui.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
        12 // purple in default palette
      )

      super.render(surface)
    }
  }
}
