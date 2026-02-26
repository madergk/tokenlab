import { hexToRgb, getContrastRatio as calcContrastRatio } from "../color-utils";
import type {
  NamingConfig,
  Casing,
  GeneratedToken,
  WizardState,
  StateConfig,
  ScaleConfig,
  ContrastWarning,
  TokenSlot,
} from "./wizard-types";

// Element name abbreviations for abbreviated mode
const ELEMENT_ABBREVIATIONS: Record<string, string> = {
  background: "bg",
  text: "text",
  border: "border",
  icon: "icon",
  shadow: "shadow",
};

// ===== Casing & Name Building =====

export function applyCasing(str: string, casing: Casing): string {
  const lower = str.toLowerCase().replace(/[\s_-]+/g, " ");
  switch (casing) {
    case "kebab":
      return lower.replace(/\s+/g, "-");
    case "camel": {
      const parts = lower.split(" ");
      return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
    }
    case "snake":
      return lower.replace(/\s+/g, "_");
    case "none":
    default:
      return lower.replace(/\s+/g, "-");
  }
}

export function buildTokenName(
  parts: string[],
  config: NamingConfig
): string {
  const filtered = parts.filter(Boolean);
  const cased = filtered.map(p => applyCasing(p, config.casing));
  const name = cased.join(config.separator);
  return config.prefix ? `${config.prefix}${config.separator}${name}` : name;
}

// Build token name from slot values — the primary name builder
// Iterates over enabled slots in order, looks up value in slotValues dict
export function buildTokenFromSlots(
  slotValues: Record<string, string | undefined>,
  naming: NamingConfig
): string {
  const parts: string[] = [];

  for (const slot of naming.slots) {
    if (!slot.enabled) continue;
    const value = slotValues[slot.id];
    if (!value) continue;

    if (naming.abbreviate) {
      // In abbreviated mode: shorten element names and skip property="color"
      if (slot.id === "element" || slot.id === "property") {
        if (slot.id === "property" && value === "color") continue;
        if (slot.id === "element") {
          parts.push(ELEMENT_ABBREVIATIONS[value] || value);
          continue;
        }
      }
    }

    parts.push(value);
  }

  return buildTokenName(parts, naming);
}

// Backward-compat helper used by step previews
export function buildTokenNameSmart(
  rawParts: { element?: string; property?: string; [key: string]: string | undefined },
  orderedKeys: string[],
  config: NamingConfig
): string {
  // If config has slots, use slot-based builder
  if (config.slots && config.slots.length > 0) {
    // Map old keys → slot ids
    const slotValues: Record<string, string | undefined> = {};
    for (const key of orderedKeys) {
      const val = rawParts[key];
      if (!val) continue;
      // Map old part keys to slot ids
      const slotId = mapPartKeyToSlotId(key);
      if (slotId) slotValues[slotId] = val;
    }
    return buildTokenFromSlots(slotValues, config);
  }

  // Fallback: old behavior
  const parts: string[] = [];
  for (const key of orderedKeys) {
    const val = rawParts[key];
    if (!val) continue;
    if (config.abbreviate) {
      if (key === "element") {
        parts.push(ELEMENT_ABBREVIATIONS[val] || val);
        continue;
      }
      if (key === "property" && val === "color") continue;
    }
    parts.push(val);
  }
  return buildTokenName(parts, config);
}

function mapPartKeyToSlotId(key: string): string | null {
  switch (key) {
    case "group": return "component";
    case "component": return "component";
    case "variant": return "role";
    case "element": return "element";
    case "property": return "property";
    case "scale": return "scale";
    case "state": return "state";
    default: return null;
  }
}

// ===== Color Transforms =====

export function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const amount = percent / 100;
  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`.toUpperCase();
}

export function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const amount = 1 - percent / 100;
  const newR = Math.max(0, Math.round(r * amount));
  const newG = Math.max(0, Math.round(g * amount));
  const newB = Math.max(0, Math.round(b * amount));
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`.toUpperCase();
}

export function applyColorTransform(
  hex: string,
  transform: "lighten" | "darken" | "none" | "opacity",
  amount: number
): string {
  switch (transform) {
    case "lighten":
      return lightenColor(hex, amount);
    case "darken":
      return darkenColor(hex, amount);
    case "opacity":
      return lightenColor(hex, amount);
    case "none":
    default:
      return hex;
  }
}

// ===== Palette Resolution =====

export function resolvePaletteColor(
  paletteRef: string,
  palettes: WizardState["selectedPalettes"]
): string {
  if (!paletteRef) return "#888888";
  for (const p of palettes) {
    const ref = `${p.libraryId}:${p.collectionName}`;
    if (ref === paletteRef) return p.baseValue;
  }
  return "#888888";
}

