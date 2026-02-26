// Convert hex color to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Calculate relative luminance (WCAG 2.0)
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Determine WCAG accessibility level
export function getAccessibilityLevel(
  contrastRatio: number
): {
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
} {
  return {
    normalAA: contrastRatio >= 4.5,
    normalAAA: contrastRatio >= 7,
    largeAA: contrastRatio >= 3,
    largeAAA: contrastRatio >= 4.5,
  };
}

// Determine best text color (black or white) for a given background
export function getBestTextColor(bgHex: string): string {
  const whiteContrast = getContrastRatio(bgHex, "#FFFFFF");
  const blackContrast = getContrastRatio(bgHex, "#000000");
  return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
}

// Re-export types and data from sample collections for backward compatibility
export type { ColorVariable, ColorCollection } from "../../data/sample-collections";
