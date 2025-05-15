import { ai, z } from "./genkit.js";
import {
  fetchDexMetrics,
  fetchTopTokenPairByChain,
  fetchSVMTokenBalance,
  fetchAvsMetrics,
  fetchOperatorMetrics,
} from "./services/index.js";

// --- DEX: Get metrics for a token pair ---
export const getDexPairMetrics = ai.defineTool(
  {
    name: "get_dex_pair_metrics",
    description:
      "Given a blockchain, retrieves essential metadata and statistical data for a given token pair",
    inputSchema: z.object({
      chain: z
        .string()
        .describe("The blockchain to query (e.g., solana, ethereum)"),
      token_pair: z.string().describe("Token pair identifier (e.g., USDC/SOL)"),
    }),
  },
  async ({ chain, token_pair }) => {
    const metrics = await fetchDexMetrics(chain, token_pair);
    return { metrics };
  }
);

// --- DEX: Get top token pairs by USD liquidity ---
export const getTokenPairsLiquidity = ai.defineTool(
  {
    name: "get_token_pairs_liquidity",
    description:
      "Identify token pairs with the highest USD liquidity on a given chain",
    inputSchema: z.object({
      chain: z
        .string()
        .describe("The blockchain to query (e.g., solana, ethereum)"),
    }),
  },
  async ({ chain }) => {
    const metrics = await fetchTopTokenPairByChain(chain);
    return { metrics };
  }
);

// --- SVM: Get token balances for a wallet ---
export const getSvmTokenBalances = ai.defineTool(
  {
    name: "get_svm_token_balances",
    description: "Get token balances for a Solana wallet address",
    inputSchema: z.object({
      wallet_address: z.string().describe("The Solana wallet address (base58)"),
    }),
  },
  async ({ wallet_address }) => {
    const metrics = await fetchSVMTokenBalance(wallet_address);
    return { metrics };
  }
);

// --- Eigenlayer: Get AVS-level stats ---
export const getEigenlayerAvsMetrics = ai.defineTool(
  {
    name: "get_eigenlayer_avs_metrics",
    description: "Get staking and operator metrics for a specific AVS",
    inputSchema: z.object({
      avs_name: z.string().describe("The name of the AVS to query"),
    }),
  },
  async ({ avs_name }) => {
    const metrics = await fetchAvsMetrics(avs_name);
    return { metrics };
  }
);

// --- Eigenlayer: Get operator metrics for an AVS ---
export const getEigenlayerOperatorMetrics = ai.defineTool(
  {
    name: "get_eigenlayer_operator_metrics",
    description: "Get the stats for all operators in a specific AVS",
    inputSchema: z.object({
      avs_name: z
        .string()
        .describe("The name of the AVS to get operator stats for"),
    }),
  },
  async ({ avs_name }) => {
    const metrics = await fetchOperatorMetrics(avs_name);
    return { avs_name, metrics };
  }
);
