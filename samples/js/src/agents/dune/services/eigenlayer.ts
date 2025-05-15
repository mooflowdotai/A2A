import { duneClient } from "./dune.js";

const BASE_PATH = "/v1/eigenlayer";
const PAGE_SIZE = 100;

interface AvsMetrics {
  num_operators: number;
  total_TVL: number;
  num_stakers: number;
}

interface OperatorMetrics {
  operator_name: string;
  total_TVL: number;
  num_stakers: number;
}

// Utility fetch with pagination
async function fetchAllPages(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<any[]> {
  let allRows: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await duneClient.get(`${BASE_PATH}${endpoint}`, {
      params: {
        ...params,
        limit: PAGE_SIZE,
        offset,
      },
    });

    const rows = response.data.result.rows;
    allRows = allRows.concat(rows);
    hasMore = rows.length === PAGE_SIZE;
    offset += PAGE_SIZE;
  }

  return allRows;
}

export async function fetchAvsMetrics(avs_name: string): Promise<AvsMetrics[]> {
  const metrics = await fetchAllPages("/avs-stats");
  return metrics
    .filter((metric: any) => metric.avs_name === avs_name)
    .map((metric: any) => ({
      num_operators: metric.num_operators,
      total_TVL: metric.total_TVL,
      num_stakers: metric.num_stakers,
    }));
}

export async function fetchOperatorMetrics(
  avs_name: string
): Promise<OperatorMetrics[]> {
  const operators = await fetchAllPages("/operator-to-avs-mapping", {
    filters: `avs_name = '${avs_name}'`,
  });

  const operatorNames = new Set(operators.map((op: any) => op.operator_name));

  const allMetrics = await fetchAllPages("/operator-stats");

  return allMetrics
    .filter((metric: any) => operatorNames.has(metric.operator_name))
    .map((metric: any) => ({
      operator_name: metric.operator_name,
      total_TVL: metric.total_TVL,
      num_stakers: metric.num_stakers,
    }));
}
