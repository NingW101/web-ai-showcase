import { execSync } from "child_process";

const PHI3_PROJECT_NAME = "phi3-webgpu";

const args = process.argv.slice(2);
let buildCmd = "build";
if (args[0] === "github") {
  buildCmd = "build:github";
} else if (args[0] === "modelscope") {
  buildCmd = "build:modelscope";
}

function buildPhi3WebGPU() {
  try {
    execSync(
      `cd ./samples/${PHI3_PROJECT_NAME} && npm install && npm run ${buildCmd}`,
      {
        stdio: "inherit"
      }
    );
  } catch (error) {
    throw error;
  }
}

buildPhi3WebGPU();
