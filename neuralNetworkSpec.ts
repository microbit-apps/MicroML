namespace micro_ml {
  // This import is really just a convenience to avoid having to prepend user_interface_base
  // Extensions and files are included when you list them inside pxt.json
  import AppInterface = user_interface_base.AppInterface
  import Scene = user_interface_base.Scene
  import SceneManager = user_interface_base.SceneManager


  enum DataOrigin {
    Datalogger,
    BSS
  }

  export type DatasetSpec = {
      name: string,
      description: string[],
      numFeatures: number,
      numLabels: number,
      labelNames: string[],
      dataOrigin: DataOrigin
  }

  export type NeuralNetworkSpec = {
      datasetSpec: DatasetSpec,
      layerDims: number[],
      activation_function_enums: ActivationFunctionEnum[],
      epochs: number,
  }


  const XOR_DATASET_SPEC: DatasetSpec = {
    name: "XOR",
    description: [""],
    numFeatures: 2,
    numLabels: 2,
    labelNames: ["0", "1"],
    dataOrigin: DataOrigin.BSS
  }

  const ACCEL_DATASET_SPEC: DatasetSpec = {
    name: "Accelerometer",
    description: [""],
    numFeatures: 30,
    numLabels: 2,
    labelNames: ["Still", "Shaking"],
    dataOrigin: DataOrigin.BSS
  }

  export class DatasetManager {
    public static datasetSpecs: DatasetSpec[] = [XOR_DATASET_SPEC, ACCEL_DATASET_SPEC];

  }
}

