namespace micro_ml {
  import Screen = user_interface_base.Screen
  import Scene = user_interface_base.Scene
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font
  import Button = user_interface_base.Button
  import CursorScene = user_interface_base.CursorScene


  enum TestingSceneState {
    Start,
    Testing,
    Done
  }

  export class TestingScene extends Scene {
    private currentIdx: number;
    private testResults: string[];
    private state: TestingSceneState;
    private maxTestResultsOnScreen = 10;

    constructor(app: AppInterface) {
      super(app);
    }

    startup() {
      super.startup()
    }

    activate() {
      super.activate()
      this.currentIdx = 0;
      this.state = TestingSceneState.Start;
      this.testResults = [];

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.A.id,
        () => {
          // this.app.popScene()
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.B.id,
        () => {
          if (this.state !== TestingSceneState.Testing) {
            this.app.popScene();
          }
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.up.id,
        () => {
          this.currentIdx = Math.max(0, this.currentIdx - 1);
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.down.id,
        () => {
          this.currentIdx = Math.min(this.currentIdx + 1, this.testResults.length - this.maxTestResultsOnScreen)
        }
      )

      const nnTestCB = (resultsBuf: Buffer) => {
        const results = resultsBuf.toArray(NumberFormat.Float32LE)

        const label: string = results[0].toString().slice(0, 4);
        const pred: string = results[1].toString().slice(0, 4);
        const confidence: string = results[2].toString().slice(0, 4);
        this.testResults.push((this.testResults.length + 1) + ": L: " + label + " P: " + pred + " C: " + confidence);
      };

      this.state = TestingSceneState.Testing;
      test_nn(nnTestCB)
      this.state = TestingSceneState.Done;
    }

    drawTestResults() {
      const lines = this.testResults.slice(this.currentIdx, this.currentIdx + this.maxTestResultsOnScreen);
      lines.forEach((line, i) => {
        Screen.print(
          line,
          Screen.LEFT_EDGE + 2,
          Screen.TOP_EDGE + (i * 10),
          15 // Black in the default palette
        );
      })
    }

    draw() {
      Screen.fillRect(
        Screen.LEFT_EDGE,
        Screen.TOP_EDGE,
        Screen.WIDTH,
        Screen.HEIGHT,
        6
      )
      this.drawTestResults();
    }
  }
}
