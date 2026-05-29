new micro_ml.App();

// const b: Buffer = micro_ml.testing();
// basic.showNumber(b.length)
// basic.showNumber(b.toArray(NumberFormat.Float32LE)[0])
// basic.showNumber(b.toArray(NumberFormat.Float32LE)[1])

namespace micro_ml {
  // let i = 0;

  // evaluate(
  //   Buffer.fromArray([0.5, 0.5]),
  //   1000,
  //   () => {
  //       i++;
  //       basic.showNumber(i)
  //   }
  // )

  // testing(nnSpec, (s: string) => {basic.showString(s);});

  // build_nn(nnSpec, () => {i++; basic.showNumber(i);});

  // function test_1() {
  const nnSpec: NeuralNetworkSpec = {
    datasetSpec: ACCEL_DATASET_SPEC,
    layerDims: [ACCEL_DATASET_SPEC.numFeatures, ACCEL_DATASET_SPEC.numLabels],
    activation_function_enums: [ActivationFunctionEnum.SoftMax],
    epochs: 30,
  };
  // }

  construct_nn(Buffer.fromArray(nnSpec.layerDims), Buffer.fromArray(nnSpec.activation_function_enums), DatasetEnum.ACCEL)

  basic.showNumber(get_biases().length / 4)
  basic.showNumber(get_weights().length / 4)
  
  // const nnTestCB = (resultsBuf: Buffer) => {
  //   const results = resultsBuf.toArray(NumberFormat.Float32LE)
  //
  //   const label: string = results[0].toString().slice(0, 4);
  //   const pred: string = results[1].toString().slice(0, 4);
  //   const confidence: string = results[2].toString().slice(0, 4);
  //   datalogger.logData([
  //     datalogger.createCV("label", label),
  //     datalogger.createCV("pred", pred),
  //     datalogger.createCV("conf", confidence)
  //   ])
  // }

  // train_nn(10, 0.015, () => { })
  // test_nn(nnTestCB)
}
