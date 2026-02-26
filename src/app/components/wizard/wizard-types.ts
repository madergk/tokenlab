export interface SelectedPalette {
  libraryId: string;
  collectionName: string;
  baseValue: string;
  shades: { name: string; value: string }[];
}

export type Separator = "." | "-" | "/" | "_";
export type Casing = "kebab" | "camel" | "snake" | "none";

// ===== Token Slot System =====

export type SlotGroupId = "namespace" | "object" | "category" | "modifiers";

export interface TokenSlot {
  id: string;
  group: SlotGroupId;
  label: string;
  description: string;
  color: string;
  enabled: boolean;
  presets: string[];
  selectedExample: string;
}

export interface TokenSlotGroupDef {
  id: SlotGroupId;
  label: string;
  sublabel: string;
  description: string;
  color: string;
}

export const TOKEN_SLOT_GROUPS: TokenSlotGroupDef[] = [
  {
    id: "namespace",
    label: "Namespace",
    sublabel: "Context",
    description: "Define the broad context: system, theme, domain or level.",
    color: "#09090b",
  },
  {
    id: "object",
    label: "Object",
    sublabel: "Where",
    description: "Refers to the component, element or group. Defines the \"where\".",
    color: "#3f3f46",
  },
  {
    id: "category",
    label: "Category",
    sublabel: "What",
    description: "Defines the type of visual design attribute. Defines the \"what\".",
    color: "#198754",
  },
  {
    id: "modifiers",
    label: "Modifiers",
    sublabel: "Which / How / When",
    description: "Adds purpose with variant, state, scale and mode.",
    color: "#71717a",
  },
];

// Token name order: the array order determines the part order in the generated name.
// UI groups them visually by .group, but the name follows this sequence.
export const DEFAULT_TOKEN_SLOTS: TokenSlot[] = [
  // ── Namespace ──
  {
    id: "system",
    group: "namespace",
    label: "System",
    description: "Identifies the global system",
    color: "#3f3f46",
    enabled: false,
    presets: ["das", "ds", "ui", "app", "acme", "mad"],
    selectedExample: "das",
  },
  {
    id: "tier",
    group: "namespace",
    label: "Tier",
    description: "Level within the system (core, sys, comp)",
    color: "#52525b",
    enabled: false,
    presets: ["core", "sys", "comp", "ref", "semantic", "theme"],
    selectedExample: "sys",
  },

  // ── Object ──
  {
    id: "component",
    group: "object",
    label: "Component",
    description: "Associated component or semantic group",
    color: "#3f3f46",
    enabled: true,
    presets: [
      // Semantic groups
      "action", "control", "feedback", "surface",
      // Components
      "accordion", "alert", "autocomplete", "avatar", "badge",
      "breadcrumbs", "button", "buttonGroup", "calendar", "card",
      "carousel", "checkbox", "chips", "colorPicker", "datePicker",
      "divider", "dropdown", "emptyState", "fileUpload", "footer",
      "form", "header", "input", "list", "loader", "logo",
      "media", "menu", "modal", "navigation", "overlay",
      "pagination", "progressIndicator", "progressTracker", "radio",
      "rating", "richTextEditor", "scrollbar", "search", "select",
      "slider", "snackbar", "statistics", "stepper", "switch",
      "table", "tabs", "tag", "textArea", "textFields",
      "timePicker", "tooltips", "typography",
    ],
    selectedExample: "button",
  },
  {
    id: "foundation",
    group: "object",
    label: "Foundation",
    description: "Foundation styles or attributes",
    color: "#0EA5E9",
    enabled: false,
    presets: ["border", "color", "elevation", "font", "palette", "spacing"],
    selectedExample: "color",
  },

  // ── Category ──
  {
    id: "property",
    group: "category",
    label: "Property",
    description: "Visual property being styled",
    color: "#3f3f46",
    enabled: true,
    presets: [
      "color", "radius", "width", "family", "size", "weight",
      "inline", "inset", "insetSquish", "insetStretch",
      "letterSpacing", "lineHeight", "opacity", "shadow",
      "stack", "surface", "textDecoration",
    ],
    selectedExample: "color",
  },
  {
    id: "element",
    group: "category",
    label: "Element",
    description: "Specific part of the component where it applies",
    color: "#059669",
    enabled: true,
    presets: [
      "bg", "body", "chart", "description", "desktop",
      "heading", "icon", "input", "label", "leading",
      "message", "mobile", "outline", "overlay", "skeleton",
      "tablet", "text", "trailing",
    ],
    selectedExample: "bg",
  },

  // ── Modifiers ──
  {
    id: "role",
    group: "modifiers",
    label: "Role",
    description: "Role or semantic function",
    color: "#a1a1aa",
    enabled: true,
    presets: [
      "primary", "secondary", "danger", "success", "info", "warning",
      "neutral", "brand", "link",
      "accent-aqua", "accent-mint", "accent-pink",
      "aqua", "blue", "green", "light-blue", "mint",
      "orange", "pink", "purple", "red", "yellow",
      "new", "update",
    ],
    selectedExample: "primary",
  },
  {
    id: "variant",
    group: "modifiers",
    label: "Variant",
    description: "Alternative use case of the component",
    color: "#EA580C",
    enabled: false,
    presets: [
      "default", "subtle", "subtlest", "bold", "solid",
      "inverse", "gradient", "dashed",
      "main", "medium", "regular",
      "italic", "underline", "uppercase", "lowercase",
      "strikethrough", "truncate",
      "left", "right", "top", "bottom", "circle",
      "increased", "decreased",
      "50", "100", "200", "300", "400", "500",
      "600", "700", "800", "900", "1000",
    ],
    selectedExample: "default",
  },
  {
    id: "state",
    group: "modifiers",
    label: "State",
    description: "Interactive state",
    color: "#3f3f46",
    enabled: true,
    presets: [
      "active", "checked", "collapsed", "disabled", "enabled",
      "expanded", "focused", "hovered", "loading", "pressed",
      "raised", "selected", "unchecked", "visited",
    ],
    selectedExample: "hovered",
  },
  {
    id: "scale",
    group: "modifiers",
    label: "Scale",
    description: "Scale, size or ordinal range",
    color: "#52525b",
    enabled: true,
    presets: [
      "xxs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl",
      "heading1", "heading2", "heading3", "heading4", "heading5", "heading6",
      "body1", "body2", "body3", "body4", "body5",
      "level0", "level1", "level2", "level3", "level4",
      "default", "compact", "scale",
      "-0", "-05", "-1", "-2", "-4", "-8", "-11", "-12",
      "-14", "-16", "-20", "-24", "-32", "-40", "-48",
      "-64", "-80", "-100",
    ],
    selectedExample: "md",
  },
  {
    id: "modifier",
    group: "modifiers",
    label: "Additional Modifier",
    description: "Relevant additional detail",
    color: "#E11D48",
    enabled: false,
    presets: [
      "label", "caption1", "caption2", "medium",
      "underlined", "regular", "soft", "dark",
    ],
    selectedExample: "label",
  },
  {
    id: "mode",
    group: "modifiers",
    label: "Mode",
    description: "Visual mode (light/dark)",
    color: "#475569",
    enabled: false,
    presets: ["dark", "light", "high-contrast"],
    selectedExample: "dark",
  },
];

