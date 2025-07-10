import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";

export function usePriceHistory(timePeriod: "1month" | "6months" | "1year", chainId?: string) {
  return useQuery({
    queryKey: ["priceHistory", timePeriod, chainId],
    queryFn: async () => {
      const now = dayjs();
      const dateFrom = {
        "1month": now.subtract(1, "month"),
        "6months": now.subtract(6, "month"),
        "1year": now.subtract(1, "year"),
      }[timePeriod];

      const params: any = {
        select: "fetch_spot,timestamp",
        timestamp: `gte.${dateFrom.toISOString()}`,
        order: "timestamp.asc",
      };
      if (chainId) params.chain_id = `eq.${chainId}`;

      const response = await axios.get(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/price_history`, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        params,
      });

      return response.data;
    },
  });
}
