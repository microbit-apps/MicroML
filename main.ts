namespace micro_ml {
  new App();

  // // const b: Buffer = micro_ml.testing();
  // // basic.showNumber(b.length)
  // // basic.showNumber(b.toArray(NumberFormat.Float32LE)[0])
  // // basic.showNumber(b.toArray(NumberFormat.Float32LE)[1])
  //
  // // let i = 0;
  //
  // // evaluate(
  // //   Buffer.fromArray([0.5, 0.5]),
  // //   1000,
  // //   () => {
  // //       i++;
  // //       basic.showNumber(i)
  // //   }
  // // )
  //
  // // testing(nnSpec, (s: string) => {basic.showString(s);});
  //
  // // build_nn(nnSpec, () => {i++; basic.showNumber(i);});
  //
  // // function test_1() {
  //
  //
  // const nnSpec: NeuralNetworkSpec = {
  //   datasetSpecIdx: 1,
  //   layerDims: [ACCEL_DATASET.datasetSpec.numFeatures, 3, ACCEL_DATASET.datasetSpec.numLabels],
  //   activation_function_enums: [ActivationFunctionEnum.Sigmoid, ActivationFunctionEnum.SoftMax],
  //   epochs: 5,
  // };
  //
  // // data collection:
  //
  // // const uBitSensors: sensors.MicrobitSensors[] = DatasetManager.getSensors();
  // // const s: sensors.Sensor[] = uBitSensors.map(s => sensors.getMicrobitSensor(s));
  //
  // // DatasetManager.currentDataset.features = [];
  // // DatasetManager.currentDataset.labels = [];
  //
  // // datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
  // //
  // // const add = (label: number) => {
  // //   const sample = sensors.getSamples(s, nnSpec.layerDims[0], 100);
  // //   const str: string = `${sample[0]}, ${sample[1]}, ${sample[2]}`;
  // //
  // //   theScreen.fill(0);
  // //   theScreen.print("" + DatasetManager.currentDataset.labels.length, (theScreen.width - 2) >> 1, 40, 1);
  // //   theScreen.print(str, (theScreen.width - (str.length * bitmaps.font8.charWidth)) >> 1, theScreen.height >> 1, 1);
  // //
  // //   DatasetManager.currentDataset.features.push(sample);
  // //   DatasetManager.currentDataset.labels.push(label);
  // //
  // //   const samplePlusLabel = sample.concat([label]);
  // //   const row = samplePlusLabel.map((v: number, i: number) => datalogger.createCV("c" + (i + 1), v));
  // //   datalogger.logData(row)
  // //   basic.showString("W")
  // // }
  // //
  // // input.onButtonPressed(Button.A, () => {
  // //   basic.showNumber(0)
  // //   add(0);
  // // })
  // //
  // // input.onButtonPressed(Button.B, () => {
  // //   basic.showNumber(1)
  // //   add(1);
  // // })
  // //
  // // let done = false;
  // // input.onButtonPressed(Button.AB, () => {
  // //   done = true;
  // // })
  // //
  // // basic.showString("S")
  // // while (!done) {
  // //   basic.pause(50);
  // // }
  // // basic.showString("D")
  //
  // construct_nn(Buffer.fromArray(nnSpec.layerDims), Buffer.fromArray(nnSpec.activation_function_enums), DatasetEnum.ACCEL);
  // print_nn_over_serial();
  //
  // let lastLoss;
  // const lCB = (loss: number) => { lastLoss = loss }
  // train_nn(nnSpec.epochs, 0.15, lCB);
  //
  // let testResults: string[][] = [];
  // const nnTestCB = (resultsBuf: Buffer) => {
  //   const results = resultsBuf.toArray(NumberFormat.Float32LE);
  //
  //   const label: string = results[0].toString().slice(0, 4);
  //   const pred: string = results[1].toString().slice(0, 4);
  //   const confidence: string = results[2].toString().slice(0, 4);
  //   testResults.push(["" + (testResults.length + 1), label, pred, confidence]);
  // };
  //
  // const accuracyAsStr = test_nn(nnTestCB).toArray(NumberFormat.Float32LE)[0].toString().slice(0, 4);
  // basic.showString(accuracyAsStr);
  //
  // // let i = 0;
  // // const intervalID = control.setInterval(
  // //   () => {
  // //     const sample = sensors.getSamples(s, (nnSpec.layerDims[0] / s.length), 100);
  // //     const pred = evaluate_nn(Buffer.fromArray(sample));
  // //     const predLabel = DatasetManager.getLabelNameFromPred(pred);
  // //     const str: string = `${sample[0]}, ${sample[1]}, ${sample[2]} = ${predLabel}`;
  // //
  // //     theScreen.fill(0)
  // //     theScreen.print("" + (i++), (theScreen.width - 2) >> 1, 40, 1)
  // //     theScreen.print(str, (theScreen.width - (str.length * bitmaps.font8.charWidth)) >> 1, theScreen.height >> 1, 1)
  // //
  // //     const row = sample.concat([pred]).map((v: number, i: number) => datalogger.createCV("c" + (i + 1), v));
  // //     datalogger.logData(row);
  // //   },
  // //   500,
  // //   control.IntervalMode.Interval
  // // );
  //
  //
  // const labels: number[] = [0,1,1,1,0,0];
  //
  // const features: number[][] = [
  //   [
  //     0,0,-992,4,4,-992,4,8,-996
  //   ],
  //   [
  //     1836,-2040,-1936,-1452,2040,-284,884,-1468,-2040
  //   ],
  //   [
  //     -760,1164,-2040,-536,848,544,-160,476,-2040
  //   ],
  //   [
  //     -708,368,-12,-700,764,-988,-584,504,404
  //   ],
  //   [
  //     4,-8,-1004,8,-8,-1000,4,-4,-1000
  //   ],
  //   [
  //     8,0,-1000,0,8,-1000,-4,-4,-1008
  //   ],
  // ];
  //
  // theScreen.fill(0)
  // for (let i = 0; i < 6; i++) {
  //   print_nn_over_serial();
  //   // printf("Input features:\n");
  //   // for (int j = 0; j < ACCEL_DATA_POINT_NUM_FEATURES; j++) {
  //   //   printf("%d ", (int)features[i][j]);
  //   // }
  //
  //   // const str1: string = `X ${features[i][0]}, Y ${features[i][1]}, Z ${features[i][2]}`
  //   const str2: string = `I: ${i}, L: ${labels[i]}, P: ${evaluate_nn(Buffer.fromArray(features[i]))}`;
  //   // theScreen.print("" + (i+1), (theScreen.width - 2) >> 1, 10, 1)
  //   // theScreen.print(str1, (theScreen.width - (str1.length * bitmaps.font8.charWidth)) >> 1, 30, 1)
  //   theScreen.print(str2, (theScreen.width - (str2.length * bitmaps.font8.charWidth)) >> 1, 5 + (i * 10), 1);
  //   // basic.pause(1000);
  // }
  //
  // while (1) {
  //   basic.pause(10);
  // }
  //
  // // function test_1() {
  // // const nnSpec: NeuralNetworkSpec = {
  // //   datasetSpec: ACCEL_DATASET_SPEC,
  // //   layerDims: [ACCEL_DATASET_SPEC.numFeatures, ACCEL_DATASET_SPEC.numLabels],
  // //   activation_function_enums: [ActivationFunctionEnum.SoftMax],
  // //   epochs: 30,
  // // };
  // //
  // // construct_nn(Buffer.fromArray(nnSpec.layerDims), Buffer.fromArray(nnSpec.activation_function_enums), DatasetEnum.ACCEL)
  // //
  // // basic.showNumber(get_biases().length / 4)
  // // basic.showNumber(get_weights().length / 4)
  //
  // // const nnTestCB = (resultsBuf: Buffer) => {
  // //   const results = resultsBuf.toArray(NumberFormat.Float32LE)
  // //
  // //   const label: string = results[0].toString().slice(0, 4);
  // //   const pred: string = results[1].toString().slice(0, 4);
  // //   const confidence: string = results[2].toString().slice(0, 4);
  // //   datalogger.logData([
  // //     datalogger.createCV("label", label),
  // //     datalogger.createCV("pred", pred),
  // //     datalogger.createCV("conf", confidence)
  // //   ])
  // // }
  //
  // // train_nn(10, 0.015, () => { })
  // // test_nn(nnTestCB)
}
