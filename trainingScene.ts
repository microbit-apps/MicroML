namespace micro_ml {
  export enum DataOrigin {
    Datalogger,
    BSS
  }


  class DatasetSelectScreen extends ui.UiScreen {
    private currentIdx: number;
    private doneCallback: (selectedIdx: number) => void;

    constructor(runtime: ui.UiRuntime, resultCallback: (selectedIdx: number) => void) {
      super(runtime);
      this.currentIdx = 0;
      this.doneCallback = resultCallback;
    }

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      switch (event.action) {
        case "activate": {
          this.doneCallback(this.currentIdx)
          this.runtime.pop()
          return true
        }
        case "cancel": {
          this.doneCallback(null) // Explicitly prevent moving onto the next step without the user pressing A.
          this.runtime.pop()
          return true
        }
        case "up": {
          this.currentIdx = (this.currentIdx - 1 + DatasetManager.datasets.length) % DatasetManager.datasets.length;
          return true
        }
        case "down": {
          this.currentIdx = ((this.currentIdx + 1) % DatasetManager.datasets.length)
          return true
        }
      }

      return undefined
    }

    render(surface: ui.DrawSurface) {
      surface.drawBitmap(
        trainingSceneBackground,
        0,
        0
      )

      const len = DatasetManager.datasets.length;

      const boxWidth = 50;
      const startX = HALF_WIDTH - (boxWidth >> 1);
      const startY = 16;
      surface.fillRect(
        new ui.Rect(
          startX,
          startY,
          boxWidth,
          (len + 2) * bitmaps.font8.charHeight
        ),
        3
      )

      const textStartX = startX + 10
      const textStartY = startY + 6
      const circleRadius = 4;

      for (let i = 0; i < len; i++) {
        surface.fillCircle(
          textStartX - circleRadius - 2,
          textStartY + (i * bitmaps.font8.charHeight) + circleRadius - 1,
          circleRadius,
          (i == this.currentIdx) ? 7 : 1
        )
        surface.drawText(
          DatasetManager.datasets[i].datasetSpec.name,
          textStartX,
          textStartY + (i * bitmaps.font8.charHeight),
          { color: 1 }
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


  class NeuralNetworkConstructScene extends ui.UiScreen {
    private state: NeuralNetworkConstructSceneState;
    private currentIdx: number;

    private nnSpec: NeuralNetworkSpec;
    private doneCallback: (selected: NeuralNetworkSpec) => void;

    private actions: ui.UiRow<string>;

    constructor(runtime: ui.UiRuntime, resultCallback: (selected: NeuralNetworkSpec) => void) {
      super(runtime);
      this.currentIdx = 0;
      this.doneCallback = resultCallback;

      const dsSpec = DatasetManager.currentDatasetSpec
      this.nnSpec = {
        datasetSpecIdx: DatasetManager.currentDatasetIdx,
        layerDims: [dsSpec.numFeatures, dsSpec.numLabels],
        activation_function_enums: [ActivationFunctionEnum.SoftMax],
        epochs: 100
      }

      const control = (id: string, bitmap: Bitmap, focusLabel: string, onActivate: () => void): ui.UiRowControl<string> => {
        const c = ui.button<string>(id, { bitmap }, onActivate)
        c.focusLabel = focusLabel
        c.style = ui.UiButtonStyles.ShadowedWhite
        return c
      }

      this.actions = new ui.UiRow<string>({
        scopeId: "construct-actions",
        controls: [
          control("layer-info", icons.get("settingsGear"), "Layer info", () => {
            this.state = NeuralNetworkConstructSceneState.LayerInfo
          }),
          control("add-layer", icons.get("btn_plus"), "Add layer", () => {
            this.state = NeuralNetworkConstructSceneState.AddingLayerNeuronCount
            const defaultNewLayerSize = 2;
            const maxNumLayers = 5; // Constrained by UI, not backend. UI scales for 5+ well enough, but its cluttered.

            if (this.nnSpec.layerDims.length < maxNumLayers) {
              // this.nnSpec.layerDims = [this.nnSpec.layerDims[0], defaultNewLayerSize].concat(this.nnSpec.layerDims.slice(1))

              this.nnSpec.layerDims = this.nnSpec.layerDims.slice(0, this.nnSpec.layerDims.length - 1)
              this.nnSpec.layerDims.push(defaultNewLayerSize)

              this.nnSpec.layerDims.push(DatasetManager.currentDatasetSpec.numLabels)

              this.nnSpec.activation_function_enums = this.nnSpec.activation_function_enums.slice(0, this.nnSpec.activation_function_enums.length - 1)
              this.nnSpec.activation_function_enums.push(ActivationFunctionEnum.Sigmoid)
              this.nnSpec.activation_function_enums.push(ActivationFunctionEnum.SoftMax)
            }

            this.currentIdx = this.nnSpec.layerDims.length - 2
          }),
          control("delete-layer", icons.get("btn_delete"), "Delete layer", () => {
            if (this.nnSpec.layerDims.length > 2) {
              this.state = NeuralNetworkConstructSceneState.DeletingLayer
            }
          }),
          control("done", ui.green_tick, "Done", () => {
            this.doneCallback(this.nnSpec)
            this.runtime.pop()
          })
        ],
        controlSize: { width: 18, height: 18 },
        gap: 2,
        wrap: true
      })

      this.add(this.actions, { centerX: HALF_WIDTH, centerY: 104 })
    }

    activate() {
      super.activate()
      this.state = NeuralNetworkConstructSceneState.Start
      this.currentIdx = 0;
    }

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      const layersLen = this.nnSpec.layerDims.length;

      switch (event.action) {
        case "activate": {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              return undefined
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
              // this.nnSpec.layerDims = this.nnSpec.layerDims.slice(0, this.nnSpec.layerDims.length - 1)
              // this.nnSpec.layerDims.push(defaultNewLayerSize)
              // this.nnSpec.layerDims.push(this.nnSpec.layerDims[this.nnSpec.layerDims.length - 1])

              this.nnSpec.layerDims.removeAt(this.currentIdx)
              break;
            }
          }
          return true
        }
        case "cancel": {
          this.doneCallback(null)

          if (this.state != NeuralNetworkConstructSceneState.Start) {
            this.state = NeuralNetworkConstructSceneState.Start
          } else {
            this.runtime.pop()
          }
          return true
        }
        case "left": {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              return undefined
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
              // decrement
              this.currentIdx--;
              if (this.currentIdx < 1) {
                this.currentIdx = layersLen - 2;
              }
              break;
            }
          }
          return true
        }
        case "right": {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              return undefined
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
          }
          return true
        }
        case "up": {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              return undefined
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
          }
          return true
        }
        case "down": {
          switch (this.state) {
            case NeuralNetworkConstructSceneState.Start: {
              return undefined
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
          }
          return true
        }
      }

      return undefined
    }

    private neuronYStart = 0;
    private yOffset = -10;
    private neuronRadius = 10;
    private maxDrawableNuerons = 5;
    drawLayer(surface: ui.DrawSurface, layerXStart: number, numNeurons: number, neuronPrefix: string, asActivationFunction: boolean) {
      const maxDrawableNuerons = 5;
      const layerTooBig = numNeurons > maxDrawableNuerons

      const numDrawableNeurons = Math.min(maxDrawableNuerons, numNeurons);

      const availableHeight = SCREEN_HEIGHT - this.neuronYStart;
      const neuronYSpacing = availableHeight / (numDrawableNeurons + 1);

      for (let i = 0; i < numDrawableNeurons; i++) {
        const y = (this.neuronYStart >> 1) + ((i + 1) * neuronYSpacing) + this.yOffset;

        surface.fillCircle(
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

        surface.drawText(
          txt,
          layerXStart - (this.neuronRadius >> 1) - 1,
          y - (this.neuronRadius >> 1) + 2,
          { color: 15, font: bitmaps.font5 }
        )
      }
    }

    drawLayerConnections(surface: ui.DrawSurface, layer1X: number, layer1NumFeatures: number, layer2X: number, layer2NumFeatures: number) {
      const layer1Size = Math.min(this.maxDrawableNuerons, layer1NumFeatures);
      const layer2Size = Math.min(this.maxDrawableNuerons, layer2NumFeatures);

      const availableHeight = SCREEN_HEIGHT - this.neuronYStart;
      const layer1Spacing = availableHeight / (layer1Size + 1);
      const layer2Spacing = availableHeight / (layer2Size + 1);

      for (let i = 0; i < layer1Size; i++) {
        for (let j = 0; j < layer2Size; j++) {
          const y1 = (this.neuronYStart >> 1) + ((i + 1) * layer1Spacing) + this.yOffset;
          const y2 = (this.neuronYStart >> 1) + ((j + 1) * layer2Spacing) + this.yOffset;

          const lineThickness = 2
          for (let s = 0; s < lineThickness; s++) {
            surface.drawLine(
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

    drawOutlineAroundCurrentIdxLayer(surface: ui.DrawSurface) {
      const layers = this.nnSpec.layerDims
      const availableWidth = SCREEN_WIDTH - (2 * this.xMargin);
      const availableHeight = SCREEN_HEIGHT - this.neuronYStart;

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
        surface.drawRect(
          new ui.Rect(
            x - (width >> 1) - s,
            top - s,
            width + (s * 2),
            height + (s * 2)
          ),
          7
        );
      }

      const infoBoxY = 5;
      const connectorWidth = 5;

      const infoBoxHeight = 85
      let infoBoxWidth = HALF_WIDTH;

      let infoBoxX: number;
      let connectorX: number;

      if ((x - (width >> 1)) < HALF_WIDTH) {
        infoBoxX = Math.min(SCREEN_WIDTH, x + (width >> 1) + connectorWidth)
        connectorX = infoBoxX - connectorWidth
        infoBoxWidth = Math.min(infoBoxWidth, SCREEN_WIDTH - infoBoxX)
      } else {
        infoBoxX = Math.max(0, x - (infoBoxWidth + (width >> 1) + connectorWidth))
        connectorX = infoBoxX + infoBoxWidth
      }

      // Info box:
      const tutorialBoxBorderThickness = 2;
      surface.fillRect(
        new ui.Rect(
          infoBoxX,
          infoBoxY,
          infoBoxWidth,
          infoBoxHeight
        ),
        15
      );

      for (let s = 0; s < tutorialBoxBorderThickness; s++) {
        surface.drawRect(
          new ui.Rect(
            infoBoxX - s,
            infoBoxY - s,
            infoBoxWidth + (s * 2),
            infoBoxHeight + (s * 2)
          ),
          7
        );
      }

      // Connector:
      surface.fillRect(
        new ui.Rect(
          connectorX,
          infoBoxY + (infoBoxHeight >> 1),
          connectorWidth,
          4
        ),
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
          "y1 = " + DatasetManager.currentDatasetSpec.labelNames[0],
          "y2 = " + DatasetManager.currentDatasetSpec.labelNames[1],
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
        surface.drawText(
          txt,
          infoBoxX + 2,
          infoBoxY + (idx * bitmaps.font8.charHeight) + (bitmaps.font8.charHeight >> 1),
          { color: 1 }
        )
      })
    }


    private xMargin = 18;
    render(surface: ui.DrawSurface) {
      surface.drawBitmap(
        constructSceneBackground,
        0,
        0
      )

      const layers = this.nnSpec.layerDims
      const availableWidth = SCREEN_WIDTH - (2 * this.xMargin);
      const spacing = availableWidth / (layers.length - 1);

      for (let i = 0; i < layers.length - 1; i++) {
        const l1 = this.xMargin + (spacing * i);
        const l2 = this.xMargin + (spacing * (i + 1));

        this.drawLayerConnections(surface, l1, layers[i], l2, layers[i + 1]);
        this.drawLayer(surface, l1, layers[i], "x", false);
        this.drawLayer(surface, l2, layers[i + 1], "y", false);
      }

      switch (this.state) {
        case NeuralNetworkConstructSceneState.LayerInfo: {
          this.drawOutlineAroundCurrentIdxLayer(surface);
          break;
        }
        case NeuralNetworkConstructSceneState.AddingLayerNeuronCount: {
          this.drawOutlineAroundCurrentIdxLayer(surface);
          break;
        }
        case NeuralNetworkConstructSceneState.AddingLayerActivationFunction: {
          this.drawOutlineAroundCurrentIdxLayer(surface);
          break;
        }
        case NeuralNetworkConstructSceneState.DeletingLayer: {
          this.drawOutlineAroundCurrentIdxLayer(surface);
          break;
        }

        default: {
          break
        }
      }

      super.render(surface)
      drawFocusedRing(surface, this.actions, this.focus, 7)
    }
  }


  enum NeuralNetworkTrainingSceneState {
    Start,
    Paused,
    Training,
    TrainingComplete,
    Saving
  }

  class NeuralNetworkTrainingScreen extends ui.UiScreen {
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

    constructor(runtime: ui.UiRuntime, neuralNetworkSpec: NeuralNetworkSpec) {
      super(runtime);
      this.neuralNetworkSpec = neuralNetworkSpec

      this.graphW = SCREEN_WIDTH - (this.leftMargin + this.rightMargin);
      this.graphH = SCREEN_HEIGHT - (this.topMargin + this.botMargin);

      this.graphBufferMaxLen = this.graphW - 4
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

      const ld = Buffer.fromArray(this.neuralNetworkSpec.layerDims);
      const afe = Buffer.fromArray(this.neuralNetworkSpec.activation_function_enums);
      construct_nn(ld, afe, this.neuralNetworkSpec.datasetSpecIdx as DatasetEnum);

      this.state = NeuralNetworkTrainingSceneState.Training
      this.trainingStartTime = input.runningTime();
      train_nn(this.neuralNetworkSpec.epochs, 0.015, (l: number) => {
        this.pushToGraphBuffer(l / 1000) // * 1000 on C++ end, since TAG_NUMBER() doesn't work with doubles nor floats.
        basic.pause(1) // yield
      });
      this.trainingFinishTime = input.runningTime();
      this.state = NeuralNetworkTrainingSceneState.TrainingComplete
    }

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      switch (event.action) {
        case "activate": {
          this.runtime.pop()
          this.runtime.pop()
          return true
        }
        case "cancel": {
          this.runtime.pop()
          return true
        }
      }

      return undefined
    }

    drawGraph(surface: ui.DrawSurface) {
      surface.fillRect(
        new ui.Rect(
          this.leftMargin,
          this.topMargin,
          this.graphW,
          this.graphH
        ),
        15
      )

      const axesThickness = 2;
      for (let s = 0; s < axesThickness; s++) {
        surface.drawLine(
          this.leftMargin + s,
          this.topMargin,
          this.leftMargin + s,
          this.graphH + this.topMargin,
          2
        )

        surface.drawLine(
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
          surface.drawLine(
            this.leftMargin + i + s,
            y1,
            this.leftMargin + i + 1 + s,
            y2,
            2
          )
        }
      }
    }

    render(surface: ui.DrawSurface) {
      surface.fillRect(
        new ui.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT),
        4
      )

      this.drawGraph(surface);

      const title = "Loss per epoch";
      surface.drawText(
        title,
        (this.leftMargin + (this.graphW >> 1)) - (title.length * bitmaps.font8.charWidth >> 1),
        this.topMargin + 1,
        { color: 1 }
      )

      const yLegendBot: string = this.yAxisRange[0].toString();
      surface.drawText(
        yLegendBot,
        0,
        this.graphH + this.topMargin - 2,
        { color: 1 }
      )

      const yLegendTop: string = this.yAxisRange[1].toString();
      surface.drawText(
        yLegendTop,
        0,
        this.topMargin,
        { color: 1 }
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
          surface.drawText(
            line,
            (SCREEN_WIDTH - (line.length * bitmaps.font8.charWidth) >> 1),
            SCREEN_HEIGHT - (10 * (txt.length - index)),
            { color: 1 }
          )
        })
      }

      super.render(surface)
    }
  }

  export class TrainingScene extends ui.UiScreen {
    private selectDataset: ui.UiControl<string>;
    private constructNN: ui.UiControl<string>;
    private trainNN: ui.UiControl<string>;
    private actions: ui.UiRow<string>;

    private neuralNetworkSpec: NeuralNetworkSpec = null;
    private selectedDatabaseIdx: number;

    constructor(runtime: ui.UiRuntime) {
      super(runtime)

      const control = (id: string, bitmap: Bitmap, focusLabel: string, onActivate: () => void): ui.UiRowControl<string> => {
        const c = ui.button<string>(id, { bitmap }, onActivate)
        c.focusLabel = focusLabel
        c.style = ui.UiButtonStyles.ShadowedWhite
        return c
      }

      this.selectDataset = control("select-dataset", ui.largeDisk, "Select a dataset", () => {
        const cb = (selected: number) => {
          this.selectedDatabaseIdx = selected;
          if (selected !== null) {
            DatasetManager.currentDatasetIdx = selected;
            this.neuralNetworkSpec = null // dataset changed; a configured network would have the wrong feature count
          }
        }
        runtime.push(new DatasetSelectScreen(runtime, cb))
      })

      this.constructNN = control("construct-nn", icons.get("neuralNetwork1"), "Configure neural network", () => {
        const cb = (selected: NeuralNetworkSpec) => {
          // null means the user backed out with B; only "Done" yields a spec.
          if (selected !== null) {
            this.neuralNetworkSpec = selected
            this.syncControls()
          }
        }

        runtime.push(new NeuralNetworkConstructScene(runtime, cb))
      })

      this.trainNN = control("train-nn", icons.get("linearGraph3"), "Train neural network", () => {
        if (this.neuralNetworkSpec == null)
          return
        runtime.push(new NeuralNetworkTrainingScreen(runtime, this.neuralNetworkSpec))
      })

      this.actions = new ui.UiRow<string>({
        scopeId: "training-actions",
        controls: [this.selectDataset, this.constructNN, this.trainNN],
        controlSize: { width: 34, height: 34 },
        gap: 11,
        wrap: true
      })

      this.add(this.actions, { centerX: HALF_WIDTH, centerY: 80 })
    }

    activate() {
      super.activate();
      this.syncControls()
    }

    private syncControls() {
      this.constructNN.visible = this.selectedDatabaseIdx != null
      this.trainNN.visible = this.neuralNetworkSpec != null
      this.remove(this.actions)
      this.add(this.actions, { centerX: HALF_WIDTH, centerY: 80 })
    }

    public handleInput(event: ui.UiInputEvent): boolean | undefined {
      if (event.phase == "released") return undefined

      switch (event.action) {
        case "cancel": {
          this.runtime.pop()
          return true
        }
      }

      return undefined
    }

    private tutorialFor(id: string): string[] {
      if (id == "select-dataset")
        return ["Select a dataset to", "train your neural", "network with."]
      if (id == "construct-nn")
        return ["Configure the neural", "network for the best", "performance against", "your dataset."]
      if (id == "train-nn")
        return ["Train your neural", "network. You can", "then test your model", "from the home screen"]
      return undefined
    }

    private drawTutorial(surface: ui.DrawSurface) {
      const targetId = focusedControlId(this.actions.scopeId, this.focus);
      if (targetId === undefined)
        return

      const lines = this.tutorialFor(targetId)
      if (!lines)
        return

      const startX = 18;
      const startY = 18;

      surface.fillRect(
        new ui.Rect(
          startX,
          startY,
          SCREEN_WIDTH - (18 * 2),
          35
        ),
        15
      )

      lines.forEach((line: string, index: number) => {
        surface.drawText(
          line,
          startX + 2,
          startY + (index * bitmaps.font8.charHeight) + 2,
          { color: 1 }
        )
      })

      const rect = new ui.Rect(0, 0, 0, 0)
      if (this.actions.getControlRect(targetId, rect)) {
        surface.fillRect(
          new ui.Rect(
            rect.x + (rect.width >> 1) - (rect.width >> 4),
            rect.y + (rect.height >> 1) - rect.height + 8,
            rect.width >> 3,
            20
          ),
          7
        )
      }
    }

    render(surface: ui.DrawSurface) {
      surface.drawBitmap(
        trainingSceneBackground,
        0,
        0
      );

      this.drawTutorial(surface);
      super.render(surface)
      drawFocusedRing(surface, this.actions, this.focus, 7)
    }
  }
}
