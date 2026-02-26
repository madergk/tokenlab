export type FoundationCategory = "spacing" | "typography" | "radius" | "shadow" | "motion";

export interface FoundationToken {
  name: string;
  value: string;
  dtcgType: string;
  description?: string;
}

export interface FoundationScale {
  id: FoundationCategory;
  label: string;
  description: string;
  icon: string;
  tokens: FoundationToken[];
}

const SPACING_TOKENS: FoundationToken[] = [
  { name: "spacing-0", value: "0px", dtcgType: "dimension" },
  { name: "spacing-px", value: "1px", dtcgType: "dimension" },
  { name: "spacing-0.5", value: "2px", dtcgType: "dimension" },
  { name: "spacing-1", value: "4px", dtcgType: "dimension" },
  { name: "spacing-1.5", value: "6px", dtcgType: "dimension" },
  { name: "spacing-2", value: "8px", dtcgType: "dimension" },
  { name: "spacing-2.5", value: "10px", dtcgType: "dimension" },
  { name: "spacing-3", value: "12px", dtcgType: "dimension" },
  { name: "spacing-4", value: "16px", dtcgType: "dimension" },
  { name: "spacing-5", value: "20px", dtcgType: "dimension" },
  { name: "spacing-6", value: "24px", dtcgType: "dimension" },
  { name: "spacing-8", value: "32px", dtcgType: "dimension" },
  { name: "spacing-10", value: "40px", dtcgType: "dimension" },
  { name: "spacing-12", value: "48px", dtcgType: "dimension" },
  { name: "spacing-16", value: "64px", dtcgType: "dimension" },
  { name: "spacing-20", value: "80px", dtcgType: "dimension" },
  { name: "spacing-24", value: "96px", dtcgType: "dimension" },
];

const TYPOGRAPHY_TOKENS: FoundationToken[] = [
  // Font sizes
  {
    name: "font-size-xs",
    value: "0.75rem",
    dtcgType: "dimension",
    description: "12px - Extra small text",
  },
  {
    name: "font-size-sm",
    value: "0.875rem",
    dtcgType: "dimension",
    description: "14px - Small text",
  },
  {
    name: "font-size-base",
    value: "1rem",
    dtcgType: "dimension",
    description: "16px - Base/body text",
  },
  {
    name: "font-size-lg",
    value: "1.125rem",
    dtcgType: "dimension",
    description: "18px - Large text",
  },
  {
    name: "font-size-xl",
    value: "1.25rem",
    dtcgType: "dimension",
    description: "20px - Extra large text",
  },
  {
    name: "font-size-2xl",
    value: "1.5rem",
    dtcgType: "dimension",
    description: "24px - 2X large heading",
  },
  {
    name: "font-size-3xl",
    value: "1.875rem",
    dtcgType: "dimension",
    description: "30px - 3X large heading",
  },
  {
    name: "font-size-4xl",
    value: "2.25rem",
    dtcgType: "dimension",
    description: "36px - 4X large heading",
  },
  {
    name: "font-size-5xl",
    value: "3rem",
    dtcgType: "dimension",
    description: "48px - 5X large heading",
  },
  // Font weights
  { name: "font-weight-light", value: "300", dtcgType: "fontWeight" },
  { name: "font-weight-regular", value: "400", dtcgType: "fontWeight" },
  { name: "font-weight-medium", value: "500", dtcgType: "fontWeight" },
  { name: "font-weight-semibold", value: "600", dtcgType: "fontWeight" },
  { name: "font-weight-bold", value: "700", dtcgType: "fontWeight" },
  // Line heights
  { name: "line-height-tight", value: "1.25", dtcgType: "number" },
  { name: "line-height-snug", value: "1.375", dtcgType: "number" },
  { name: "line-height-normal", value: "1.5", dtcgType: "number" },
  { name: "line-height-relaxed", value: "1.625", dtcgType: "number" },
  { name: "line-height-loose", value: "2", dtcgType: "number" },
  // Letter spacings
  { name: "letter-spacing-tighter", value: "-0.05em", dtcgType: "dimension" },
  { name: "letter-spacing-tight", value: "-0.025em", dtcgType: "dimension" },
  { name: "letter-spacing-normal", value: "0em", dtcgType: "dimension" },
  { name: "letter-spacing-wide", value: "0.025em", dtcgType: "dimension" },
  { name: "letter-spacing-wider", value: "0.05em", dtcgType: "dimension" },
];

const RADIUS_TOKENS: FoundationToken[] = [
  { name: "radius-none", value: "0px", dtcgType: "dimension" },
  { name: "radius-sm", value: "2px", dtcgType: "dimension" },
  { name: "radius-md", value: "4px", dtcgType: "dimension" },
  { name: "radius-lg", value: "8px", dtcgType: "dimension" },
  { name: "radius-xl", value: "12px", dtcgType: "dimension" },
  { name: "radius-2xl", value: "16px", dtcgType: "dimension" },
  { name: "radius-3xl", value: "24px", dtcgType: "dimension" },
  { name: "radius-full", value: "9999px", dtcgType: "dimension" },
];

