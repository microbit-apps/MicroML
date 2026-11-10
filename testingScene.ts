namespace micro_ml {
  enum TestingSceneState {
    Start,
    Testing,
    Done
  }

  export class TestingScene extends ui.UiScreen {
    private currentIdx: number;
    private testResults: string[][];
    private state: TestingSceneState;
    private maxTestResultsOnScreen = 10;
    private accuracyAsStr: string;
    private prediction: number;
    private confusionMatrix: number[];

    constructor(runtime: ui.UiRuntime) {
      super(runtime);
    }

    activate() {
      super.activate()
      this.currentIdx = 0;
      this.state = TestingSceneState.Start;
      this.testResults = [];

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

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      switch (event.action) {
        case "activate": {
          this.runtime.pop()
          return true
        }
        case "cancel": {
          if (this.state !== TestingSceneState.Testing) {
            this.runtime.pop();
          }
          return true
        }
        case "up": {
          this.currentIdx = Math.max(0, this.currentIdx - 1);
          return true
        }
        case "down": {
          this.currentIdx = Math.min(this.currentIdx + 1, this.testResults.length - this.maxTestResultsOnScreen)
          return true
        }
      }

      return undefined
    }

    drawTestResults(surface: ui.DrawSurface) {
      const cols = ["ID", "Label", "Pred", "Conf."];

      const rows: string[][] = [
        cols
      ].concat(
        this.testResults.slice(this.currentIdx, this.currentIdx + this.maxTestResultsOnScreen - 1)
      );

      const xMargin: number = 9;
      const xSpacing = (SCREEN_WIDTH - xMargin) / cols.length
      const ySpacing = 10;
      rows.forEach((row: string[], rowIdx: number) => {
        row.forEach((cols: string, colIdx: number) => {
          surface.drawText(
            cols,
            xMargin + (colIdx * xSpacing),
            rowIdx * ySpacing,
            { color: 15 } // Black in the default palette
          );
        })
      })

      const accuracyStr = `Acc: ${this.accuracyAsStr}%`
      surface.drawText(
        accuracyStr,
        HALF_WIDTH - (bitmaps.font8.charWidth * accuracyStr.length >> 1),
        SCREEN_HEIGHT - 10,
        { color: 15 } // Black in the default palette
      );
    }

    render(surface: ui.DrawSurface) {
      surface.fillRect(
        new ui.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
        6
      )

      if (this.state == TestingSceneState.Done) {
        this.drawTestResults(surface);
      }
    }
  }
}
