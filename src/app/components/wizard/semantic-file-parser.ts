import type {
  ImportedFileFormat,
  ImportedSemanticFile,
  SemanticGroup,
  SemanticVariant,
  SemanticElement,
} from "./wizard-types";

// ── Known vocabulary for heuristic classification ──────────────────────

const KNOWN_ELEMENTS = new Set([
  "background", "bg", "text", "foreground", "fg",
  "border", "outline", "icon", "shadow", "ring",
  "overlay", "surface", "label", "heading", "caption",
  "placeholder", "separator", "divider",
]);

const KNOWN_PROPERTIES = new Set([
  "color", "colour", "opacity", "weight", "size",
  "radius", "width", "height", "spacing",
]);

const KNOWN_GROUPS = new Set([
  "action", "feedback", "surface", "control", "navigation",
  "layout", "status", "content", "interactive", "overlay",
]);

const KNOWN_VARIANTS = new Set([
  "primary", "secondary", "tertiary", "danger", "error",
  "warning", "success", "info", "neutral", "brand",
  "default", "inverse", "subtle", "muted", "accent",
  "link", "disabled", "active", "hover", "focus",
  "selected", "checked", "raised", "overlay",
]);

// Canonical element names for display
const ELEMENT_CANONICAL: Record<string, string> = {
  bg: "background",
  background: "background",
  fg: "text",
  foreground: "text",
  text: "text",
  label: "text",
  heading: "text",
  caption: "text",
  border: "border",
  outline: "border",
  ring: "border",
  icon: "icon",
  shadow: "shadow",
  overlay: "shadow",
  surface: "background",
  placeholder: "text",
  separator: "border",
  divider: "border",
};

// ── Token name parsers (reused from token-file-parser concept) ─────────

interface RawEntry {
  segments: string[];
  value?: string;
}

const HEX_RE = /^#([0-9a-fA-F]{3,8})$/;
function isHex(v: string) { return HEX_RE.test(v.trim()); }

function parseCSS(content: string): RawEntry[] {
  const entries: RawEntry[] = [];
  const re = /--([\w-]+)\s*:\s*([^;]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const segments = m[1].split(/[-_]+/).filter(Boolean);
    const val = m[2].trim();
    entries.push({ segments, value: isHex(val) ? val.toUpperCase() : undefined });
  }
  return entries;
}

function parseSCSS(content: string): RawEntry[] {
  const entries: RawEntry[] = [];
  const re = /\$([\w-]+)\s*:\s*([^;]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const segments = m[1].split(/[-_]+/).filter(Boolean);
    const val = m[2].trim();
    entries.push({ segments, value: isHex(val) ? val.toUpperCase() : undefined });
  }
  return entries;
}

function flattenJSON(
  obj: Record<string, unknown>,
  path: string[] = [],
  out: RawEntry[] = []
): RawEntry[] {
  for (const [key, val] of Object.entries(obj)) {
    const cur = [...path, key];
    if (typeof val === "string") {
      out.push({ segments: cur, value: isHex(val) ? val.toUpperCase() : undefined });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      const rec = val as Record<string, unknown>;
      const dtcg = rec["$value"] ?? rec["value"];
      if (typeof dtcg === "string") {
        out.push({ segments: cur, value: isHex(dtcg) ? dtcg.toUpperCase() : undefined });
      } else {
        flattenJSON(rec, cur, out);
      }
    }
  }
  return out;
}

function parseJSON(content: string): RawEntry[] {
  try {
    const obj = JSON.parse(content);
    if (typeof obj !== "object" || Array.isArray(obj)) return [];
    return flattenJSON(obj);
  } catch { return []; }
}

function parseTS(content: string): RawEntry[] {
  const entries: RawEntry[] = [];
  const re = /(?:['"]?)([\w-]+)(?:['"]?)\s*[:=]\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    entries.push({
      segments: m[1].split(/[-_]+/).filter(Boolean),
      value: m[2].toUpperCase(),
    });
  }
  // Also capture CSS/SCSS vars
  for (const e of [...parseCSS(content), ...parseSCSS(content)]) {
    entries.push(e);
  }
  return entries;
}

function detectFormat(fileName: string): ImportedFileFormat | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "css": return "css";
    case "scss": case "sass": return "scss";
    case "json": return "json";
    case "ts": case "tsx": case "js": case "mjs": return "ts";
    default: return null;
  }
}

