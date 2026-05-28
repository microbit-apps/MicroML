namespace micro_ml {
  //% shim=__micro_ml::construct_nn
  export function construct_nn(layer_dims: Buffer, activation_function_enums: Buffer, dataset_enum: DatasetEnum): void {
    console.log("pxtsim hack")
  }


  //% shim=__micro_ml::train_nn
  export function train_nn(epochs: number, learning_rate: number, lossCB: (l: number) => void): void {
    console.log("pxtsim hack")
  }

  //% shim=__micro_ml::test_nn
  export function test_nn(infoCB: (b: Buffer) => void): Buffer {
    return null;
  }

  //% shim=__micro_ml::save_current_nn
  export function save_current_nn(): boolean {
    return false;
  }

  //% shim=__micro_ml::evaluate
  export function evaluate(input_data: Buffer): number {
    return 0;
  }

  //% shim=__micro_ml::get_weights
  export function get_weights(): Buffer {
    return null;
  }

  //% shim=__micro_ml::get_biases
  export function get_biases(): Buffer {
    return null;
  }


  export function print_debug_info(): void {
    control.heapSnapshot()
    control.gc() // displays stats on hardware
  }
}
