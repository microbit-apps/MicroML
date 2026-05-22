namespace micro_ml {
  //% shim=__micro_ml::construct_nn
  export function construct_nn(layer_dims: Buffer, activation_function_enums: Buffer, dataset_enum: DatasetEnum, training_split: number): void {

  }

  //% shim=__micro_ml::train_nn
  export function train_nn(epochs: number, learning_rate: number, print_info: boolean = false): void {
  }

  //% shim=__micro_ml::test_nn
  export function test_nn(print_info: boolean = false): number {
    return 0;
  }

  //% shim=__micro_ml::evaluate
  export function evaluate(input_data: Buffer): number {
    return 0;
  }

  export function print_debug_info(): void {
    control.heapSnapshot()
    control.gc() // displays stats on hardware
  }
}
