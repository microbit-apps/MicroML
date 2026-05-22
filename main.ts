// new example_project.App();
namespace micro_ml {
  serial.setBaudRate(115200)
  serial.redirectToUSB()

  const debug_info_on = false

  // const layer_dims = Buffer.fromArray([2, 3, 2]);
  // const afe = Buffer.fromArray([ActivationFunctionEnum.Sigmoid, ActivationFunctionEnum.SoftMax]);
  //
  // construct_nn(layer_dims, afe, DatasetEnum.XOR, 1.0);

  const layer_dims = Buffer.fromArray([30, 16, 2]);
  const afe = Buffer.fromArray([ActivationFunctionEnum.Sigmoid, ActivationFunctionEnum.SoftMax]);

  construct_nn(layer_dims, afe, DatasetEnum.ACCEL, 0.5);
  train_nn(50, 0.015, debug_info_on);

  let accuracy = test_nn(true);
  basic.showNumber(accuracy);
}
