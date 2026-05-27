#include "pxt.h"

#include "datasets.h"
#include "utils.h"

namespace __micro_ml {
struct NeuralNetwork {
  struct Layer **layers;
  int num_layers;
  struct TestTrainSplitDataset *dataset;
  float learning_rate;
};

struct Layer {
  int input_len;
  int output_len;
  int weights_len;
  int biases_len;
  float *weights;
  float *biases;
  float *z_cache;
  float *hypothesis_cache;
  float *input_cache;
  ActivationFunctionEnum afe;
};

static void print_float(const char *prepend, float val);
void print_layer(Layer *l);
void print_nn();

static float *malloc_and_fill_random(int len) {
  float *arr = new float[len];
  const int range = 2;
  for (int i = 0; i < len; i++)
    arr[i] = (float)random(range + 1) -
             1.0f; // +1, since random(range) returns [0, range-1]
  return arr;
}

static Layer *construct_layer(int input_len, int output_len,
                              ActivationFunctionEnum afe) {
  Layer *l = new Layer;
  l->input_len = input_len;
  l->output_len = output_len;
  l->weights_len = input_len * output_len;
  l->biases_len = output_len;
  l->weights = malloc_and_fill_random(l->weights_len);
  l->biases = malloc_and_fill_random(l->biases_len);
  l->input_cache = new float[input_len]{0.0f};
  l->z_cache = new float[output_len]{0.0f};
  l->hypothesis_cache = new float[output_len]{0.0f};
  l->afe = afe;
  return l;
}

static void destruct_layer(Layer *l) {
  delete[] l->weights;
  l->weights = nullptr;
  delete[] l->biases;
  l->biases = nullptr;
  delete[] l->input_cache;
  l->input_cache = nullptr;
  delete[] l->z_cache;
  l->z_cache = nullptr;
  delete[] l->hypothesis_cache;
  l->hypothesis_cache = nullptr;
  delete l;
}

static NeuralNetwork *nn = nullptr;

// void construct_nn(int *layer_dims, int layer_dims_len, int
// *activation_fn_enums, TestTrainSplitDataset* ds) {
//   int num_layers = layer_dims_len - 1;
//   Layer **layers = new Layer *[num_layers];
//
//   for (int i = 0; i < num_layers; i++) {
//     int in_dim = layer_dims[i];
//     int out_dim = layer_dims[i + 1];
//     layers[i] = construct_layer(in_dim, out_dim,
//                                 (ActivationFunctionEnum)activation_fn_enums[i]);
//   }
//
//   nn = new NeuralNetwork;
//   nn->layers = layers;
//   nn->num_layers = num_layers;
//   nn->dataset = ds;
//   nn->learning_rate = 0.015f;
// }

#define DEFAULT_LEARNING_RATE 0.015f

//%
void construct_nn(Buffer layer_dims, Buffer activation_fn_enums, DatasetEnum dataset_enum) {
  // if (nn) {
  //     for (int i = 0; i < nn->num_layers; i++)
  //       destruct_layer(&nn->layer[i]);
  //     delete[] nn->layer;
  //     delete nn;
  // }

  int num_layers = layer_dims->length - 1;
  Layer **layers = new Layer *[num_layers];

  for (int i = 0; i < num_layers; i++) {
    int in_dim = layer_dims->data[i];
    int out_dim = layer_dims->data[i + 1];
    layers[i] = construct_layer(
        in_dim, out_dim, (ActivationFunctionEnum)activation_fn_enums->data[i]);
  }

  nn = new NeuralNetwork;
  nn->layers = layers;
  nn->num_layers = num_layers;
  nn->dataset = construct_train_test_split_dataset(
      dataset_enum, 0.5, DATASET_RAM_BUDGET_BYTES_DEFAULT);
  nn->learning_rate = DEFAULT_LEARNING_RATE;
}

static void forward_pass(Layer *layer, const float *input);
static float *backward_pass(Layer *layer, const float *upstream_grad);

//%
void train_nn(int epochs, float learning_rate, Action loss_cb) {
  nn->learning_rate = learning_rate;
  // if (!nn || !nn->dataset)
  //   return -1;
  Dataset *ds = nn->dataset->train;

  for (int epoch = 0; epoch < epochs; epoch++) {
    float epoch_loss_cum = 0.0f;
    for (int ds_i = 0; ds_i < ds->total_len; ds_i++) {
      const DataPoint *dp = dataset_get_datapoint(ds);

      const float *layer_input = dp->features;
      for (int i = 0; i < nn->num_layers; i++) {
        forward_pass(nn->layers[i], layer_input);
        layer_input = nn->layers[i]->hypothesis_cache;
      }

      // const float mse = powf(dp->label - layer_input[0], 2.0f);
      // const float mse = mse_value(layer_input, one_hot, ds->num_classes);
      // upstream_grad[0] = 2.0f * (layer_input[0] - dp->label);

      // ds->num_classes should be the same as nn->layers[nn->num_layers -
      // 1]->output_len
      float *upstream_grad = new float[ds->num_classes];
      float *one_hot = new float[ds->num_classes]{0};
      one_hot[dp->label] = 1.0;
      cce_grad(layer_input, one_hot, ds->num_classes, upstream_grad);
      epoch_loss_cum += cce_value(layer_input, one_hot, ds->num_classes);

      for (int i = nn->num_layers - 1; i >= 0; i--) {
        float *prior_upstream_grad = upstream_grad;
        upstream_grad = backward_pass(nn->layers[i], upstream_grad);
        delete[] prior_upstream_grad;
      }

      delete[] upstream_grad;
      delete[] one_hot;
    }

    runAction1(loss_cb, TAG_NUMBER(epoch_loss_cum / (float)ds->total_len));
    // uBit.serial.printf("Training epoch: %d, %d, %d", epoch, (int)
    // epoch_loss_cum, ds->total_len); uBit.serial.printf("\r\n");
    // print_float("Loss: ", epoch_loss_cum / ds->total_len);
    // uBit.serial.printf("\r\n");
    // uBit.sleep(10);

    // if (print_epoch_info) {
    //   uBit.serial.printf("Training epoch: %d, ", epoch);
    //   print_float("Loss: ", epoch_loss_cum / ds->total_len);
    //   uBit.serial.printf("\r\n");
    //   uBit.sleep(10);
    // }
  }
}

static void print_float(const char *prepend, float val) {
  int as_int = (int)val;
  int as_frac = (int)((val - as_int) * 100.0f);

  if (as_frac < 0)
    as_frac = -as_frac;
  if (as_frac < 10)
    uBit.serial.printf("%s%d.0%d", prepend, as_int, as_frac);
  else
    uBit.serial.printf("%s%d.%d", prepend, as_int, as_frac);
}


static float *unpack_buffer_into_floats(Buffer buf) {
  const int s = sizeof(float);
  int count = buf->length / s;
  float *out = new float[count];
  for (int i = 0; i < count; i++)
    out[i] =
        toFloat(getNumberCore(buf->data + i * s, s, NumberFormat::Float32LE));
  return out;
}

//%
Buffer testing() {
  const float test_data[3] = {0.1f, 2.1f, -10.0f};

  return mkBuffer(test_data, sizeof(test_data));
}

//%
Buffer evaluate(Buffer input_buf) {
  // if (!nn)
  //     return -1.0f;
  // float *input = unpack_buffer_into_floats(input_buf);
  // const float *output = forward_pass(input);
  // int best = 0;
  // int out_dim = nn->layer[nn->num_layers - 1].hypothesis_len;
  // for (int i = 1; i < out_dim; i++)
  //     if (output[i] > output[best])
  //         best = i;
  // delete[] input;
  // return (float)best;
  // handler.call();
  // registerWithDal(1000, event, handler);
  // EventModel::defaultEventBus->listen(event, DEVICE_BUTTON_EVT_DOWN,
  // handler);

  //
  // Event(1000, event);
  // Event(1000, event);
  // Event(1000, event);

  // runAction0(handler);

  return input_buf;
}

//%
Buffer test_nn(Action a) {
  Dataset *ds = nn->dataset->test;

  int correct = 0;
  for (int ds_i = 0; ds_i < ds->total_len; ds_i++) {
    const DataPoint *dp = dataset_get_datapoint(ds);

    const float *layer_input = dp->features;
    for (int i = 0; i < nn->num_layers; i++) {
      forward_pass(nn->layers[i], layer_input);
      layer_input = nn->layers[i]->hypothesis_cache;
    }

    int pred = 0;
    for (int c = 1; c < ds->num_classes; c++)
      if (layer_input[c] > layer_input[pred])
        pred = c;

    if (pred == dp->label) {
      correct++;
    }

    // uBit.serial.printf("Test: %d, Label: %d, Predicted: %d\r\nLayer
    // outputs:\r\n", ds_i, dp->label, pred); uBit.sleep(25); for (int i = 0;

    const float test_data[3] = {(float) dp->label, (float)pred, layer_input[pred]};
    runAction1(a, (TValue) mkBuffer(test_data, sizeof(test_data)));
                       
    // if (print_info) {
    //   uBit.serial.printf("Test: %d, Label: %d, Predicted: %d\r\nLayer
    //   outputs:\r\n", ds_i, dp->label, pred); uBit.sleep(25); for (int i = 0;
    //   i < ds->num_classes; i++) {
    //     uBit.serial.printf("%d : ", i);
    //     print_float("", layer_input[i]);
    //     uBit.serial.printf("\r\n");
    //     uBit.sleep(25);
    //   }
    //
    //   uBit.serial.printf("\r\n");
    //   uBit.sleep(25);
    // }
  }

  const float accuracy = ((float)correct) / (float)ds->total_len;
  // if (print_info) {
  //   uBit.serial.printf("Accuracy: %d/%d=", correct, ds->total_len);
  //   print_float("", accuracy);
  //   uBit.serial.printf("\r\n");
  //   uBit.sleep(25);
  // }

  return mkBuffer(&accuracy, sizeof(float));
}

//%
bool save_current_nn() {}

// float test_nn() {
//     if (!nn || !nn->dataset)
//         return -1;
//
//     Dataset *ds = nn->dataset;
//     int correct = 0;
//
//     for (int i = 0; i < ds->capacity; i++) {
//         DataPoint &dp = ds->data_points[i];
//
//         const float *out = forward_pass(dp.features);
//
//         int pred = 0;
//         int out_dim = nn->layer[nn->num_layers - 1].hypothesis_len;
//         for (int j = 1; j < out_dim; j++)
//             if (out[j] > out[pred])
//                 pred = j;
//
//         if (pred == dp.label)
//             correct++;
//
//         uBit.serial.printf("test i=%d label=%d pred=%d\r\n", i, dp.label,
//         pred); uBit.sleep(5);
//     }
//
//     uBit.serial.printf("correct=%d/%d\r\n", correct, ds->capacity);
//
//     return correct / (float)ds->capacity;
// }

static void forward_pass(Layer *layer, const float *input) {
  memcpy(layer->input_cache, input, layer->input_len * sizeof(float));

  // Z:
  memcpy(layer->z_cache, layer->biases, layer->output_len * sizeof(float));
  for (int j = 0; j < layer->output_len; j++) {
    for (int i = 0; i < layer->input_len; i++) {
      const int w_idx = j * layer->input_len + i;
      layer->z_cache[j] += input[i] * layer->weights[w_idx];
    }
  }

  // Hypothesis:
  ActivationFunction_t afe = get_activation_function(layer->afe);
  afe(layer->z_cache, layer->output_len, layer->hypothesis_cache);
}

static float *backward_pass(Layer *layer, const float *upstream_grad) {
  float grad_wrto_hypothesis[layer->output_len];

  ActivationFunction_t deriv =
      get_derivative_of_activation_function(layer->afe);

  float d_hypothesis[layer->output_len];
  deriv(layer->z_cache, layer->output_len, d_hypothesis);

  for (int j = 0; j < layer->output_len; j++) {
    grad_wrto_hypothesis[j] = upstream_grad[j] * d_hypothesis[j];
  }

  // Weights grad calc:
  float w_delta[layer->output_len * layer->input_len];
  for (int j = 0; j < layer->output_len; j++) {
    for (int i = 0; i < layer->input_len; i++) {
      const int w_idx = j * layer->input_len + i;
      w_delta[w_idx] =
          grad_wrto_hypothesis[j] * layer->input_cache[i] * nn->learning_rate;
    }
  }

  // Bias grad calc:
  float b_delta[layer->output_len];
  for (int j = 0; j < layer->output_len; j++) {
    b_delta[j] = grad_wrto_hypothesis[j] * nn->learning_rate;
  }

  // Calculate downstream before updating:
  float *downstream_grad = new float[layer->input_len]{0};
  for (int j = 0; j < layer->output_len; j++) {
    for (int i = 0; i < layer->input_len; i++) {
      const int w_idx = j * layer->input_len + i;
      downstream_grad[i] += layer->weights[w_idx] * grad_wrto_hypothesis[j];
    }
  }

  // Update weights and biases:
  for (int j = 0; j < layer->output_len; j++) {
    for (int i = 0; i < layer->input_len; i++) {
      const int w_idx = j * layer->input_len + i;
      layer->weights[w_idx] -= w_delta[w_idx];
    }
    layer->biases[j] -= b_delta[j];
  }

  return downstream_grad;
}

} // namespace __micro_ml