// ===== Naming Config =====

export interface NamingConfig {
  separator: Separator;
  prefix: string;
  casing: Casing;
  abbreviate: boolean;
  slots: TokenSlot[];
}

// ===== Semantic Types =====

export interface SemanticGroup {
  id: string;
  type: "group" | "component";
  name: string;
  variants: SemanticVariant[];
}

export interface SemanticVariant {
  id: string;
  name: string;
  paletteRef: string; // "libraryId:collectionName"
  elements: SemanticElement[];
  shadeIndex?: number; // index into palette.shades — defaults to base value
  textMode?: "light" | "dark" | "auto"; // foreground text color strategy
}

export interface SemanticElement {
  id: string;
  name: string; // background, text, border, icon, shadow
  property: string; // color, opacity, etc.
}

export interface StateConfig {
  id: string;
  name: string;
  enabled: boolean;
  colorTransform: "lighten" | "darken" | "none" | "opacity";
  amount: number;
}

export interface ScaleConfig {
  id: string;
  name: string;
  enabled: boolean;
  colorTransform: "lighten" | "darken" | "none";
  amount: number;
}

export interface GeneratedToken {
  fullName: string;
  parts: {
    group?: string;
    component?: string;
    variant?: string;
    element?: string;
    property?: string;
    type?: string;
    scale?: string;
    state?: string;
  };
  slotValues: Record<string, string>; // keyed by slot id
  value: string;
  reference?: string;
  primitiveRef?: string;
}

// Contrast warning for bg/text pairs
export interface ContrastWarning {
  groupName: string;
  variantName: string;
  scale?: string;
  state?: string;
  bgToken: string;
  bgColor: string;
  textToken: string;
  textColor: string;
  contrastRatio: number;
}

