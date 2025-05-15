import {
  A2AServer,
  TaskContext,
  TaskYieldUpdate,
  schema,
} from "../../server/index.js";
import { MessageData } from "genkit";
import { ai } from "./genkit.js";
import {
  getDexPairMetrics,
  getTokenPairsLiquidity,
  getSvmTokenBalances,
  getEigenlayerAvsMetrics,
  getEigenlayerOperatorMetrics,
} from "./tools.js";

if (!process.env.DUNE_API_KEY) {
  console.error("DUNE_API_KEY environment variable is required");
  process.exit(1);
}

const dunePrompt = ai.prompt("dune_agent");

/**
 * Dune Agent Task Handler
 */
export async function* duneAgentHandler(
  context: TaskContext
): AsyncGenerator<TaskYieldUpdate> {
  if (!context.history || context.history.length === 0) {
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ type: "text", text: "No messages to process." }],
      },
    };
    return;
  }

  const messages: MessageData[] = context.history
    .map((m) => ({
      role: (m.role === "agent" ? "model" : "user") as "user" | "model",
      content: m.parts
        .filter((p): p is schema.TextPart => !!(p as schema.TextPart).text)
        .map((p) => ({ text: p.text })),
    }))
    .filter((m) => m.content.length > 0);

  if (messages.length === 0) {
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ type: "text", text: "No message found to process." }],
      },
    };
    return;
  }

  try {
    const response = await dunePrompt(
      { now: new Date().toISOString() },
      {
        messages,
        tools: [
          getDexPairMetrics,
          getTokenPairsLiquidity,
          getSvmTokenBalances,
          getEigenlayerAvsMetrics,
          getEigenlayerOperatorMetrics,
        ],
      }
    );

    yield {
      state: "completed",
      message: {
        role: "agent",
        parts: [{ type: "text", text: response.text.trim() }],
      },
    };
  } catch (error: any) {
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [
          {
            type: "text",
            text: `An error occurred while processing the request: ${error.message}`,
          },
        ],
      },
    };
  }
}

const duneAgentCard: schema.AgentCard = {
  name: "Dune Agent",
  description: "Query blockchain data using Dune Analytics APIs.",
  url: "http://0.0.0.0:10000",
  provider: { organization: "Dune Agents" },
  version: "0.1.0",
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: true,
  },
  authentication: null,
  defaultInputModes: ["text"],
  defaultOutputModes: ["text"],
  skills: [
    {
      id: "dune_query",
      name: "Dune Blockchain Query",
      description: "Query DEX liquidity or token balances via Dune API.",
      tags: ["dune", "dex", "solana", "svm", "token", "eigenlayer"],
      examples: [
        "Show me the top Solana token pairs by liquidity.",
        "What tokens does 3aH1...XYZ hold?",
        "Get operator stats for AVS 'EigenDA'",
      ],
    },
  ],
};

const server = new A2AServer(duneAgentHandler, { card: duneAgentCard });
server.start();
console.log("[DuneAgent] Running at http://0.0.0.0:10000");
