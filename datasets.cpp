#include "datasets.h"
#include "CodalCompat.h"

namespace __micro_ml {
static void destruct_datapoint(DataPoint *dp);


// Helper for reading raw XOR dataset bytes
// It is common to map 0/1 of XOR into -1/1 when training XOR
static float interpret_XOR_datapoint(unsigned char raw) {
    return (raw == 0) ? -1.0f : 1.0f;
}

static void construct_XOR_datapoint_from_raw(DataPoint *dest,
                                             const unsigned char *&at_xor_dataset_data_ptr,
                                             const unsigned char *&at_xor_dataset_label_ptr) {
    *dest = (DataPoint){
        new float[XOR_DATASET_NUM_FEATURES]{
          interpret_XOR_datapoint(*at_xor_dataset_data_ptr++),
          interpret_XOR_datapoint(*at_xor_dataset_data_ptr++)
        },
        XOR_DATASET_NUM_FEATURES,
        *at_xor_dataset_label_ptr++
    };
}

static void construct_ACCEL_datapoint_from_raw(DataPoint *dest,
                                               const int16_t *&at_accel_dataset_data_ptr,
                                               const unsigned char *&at_accel_dataset_label_ptr) {
    dest->features_len = ACCEL_DATA_POINT_NUM_FEATURES;
    float *features = new float[dest->features_len];

    for (int i = 0; i < dest->features_len; i++) {
        features[i] = (float)(*at_accel_dataset_data_ptr++);
    }
    dest->features = features;
    dest->label = *at_accel_dataset_label_ptr++;
}

static void destruct_datapoint(DataPoint *dp) {
    delete[] dp->features;
    dp->features = nullptr;
}


Dataset* construct_custom_dataset(RefObject* datasetSpec) {
  
}


Dataset *construct_dataset(DatasetEnum dataset_enum, unsigned start_idx, unsigned stop_idx,
                           unsigned ram_budget_bytes) {
    switch (dataset_enum) {
        // Ignores start_idx and stop_idx
        case XOR: {
            const unsigned data_points_to_load =
                codal::min(XOR_DATASET_LEN, (int) (ram_budget_bytes / XOR_DATASET_RAM_COST_BYTES));

            const unsigned char *xor_dataset_data_ptr = XOR_RAW_DATA;
            const unsigned char *xor_dataset_label_ptr = XOR_LABELS;

            Dataset *ds = new Dataset;
            ds->capacity = data_points_to_load;
            ds->total_len = XOR_DATASET_LEN;
            ds->start_index = 0;
            ds->current_index = 0;
            ds->num_classes = XOR_NUM_CLASSES;
            ds->data_points = new DataPoint[ds->capacity];
            ds->ds_enum = dataset_enum;

            for (int i = 0; i < ds->capacity; i++) {
                construct_XOR_datapoint_from_raw(&ds->data_points[i], xor_dataset_data_ptr,
                                                xor_dataset_label_ptr);
            }

            return ds;
        }

        case ACCEL: {
            const int len = stop_idx - start_idx;

            const unsigned data_points_to_load =
                codal::min(len, (int) (ram_budget_bytes / ACCEL_DATA_POINT_RAM_COST_BYTES));


            // uBit.serial.printf("%d %d %d %d %d %d\n", start_idx, stop_idx, len, data_points_to_load, len * (int)ACCEL_DATA_POINT_RAM_COST_BYTES, (int) (ram_budget_bytes / ACCEL_DATA_POINT_RAM_COST_BYTES));
            if (data_points_to_load == 0) {
                uBit.serial.printf("RAM budget too low to load any data points for the ACCEL dataset. Please increase the RAM budget.\n");
                return nullptr;
            }

            const size_t raw_data_bytes_ptr_offset = (size_t) start_idx * ACCEL_DATA_POINT_NUM_FEATURES;
            const int16_t *accel_dataset_data_ptr = ACCEL_RAW_DATA + raw_data_bytes_ptr_offset;
            const unsigned char *accel_dataset_label_ptr = ACCEL_LABELS + start_idx;

            Dataset *ds = new Dataset;
            ds->capacity = data_points_to_load;
            ds->total_len = len;
            ds->start_index = start_idx;
            ds->current_index = 0;
            ds->data_points = new DataPoint[ds->capacity];
            ds->num_classes = ACCEL_NUM_CLASSES;
            ds->ds_enum = dataset_enum;

            for (int i = 0; i < ds->capacity; i++) {
                construct_ACCEL_datapoint_from_raw(&ds->data_points[i], accel_dataset_data_ptr,
                                                  accel_dataset_label_ptr);
            }
            return ds;
        }

        default: {
            return nullptr;
        }
    }
}

void print_dataset_info(Dataset *ds) {
  uBit.serial.printf("train len: %d\nclasses: %d\nstart: %d\ncurrent: %d\ncap: %d\ninited: %d\n\n", ds->total_len, ds->num_classes, ds->start_index, ds->current_index ,ds->capacity, ds->inited);
}

void print_MNIST_datapoint(const DataPoint* dp) {
    uBit.serial.printf("MNIST Datapoint:\nLabel: %d\nFeatures:\n", dp->label);
    for (int i = 0; i < dp->features_len; i++) {
        uBit.serial.printf("%03d ", (int)dp->features[i]);
        if ((i + 1) % 28 == 0)
            uBit.serial.printf("\n");
    }
    uBit.serial.printf("\n");
}


/**
* Needs to be done like this to support dynamic datasets in the future.
*/
unsigned dataset_get_total_len(DatasetEnum dataset_enum) {
    switch (dataset_enum) {
        case XOR:
            return XOR_DATASET_LEN;
        case ACCEL:
            return ACCEL_DATASET_LEN;
        default:
            return 0;
    }
}

TestTrainSplitDataset *construct_train_test_split_dataset(DatasetEnum dataset_enum, float training_split, unsigned ram_budget_bytes) {
  TestTrainSplitDataset* ttds = new TestTrainSplitDataset;
  const unsigned test_start_idx = (unsigned)(training_split * (float) dataset_get_total_len(dataset_enum));

  ttds->train = construct_dataset(dataset_enum, 0, test_start_idx, ram_budget_bytes);
  ttds->test = construct_dataset(dataset_enum, test_start_idx, dataset_get_total_len(dataset_enum), ram_budget_bytes);
  ttds->split = training_split;

  return ttds;
}

/**
* Load values as needed, loads new values into RAM from flash if the dataset is larger than the RAM budget allows.
*/
DataPoint *dataset_get_datapoint(Dataset *ds) {
    if (ds->current_index >= ds->capacity) {
        ds->current_index = 0;
        switch (ds->ds_enum) {
            // Unnecessary at the moment, might be needed for larger ACCEL
            case ACCEL: {
                const size_t raw_data_bytes_ptr_offset = (size_t) ds->start_index * ACCEL_DATA_POINT_NUM_FEATURES;
                const int16_t *accel_dataset_data_ptr = ACCEL_RAW_DATA + raw_data_bytes_ptr_offset;
                const unsigned char *accel_dataset_label_ptr = ACCEL_LABELS + ds->start_index;
                for (int i = 0; i < ds->capacity; i++) {
                    destruct_datapoint(&ds->data_points[i]);
                    construct_ACCEL_datapoint_from_raw(&ds->data_points[i], accel_dataset_data_ptr,
                                                      accel_dataset_label_ptr);
                }
                break;
            }
            default: {
                break;
            }
        }
    }
    return &ds->data_points[ds->current_index++];
}
}
