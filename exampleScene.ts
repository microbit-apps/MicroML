namespace micro_ml {
  import Screen = user_interface_base.Screen
  import Scene = user_interface_base.Scene
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font


  /**
  * Use a Scene instead of a CursorScene when you want to
  * control display-shield button behaviour yourself.
  */
  export class ExampleScene extends Scene {
    // layerDims = Buffer.fromArray([30, 16, 2]);
    // afe = Buffer.fromArray([ActivationFunctionEnum.Sigmoid, ActivationFunctionEnum.SoftMax]);
    // epochs = 50
    // learningRate = 0.015
    // trainTestSplit = 0.5
    // training = false
    // accuracy: number = null
    // trainTime: number = null

    constructor(app: AppInterface) {
      super(app)
    }

    // This is called when the Scene 'becomes active'.
    // This happens when the scene ahead is popped, or this is the first one pushed.
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
      //     // this.app.pushScene(new ExampleMicroGUIScene(this.app))
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
      //     this.app.popScene()
      //   }
      // )
    }

    draw() {
      Screen.fillRect(
        Screen.LEFT_EDGE,
        Screen.TOP_EDGE,
        Screen.WIDTH,
        Screen.HEIGHT,
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
      //     Screen.print(
      //       line,
      //       -line.length * font.charWidth >> 1,
      //       -55 + index * (font.charHeight + 1),
      //       15 // Black in the default palette
      //     )
      // })
      //
      // if (!this.training) {
      //   const txt1 = "Press A to start training"
      //   Screen.print(
      //     txt1,
      //     -txt1.length * font.charWidth >> 1,
      //     30,
      //     15 // Black in the default palette
      //   )
      // } else if (this.accuracy === null || this.trainTime === null) {
      //   const txt1 = "model is training..."
      //   Screen.print(
      //     txt1,
      //     -txt1.length * font.charWidth >> 1,
      //     30,
      //     15 // Black in the default palette
      //   )
      // } else {
      //   const trainTimeSec = (this.trainTime / 1000).toString().slice(0, 4)
      //     const info = [
      //       "Trained in " + trainTimeSec + " seconds\n",
      //       "Model accuracy is " + this.accuracy.toString().slice(0, 4) + "%"
      //     ]
      //
      //     info.forEach((line, index) => {
      //         Screen.print(
      //           line,
      //           -line.length * font.charWidth >> 1,
      //           30 + (index * (font.charHeight + 1)),
      //           15 // Black in the default palette
      //         )
      //     })
      //
      // }
      super.draw()
    }
  }
}
