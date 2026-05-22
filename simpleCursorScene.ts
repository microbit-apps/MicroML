namespace micro_ml {
  import Screen = user_interface_base.Screen
  import CursorScene = user_interface_base.CursorScene
  import Button = user_interface_base.Button
  import ButtonStyles = user_interface_base.ButtonStyles
  import AppInterface = user_interface_base.AppInterface

  export class SimpleCursorScene extends CursorScene {
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
          icon: "accelerometer",
          ariaId: "Enter ExampleScene",
          x: 0,
          y: 0,
          onClick: () => {
            this.app.pushScene(new ExampleScene(this.app))
          },
        })
      ]])
    }

    activate() {
        super.activate()
        control.onEvent(
            ControllerButtonEvent.Pressed,
            controller.B.id,
            () => {
                this.app.popScene()
            }
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

      this.navigator.drawComponents();
      super.draw()
    }
  }
}
