namespace micro_ml {
  import Screen = user_interface_base.Screen
  import Scene = user_interface_base.Scene
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font
  import Button = user_interface_base.Button
  import CursorScene = user_interface_base.CursorScene
  import Sensor = sensors.Sensor

  const intraSampleFrequencyMS: number = 100;

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

      const inputLen = nn_input_len();
      if (inputLen > 0 && this.sensors.length > 0) {
        const samplesPerAxis = Math.idiv(inputLen, this.sensors.length);
        const retriggerDelayMS = 1;
        this.samplingIntervalID = control.setInterval(
          () => {
            this.lastSample = sensors.getSamples(this.sensors, samplesPerAxis, intraSampleFrequencyMS);
            const pred = evaluate_nn(packFloat32s(this.lastSample));
            this.lastNNPredLabel = DatasetManager.getLabelNameFromPred(pred);
          },
          retriggerDelayMS,
          control.IntervalMode.Interval
        );
      }
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


      if (this.lastNNPredLabel !== undefined) {
        const s: string = this.lastSample[0] + ", " + this.lastSample[1] + ", " + this.lastSample[2]

        Screen.print(
          s,
          0 - (s.length * font.charWidth >> 1),
          -20
        )

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

