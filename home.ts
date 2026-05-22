namespace example_project {
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
          icon: "linear_graph_1",
          ariaId: "Select me!",
          x: -40,
          y: 25,
          onClick: () => {
            this.app.pushScene(new ExampleScene(this.app))
          },
        }),
        new Button({
          parent: null,
          style: ButtonStyles.Transparent,
          icon: "largeDisk",
          ariaId: "Or select me!",
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
        12 // purple in default palette
      )

      // How we can get bitmaps from assets, which we then draw to the screen:
      const microbitLogo = icons.get("microbitLogo")
      const microdataLogo = icons.get("exampleProjectLogo")

      // This code makes the microdataLogo scroll down from the screen and bounce.
      // You can ignore the specifics of this code:
      this.yOffset = Math.min(0, this.yOffset + 2)
      const t = control.millis()
      const dy = this.yOffset == 0 ? (Math.idiv(t, 800) & 1) - 1 : 0
      const margin = 2
      const OFFSET = (Screen.HEIGHT >> 1) - microdataLogo.height - margin - 9
      const y = Screen.TOP_EDGE + OFFSET

      Screen.drawTransparentImage(
        microdataLogo,
        Screen.LEFT_EDGE + ((Screen.WIDTH - microdataLogo.width) >> 1),
        y + this.yOffset
      )

      Screen.drawTransparentImage(
        microbitLogo,
        Screen.LEFT_EDGE + ((Screen.WIDTH - microbitLogo.width) >> 1),
        y - microdataLogo.height + this.yOffset + margin
      )

      if (!this.yOffset) {
        const flavourText = "Let's make an app!"
        const x = Screen.LEFT_EDGE + ((Screen.WIDTH + microdataLogo.width) >> 1) + dy
                  - (flavourText.length * font.charWidth)
        const y = Screen.TOP_EDGE + OFFSET + microdataLogo.height + dy + this.yOffset + 3
        Screen.print(
          flavourText,
          x,
          y,
          11, // light grey in the default palette
          font
        )
      }

      this.navigator.drawComponents();
      this.drawVersion()
      super.draw()
    }
  }
}
