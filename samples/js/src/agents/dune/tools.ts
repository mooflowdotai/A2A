import { ai, z } from "./genkit.js";
import { fetchGraduates } from "./services/graduates.js";
import {
  fetchDexMetrics,
  fetchTopTokenPairByChain,
  fetchSVMTokenBalance,
} from "./services/index.js";
import { fetchTokens24h } from "./services/last_24h.js";

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

// --- Get Graduates from the last 24 hours ---
export const getGraduates = ai.defineTool(
  {
    name: "get_graduates",
    description:
      "Return a breakdown of the number of tokens created on Solana in the last 24 hours, grouped by launchpad (LaunchLab, LetsBonk, Pumpfun, Boop)",
    inputSchema: z.object({}),
  },
  async () => {
    const graduates = await fetchGraduates();
    return { graduates };
  }
);

// --- Get Graduates from the last 24 hours ---
export const getTokens24h = ai.defineTool(
  {
    name: "get_tokens_24h",
    description:
      "Return the total number of tokens created on Solana in the last 24 hours across all launchpads and creators",
    inputSchema: z.object({}),
  },
  async () => {
    const tokens24hCount = await fetchTokens24h(1);
    return { tokens24hCount };
  }
);
