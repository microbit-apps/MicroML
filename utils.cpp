#include "utils.h"

ActivationFunction_t get_activation_function(ActivationFunctionEnum e) {
  switch (e) {
  case ReLU:
    return relu_fn;
  case Sigmoid:
    return sigmoid_fn;
  case Tanh:
    return tanh_fn;
  case SoftMax:
    return softmax_fn;
  default:
    return nullptr;
  }
}

ActivationFunction_t get_derivative_of_activation_function(ActivationFunctionEnum e) {
  switch (e) {
  case ReLU:
    return relu_derivative_fn;
  case Sigmoid:
    return sigmoid_derivative_fn;
  case Tanh:
    return tanh_derivative_fn;
  case SoftMax:
    return softmax_derivative_fn;
  default:
    return nullptr;
  }
}

void relu_fn(float *h, int len, float *out) {
  for (int i = 0; i < len; i++)
    out[i] = h[i] < 0.0f ? 0.0f : h[i];
}

void sigmoid_fn(float *h, int len, float *out) {
  for (int i = 0; i < len; i++)
    out[i] = 1.0f / (1.0f + expf(-h[i]));
}

void tanh_fn(float *h, int len, float *out) {
  for (int i = 0; i < len; i++)
    out[i] = tanhf(h[i]);
}

void softmax_fn(float *h, int len, float *out) {
  float mx = h[0];
  for (int i = 1; i < len; i++)
    if (h[i] > mx)
      mx = h[i];
  float sum = 0.0f;
  for (int i = 0; i < len; i++) {
    out[i] = expf(h[i] - mx);
    sum += out[i];
  }
  for (int i = 0; i < len; i++)
    out[i] /= sum;
}

void relu_derivative_fn(float *h, int len, float *out) {
  for (int i = 0; i < len; i++)
    out[i] = h[i] > 0.0f ? 1.0f : 0.0f;
}

void sigmoid_derivative_fn(float *h, int len, float *out) {
  for (int i = 0; i < len; i++) {
    float s = 1.0f / (1.0f + expf(-h[i]));
    out[i] = s * (1.0f - s);
  }
}

void tanh_derivative_fn(float *h, int len, float *out) {
  for (int i = 0; i < len; i++) {
    float t = tanhf(h[i]);
    out[i] = 1.0f - t * t;
  }
}

void softmax_derivative_fn(float *h, int len, float *out) {
  for (int i = 0; i < len; i++)
    out[i] = 1.0f;
}

//----------------
// Loss functions:
//----------------

LossValueFunction_t get_loss_value_function(LossFunctionEnum lfe) {
  switch (lfe) {
  case LOSS_MSE:
    return mse_value;
  case LOSS_CROSS_ENTROPY:
    return cce_value;
  default:
    return nullptr;
  }
}

LossGradientFunction_t get_loss_gradient_function(LossFunctionEnum lfe) {
  switch (lfe) {
  case LOSS_MSE:
    return mse_grad;
  case LOSS_CROSS_ENTROPY:
    return cce_grad;
  default:
    return nullptr;
  }
}

// Helper:
void to_one_hot(int label, int num_classes, float *out) {
  for (int i = 0; i < num_classes; i++)
    out[i] = (i == label) ? 1.0f : 0.0f;
}

void mse_grad(const float *pred, const float *actual, int n, float *out) {
  float inv_n = 2.0f / n;
  for (int i = 0; i < n; i++)
    out[i] = inv_n * (pred[i] - actual[i]);
}

float mse_value(const float *pred, const float *actual, int n) {
  float s = 0.0f;
  for (int i = 0; i < n; i++) {
    float d = pred[i] - actual[i];
    s += d * d;
  }
  return s / n;
}


/**
* For softmax + cross-entropy, the gradient simplifies to (pred - actual) where pred is the softmax output and actual is the one-hot label vector. This is because the Jacobian of the softmax function cancels out with the derivative of the cross-entropy loss, leading to a much simpler expression for the gradient.
*/
void cce_grad(const float *pred, const float *actual, int n, float *out) {
  for (int i = 0; i < n; i++)
    out[i] = pred[i] - actual[i]; // combined; Jacobian absorbed
}

float cce_value(const float *pred, const float *one_hot, int num_classes) {
    const float epsilon = 1e-7f; // avoid log(0)
    float loss = 0.0f;

    for (int i = 0; i < num_classes; i++) {
        loss -= one_hot[i] * logf(pred[i] + epsilon);
    }

    return loss;
}
