import { useQuery } from "@tanstack/react-query";
import { fetchForecast } from "../api/openMeteo";
import type { Place } from "../api/schemas";

export function useForecast(place: Place | null) {
  return useQuery({
    queryKey: ["forecast", place?.id ?? null],
    queryFn: ({ signal }) => {
      if (!place) throw new Error("no place selected");
      return fetchForecast(place, signal);
    },
    enabled: place !== null,
    staleTime: 10 * 60_000,
  });
}
