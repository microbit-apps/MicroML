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
    private testResults: string[][];
    private state: TestingSceneState;
    private maxTestResultsOnScreen = 10;
    private accuracyAsStr: string;
    private prediction: number;
    private confusionMatrix: number[];

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
          this.app.popScene()
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
        this.testResults.push([""+(this.testResults.length + 1), label, pred, confidence]);
      };

      this.state = TestingSceneState.Testing;
      this.accuracyAsStr = test_nn(nnTestCB).toArray(NumberFormat.Float32LE)[0].toString().slice(0, 4);
      this.state = TestingSceneState.Done;
    }

    drawTestResults() {
      const cols = ["ID", "Label", "Pred", "Conf."];

      const rows: string[][] = [
        cols
      ].concat(
        this.testResults.slice(this.currentIdx, this.currentIdx + this.maxTestResultsOnScreen - 1)
      );

      const xMargin: number = 9;
      const xSpacing = (Screen.WIDTH - xMargin) / cols.length
      const ySpacing = 10;
      rows.forEach((row: string[], rowIdx: number) => {
        row.forEach((cols: string, colIdx: number) => {
          Screen.print(
            cols,
            Screen.LEFT_EDGE + xMargin + (colIdx * xSpacing),
            Screen.TOP_EDGE + (rowIdx * ySpacing),
            15 // Black in the default palette
          );
        })
      })

      const accuracyStr = `Acc: ${this.accuracyAsStr}%`
      Screen.print(
        accuracyStr,
        0 - (font.charWidth * accuracyStr.length >> 1),
        Screen.BOTTOM_EDGE - 10,
        15 // Black in the default palette
      );
    }

    draw() {
      Screen.fillRect(
        Screen.LEFT_EDGE,
        Screen.TOP_EDGE,
        Screen.WIDTH,
        Screen.HEIGHT,
        6
      )

      if (this.state == TestingSceneState.Done) {
        this.drawTestResults();
      }
    }
  }
}
