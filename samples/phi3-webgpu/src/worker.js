import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  StoppingCriteria,
  env
} from "@xenova/transformers";

class CallbackTextStreamer extends TextStreamer {
  constructor(tokenizer, cb) {
    super(tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true
    });
    this.cb = cb;
  }

  on_finalized_text(text) {
    this.cb(text);
  }
}

class InterruptableStoppingCriteria extends StoppingCriteria {
  constructor() {
    super();
    this.interrupted = false;
  }

  interrupt() {
    this.interrupted = true;
  }

  reset() {
    this.interrupted = false;
  }

  _call(input_ids, scores) {
    return new Array(input_ids.length).fill(this.interrupted);
  }
}

const stopping_criteria = new InterruptableStoppingCriteria();

async function hasFp16() {
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter.features.has("shader-f16");
  } catch (e) {
    return false;
  }
}

/**
 * This class uses the Singleton pattern to ensure that only one instance of the model is loaded.
 */
class TextGenerationPipeline {
  static model_id = null;
  static model = null;
  static tokenizer = null;
  static streamer = null;

  static async getInstance(progress_callback = null) {
    // Choose the model based on whether fp16 is available
    if (
      location.href.toLowerCase().indexOf("modelscope.cn") > -1 ||
      location.href.toLowerCase().indexOf("s5k.cn") > -1
    ) {
      //https://modelscope.cn/api/v1/models/ZhipuAI/glm-4-9b-chat/repo?Revision=master&FilePath=model-00010-of-00010.safetensors
      this.model_id = "ZhipuAI/glm-4-9b-chat";
    } else {
      this.model_id ??= (await hasFp16())
        ? "Xenova/Phi-3-mini-4k-instruct_fp16"
        : "Xenova/Phi-3-mini-4k-instruct";
    }

    this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
      revision: "master",
      legacy: true,
      progress_callback
    });

    this.model ??= AutoModelForCausalLM.from_pretrained(this.model_id, {
      revision: "master",
      dtype: "q4",
      device: "webgpu",
      use_external_data_format: true,
      progress_callback
    });

    return Promise.all([this.tokenizer, this.model]);
  }
}

async function generate(messages) {
  // Retrieve the text-generation pipeline.
  const [tokenizer, model] = await TextGenerationPipeline.getInstance();

  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true
  });

  let startTime;
  let numTokens = 0;
  const cb = (output) => {
    startTime ??= performance.now();

    let tps;
    if (numTokens++ > 0) {
      tps = (numTokens / (performance.now() - startTime)) * 1000;
    }
    self.postMessage({
      status: "update",
      output,
      tps,
      numTokens
    });
  };

  const streamer = new CallbackTextStreamer(tokenizer, cb);

  // Tell the main thread we are starting
  self.postMessage({ status: "start" });

  const outputs = await model.generate({
    ...inputs,
    max_new_tokens: 512,
    streamer,
    stopping_criteria
  });
  const outputText = tokenizer.batch_decode(outputs, {
    skip_special_tokens: false
  });

  // Send the output back to the main thread
  self.postMessage({
    status: "complete",
    output: outputText
  });
}

function getBaseURL(domain) {
  if (domain.indexOf("github.io") > -1) {
    return "/web-ai-showcase/";
  } else if (
    domain.indexOf("modelscope.cn") > -1 ||
    domain.indexOf("s5k.cn") > -1
  ) {
    return "/api/v1/studio/ningwang101/Stable-Diffusion-Turbo-WebGPU/static/";
  } else {
    return "/";
  }
}

async function load() {
  self.postMessage({
    status: "loading",
    data: `Loading model and initializing`
  });

  const baseUrl = getBaseURL(location.href.toLowerCase());

  if (location.href.toLowerCase().indexOf("github.io") > -1) {
    // Used for release to public domain, so the project can be hosted on GitHub Pages or other static hosting services.
    baseUrl = "/web-ai-showcase/";
  }

  // transformers will first fetch from local model path
  // then from remote model path if not found locally
  env.localModelPath = "/models/";
  env.allowLocalModels = true;
  // set up the path to use local wasm files for the onnx backend
  env.backends.onnx.wasm.wasmPaths = `${baseUrl}models/wasm/ort-web@1_19_0_dev/`;

  // Load the pipeline and save it for future use.
  const [tokenizer, model] = await TextGenerationPipeline.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    self.postMessage(x);
  });

  self.postMessage({
    status: "compiling",
    data: "Compiling shaders and warming up model..."
  });

  // Run model with dummy input to compile shaders
  const inputs = tokenizer("a");
  await model.generate({ ...inputs, max_new_tokens: 1 });
  self.postMessage({ status: "ready" });
}
// Listen for messages from the main thread
self.addEventListener("message", async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case "load":
      load();
      break;

    case "generate":
      stopping_criteria.reset();
      generate(data);
      break;

    case "interrupt":
      stopping_criteria.interrupt();
      break;

    case "reset":
      stopping_criteria.reset();
      break;
  }
});
