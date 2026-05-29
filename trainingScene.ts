namespace micro_ml {
  import Screen = user_interface_base.Screen
  import Scene = user_interface_base.Scene
  import AppInterface = user_interface_base.AppInterface
  import font = user_interface_base.font
  import Button = user_interface_base.Button
  import CursorScene = user_interface_base.CursorScene

  import GUIComponentScene = microgui.GUIComponentScene
  import GUIComponentAbstract = microgui.GUIComponentAbstract
  import GUIComponentAlignment = microgui.GUIComponentAlignment
  import RadioButtonCollection = microgui.RadioButtonCollection
  import ButtonCollection = microgui.ButtonCollection
  import RadioButton = microgui.RadioButton
  import TextBox = microgui.TextBox
  import TextButton = microgui.TextButton
  import TextButtonCollection = microgui.TextButtonCollection

  export enum DataOrigin {
    Datalogger,
    BSS
  }

  export const XOR_DATASET_SPEC: DatasetSpec = {
    name: "XOR",
    description: [""],
    numFeatures: 2,
    numLabels: 2,
    labelNames: ["0", "1"],
    dataOrigin: DataOrigin.BSS
  }

  export const ACCEL_DATASET_SPEC: DatasetSpec = {
    name: "Shake",
    description: [""],
    numFeatures: 30,
    numLabels: 2,
    labelNames: ["Still", "Shaking"],
    dataOrigin: DataOrigin.BSS
  }

  const EXAMPLE_: DatasetSpec = {
    name: "Custom1",
    description: [""],
    numFeatures: 30,
    numLabels: 2,
    labelNames: ["Still", "Shaking"],
    dataOrigin: DataOrigin.BSS
  }

  class DatasetManager {
    public static datasetSpecs: DatasetSpec[] = [XOR_DATASET_SPEC, ACCEL_DATASET_SPEC];
  }


  enum State {
    Start,
    DatasetSelected,
    NeuralNetworkConstructed,
    NeuralNetworkTrained
  }


  class DatasetSelectScene extends Scene {
    private datasetNames: string[];
    private currentIdx: number;
    private doneCallback: (selectedIdx: number) => void;

    constructor(app: AppInterface, resultCallback: (selectedIdx: number) => void) {
      super(app);
      this.currentIdx = 0;
      this.doneCallback = resultCallback;
    }

    startup() {
      super.startup()
    }

    activate() {
      super.activate()
      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.A.id,
        () => {
          this.doneCallback(this.currentIdx)
          this.app.popScene()
        }
      )
      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.B.id,
        () => {
          this.doneCallback(null) // Explicitly prevent moving onto the next step without the user pressing A.
          this.app.popScene()
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.up.id,
        () => {
          this.currentIdx = (this.currentIdx - 1 + DatasetManager.datasetSpecs.length) % DatasetManager.datasetSpecs.length;
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.down.id,
        () => {
          this.currentIdx = ((this.currentIdx + 1) % DatasetManager.datasetSpecs.length)
        }
      )
    }

    draw() {
      Screen.drawTransparentImage(
        trainingSceneBackground,
        -Screen.HALF_WIDTH,
        -Screen.HALF_HEIGHT
      )

      const len = DatasetManager.datasetSpecs.length;

      const boxWidth = 50;
      const startX = 0 - (boxWidth >> 1);
      const startY = -Screen.HALF_HEIGHT + 16;
      Screen.fillRect(
        startX,
        startY,
        boxWidth,
        (len + 2) * font.charHeight,
        3
      )

      const textStartX = startX + 10
      const textStartY = startY + 6
      const circleRadius = 4;

      for (let i = 0; i < len; i++) {
        screen().fillCircle(
          textStartX + Screen.HALF_WIDTH - circleRadius - 2,
          textStartY + Screen.HALF_HEIGHT + (i * font.charHeight) + circleRadius - 1,
          circleRadius,
          (i == this.currentIdx) ? 7 : 1
        )
        Screen.print(
          DatasetManager.datasetSpecs[i].name,
          textStartX,
          textStartY + (i * font.charHeight),
          1
        )
      }
    }
  }


  enum NeuralNetworkConstructSceneState {
    Start,
    LayerInfo,
    AddingLayerNeuronCount,
    AddingLayerActivationFunction,
    DeletingLayer
  }


  class NeuralNetworkConstructScene extends CursorScene {
    private state: NeuralNetworkConstructSceneState;
    private layerBtns: Button[];
    private currentIdx: number;

    private nnSpec: NeuralNetworkSpec;
    private doneCallback: (selected: NeuralNetworkSpec) => void;

    constructor(app: AppInterface, datasetSpec: DatasetSpec, resultCallback: (selected: NeuralNetworkSpec) => void) {
      super(app);
      this.currentIdx = 0;
      this.doneCallback = resultCallback;
      this.nnSpec = {
        datasetSpec: datasetSpec,
        layerDims: [datasetSpec.numFeatures, datasetSpec.numLabels],
        activation_function_enums: [ActivationFunctionEnum.SoftMax],
        epochs: 50
      }

      this.layerBtns = [];
    }

    startup() {
      super.startup()

      this.layerBtns = [
        new Button({
          parent: null,
          style: user_interface_base.ButtonStyles.ShadowedWhite,
          icon: "settingsGear",
          ariaId: "Layer info",
          x: -30,
          y: 44,
          onClick: () => {
            this.state = NeuralNetworkConstructSceneState.LayerInfo
          },
        }),
        new Button({
          parent: null,
          style: user_interface_base.ButtonStyles.ShadowedWhite,
          icon: "btn_plus",
          ariaId: "Add layer",
          x: -10,
          y: 44,
          onClick: () => {
            this.state = NeuralNetworkConstructSceneState.AddingLayerNeuronCount
            const defaultNewLayerSize = 2;
            const maxNumLayers = 5; // Constrained by UI, not backend. UI scales for 5+ well enough, but its cluttered.

            if (this.nnSpec.layerDims.length < maxNumLayers) {
              // this.nnSpec.layerDims = [this.nnSpec.layerDims[0], defaultNewLayerSize].concat(this.nnSpec.layerDims.slice(1))

              this.nnSpec.layerDims = this.nnSpec.layerDims.slice(0, this.nnSpec.layerDims.length - 1)
              this.nnSpec.layerDims.push(defaultNewLayerSize)
              this.nnSpec.layerDims.push(this.nnSpec.datasetSpec.numLabels)

              this.nnSpec.activation_function_enums = this.nnSpec.activation_function_enums.slice(0, this.nnSpec.activation_function_enums.length - 1)
              this.nnSpec.activation_function_enums.push(ActivationFunctionEnum.Sigmoid)
              this.nnSpec.activation_function_enums.push(ActivationFunctionEnum.SoftMax)
            }

            this.currentIdx = this.nnSpec.layerDims.length - 2
          },
        }),
        new Button({
          parent: null,
          style: user_interface_base.ButtonStyles.ShadowedWhite,
          icon: "btn_delete",
          ariaId: "Delete layer",
          x: 10,
          y: 44,
          onClick: () => {
            if (this.nnSpec.layerDims.length > 2) {
              this.state = NeuralNetworkConstructSceneState.DeletingLayer
            }
          },
        }),
        new Button({
          parent: null,
          style: user_interface_base.ButtonStyles.ShadowedWhite,
          icon: "green_tick",
          ariaId: "Done",
          x: 30,
          y: 44,
          onClick: () => {
            this.doneCallback(this.nnSpec)
            this.app.popScene()
          },
        })
      ]

      this.navigator.setBtns([this.layerBtns])
    }

    activate() {
      super.activate()
      this.state = NeuralNetworkConstructSceneState.Start
      this.cursor.setOutlineColour(7)
      this.currentIdx = 0;

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.A.id,
        () => {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              this.cursor.click()
              break;
            }
            case NeuralNetworkConstructSceneState.LayerInfo: {
              this.state = NeuralNetworkConstructSceneState.Start
              // this.currentIdx = (this.currentIdx - 1 + layersLen) % layersLen;
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerNeuronCount: {
              this.state = NeuralNetworkConstructSceneState.AddingLayerActivationFunction
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerActivationFunction: {
              this.state = NeuralNetworkConstructSceneState.Start
              break;
            }
            case NeuralNetworkConstructSceneState.DeletingLayer: {
              this.state = NeuralNetworkConstructSceneState.Start
              // this.nnSpec.layerDims = this.nnSpec.layerDims.slice(0, this.nnSpec.layerDims.length - 1)
              // this.nnSpec.layerDims.push(defaultNewLayerSize)
              // this.nnSpec.layerDims.push(this.nnSpec.layerDims[this.nnSpec.layerDims.length - 1])

              this.nnSpec.layerDims.removeAt(this.currentIdx)
              break;
            }

            default: {
              break;
            }
          }
        }
      )
      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.B.id,
        () => {
          this.doneCallback(null)

          if (this.state != NeuralNetworkConstructSceneState.Start) {
            this.state = NeuralNetworkConstructSceneState.Start
          } else {
            this.app.popScene()
          }
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.left.id,
        () => {
          const layersLen = this.nnSpec.layerDims.length;

          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              this.moveCursor(user_interface_base.CursorDir.Left)
              break;
            }
            case NeuralNetworkConstructSceneState.LayerInfo: {
              this.currentIdx = (this.currentIdx - 1 + layersLen) % layersLen;
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerNeuronCount: {
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerActivationFunction: {
              break;
            }
            case NeuralNetworkConstructSceneState.DeletingLayer: {
              // this.currentIdx = (this.currentIdx - 1 + layersLen) % (layersLen - 1);

              // this.currentIdx = ((this.currentIdx + (layersLen - 1) - 1) % (layersLen - 1)) + 0;

              // decrement
              this.currentIdx--;
              if (this.currentIdx < 1) {
                this.currentIdx = layersLen - 2;
              }
              break;
            }

            default: {
              break;
            }
          }
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.right.id,
        () => {
          const layersLen = this.nnSpec.layerDims.length;

          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              this.moveCursor(user_interface_base.CursorDir.Right);
              break;
            }
            case NeuralNetworkConstructSceneState.LayerInfo: {
              this.currentIdx = (this.currentIdx + 1) % layersLen;
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerNeuronCount: {
              // Don't modify first nor last layer (input, output):
              // this.currentIdx = Math.max(1, (this.currentIdx + 1) % (layersLen - 1));
              break;

            }
            case NeuralNetworkConstructSceneState.AddingLayerActivationFunction: {
              break;

            }
            case NeuralNetworkConstructSceneState.DeletingLayer: {
              this.currentIdx++;
              if (this.currentIdx > layersLen - 2) {
                this.currentIdx = 1;
              }
              break;
            }

            default: {
              break;
            }
          }
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.up.id,
        () => {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              this.moveCursor(user_interface_base.CursorDir.Right);
              break;
            }
            case NeuralNetworkConstructSceneState.LayerInfo: {
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerNeuronCount: {
              // this.currentIdx = (this.currentIdx + 1) % layersLen;
              const maxNeurons = 32; // Arbitrary.
              this.nnSpec.layerDims[this.currentIdx] = Math.min(this.nnSpec.layerDims[this.currentIdx] + 1, maxNeurons);
              break;

            }
            case NeuralNetworkConstructSceneState.AddingLayerActivationFunction: {
              // this.currentIdx = (this.currentIdx + 1) % layersLen;
              // const maxNeurons = 32; // Arbitrary.
              // this.nnSpec.layerDims[this.currentIdx] = Math.min(this.nnSpec.layerDims[this.currentIdx] + 1, maxNeurons);
              break;
            }
            case NeuralNetworkConstructSceneState.DeletingLayer: {
              break;
            }

            default: {
              break;
            }
          }
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.down.id,
        () => {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              this.moveCursor(user_interface_base.CursorDir.Right);
              break;
            }
            case NeuralNetworkConstructSceneState.LayerInfo: {
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerNeuronCount: {
              // this.currentIdx = (this.currentIdx + 1) % layersLen;
              this.nnSpec.layerDims[this.currentIdx] = Math.max(this.nnSpec.layerDims[this.currentIdx] - 1, 1);
              break;
            }
            case NeuralNetworkConstructSceneState.AddingLayerActivationFunction: {
              break;
            }

            case NeuralNetworkConstructSceneState.DeletingLayer: {
              break;
            }

            default: {
              break;
            }
          }
        }
      )
    }

    private neuronYStart = 0;
    private yOffset = -10;
    private neuronRadius = 10;
    private maxDrawableNuerons = 5;
    drawLayer(layerXStart: number, numNeurons: number, neuronPrefix: string, asActivationFunction: boolean) {
      const maxDrawableNuerons = 5;
      const layerTooBig = numNeurons > maxDrawableNuerons

      const numDrawableNeurons = Math.min(maxDrawableNuerons, numNeurons);

      const availableHeight = Screen.HEIGHT - this.neuronYStart;
      const neuronYSpacing = availableHeight / (numDrawableNeurons + 1);

      for (let i = 0; i < numDrawableNeurons; i++) {
        const y = (this.neuronYStart >> 1) + ((i + 1) * neuronYSpacing) + this.yOffset;

        screen().fillCircle(
          layerXStart,
          y,
          this.neuronRadius,
          3
        );

        let txt = neuronPrefix + (i + 1);
        if (layerTooBig) {
          if (i != 0) {
            txt = "..."
          }
          if (i == numDrawableNeurons - 1) {
            txt = neuronPrefix + numNeurons
          }
        }

        screen().print(
          txt,
          layerXStart - (this.neuronRadius >> 1) - 1,
          y - (this.neuronRadius >> 1) + 2,
          15,
          bitmaps.font5
        )
      }
    }

    drawLayerConnections(layer1X: number, layer1NumFeatures: number, layer2X: number, layer2NumFeatures: number) {
      const layer1Size = Math.min(this.maxDrawableNuerons, layer1NumFeatures);
      const layer2Size = Math.min(this.maxDrawableNuerons, layer2NumFeatures);

      const availableHeight = Screen.HEIGHT - this.neuronYStart;
      const layer1Spacing = availableHeight / (layer1Size + 1);
      const layer2Spacing = availableHeight / (layer2Size + 1);

      for (let i = 0; i < layer1Size; i++) {
        for (let j = 0; j < layer2Size; j++) {
          const y1 = (this.neuronYStart >> 1) + ((i + 1) * layer1Spacing) + this.yOffset;
          const y2 = (this.neuronYStart >> 1) + ((j + 1) * layer2Spacing) + this.yOffset;

          const lineThickness = 2
          for (let s = 0; s < lineThickness; s++) {
            screen().drawLine(
              layer1X,
              y1 + s,
              layer2X,
              y2 + s,
              15
            )
          }
        }
      }
    }

    drawOutlineAroundCurrentIdxLayer() {
      const layers = this.nnSpec.layerDims
      const availableWidth = Screen.WIDTH - (2 * this.xMargin);
      const availableHeight = Screen.HEIGHT - this.neuronYStart;

      const numNeurons = Math.min(
        this.maxDrawableNuerons,
        this.nnSpec.layerDims[this.currentIdx]
      );

      const ySpacing = availableHeight / (numNeurons + 1);
      const xSpacing = availableWidth / (layers.length - 1);

      const x = this.xMargin + (xSpacing * this.currentIdx);

      const firstNeuronY = (this.neuronYStart >> 1) + ySpacing;
      const lastNeuronY = (this.neuronYStart >> 1) + (numNeurons * ySpacing);

      const top = firstNeuronY - this.neuronRadius + this.yOffset;
      const bottom = lastNeuronY + this.neuronRadius + this.yOffset;

      const height = bottom - top;
      const width = this.neuronRadius * 3;

      const thickness = 3;
      for (let s = 0; s < thickness; s++) {
        screen().drawRect(
          x - (width >> 1) - s,
          top - s,
          width + (s * 2),
          height + (s * 2),
          7
        );
      }

      const infoBoxY = 5;
      const connectorWidth = 5;

      const infoBoxHeight = 85
      let infoBoxWidth = Screen.HALF_WIDTH;

      let infoBoxX: number;
      let connectorX: number;

      if ((x - (width >> 1)) < Screen.HALF_WIDTH) {
        infoBoxX = Math.min(Screen.WIDTH, x + (width >> 1) + connectorWidth)
        connectorX = infoBoxX - connectorWidth
        infoBoxWidth = Math.min(infoBoxWidth, Screen.WIDTH - infoBoxX)
      } else {
        infoBoxX = Math.max(0, x - (infoBoxWidth + (width >> 1) + connectorWidth))
        connectorX = infoBoxX + infoBoxWidth
      }

      // Info box:
      const tutorialBoxBorderThickness = 2;
      screen().fillRect(
        infoBoxX,
        infoBoxY,
        infoBoxWidth,
        infoBoxHeight,
        15
      );

      for (let s = 0; s < tutorialBoxBorderThickness; s++) {
        screen().drawRect(
          infoBoxX - s,
          infoBoxY - s,
          infoBoxWidth + (s * 2),
          infoBoxHeight + (s * 2),
          7
        );
      }

      // Connector:
      screen().fillRect(
        connectorX,
        infoBoxY + (infoBoxHeight >> 1),
        connectorWidth,
        4,
        7
      );

      let layerInfoText: string[];

      if (this.currentIdx == 0) {
        layerInfoText = [
          "Use <- -> B",
          "",
          "- " + this.nnSpec.layerDims[this.currentIdx] + " input",
          "features.",
          "",
          // "- an input",
          // " layer can't",
          // " have an",
          // " activation",
          // " function.",
          "- has no",
          "activation",
          "function."
        ]
      } else if (this.currentIdx == this.nnSpec.layerDims.length - 1) {
        layerInfoText = [
          "Use <- -> B",
          "",
          "- " + this.nnSpec.layerDims[this.currentIdx] + " labels:",
          "y1 = " + this.nnSpec.datasetSpec.labelNames[0],
          "y2 = " + this.nnSpec.datasetSpec.labelNames[1],
          "",
          "- softmax",
          " activation",
          " function.",
        ]
      } else {
        layerInfoText = [
          "- hidden",
          "layer of",
          "" + this.nnSpec.layerDims[this.currentIdx] + " neurons",
          "",
          "g() =",
          "sigmoid",
          "",
          "z=(w*x)+b",
          "outputs =",
          "g(z)",
        ]
      }

      layerInfoText.forEach((txt: string, idx: number) => {
        screen().print(
          txt,
          infoBoxX + 2,
          infoBoxY + (idx * font.charHeight) + (font.charHeight >> 1),
          1
        )
      })
    }


    private xMargin = 18;
    draw() {
      Screen.drawTransparentImage(
        constructSceneBackground,
        -Screen.HALF_WIDTH,
        -Screen.HALF_HEIGHT
      )

      const layers = this.nnSpec.layerDims
      const availableWidth = Screen.WIDTH - (2 * this.xMargin);
      const spacing = availableWidth / (layers.length - 1);

      for (let i = 0; i < layers.length - 1; i++) {
        const l1 = this.xMargin + (spacing * i);
        const l2 = this.xMargin + (spacing * (i + 1));

        this.drawLayerConnections(l1, layers[i], l2, layers[i + 1]);
        this.drawLayer(l1, layers[i], "x", false);
        this.drawLayer(l2, layers[i + 1], "y", false);
      }

      switch (this.state) {
        case NeuralNetworkConstructSceneState.LayerInfo: {
          this.drawOutlineAroundCurrentIdxLayer();
          break;
        }
        case NeuralNetworkConstructSceneState.AddingLayerNeuronCount: {
          this.drawOutlineAroundCurrentIdxLayer();
          break;
        }
        case NeuralNetworkConstructSceneState.AddingLayerActivationFunction: {
          this.drawOutlineAroundCurrentIdxLayer();
          break;
        }
        case NeuralNetworkConstructSceneState.DeletingLayer: {
          this.drawOutlineAroundCurrentIdxLayer();
          break;
        }

        default: {
          break
        }
      }

      this.navigator.drawComponents();
      super.draw()
    }
  }


  enum NeuralNetworkTrainingSceneState {
    Start,
    Paused,
    Training,
    TrainingComplete,
    Saving
  }

  class NeuralNetworkTrainingScene extends Scene {
    private state: NeuralNetworkTrainingSceneState;
    private neuralNetworkSpec: NeuralNetworkSpec = null;
    private graphBuffer: number[];
    private graphBufferMaxLen: number;

    private leftMargin: number = 25;
    private rightMargin: number = 5;
    private topMargin: number = 3;
    private botMargin: number = 32;

    private graphW: number;
    private graphH: number;

    private yAxisRange: number[];
    private trainingStartTime: number;
    private trainingFinishTime: number;

    constructor(app: AppInterface, neuralNetworkSpec: NeuralNetworkSpec) {
      super(app);
      this.neuralNetworkSpec = neuralNetworkSpec

      this.graphW = Screen.WIDTH - (this.leftMargin + this.rightMargin);
      this.graphH = Screen.HEIGHT - (this.topMargin + this.botMargin);

      this.graphBufferMaxLen = this.graphW - 4
    }

    startup() {
      super.startup();

      // this.startTrainingBtn = new Button({
      //   parent: null,
      //   style: user_interface_base.ButtonStyles.ShadowedWhite,
      //   icon: "rule_arrow",
      //   ariaId: "Start training",
      //   x: 0,
      //   y: 44,
      //   onClick: (button: Button) => {
      //     // this.state = NeuralNetworkConstructSceneState.LayerInfo
      //
      //     if (this.state == NeuralNetworkTrainingSceneState.Start || this.state == NeuralNetworkTrainingSceneState.Paused) {
      //       this.state = NeuralNetworkTrainingSceneState.Training
      //       button.setIcon("btn_stop")
      //       button.ariaId = "Pause training"
      //       button.update()

      // basic.showNumber(0)
      // const nnSpec: NeuralNetworkSpec = {
      //   datasetSpec: ACCEL_DATASET_SPEC,
      //   layerDims: [ACCEL_DATASET_SPEC.numFeatures, 8, ACCEL_DATASET_SPEC.numLabels],
      //   activation_function_enums: [ActivationFunctionEnum.Sigmoid, ActivationFunctionEnum.SoftMax],
      //   epochs: 30,
      // };
      //
      // construct_nn(Buffer.fromArray(nnSpec.layerDims), Buffer.fromArray(nnSpec.activation_function_enums), DatasetEnum.ACCEL)

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
      //
      // basic.showNumber(1)
      // train_nn(nnSpec.epochs, 0.015, (l: number) => {
      //   this.pushToGraphBuffer(l / 1000)
      //   // basic.pause(1) // yield
      // })
      // basic.showNumber(2)
      // test_nn(nnTestCB)

      // construct_nn(
      //   Buffer.fromArray(this.neuralNetworkSpec.layerDims),
      //   Buffer.fromArray(this.neuralNetworkSpec.activation_function_enums),
      //   DatasetEnum.ACCEL
      // );

      // control.inBackground(() => {
      // train_nn(
      //   this.neuralNetworkSpec.epochs,
      //   0.5,
      //   (l: number) => {
      //     this.pushToGraphBuffer(l)
      //     basic.pause(1) // yield
      //   }
      // );
      // })

      // } else if (this.state == NeuralNetworkTrainingSceneState.Training) {
      //   this.state = NeuralNetworkTrainingSceneState.Paused
      //   button.setIcon("rule_arrow")
      //   button.ariaId = "Resume training"
      //   button.update()
      // }
      //   }
      // });

      // this.saveModelBtn = new Button({
      //     parent: null,
      //     style: user_interface_base.ButtonStyles.ShadowedWhite,
      //     icon: "disk1",
      //     ariaId: "Save trained model",
      //     x: 30,
      //     y: 44,
      //     onClick: () => {
      //         this.app.popScene()
      //     },
      // });

      // this.navigator.setBtns([[this.startTrainingBtn]])
    }

    private pushToGraphBuffer(loss: number) {
      if (this.graphBuffer.length == this.graphBufferMaxLen)
        this.graphBuffer.shift();

      if (loss > this.yAxisRange[1])
        this.yAxisRange[1] = loss;

      if (loss < this.yAxisRange[0])
        this.yAxisRange[0] = loss;

      const minY = this.yAxisRange[0];
      const maxY = this.yAxisRange[1];

      let normalized = 0;

      if (maxY > minY)
        normalized = (loss - minY) / (maxY - minY);

      // invert because screen Y grows downward
      const y = this.topMargin + (1 - normalized) * this.graphH;

      this.graphBuffer.push(y);
    }

    activate() {
      super.activate();
      this.state = NeuralNetworkTrainingSceneState.Start;

      this.graphBuffer = [];
      this.yAxisRange = [0, 0]

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.A.id,
        () => {
          this.app.popScene()
          this.app.popScene()
        }
      )

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.B.id,
        () => {
          this.app.popScene()
        }
      )

      const ld = Buffer.fromArray(this.neuralNetworkSpec.layerDims);
      const afe = Buffer.fromArray(this.neuralNetworkSpec.activation_function_enums);
      construct_nn(ld, afe, DatasetEnum.ACCEL);

      this.state = NeuralNetworkTrainingSceneState.Training
      this.trainingStartTime = input.runningTime();
      train_nn(this.neuralNetworkSpec.epochs, 0.015, (l: number) => {
        this.pushToGraphBuffer(l / 1000) // * 1000 on C++ end, since TAG_NUMBER() doesn't work with doubles nor floats.
        basic.pause(1) // yield
      });
      this.trainingFinishTime = input.runningTime();
      this.state = NeuralNetworkTrainingSceneState.TrainingComplete
    }

    drawGraph() {
      screen().fillRect(
        this.leftMargin,
        this.topMargin,
        this.graphW,
        this.graphH,
        15
      )

      const axesThickness = 2;
      for (let s = 0; s < axesThickness; s++) {
        screen().drawLine(
          this.leftMargin + s,
          this.topMargin,
          this.leftMargin + s,
          this.graphH + this.topMargin,
          2
        )

        screen().drawLine(
          this.leftMargin,
          this.graphH + this.topMargin + s,
          this.graphW + this.leftMargin,
          this.graphH + this.topMargin + s,
          2
        )
      }

      const lineThickness = 3
      for (let i = 0; i < this.graphBuffer.length - 1; i++) {
        const y1 = this.graphBuffer[i];
        const y2 = this.graphBuffer[i + 1];

        for (let s = 0; s < lineThickness; s++) {
          screen().drawLine(
            this.leftMargin + i + s,
            y1,
            this.leftMargin + i + 1 + s,
            y2,
            2
          )
        }
      }
    }

    draw() {
      screen().fillRect(
        0,
        0,
        Screen.WIDTH,
        Screen.HEIGHT,
        4
      )

      this.drawGraph();

      const title = "Loss per epoch";
      screen().print(
        title,
        (this.leftMargin + (this.graphW >> 1)) - (title.length * font.charWidth >> 1),
        this.topMargin + 1,
        1,
      )

      const yLegendBot: string = this.yAxisRange[0].toString();
      screen().print(
        yLegendBot,
        0,
        this.graphH + this.topMargin - 2,
        1,
      )

      const yLegendTop: string = this.yAxisRange[1].toString();
      screen().print(
        yLegendTop,
        0,
        this.topMargin,
        1,
      )

      let txt: string[] = null;
      if (this.state == NeuralNetworkTrainingSceneState.Training) {
        txt = ["Training..."]
      } else if (this.state == NeuralNetworkTrainingSceneState.TrainingComplete) {
        const t: string = ((this.trainingFinishTime - this.trainingStartTime) / 1000).toString().slice(0, 4);
        txt = ["Training Done! Press A", `Took ${t} seconds`]
      }

      if (txt != null) {
        txt.forEach((line: string, index: number) => {
          screen().print(
            line,
            (screen().width - (line.length * font.charWidth) >> 1),
            screen().height - (10 * (txt.length - index)),
            1,
          )
        })
      }

      super.draw()
    }
  }

  export class TrainingScene extends CursorScene {
    private selectDatasetBtn: Button;
    private constructNN: Button;
    private trainNN: Button;
    private state: State = State.Start;

    private neuralNetworkSpec: NeuralNetworkSpec = null;
    private selectedDatabaseIdx: number;

    constructor(app: AppInterface) {
      super(app)
    }

    startup() {
      super.startup()

      this.selectDatasetBtn = new Button({
        parent: null,
        style: user_interface_base.ButtonStyles.ShadowedWhite,
        icon: "largeDisk",
        ariaId: "Select a dataset",
        x: -45,
        y: 20,
        onClick: () => {
          // setBtns instead of add, to explicitly remove trainModel if you go back
          // into "Select a dataset"
          this.navigator.setBtns([[
            this.selectDatasetBtn,
            this.constructNN,
          ]])
          this.state = State.DatasetSelected;

          const cb = (selected: number) => {
            this.selectedDatabaseIdx = selected;
            // basic.showString("cb")
          }
          this.app.pushScene(new DatasetSelectScene(this.app, cb))
        },
        state: ["Select a dataset to", "train your neural", "network with."]
      })

      this.constructNN = new Button({
        parent: null,
        style: user_interface_base.ButtonStyles.ShadowedWhite,
        icon: "neuralNetwork1",
        ariaId: "Configure neural network",
        x: 0,
        y: 20,
        onClick: () => {
          this.navigator.addCol([
            this.trainNN,
          ])
          this.state = State.NeuralNetworkConstructed;

          const cb = (selected: NeuralNetworkSpec) => { this.neuralNetworkSpec = selected }
          // const cb = (selected: NeuralNetworkSpec) => { this.setNNSpec(selected) }

          this.app.pushScene(new NeuralNetworkConstructScene(this.app, DatasetManager.datasetSpecs[this.selectedDatabaseIdx], cb))
        },
        state: ["Configure the neural", "network for the best", "performance against", "your dataset."]
      })

      this.trainNN = new Button({
        parent: null,
        style: user_interface_base.ButtonStyles.ShadowedWhite,
        icon: "linearGraph3",
        ariaId: "Train neural network",
        x: 45,
        y: 20,
        onClick: () => {
          this.state = State.NeuralNetworkTrained
          this.app.pushScene(new NeuralNetworkTrainingScene(this.app, this.neuralNetworkSpec))
        },
        state: ["Train your neural", "network. You can", "then test your model", "from the home screen"]
      })

      this.navigator.setBtns([[
        this.selectDatasetBtn,
      ]])

      this.cursor.setOutlineColour(7)
    }

    activate() {
      super.activate();

      control.onEvent(
        ControllerButtonEvent.Pressed,
        controller.B.id,
        () => {
          this.app.popScene()
        }
      )

      if (this.selectedDatabaseIdx == null) {
        this.navigator.setBtns([[
          this.selectDatasetBtn,
        ]])
      }
    }

    draw_tutorial() {
      const btn = this.navigator.getCurrent();

      const startX = Screen.LEFT_EDGE + 18;
      const startY = Screen.TOP_EDGE + 18;

      Screen.fillRect(
        startX,
        startY,
        Screen.WIDTH - (18 * 2),
        35,
        15
      )

      btn.state.forEach((line: string, index: number) => {
        Screen.print(
          line,
          startX + 2,
          startY + (index * font.charHeight) + 2,
          1
        )
      })

      Screen.fillRect(
        btn.getLocalX - (btn.width >> 4),
        btn.getLocalY - btn.height + 8,
        btn.width >> 3,
        20,
        7
      )
    }

    draw() {
      Screen.drawTransparentImage(
        trainingSceneBackground,
        -Screen.HALF_WIDTH,
        -Screen.HALF_HEIGHT
      )

      this.draw_tutorial();
      this.navigator.drawComponents();
      super.draw()
    }
  }
}
