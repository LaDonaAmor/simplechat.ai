import { useCallback, useEffect, useState } from "react";

export function useCopy(resetMs = 1500) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), resetMs);
    return () => clearTimeout(timer);
  }, [copied, resetMs]);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard blocked (insecure context or denied) */
    }
  }, []);

  return { copied, copy };
}
