namespace micro_ml {
  /**
  * Use a plain ui.UiScreen (not one with focusable views) when you want to
  * control display-shield button behaviour yourself via handleInput().
  */
  export class TrainingInfo extends ui.UiScreen {
    constructor(runtime: ui.UiRuntime) {
      super(runtime)
    }

    // This is called when the Screen 'becomes active'.
    // This happens when the screen ahead is popped, or this is the first one pushed.
    activate() {
      super.activate()
    }

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      switch (event.action) {
        case "activate": {
          this.runtime.push(new ExampleMicroGUIScene(this.runtime))
          return true
        }
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
        6 // Light blue in the default palette
      )

      const txt1 = "Press A for the next scene"
      surface.drawText(
        txt1,
        HALF_WIDTH - (txt1.length * bitmaps.font8.charWidth >> 1),
        -20 + HALF_HEIGHT,
        { color: 15 } // Blcak in the default palette
      )

      const txt2 = "Press B to go back"
      surface.drawText(
        txt2,
        HALF_WIDTH - (txt2.length * bitmaps.font8.charWidth >> 1),
        20 + HALF_HEIGHT,
        { color: 15 } // Blcak in the default palette
      )

      super.render(surface)
    }
  }
}
