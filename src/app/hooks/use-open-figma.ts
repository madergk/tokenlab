import { useCallback, useState } from "react";

const FIGMA_FILES_URL = "https://www.figma.com/files/recent";
const FIGMA_IMPORT_PLUGIN_URL =
  "https://www.figma.com/community/plugin/1572986244884345594/variables-collection-import-and-export";

export function useOpenInFigma() {
  const [isOpening, setIsOpening] = useState(false);

  const openInFigma = useCallback(async (payload: string) => {
    setIsOpening(true);
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // Clipboard access can fail without user gesture or permission.
    }
    window.open(FIGMA_FILES_URL, "_blank", "noopener,noreferrer");
    window.open(FIGMA_IMPORT_PLUGIN_URL, "_blank", "noopener,noreferrer");
    setTimeout(() => setIsOpening(false), 1000);
  }, []);

  return { openInFigma, isOpening };
}
