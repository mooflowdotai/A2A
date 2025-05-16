import { googleAI, gemini20Flash } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { dirname } from "path";
import { fileURLToPath } from "url";

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash.withConfig({ version: "gemini-2.5-pro-preview-05-06" }),
  promptDir: dirname(fileURLToPath(import.meta.url)),
});

export { z } from "genkit";
