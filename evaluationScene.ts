namespace micro_ml {
  import Screen = user_interface_base.Screen
  import Scene = user_interface_base.Scene
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font
  import Button = user_interface_base.Button
  import CursorScene = user_interface_base.CursorScene
  import Sensor = sensors.Sensor

  const intraSampleFrequencyMS: number = 100;
  const intraSampleQuantity: number = 10;
  const sampleFrequencyMS: number = (intraSampleFrequencyMS * intraSampleFrequencyMS) - 1000 + 100;

  export class EvaluationScene extends Scene {
    private sensors: Sensor[];

    private samplingIntervalID: number;
    private lastSample: number[];
    private lastNNPredLabel: string;

    constructor(app: AppInterface) {
      super(app);
    }

    startup() {
      super.startup()
    }

    activate() {
      super.activate()

      const uBitSensors: sensors.MicrobitSensors[] = DatasetManager.getSensors();
      this.sensors = uBitSensors.map(s => sensors.getMicrobitSensor(s));

      this.samplingIntervalID = control.setInterval(
          () => {
              this.lastSample = sensors.getSamples(this.sensors, intraSampleQuantity, intraSampleFrequencyMS);
              const pred = evaluate_nn(Buffer.fromArray(this.lastSample));
              this.lastNNPredLabel = DatasetManager.getLabelNameFromPred(pred);
          }, 
          sampleFrequencyMS,
          control.IntervalMode.Interval
      );
    }

    deactivate(): void {
      super.deactivate()
      control.clearInterval(this.samplingIntervalID, control.IntervalMode.Interval)
    }

    draw() {
      Screen.drawTransparentImage(
        trainingSceneBackground,
        -Screen.HALF_WIDTH,
        -Screen.HALF_HEIGHT
      );


      const s: string = this.lastSample[0] + ", " + this.lastSample[1] + ", " + this.lastSample[2]

      Screen.print(
        s,
        0 - (s.length * font.charWidth >> 1),
        -20
      )

      if (this.lastNNPredLabel !== undefined) {
        Screen.print(
          this.lastNNPredLabel,
          0 - (this.lastNNPredLabel.length * font.charWidth >> 1),
          20
        )
      }

      super.draw()
    }
  }
}

