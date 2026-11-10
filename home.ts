namespace micro_ml {
  export class Home extends ui.UiScreen {
    /** Used by draw for examplelogo visual effect **/
    private yOffset = -SCREEN_HEIGHT >> 1
    private actions: ui.UiRow<string>

    constructor(runtime: ui.UiRuntime) {
      super(runtime)

      const action = (id: string, bitmap: Bitmap, focusLabel: string, onActivate: () => void): ui.UiRowControl<string> => {
        const control = ui.button<string>(id, { bitmap }, onActivate)
        control.focusLabel = focusLabel
        control.style = ui.UiButtonStyles.Transparent
        return control
      }

      this.actions = new ui.UiRow<string>({
        scopeId: "home-actions",
        controls: [
          action("train", icons.get("neuralNetwork1"), "Train", () => {
            runtime.push(new TrainingScene(runtime))
          }),
          action("test", icons.get("linearGraph3"), "Test", () => {
            if (nn_is_init()) { // TODO: Should tell the user to train it, for now just do nothing
              runtime.push(new TestingScene(runtime))
            }
          }),
          action("evaluate", icons.get("sampleHeadsOrTails"), "Evaluate", () => {
            if (nn_is_init()) { // TODO: Should tell the user to train it, for now just do nothing
              runtime.push(new EvaluationScene(runtime))
            }
          }),
          action("build-dataset", ui.largeDisk, "Build a dataset", () => {
          })
        ],
        controlSize: { width: 34, height: 34 },
        gap: 6,
        wrap: true
      })

      this.add(this.actions, { centerX: HALF_WIDTH, centerY: 85 })
    }

    private drawVersion(surface: ui.DrawSurface) {
      const font = bitmaps.font5
      const text = "v0.0.1"
      surface.drawText(
        text,
        SCREEN_WIDTH - (font.charWidth * text.length),
        SCREEN_HEIGHT - font.charHeight - 2,
        { color: 11, font: font } // light grey in the default palette
      )
    }

    render(surface: ui.DrawSurface) {
      surface.fillRect(
        new ui.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
        0xc
      )


      const microbitLogo = icons.get("microbitLogo")
      const wordLogo = icons.get("microMLLogo")

      this.yOffset = Math.min(0, this.yOffset + 2)
      const t = control.millis()
      const dy = this.yOffset == 0 ? (Math.idiv(t, 800) & 1) - 1 : 0
      const margin = 2
      const OFFSET = (SCREEN_HEIGHT >> 1) - wordLogo.height - margin - 9

      surface.drawBitmap(
        wordLogo,
        ((SCREEN_WIDTH - wordLogo.width) >> 1) + dy,
        OFFSET + dy + this.yOffset
      )

      surface.drawBitmap(
        microbitLogo,
        ((SCREEN_WIDTH - microbitLogo.width) >> 1) + dy,
        OFFSET + dy + this.yOffset - wordLogo.height + margin
      )

      if (!this.yOffset) {
        const tagline = "on device ML"
        surface.drawText(
          tagline,
          ((SCREEN_WIDTH + wordLogo.width) >> 1) +
          dy -
          bitmaps.font8.charWidth * tagline.length,
          OFFSET +
          wordLogo.height +
          dy +
          this.yOffset +
          1,
          { color: 11 } // light grey in the default palette
        )
      }

      this.drawVersion(surface)
      super.render(surface)
    }
  }
}