function buildPrimitiveRef(
  paletteRef: string,
  palettes: WizardState["selectedPalettes"],
  config: NamingConfig
): string {
  const palette = palettes.find(
    (p) => `${p.libraryId}:${p.collectionName}` === paletteRef
  );
  if (!palette) return "";

  const baseShade = palette.shades.find(s => s.value.toUpperCase() === palette.baseValue.toUpperCase());
  const shadeName = baseShade?.name || palette.collectionName;
  const cleanName = palette.collectionName.toLowerCase().replace(/\s+/g, "-");
  const shadeMatch = shadeName.match(/(\d+)$/);
  const shadeNum = shadeMatch ? shadeMatch[1] : "";

  const parts = [cleanName];
  if (shadeNum) parts.push(shadeNum);
  return buildTokenName(parts, config);
}

export function getShadeForScale(
  paletteRef: string,
  scaleName: string,
  palettes: WizardState["selectedPalettes"]
): string {
  const palette = palettes.find(
    (p) => `${p.libraryId}:${p.collectionName}` === paletteRef
  );
  if (!palette) return "#888888";
  const shades = palette.shades;
  const total = shades.length;
  switch (scaleName) {
    case "subtle":
      return shades[Math.min(1, total - 1)]?.value || palette.baseValue;
    case "strong":
      return shades[Math.max(0, total - 3)]?.value || palette.baseValue;
    default:
      return palette.baseValue;
  }
}

// ===== Element Color Offset =====

function elementColorOffset(element: string, baseHex: string): string {
  switch (element) {
    case "background":
      return baseHex;
    case "text":
      return lightenColor(baseHex, 90);
    case "border":
      return darkenColor(baseHex, 10);
    case "icon":
      return lightenColor(baseHex, 85);
    default:
      return baseHex;
  }
}

// ===== Token Generation =====

export function generateAllTokens(state: WizardState): { tokens: GeneratedToken[]; warnings: ContrastWarning[] } {
  const tokens: GeneratedToken[] = [];
  const warnings: ContrastWarning[] = [];
  const { naming, groups, states, scales, selectedPalettes } = state;

  const tokensByContext: Record<string, Record<string, GeneratedToken>> = {};

  for (const group of groups) {
    for (const variant of group.variants) {
      if (!variant.paletteRef) continue;

      const baseColor = resolvePaletteColor(variant.paletteRef, selectedPalettes);
      const basePrimitiveRef = buildPrimitiveRef(variant.paletteRef, selectedPalettes, naming);

      for (const element of variant.elements) {
        const enabledScales = scales.filter((s) => s.enabled);
        const enabledStates = states.filter((s) => s.enabled);

        for (const scale of enabledScales) {
          for (const stateConf of enabledStates) {
            // Build slot values for this token
            const slotValues: Record<string, string | undefined> = {
              component: group.name,
              role: variant.name,
              element: element.name,
              property: element.property,
              scale: scale.name !== "default" ? scale.name : undefined,
              state: stateConf.name !== "default" ? stateConf.name : undefined,
            };

            // Calculate color
            let color = baseColor;
            color = applyColorTransform(color, scale.colorTransform, scale.amount);
            color = elementColorOffset(element.name, color);
            color = applyColorTransform(color, stateConf.colorTransform, stateConf.amount);

            const fullName = buildTokenFromSlots(slotValues, naming);

            // Build clean slotValues (only defined values)
            const cleanSlotValues: Record<string, string> = {};
            for (const [k, v] of Object.entries(slotValues)) {
              if (v) cleanSlotValues[k] = v;
            }

            const token: GeneratedToken = {
              fullName,
              parts: {
                group: group.type === "group" ? group.name : undefined,
                component: group.type === "component" ? group.name : undefined,
                variant: variant.name,
                element: element.name,
                property: element.property,
                scale: scale.name !== "default" ? scale.name : undefined,
                state: stateConf.name !== "default" ? stateConf.name : undefined,
              },
              slotValues: cleanSlotValues,
              value: color,
              reference: variant.paletteRef
                ? `${variant.paletteRef.split(":")[1]}`
                : undefined,
              primitiveRef: basePrimitiveRef || undefined,
            };

            tokens.push(token);

            const contextKey = `${group.name}:${variant.name}:${scale.name}:${stateConf.name}`;
            if (!tokensByContext[contextKey]) tokensByContext[contextKey] = {};
            tokensByContext[contextKey][element.name] = token;
          }
        }
      }
    }
  }

  // Check contrast for bg/text pairs
  for (const [contextKey, elements] of Object.entries(tokensByContext)) {
    const bgToken = elements["background"];
    const textToken = elements["text"];
    if (bgToken && textToken) {
      const ratio = calcContrastRatio(bgToken.value, textToken.value);
      if (ratio < 4.5) {
        const [groupName, variantName, scaleName, stateName] = contextKey.split(":");
        warnings.push({
          groupName,
          variantName,
          scale: scaleName !== "default" ? scaleName : undefined,
          state: stateName !== "default" ? stateName : undefined,
          bgToken: bgToken.fullName,
          bgColor: bgToken.value,
          textToken: textToken.fullName,
          textColor: textToken.value,
          contrastRatio: ratio,
        });
      }
    }
  }

  return { tokens, warnings };
}

