namespace micro_ml {
  import Screen = user_interface_base.Screen
  import CursorScene = user_interface_base.CursorScene
  import Button = user_interface_base.Button
  import ButtonStyles = user_interface_base.ButtonStyles
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font

  export class Home extends CursorScene {
    /** Used by draw for examplelogo visual effect **/
    private yOffset = -Screen.HEIGHT >> 1

    constructor(app: AppInterface) {
      super(app)
    }

    /* override */
    startup() {
      super.startup()
      this.navigator.setBtns([[
        new Button({
            parent: null,
            style: ButtonStyles.Transparent,
            icon: "neuralNetwork1",
            ariaId: "Train a model",
            x: -40,
            y: 25,
            onClick: () => {
                this.app.pushScene(new TrainingScene(this.app))
            },
        }),
        new Button({
            parent: null,
            style: ButtonStyles.Transparent,
            icon: "linearGraph3",
            ariaId: "Test a model",
            x: 0,
            y: 25,
            onClick: () => {
                this.app.pushScene(new TestingScene(this.app))
            },
        }),
        new Button({
          parent: null,
          style: ButtonStyles.Transparent,
          icon: "largeDisk",
          ariaId: "Build a dataset",
          x: 40,
          y: 25,
          onClick: () => {
            this.app.pushScene(new SimpleCursorScene(this.app))
          },
        })
      ]])
    }

    private drawVersion() {
      const font = bitmaps.font5
      const text = "v0.0.1"
      Screen.print(
        text,
        Screen.RIGHT_EDGE - (font.charWidth * text.length),
        Screen.BOTTOM_EDGE - font.charHeight - 2,
        11, // light grey in the default palette
        font
      )
    }

    draw() {
      Screen.fillRect(
        Screen.LEFT_EDGE,
        Screen.TOP_EDGE,
        Screen.WIDTH,
        Screen.HEIGHT,
        0xc
      )


      const microbitLogo = icons.get("microbitLogo")
      const wordLogo = icons.get("microMLLogo")

      this.yOffset = Math.min(0, this.yOffset + 2)
      const t = control.millis()
      const dy = this.yOffset == 0 ? (Math.idiv(t, 800) & 1) - 1 : 0
      const margin = 2
      const OFFSET = (Screen.HEIGHT >> 1) - wordLogo.height - margin - 9
      const y = Screen.TOP_EDGE + OFFSET + dy


      Screen.drawTransparentImage(
        wordLogo,
        Screen.LEFT_EDGE + ((Screen.WIDTH - wordLogo.width) >> 1) + dy,
        y + this.yOffset
      )

      Screen.drawTransparentImage(
        microbitLogo,
        Screen.LEFT_EDGE +
        ((Screen.WIDTH - microbitLogo.width) >> 1) +
        dy,
        y - wordLogo.height + this.yOffset + margin
      )

      if (!this.yOffset) {
        const tagline = "on device ML"
        Screen.print(
          tagline,
          Screen.LEFT_EDGE +
          ((Screen.WIDTH + wordLogo.width) >> 1) +
          dy -
          font.charWidth * tagline.length,
          Screen.TOP_EDGE +
          OFFSET +
          wordLogo.height +
          dy +
          this.yOffset +
          1,
          11,
          font
        )
      }

      this.navigator.drawComponents()
      this.drawVersion()
      super.draw()
    }
  }
}
