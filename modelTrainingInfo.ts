namespace micro_ml {
  import Screen = user_interface_base.Screen
  import Scene = user_interface_base.Scene
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font


  /**
  * Use a Scene instead of a CursorScene when you want to
  * control display-shield button behaviour yourself.
  */
  export class TrainingInfo extends Scene {
    constructor(app: AppInterface) {
      super(app)
    }

    // This is called when the Scene 'becomes active'.
    // This happens when the scene ahead is popped, or this is the first one pushed.
    activate() {
      super.activate()
      // Setup display-shield buttons yourself
      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.A.id,
        () => {
          this.app.pushScene(new ExampleMicroGUIScene(this.app))
        }
      )

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
        6 // Light blue in the default palette
      )

      const txt1 = "Press A for the next scene"
      Screen.print(
        txt1,
        -txt1.length * font.charWidth >> 1,
        -20,
        15 // Blcak in the default palette
      )

      const txt2 = "Press B to go back"
      Screen.print(
        txt2,
        -txt2.length * font.charWidth >> 1,
        20,
        15 // Blcak in the default palette
      )

      super.draw()
    }
  }
}