const SHADOW_TOKENS: FoundationToken[] = [
  { name: "shadow-none", value: "none", dtcgType: "shadow" },
  {
    name: "shadow-xs",
    value: "0 1px 2px 0 rgba(0,0,0,0.05)",
    dtcgType: "shadow",
  },
  {
    name: "shadow-sm",
    value: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
    dtcgType: "shadow",
  },
  {
    name: "shadow-md",
    value: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
    dtcgType: "shadow",
  },
  {
    name: "shadow-lg",
    value:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    dtcgType: "shadow",
  },
  {
    name: "shadow-xl",
    value:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    dtcgType: "shadow",
  },
  {
    name: "shadow-2xl",
    value: "0 25px 50px -12px rgba(0,0,0,0.25)",
    dtcgType: "shadow",
  },
  {
    name: "shadow-inner",
    value: "inset 0 2px 4px 0 rgba(0,0,0,0.05)",
    dtcgType: "shadow",
  },
];

const MOTION_TOKENS: FoundationToken[] = [
  // Durations
  { name: "duration-instant", value: "0ms", dtcgType: "duration" },
  { name: "duration-fast", value: "100ms", dtcgType: "duration" },
  { name: "duration-normal", value: "200ms", dtcgType: "duration" },
  { name: "duration-slow", value: "300ms", dtcgType: "duration" },
  { name: "duration-slower", value: "500ms", dtcgType: "duration" },
  { name: "duration-slowest", value: "1000ms", dtcgType: "duration" },
  // Easings
  { name: "easing-linear", value: "cubic-bezier(0, 0, 1, 1)", dtcgType: "cubicBezier" },
  { name: "easing-ease-in", value: "cubic-bezier(0.4, 0, 1, 1)", dtcgType: "cubicBezier" },
  { name: "easing-ease-out", value: "cubic-bezier(0, 0, 0.2, 1)", dtcgType: "cubicBezier" },
  {
    name: "easing-ease-in-out",
    value: "cubic-bezier(0.4, 0, 0.2, 1)",
    dtcgType: "cubicBezier",
  },
  {
    name: "easing-spring",
    value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    dtcgType: "cubicBezier",
  },
];

export const FOUNDATION_SCALES: FoundationScale[] = [
  {
    id: "spacing",
    label: "Spacing",
    description: "Consistent spacing scale for margins, padding, and gaps",
    icon: "↔",
    tokens: SPACING_TOKENS,
  },
  {
    id: "typography",
    label: "Typography",
    description: "Type scale, weights, and line heights",
    icon: "Aa",
    tokens: TYPOGRAPHY_TOKENS,
  },
  {
    id: "radius",
    label: "Border Radius",
    description: "Corner rounding scale from sharp to circular",
    icon: "◰",
    tokens: RADIUS_TOKENS,
  },
  {
    id: "shadow",
    label: "Shadow & Elevation",
    description: "Layered shadow scale for depth and elevation",
    icon: "◫",
    tokens: SHADOW_TOKENS,
  },
  {
    id: "motion",
    label: "Motion",
    description: "Duration and easing tokens for animations and transitions",
    icon: "⟳",
    tokens: MOTION_TOKENS,
  },
];

/**
 * Convert enabled foundation token categories to W3C Design Tokens Community Group format
 */
export function foundationTokensToDTCG(
  enabledCategories: FoundationCategory[]
): Record<string, any> {
  const dtcg: Record<string, any> = {};

  enabledCategories.forEach((categoryId) => {
    const scale = FOUNDATION_SCALES.find((s) => s.id === categoryId);
    if (!scale) return;

    dtcg[categoryId] = {
      $description: scale.description,
    };

    scale.tokens.forEach((token) => {
      dtcg[categoryId][token.name] = {
        $value: token.value,
        $type: token.dtcgType,
      };
      if (token.description) {
        dtcg[categoryId][token.name].$description = token.description;
      }
    });
  });

  return dtcg;
}

/**
 * Convert enabled foundation token categories to CSS custom properties
 */
export function foundationTokensToCSS(
  enabledCategories: FoundationCategory[]
): string {
  let css = ":root {\n";

  enabledCategories.forEach((categoryId) => {
    const scale = FOUNDATION_SCALES.find((s) => s.id === categoryId);
    if (!scale) return;

    css += `\n  /* ${scale.label} */\n`;

    scale.tokens.forEach((token) => {
      css += `  --${token.name}: ${token.value};\n`;
    });
  });

  css += "\n}\n";

  return css;
}