// ===== Export Helpers =====

export function tokensToCSS(tokens: GeneratedToken[], naming: NamingConfig): string {
  let css = `:root {\n`;
  let lastGroup = "";
  for (const t of tokens) {
    const group = t.parts.group || t.parts.component || "";
    if (group !== lastGroup) {
      if (lastGroup) css += "\n";
      css += `  /* ${group}${t.parts.variant ? ` / ${t.parts.variant}` : ""} */\n`;
      lastGroup = group;
    }
    // Replace both dots and slashes — both are invalid in CSS custom property names
    const varName = t.fullName.replace(/[./]/g, "-");
    const comment = t.primitiveRef ? ` /* ref: ${t.primitiveRef} */` : "";
    css += `  --${varName}: ${t.value};${comment}\n`;
  }
  css += `}\n`;
  return css;
}

export function tokensToSCSS(tokens: GeneratedToken[]): string {
  const primitiveRefs = new Set<string>();
  for (const t of tokens) {
    if (t.primitiveRef) primitiveRefs.add(t.primitiveRef);
  }

  let scss = `// Design Token System\n// Auto-generated\n\n`;

  if (primitiveRefs.size > 0) {
    scss += `// ==========================================\n`;
    scss += `// PRIMITIVE REFERENCES (from selected palettes)\n`;
    scss += `// ==========================================\n`;
    for (const ref of primitiveRefs) {
      scss += `// $${ref.replace(/[./]/g, "-")}\n`;
    }
    scss += `\n`;
  }

  scss += `// ==========================================\n`;
  scss += `// SEMANTIC TOKENS\n`;
  scss += `// ==========================================\n\n`;

  let lastGroup = "";
  for (const t of tokens) {
    const group = t.parts.group || t.parts.component || "";
    if (group !== lastGroup) {
      if (lastGroup) scss += "\n";
      scss += `// ${group.toUpperCase()}${t.parts.variant ? `: ${t.parts.variant}` : ""}\n`;
      lastGroup = group;
    }
    const comment = t.primitiveRef ? ` // ref: $${t.primitiveRef.replace(/[./]/g, "-")}` : "";
    scss += `$${t.fullName.replace(/[./]/g, "-")}: ${t.value};${comment}\n`;
  }
  return scss;
}

export function tokensToJSON(tokens: GeneratedToken[], separator: string = "-"): string {
  const obj: Record<string, any> = {};
  for (const t of tokens) {
    const keys = t.fullName.split(separator);
    let ref: any = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!ref[keys[i]]) ref[keys[i]] = {};
      ref = ref[keys[i]];
    }
    const entry: any = { $value: t.value, $type: "color" };
    if (t.primitiveRef) entry.$primitiveRef = t.primitiveRef;
    ref[keys[keys.length - 1]] = entry;
  }
  return JSON.stringify(obj, null, 2);
}

export function tokensToDTCG(tokens: GeneratedToken[], separator: string = "-"): string {
  const obj: Record<string, any> = {};
  for (const t of tokens) {
    const keys = t.fullName.split(separator);
    let ref: any = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!ref[keys[i]]) ref[keys[i]] = {};
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = {
      $value: t.value,
      $type: "color",
      $description: t.primitiveRef
        ? `Primitive: ${t.primitiveRef}`
        : t.reference ? `Reference: ${t.reference}` : undefined,
    };
  }
  return JSON.stringify(obj, null, 2);
}

export function tokensToTailwind(tokens: GeneratedToken[]): string {
  let config = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
  const grouped: Record<string, Record<string, string>> = {};
  for (const t of tokens) {
    const group = t.parts.group || t.parts.component || "tokens";
    const key = [t.parts.variant, t.parts.element, t.parts.scale, t.parts.state]
      .filter(Boolean)
      .join("-");
    if (!grouped[group]) grouped[group] = {};
    grouped[group][key] = t.value;
  }
  for (const [group, values] of Object.entries(grouped)) {
    config += `        '${group}': {\n`;
    for (const [key, val] of Object.entries(values)) {
      config += `          '${key}': '${val}',\n`;
    }
    config += `        },\n`;
  }
  config += `      },\n    },\n  },\n};`;
  return config;
}

export function tokensToJS(tokens: GeneratedToken[]): string {
  let js = `// Design Token System\n// Auto-generated\n\nexport const tokens = {\n`;
  const grouped: Record<string, GeneratedToken[]> = {};
  for (const t of tokens) {
    const group = t.parts.group || t.parts.component || "tokens";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(t);
  }
  for (const [group, toks] of Object.entries(grouped)) {
    js += `  ${group}: {\n`;
    for (const t of toks) {
      const key = [t.parts.variant, t.parts.element, t.parts.scale, t.parts.state]
        .filter(Boolean)
        .join("_");
      js += `    '${key}': '${t.value}',\n`;
    }
    js += `  },\n`;
  }
  js += `};\n`;
  return js;
}
