/*-------------------------------------------------------------------------------------------------
 *  Copyright (C) 2024 Intel Corporation. All rights reserved.
 *  Licensed under the Apache License 2.0. See LICENSE in the project root for license information.
 *  SPDX-License-Identifier: Apache-2.0
 *-----------------------------------------------------------------------------------------------*/

/**
 * Transformers.js will firstly try to fetch resource from
 * the hugging face, then fallback to local if hugging face
 * is inaccessible
 */

/***************************************************************
 *                                                             *
 * ONLY_USE_LOCAL_MODELS (offline | hugging face inaccessible) *
 *     USE_REMOTE_MODELS = false                               *
 *                                                             *
 * ONLY_USE_REMOTE_MODELS (hugging face accessible)            *
 *     USE_REMOTE_MODELS = true                                *
 *                                                             *
 ***************************************************************/

export const USE_REMOTE_MODELS = false;

export const TRANSFORMER_LOCAL_MODEL_PATH = "/models/";

//TODO: unify the wasm version used by `Stable diffusion turbo` and other transformers.js samples.
// Now
//  - `transformers.js@aadeed9` : `onnxruntime-web@1.17.1`
//
//  We keep these 2 wasm files temporally and may unify them later.

export const TRANSFORMERS_V3_ORT_ENV_WASM_FILE_PATH =
  "/models/wasm/ort-web@1_17_1/";

export const MEDIAPIPE_WASM_FILE_PATH = "/models/mediapipe/tasks-genai/wasm";

/**
 * Example:
 *
 *  Remote Link
 *   - https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/config.json
 *
 *
 *  LocalModelFolder -
 *
 *   ./`${transformer_local_model_path}`/Xenova/distilbart-cnn-6-6/config.json
 *
 *   For onnx model files:
 *   ./`${transformer_local_model_path}`/models/Xenova/distilbart-cnn-6-6/onnx%2Fdecoder_model_merged_quantized.onnx
 */
export const ALL_NEEDED_MODEL_RESOURCES = {
  // summarization
  "distilbart-cnn-6-6": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/distilbart-cnn-6-6/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "AI-ModelScope/",
    resources: [
      "onnx%2Fdecoder_model_merged_quantized.onnx",
      "onnx%2Fencoder_model_quantized.onnx"
    ]
  },

  // image-to-text
  "vit-gpt2-image-captioning": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/vit-gpt2-image-captioning/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "AI-ModelScope/",
    resources: [
      "onnx%2Fdecoder_model_merged_quantized.onnx",
      "onnx%2Fencoder_model_quantized.onnx"
    ]
  },

  // question-answering
  "distilbert-base-cased-distilled-squad": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/distilbert-base-cased-distilled-squad/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "AI-ModelScope/",
    resources: ["onnx%2Fmodel_quantized.onnx"]
  },

  // background-removal
  "RMBG-1.4": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/RMBG-1.4/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "AI-ModelScope/",
    resources: ["onnx%2Fmodel.onnx"]
  },

  // SD-Turbo
  "sd-turbo-ort-web": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/sd-turbo-ort-web/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "schmuell/",
    resources: [
      "unet/model.onnx",
      "vae_decoder/model.onnx",
      "text_encoder/model.onnx"
    ]
  },

  // used by SD-Turbo
  "clip-vit-base-patch16": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/clip-vit-base-patch16/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "AI-ModelScope/",
    resources: []
  },

  "Phi-3-mini-4k-instruct": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/Phi-3-mini-4k-instruct/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "Xenova/",
    resources: ["onnx%2Fmodel_q4.onnx", "onnx%2Fmodel_q4.onnx_data"]
  },

  "Phi-3-mini-4k-instruct_fp16": {
    linkPathPrefix:
      "https://modelscope.cn/api/v1/models/AI-ModelScope/Phi-3-mini-4k-instruct_fp16/repo?Revision=master&FilePath=",
    localFolderPathPrefix: "AI-ModelScope/",
    resources: ["onnx%2Fmodel_q4.onnx", "onnx%2Fmodel_q4.onnx_data"]
  }
};
