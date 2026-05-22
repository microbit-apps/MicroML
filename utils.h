#ifndef __MICRO_ML_UTILS_H
#define __MICRO_ML_UTILS_H

#include "CodalCompat.h"
#include "math.h"

//----------------------
// Activation functions:
//----------------------

//%
enum ActivationFunctionEnum {
  ReLU,
  Sigmoid,
  Tanh,
  SoftMax
};

typedef void (*ActivationFunction_t)(float *hypothesis, int hypothesis_len, float *out);
ActivationFunction_t get_activation_function(ActivationFunctionEnum e);
ActivationFunction_t get_derivative_of_activation_function(ActivationFunctionEnum e);

void relu_fn(float *h, int len, float *out);
void sigmoid_fn(float *h, int len, float *out);
void tanh_fn(float *h, int len, float *out);
void softmax_fn(float *h, int len, float *out);

void relu_derivative_fn(float *h, int len, float *out);
void sigmoid_derivative_fn(float *h, int len, float *out);
void softmax_derivative_fn(float *h, int len, float *out);
void tanh_derivative_fn(float *h, int len, float *out);

//----------------
// Loss functions:
//----------------

typedef float (*LossValueFunction_t)(const float *hyp, const float *target, int len);
typedef void (*LossGradientFunction_t)(const float *hyp, const float *target, int len,
                                       float *grad_out);
//%
enum LossFunctionEnum {
  LOSS_MSE,
  LOSS_CROSS_ENTROPY,
};

struct LossFunction {
    LossFunctionEnum loss_enum;
    LossValueFunction_t value;       // for monitoring/logging
    LossGradientFunction_t gradient; // ∂L/∂ŷ
};

float mse_value(const float *pred, const float *actual, int n);
void mse_grad(const float *pred, const float *actual, int n, float *out);

float cce_value(const float *pred, const float *one_hot, int num_classes);
void cce_grad(const float *h, const float *t, int n, float *g);

LossValueFunction_t get_loss_value_function(LossFunctionEnum lfe);
LossGradientFunction_t get_loss_gradient_function(LossFunctionEnum lfe);

//--------------
// General util:
//--------------

void to_one_hot(int label, int num_classes, float *out);
#endif
