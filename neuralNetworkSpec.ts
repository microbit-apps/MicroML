namespace micro_ml {
  // This import is really just a convenience to avoid having to prepend user_interface_base
  // Extensions and files are included when you list them inside pxt.json
  import AppInterface = user_interface_base.AppInterface
  import Scene = user_interface_base.Scene
  import SceneManager = user_interface_base.SceneManager
  import Sensor = sensors.Sensor
  import MicrobitSensors = sensors.MicrobitSensors

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
    dataOrigin: DataOrigin,
    sensors: MicrobitSensors[]
  }

  export type Dataset = {
    datasetSpec: DatasetSpec,
    features: number[][],
    labels: number[]
  }

  export type NeuralNetworkSpec = {
    datasetSpecIdx: number,
    layerDims: number[],
    activation_function_enums: ActivationFunctionEnum[],
    epochs: number,
  }

  export type NeuralNetwork = {
    nnSpec: NeuralNetworkSpec,
    weights: number[][][],
    biases: number[][]
  }

  const enum DataloggedType {
    NeuralNetwork,
    Dataset
  }

  function encode_str(str: string): number[] {
    let serial: number[] = []

    for (let i = 0; i < str.length; i++) {
      serial.push(str.charCodeAt(i))
    }

    return serial;
  }

  function serialiseNeuralNetwork(nn: NeuralNetwork): number[] {
    let serial: number[] = [];

    serial.push(DataloggedType.NeuralNetwork)

    // nnspec:
    serial.push(nn.nnSpec.datasetSpecIdx)

    serial.push(nn.nnSpec.layerDims.length)
    for (let i = 0; i < nn.nnSpec.layerDims.length; i++) {
      serial.push(nn.nnSpec.layerDims[i])
    }

    serial.push(nn.nnSpec.activation_function_enums.length)
    for (let i = 0; i < nn.nnSpec.activation_function_enums.length; i++) {
      serial.push(nn.nnSpec.activation_function_enums[i])
    }
    serial.push(nn.nnSpec.epochs)
    // end nnspec


    for (let l = 0; l < nn.nnSpec.layerDims.length - 1; l++) {
      for (let j = 0; j < nn.weights[l].length; j++) {
        for (let i = 0; i < nn.weights[l][j].length; i++) {
          serial.push(nn.weights[l][j][i]);
        }
      }
    }

    for (let l = 0; l < nn.nnSpec.layerDims.length - 1; l++) {
      for (let i = 0; i < nn.biases[l].length; i++) {
        serial.push(nn.biases[l][i]);
      }
    }

    return serial;
  }

  function deserialiseNeuralNetwork(serial: number[]): NeuralNetwork {
    let idx: number = 0;

    const dataloggerType: DataloggedType = serial[idx++]

    // nnspec:
    const datasetSpecIdx: number = serial[idx++]

    const layerDimLen: number = serial[idx++]
    let layerDims: number[] = []
    for (let i = 0; i < layerDimLen; i++) {
      layerDims.push(serial[idx++])
    }


    const afeLen: number = serial[idx++]
    let activation_function_enums: ActivationFunctionEnum[] = []
    for (let i = 0; i < afeLen; i++) {
      activation_function_enums.push(serial[idx++])
    }

    const epochs: number = serial[idx++]
    // end nnspec

    let weights: number[][][] = [];
    for (let l = 0; l < layerDimLen - 1; l++) {
      weights[l] = []
      for (let j = 0; j < layerDims[l + 1]; j++) {
        weights[l][j] = []
        for (let i = 0; i < layerDims[l]; i++) {
          weights[l][j][i] = serial[idx++];
        }
      }
    }

    let biases: number[][] = [];
    for (let l = 0; l < layerDimLen - 1; l++) {
      biases[l] = []
      for (let i = 0; i < layerDims[l + 1]; i++) {
        biases[l][i] = serial[idx++];
      }
    }


    return {
      nnSpec: {
        datasetSpecIdx,
        layerDims,
        activation_function_enums,
        epochs
      },
      weights,
      biases
    };
  }

  export const XOR_DATASET: Dataset = {
    datasetSpec: {
      name: "XOR",
      description: [""],
      numFeatures: 2,
      numLabels: 2,
      labelNames: ["0", "1"],
      dataOrigin: DataOrigin.BSS,
      sensors: []
    },
    features: [[0, 0], [0, 1], [1, 0], [1, 1]],
    labels: [0, 1, 1, 0],
  }

  export const ACCEL_DATASET: Dataset = {
    datasetSpec: {
      name: "Shake",
      description: [""],
      numFeatures: 9, // NOTE: 90 for newer...
      numLabels: 2,
      labelNames: ["Still", "Shaking"],
      dataOrigin: DataOrigin.BSS,
      sensors: [MicrobitSensors.AccelerometerX, MicrobitSensors.AccelerometerY, MicrobitSensors.AccelerometerZ]
    },
    features: [],
    labels: [],
  }

  export class DatasetManager {
    public static currentDatasetIdx: number = 1;
    public static datasets: Dataset[] = [XOR_DATASET, ACCEL_DATASET];

    public static get currentDatasetSpec(): DatasetSpec {
      return DatasetManager.datasets[DatasetManager.currentDatasetIdx].datasetSpec
    }

    public static get currentDataset(): Dataset {
      return DatasetManager.datasets[DatasetManager.currentDatasetIdx]
    }

    public static getLabelNameFromPred(pred: number): string {
      return DatasetManager.datasets[DatasetManager.currentDatasetIdx].datasetSpec.labelNames[pred]
    }

    public static getSensors(): MicrobitSensors[] {
      return DatasetManager.datasets[DatasetManager.currentDatasetIdx].datasetSpec.sensors
    }
  }
}
