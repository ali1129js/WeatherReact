import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "../api/openMeteo";
import { useDebouncedValue } from "./useDebouncedValue";

export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_QUERY_LENGTH = 2;

/**
 * Debounced city search. TanStack Query hands queryFn an AbortSignal and cancels the request
 * when the key changes (the previous query loses its observer), so a slow answer for "Ber"
 * can never overwrite the answer for "Berlin".
 */
export function useCitySearch(input: string, debounceMs: number = SEARCH_DEBOUNCE_MS) {
  const typed = input.trim();
  const term = useDebouncedValue(typed, debounceMs);
  const enabled = term.length >= MIN_QUERY_LENGTH;

  const query = useQuery({
    queryKey: ["places", term.toLowerCase()],
    queryFn: ({ signal }) => searchPlaces(term, signal),
    enabled,
    staleTime: 5 * 60_000,
  });

  return {
    term,
    enabled,
    /** True while the user is still typing or the request is in flight. */
    searching: typed.length >= MIN_QUERY_LENGTH && (typed !== term || query.isFetching),
    places: enabled && typed === term ? (query.data ?? []) : [],
    error: query.error,
    settled: enabled && typed === term && query.isSuccess,
  };
}