// ===== Imported File Types =====

export type ImportedFileFormat = "css" | "json" | "scss" | "ts";

export interface ParsedToken {
  name: string;
  value: string;
  path: string[];
}

export interface ParsedTokenGroup {
  groupName: string;
  tokens: ParsedToken[];
}

export interface ImportedTokenFile {
  fileName: string;
  format: ImportedFileFormat;
  rawContent: string;
  groups: ParsedTokenGroup[];
  totalTokens: number;
}

export interface ImportedSemanticFile {
  fileName: string;
  format: ImportedFileFormat;
  detectedGroups: SemanticGroup[];
  totalTokens: number;
}

export interface WizardState {
  currentStep: number;
  selectedPalettes: SelectedPalette[];
  naming: NamingConfig;
  groups: SemanticGroup[];
  states: StateConfig[];
  scales: ScaleConfig[];
  generatedTokens: GeneratedToken[];
  contrastWarnings: ContrastWarning[];
  importedFile?: ImportedTokenFile;
  importedSemanticFile?: ImportedSemanticFile;
  // Phase 4: foundation token categories to include in export
  enabledFoundations: import("../../../data/foundation-tokens").FoundationCategory[];
}

// ===== Defaults =====

export const DEFAULT_STATES: StateConfig[] = [
  { id: "default", name: "default", enabled: true, colorTransform: "none", amount: 0 },
  { id: "hover", name: "hover", enabled: true, colorTransform: "darken", amount: 8 },
  { id: "active", name: "active", enabled: true, colorTransform: "darken", amount: 16 },
  { id: "focus", name: "focus", enabled: true, colorTransform: "lighten", amount: 20 },
  { id: "disabled", name: "disabled", enabled: true, colorTransform: "opacity", amount: 40 },
];

export const DEFAULT_SCALES: ScaleConfig[] = [
  { id: "subtle", name: "subtle", enabled: true, colorTransform: "lighten", amount: 80 },
  { id: "default", name: "default", enabled: true, colorTransform: "none", amount: 0 },
  { id: "strong", name: "strong", enabled: true, colorTransform: "darken", amount: 20 },
];

export const DEFAULT_ELEMENTS: SemanticElement[] = [
  { id: "bg", name: "background", property: "color" },
  { id: "text", name: "text", property: "color" },
  { id: "border", name: "border", property: "color" },
  { id: "icon", name: "icon", property: "color" },
];

export const PRESET_GROUPS: SemanticGroup[] = [
  {
    id: "action",
    type: "group",
    name: "action",
    variants: [
      { id: "action-primary", name: "primary", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "action-secondary", name: "secondary", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "action-danger", name: "danger", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
    ],
  },
  {
    id: "feedback",
    type: "group",
    name: "feedback",
    variants: [
      { id: "feedback-success", name: "success", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "feedback-warning", name: "warning", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "feedback-error", name: "error", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "feedback-info", name: "info", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
    ],
  },
  {
    id: "surface",
    type: "group",
    name: "surface",
    variants: [
      { id: "surface-default", name: "default", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "surface-raised", name: "raised", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "surface-overlay", name: "overlay", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
    ],
  },
  {
    id: "control",
    type: "group",
    name: "control",
    variants: [
      { id: "control-default", name: "default", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
      { id: "control-checked", name: "checked", paletteRef: "", elements: [...DEFAULT_ELEMENTS] },
    ],
  },
];

export const INITIAL_WIZARD_STATE: WizardState = {
  currentStep: 0,
  selectedPalettes: [],
  naming: {
    separator: ".",
    prefix: "",
    casing: "kebab",
    abbreviate: false,
    slots: DEFAULT_TOKEN_SLOTS.map(s => ({ ...s })),
  },
  groups: [],
  states: DEFAULT_STATES,
  scales: DEFAULT_SCALES,
  generatedTokens: [],
  contrastWarnings: [],
  enabledFoundations: ["spacing", "radius"],   // sensible defaults — spacing and radius always useful
};

export const STEP_LABELS = [
  { title: "Base Palette",        description: "Select primitive colors" },
  { title: "Naming Convention",   description: "Configure the semantic naming structure" },
  { title: "Semantic Tokens",     description: "Define groups and color mapping" },
  { title: "States & Scales",     description: "Configure interactive modifiers" },
  { title: "Foundation Tokens",   description: "Add spacing, typography, radius, shadow and motion scales" },
  { title: "Review & Export",     description: "Final view and export" },
  { title: "Theme Preview",       description: "Live preview of your design system" },
];
