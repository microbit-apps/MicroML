namespace micro_ml {
  import Screen = user_interface_base.Screen
  import Scene = user_interface_base.Scene
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font
  import Button = user_interface_base.Button
  import CursorScene = user_interface_base.CursorScene
  // import Sensor = sensors.Sensor


  export class EvaluationScene extends Scene {
    // private sensors: Sensor[];

    constructor(app: AppInterface) {
      super(app);
    }

    startup() {

    }

    activate() {
      super.activate()

    }

    draw() {
      Screen.fillRect(
        Screen.LEFT_EDGE,
        Screen.TOP_EDGE,
        Screen.WIDTH,
        Screen.HEIGHT,
        6 // Light blue in the default palette
      )

      super.draw()
    }
  }
}

