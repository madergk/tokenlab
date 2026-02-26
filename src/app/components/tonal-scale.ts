/**
 * Tonal Scale Generator using OKLCH Color Space
 *
 * Generates perceptually uniform color scales using OKLCH,
 * which is far superior to HSL for tonal consistency.
 *
 * OKLCH = Oklab in cylindrical coordinates:
 * - L (Lightness): 0–1, perceptually uniform
 * - C (Chroma): 0–~0.4, colorfulness
 * - H (Hue): 0–360°, color angle
 *
 * Color pipeline (Björn Ottosson's specification):
 * sRGB → Linear RGB → LMS (M1) → cube root → Oklab (M2) → OKLCH
 *
 * No XYZ intermediate step needed — Oklab uses a direct
 * linear-sRGB-to-LMS matrix for better accuracy.
 */

import type { SelectedPalette } from "./wizard/wizard-types";

// ============================================================================
// Oklab Matrices (from Björn Ottosson's specification)
// ============================================================================

/**
 * M1: Linear sRGB → approximate cone response LMS
 * This goes directly from linear RGB to LMS, skipping XYZ.
 */
const LINEAR_SRGB_TO_LMS = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

/**
 * M1 inverse: LMS → Linear sRGB
 */
const LMS_TO_LINEAR_SRGB = [
  [ 4.0767416621, -3.3077115913,  0.2309699292],
  [-1.2684380046,  2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147,  1.7076147010],
];

/**
 * M2: LMS' (cube root of LMS) → Oklab
 */
const LMS_PRIME_TO_OKLAB = [
  [0.2104542553,  0.7936177850, -0.0040720468],
  [1.9779984951, -2.4285922050,  0.4505937099],
  [0.0259040371,  0.7827717662, -0.8086757660],
];

/**
 * M2 inverse: Oklab → LMS' (cube root of LMS)
 */
const OKLAB_TO_LMS_PRIME = [
  [1.0,  0.3963377774,  0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.2914855480],
];

// ============================================================================
// sRGB Gamma Constants
// ============================================================================

const SRGB_GAMMA = 2.4;
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_SCALE = 12.92;

// ============================================================================
// Internal Helpers
// ============================================================================

/** Multiply a 3-element vector by a 3×3 matrix */
function mul3(m: number[][], [a, b, c]: [number, number, number]): [number, number, number] {
  return [
    m[0][0] * a + m[0][1] * b + m[0][2] * c,
    m[1][0] * a + m[1][1] * b + m[1][2] * c,
    m[2][0] * a + m[2][1] * b + m[2][2] * c,
  ];
}

/** Signed cube root (handles negatives) */
function cbrt(x: number): number {
  return x >= 0 ? Math.pow(x, 1 / 3) : -Math.pow(-x, 1 / 3);
}

/** sRGB gamma removal → linear */
function srgbToLinear(c: number): number {
  return c <= SRGB_LINEAR_THRESHOLD
    ? c / SRGB_LINEAR_SCALE
    : Math.pow((c + 0.055) / 1.055, SRGB_GAMMA);
}

/** Linear → sRGB gamma application */
function linearToSrgb(c: number): number {
  return c <= 0.0031308
    ? SRGB_LINEAR_SCALE * c
    : 1.055 * Math.pow(c, 1 / SRGB_GAMMA) - 0.055;
}

/** Parse hex (3 or 6 char) to sRGB [0,1] */
function hexToSrgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) throw new Error(`Invalid hex: ${hex}`);
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

/** sRGB [0,1] → hex string (with gamut clamping) */
function srgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const toHex = (v: number) => Math.round(clamp(v) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Convert hex color → OKLCH
 *
 * Pipeline: hex → sRGB → linear RGB → LMS (M1) → cube root → Oklab (M2) → OKLCH
 */
export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  // sRGB → linear
  const [r, g, b] = hexToSrgb(hex);
  const linear: [number, number, number] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];

  // Linear sRGB → LMS
  const lms = mul3(LINEAR_SRGB_TO_LMS, linear);

  // Cube root of LMS
  const lmsPrime: [number, number, number] = [cbrt(lms[0]), cbrt(lms[1]), cbrt(lms[2])];

  // LMS' → Oklab
  const [L, a, bVal] = mul3(LMS_PRIME_TO_OKLAB, lmsPrime);

  // Oklab → OKLCH
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

/**
 * Convert OKLCH → hex string (with gamut clamping)
 *
 * Pipeline: OKLCH → Oklab → LMS' (M2⁻¹) → cube → LMS → linear RGB (M1⁻¹) → sRGB → hex
 */
export function oklchToHex(l: number, c: number, h: number): string {
  // OKLCH → Oklab
  const hRad = (h * Math.PI) / 180;
  const lab: [number, number, number] = [l, c * Math.cos(hRad), c * Math.sin(hRad)];

  // Oklab → LMS' (cube root space)
  const lmsPrime = mul3(OKLAB_TO_LMS_PRIME, lab);

  // Reverse cube root → LMS
  const lms: [number, number, number] = [
    lmsPrime[0] ** 3,
    lmsPrime[1] ** 3,
    lmsPrime[2] ** 3,
  ];

  // LMS → linear sRGB
  const linear = mul3(LMS_TO_LINEAR_SRGB, lms);

  // Linear → sRGB with gamma
  return srgbToHex(linearToSrgb(linear[0]), linearToSrgb(linear[1]), linearToSrgb(linear[2]));
}

/**
 * Generate an 11-stop tonal scale from any hex color.
 *
 * Stops: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
 * The input color becomes the 500 stop (preserved as-is).
 * Hue stays constant; chroma naturally tapers at extremes.
 */
export function generateTonalScale(
  hex: string,
  name: string
): { name: string; stops: { stop: number; hex: string }[] } {
  const { c: baseChroma, h: baseHue } = hexToOklch(hex);

  // Lightness targets per stop (OKLCH L, 0–1 scale)
  // Calibrated for perceptual uniformity across the range
  const STOPS: [number, number, number][] = [
    //  stop, lightness, chroma multiplier
    [  50, 0.97, 0.30],   // Very light — minimal chroma
    [ 100, 0.93, 0.50],
    [ 200, 0.87, 0.70],
    [ 300, 0.78, 0.88],
    [ 400, 0.68, 0.96],
    [ 500, 0.57, 1.00],   // Base color
    [ 600, 0.48, 0.96],
    [ 700, 0.39, 0.88],
    [ 800, 0.30, 0.80],
    [ 900, 0.22, 0.65],
    [ 950, 0.15, 0.40],   // Very dark — minimal chroma
  ];

  const stops = STOPS.map(([stop, lightness, chromaMul]) => {
    if (stop === 500) return { stop, hex }; // Preserve original exactly
    return { stop, hex: oklchToHex(lightness, baseChroma * chromaMul, baseHue) };
  });

  return { name, stops };
}

/**
 * Convert a tonal scale result into the SelectedPalette shape used by the wizard.
 * The 500 stop becomes the baseValue.
 */
export function tonalScaleToSelectedPalette(
  scale: ReturnType<typeof generateTonalScale>,
  libraryId: string = "custom"
): SelectedPalette {
  const baseStop = scale.stops.find((s) => s.stop === 500);
  return {
    libraryId,
    collectionName: scale.name,
    baseValue: baseStop?.hex ?? "#000000",
    shades: scale.stops.map((s) => ({
      name: `${scale.name}-${s.stop}`,
      value: s.hex,
    })),
  };
}
