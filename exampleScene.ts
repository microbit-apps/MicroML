namespace micro_ml {
  export class ExampleScene extends ui.UiScreen {
    // layerDims = Buffer.fromArray([30, 16, 2]);
    // afe = Buffer.fromArray([ActivationFunctionEnum.Sigmoid, ActivationFunctionEnum.SoftMax]);
    // epochs = 50
    // learningRate = 0.015
    // trainTestSplit = 0.5
    // training = false
    // accuracy: number = null
    // trainTime: number = null

    constructor(runtime: ui.UiRuntime) {
      super(runtime)
    }

    // This is called when the Screen 'becomes active'.
    // This happens when the screen ahead is popped, or this is the first one pushed.
    activate() {
      super.activate()

      // const layer_dims = Buffer.fromArray([2, 3, 2]);
      // const afe = Buffer.fromArray([ActivationFunctionEnum.Sigmoid, ActivationFunctionEnum.SoftMax]);
      //
      // construct_nn(layer_dims, afe, DatasetEnum.XOR, 1.0);

      // construct_nn(this.layerDims, this.afe, DatasetEnum.ACCEL, this.trainTestSplit);
      // train_nn(this.epochs, this.learningRate, false);
      //
      // // Setup display-shield buttons yourself
      // control.onEvent(
      //   ControllerButtonEvent.Pressed,
      //   controller.A.id,
      //   () => {
      //     // this.runtime.push(new ExampleMicroGUIScene(this.runtime))
      //
      //     const startTime = control.millis();
      //     this.training = true;
      //     this.accuracy = test_nn(true) * 100;
      //     this.trainTime = control.millis() - startTime
      //   }
      // )
      //
      // control.onEvent(
      //   ControllerButtonEvent.Pressed,
      //   controller.B.id,
      //   () => {
      //     this.runtime.pop()
      //   }
      // )
    }

    render(surface: ui.DrawSurface) {
      surface.fillRect(
        new ui.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
        6 // Light blue in the default palette
      )

      // let layers = "";
      // for (let i = 0; i < this.layerDims.length; i++) {
      //   layers += this.layerDims.getNumber(NumberFormat.UInt8LE, i).toString() + (i === this.layerDims.length - 1 ? "" : "->");
      // }
      //
      // let afes = "";
      // for (let i = 0; i < this.afe.length; i++) {
      //     switch (this.afe.getNumber(NumberFormat.UInt8LE, i)) {
      //       case ActivationFunctionEnum.ReLU: {afes += "ReLU "; break;}
      //       case ActivationFunctionEnum.Sigmoid: {afes += "Sigmoid "; break;}
      //       case ActivationFunctionEnum.Tanh: {afes += "Tanh "; break;}
      //       case ActivationFunctionEnum.SoftMax: {afes += "SoftMax "; break;}
      //       default: afes += "Unknown AF ";
      //     }
      //   afes += (i === this.afe.length - 1 ? "" : "->");
      // }
      //
      // const modelInfo: string[] = [
      //   "Model architecture:",
      //   layers,
      //   "Activation functions:",
      //   afes,
      //   "Epochs: " + this.epochs,
      //   "Learning rate: " + this.learningRate,
      //   "Train-test split: " + (this.trainTestSplit * 100) + "%"
      // ];
      //
      // modelInfo.forEach((line, index) => {
      //     surface.drawText(
      //       line,
      //       HALF_WIDTH - line.length * bitmaps.font8.charWidth >> 1,
      //       -55 + HALF_HEIGHT + index * (bitmaps.font8.charHeight + 1),
      //       { color: 15 } // Black in the default palette
      //     )
      // })
      //
      // if (!this.training) {
      //   const txt1 = "Press A to start training"
      //   surface.drawText(
      //     txt1,
      //     HALF_WIDTH - txt1.length * bitmaps.font8.charWidth >> 1,
      //     30 + HALF_HEIGHT,
      //     { color: 15 } // Black in the default palette
      //   )
      // } else if (this.accuracy === null || this.trainTime === null) {
      //   const txt1 = "model is training..."
      //   surface.drawText(
      //     txt1,
      //     HALF_WIDTH - txt1.length * bitmaps.font8.charWidth >> 1,
      //     30 + HALF_HEIGHT,
      //     { color: 15 } // Black in the default palette
      //   )
      // } else {
      //   const trainTimeSec = (this.trainTime / 1000).toString().slice(0, 4)
      //     const info = [
      //       "Trained in " + trainTimeSec + " seconds\n",
      //       "Model accuracy is " + this.accuracy.toString().slice(0, 4) + "%"
      //     ]
      //
      //     info.forEach((line, index) => {
      //         surface.drawText(
      //           line,
      //           HALF_WIDTH - line.length * bitmaps.font8.charWidth >> 1,
      //           30 + HALF_HEIGHT + (index * (bitmaps.font8.charHeight + 1)),
      //           { color: 15 } // Black in the default palette
      //         )
      //     })
      //
      // }
      super.render(surface)
    }
  }
}