// ── Semantic structure detection ───────────────────────────────────────
//
// Heuristic: for each token name split into segments, classify each
// segment as group / variant / element / property using vocabulary sets.
// Segments not matching any known set are classified by position:
//   segment[0] → group, segment[1] → variant, remainder → element / property

interface ClassifiedToken {
  group: string;
  variant: string;
  elements: string[];
  property: string;
}

function classify(segments: string[]): ClassifiedToken | null {
  if (segments.length < 2) return null;

  const lower = segments.map((s) => s.toLowerCase());
  let group = "";
  let variant = "";
  const elements: string[] = [];
  let property = "";

  for (const seg of lower) {
    if (KNOWN_PROPERTIES.has(seg)) {
      property = seg;
    } else if (KNOWN_ELEMENTS.has(seg)) {
      elements.push(ELEMENT_CANONICAL[seg] || seg);
    } else if (!group && KNOWN_GROUPS.has(seg)) {
      group = seg;
    } else if (!variant && KNOWN_VARIANTS.has(seg)) {
      variant = seg;
    } else if (!group) {
      group = seg;
    } else if (!variant) {
      variant = seg;
    } else if (elements.length === 0) {
      elements.push(ELEMENT_CANONICAL[seg] || seg);
    }
  }

  if (!group || !variant) return null;
  return { group, variant, elements, property: property || "color" };
}

// ── Build SemanticGroup[] from classified tokens ───────────────────────

function buildSemanticGroups(entries: RawEntry[]): SemanticGroup[] {
  // group-name → variant-name → Set<element-name>
  const tree = new Map<string, Map<string, Set<string>>>();

  for (const entry of entries) {
    const cls = classify(entry.segments);
    if (!cls) continue;

    if (!tree.has(cls.group)) tree.set(cls.group, new Map());
    const variants = tree.get(cls.group)!;

    if (!variants.has(cls.variant)) variants.set(cls.variant, new Set());
    const els = variants.get(cls.variant)!;

    for (const el of cls.elements) els.add(el);
    // If no element was detected, default to common set
    if (cls.elements.length === 0) {
      els.add("background");
      els.add("text");
      els.add("border");
    }
  }

  const groups: SemanticGroup[] = [];

  for (const [groupName, variants] of tree) {
    const ts = Date.now();
    const groupId = `imported-${groupName}-${ts}`;

    const semanticVariants: SemanticVariant[] = [];
    let vi = 0;
    for (const [variantName, elementSet] of variants) {
      const variantId = `${groupId}-${variantName}-${vi++}`;
      const semanticElements: SemanticElement[] = [];

      for (const el of elementSet) {
        semanticElements.push({
          id: `${variantId}-${el}`,
          name: el,
          property: "color",
        });
      }

      // Ensure a stable order: background, text, border, icon, shadow, then rest
      const ORDER = ["background", "text", "border", "icon", "shadow"];
      semanticElements.sort((a, b) => {
        const ai = ORDER.indexOf(a.name);
        const bi = ORDER.indexOf(b.name);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });

      semanticVariants.push({
        id: variantId,
        name: variantName,
        paletteRef: "",
        elements: semanticElements,
      });
    }

    // Heuristic: if a group name matches known groups, type = "group", otherwise "component"
    const type = KNOWN_GROUPS.has(groupName) ? "group" : "component";

    groups.push({
      id: groupId,
      type,
      name: groupName,
      variants: semanticVariants,
    });
  }

  return groups;
}

// ── Main entry point ───────────────────────────────────────────────────

export function parseSemanticFile(
  fileName: string,
  content: string
): ImportedSemanticFile | null {
  const format = detectFormat(fileName);
  if (!format) return null;

  let entries: RawEntry[];
  switch (format) {
    case "css":   entries = parseCSS(content); break;
    case "scss":  entries = parseSCSS(content); break;
    case "json":  entries = parseJSON(content); break;
    case "ts":    entries = parseTS(content); break;
  }

  if (entries.length === 0) return null;

  const detectedGroups = buildSemanticGroups(entries);
  if (detectedGroups.length === 0) return null;

  const totalTokens = entries.length;

  return { fileName, format, detectedGroups, totalTokens };
}
