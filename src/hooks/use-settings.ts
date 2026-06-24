import { useListSettings } from "@workspace/api-client-react";

export function useSettings() {
  const { data } = useListSettings();
  const settings = (data as Record<string, string> | undefined) ?? {};

  function get(key: string, fallback = ""): string {
    return settings[key] ?? fallback;
  }

  return { settings, get };
}
