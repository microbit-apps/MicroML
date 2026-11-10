namespace micro_ml {
  import Sensor = sensors.Sensor

  const intraSampleFrequencyMS: number = 100;
  const retriggerDelayMS = 1;

  export class EvaluationScene extends ui.UiScreen {
    private sensors: Sensor[];

    private samplingIntervalID: number;
    private lastSample: number[];
    private lastNNPredLabel: string;

    constructor(runtime: ui.UiRuntime) {
      super(runtime);
    }

    activate() {
      super.activate()

      const uBitSensors: sensors.MicrobitSensors[] = DatasetManager.getSensors();
      this.sensors = uBitSensors.map(s => sensors.getMicrobitSensor(s));

      const inputLen = nn_input_len();
      if (inputLen > 0 && this.sensors.length > 0) {
        const samplesPerAxis = Math.idiv(inputLen, this.sensors.length);
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

    render(surface: ui.DrawSurface) {
      surface.drawBitmap(
        trainingSceneBackground,
        0,
        0
      );


      if (this.lastNNPredLabel !== undefined) {
        const s: string = this.lastSample[0] + ", " + this.lastSample[1] + ", " + this.lastSample[2]

        surface.drawText(
          s,
          HALF_WIDTH - (s.length * bitmaps.font8.charWidth >> 1),
          -20 + HALF_HEIGHT,
          { color: 1, font: bitmaps.font8 }
        )

        surface.drawText(
          this.lastNNPredLabel,
          HALF_WIDTH - (this.lastNNPredLabel.length * bitmaps.font8.charWidth >> 1),
          20 + HALF_HEIGHT,
          { color: 1, font: bitmaps.font8 }
        )
      }

      super.render(surface)
    }
  }
}
