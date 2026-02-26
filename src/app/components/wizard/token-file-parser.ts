import type {
  ImportedFileFormat,
  ParsedToken,
  ParsedTokenGroup,
  ImportedTokenFile,
} from "./wizard-types";

const HEX_RE = /^#([0-9a-fA-F]{3,8})$/;

function isHexColor(v: string): boolean {
  return HEX_RE.test(v.trim());
}

function normalizeHex(v: string): string {
  let h = v.trim().toUpperCase();
  if (h.length === 4) h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  return h;
}

// ── CSS: --var-name: #hex; ─────────────────────────────────────────────
function parseCSS(content: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  const re = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    tokens.push({ name: m[1], value: normalizeHex(m[2]), path: m[1].split("-") });
  }
  return tokens;
}

// ── SCSS: $var-name: #hex; ─────────────────────────────────────────────
function parseSCSS(content: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  const re = /\$([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    tokens.push({ name: `$${m[1]}`, value: normalizeHex(m[2]), path: m[1].split("-") });
  }
  return tokens;
}

// ── JSON: recursive traversal ──────────────────────────────────────────
function flattenJSON(
  obj: Record<string, unknown>,
  path: string[] = [],
  out: ParsedToken[] = []
): ParsedToken[] {
  for (const [key, val] of Object.entries(obj)) {
    const currentPath = [...path, key];

    if (typeof val === "string" && isHexColor(val)) {
      out.push({ name: currentPath.join("-"), value: normalizeHex(val), path: currentPath });
      continue;
    }

    if (val && typeof val === "object" && !Array.isArray(val)) {
      const record = val as Record<string, unknown>;

      // DTCG / Tokens Studio format: { "$value": "#hex" }
      const dtcgVal = record["$value"] ?? record["value"];
      if (typeof dtcgVal === "string" && isHexColor(dtcgVal)) {
        out.push({ name: currentPath.join("-"), value: normalizeHex(dtcgVal), path: currentPath });
        continue;
      }

      flattenJSON(record, currentPath, out);
    }
  }
  return out;
}

function parseJSON(content: string): ParsedToken[] {
  try {
    const obj = JSON.parse(content);
    if (typeof obj !== "object" || Array.isArray(obj)) return [];
    return flattenJSON(obj);
  } catch {
    return [];
  }
}

// ── TS/JS: best-effort regex extraction ────────────────────────────────
function parseTS(content: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  // Match patterns like:  key: "#hex"  or  'key': '#hex'  or  key = "#hex"
  const re = /(?:['"]?)([\w-]+)(?:['"]?)\s*[:=]\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    tokens.push({ name: m[1], value: normalizeHex(m[2]), path: m[1].split(/[-_]/) });
  }

  // Also capture CSS custom properties if embedded
  const cssTokens = parseCSS(content);
  const scssTokens = parseSCSS(content);
  const names = new Set(tokens.map((t) => t.name));
  for (const t of [...cssTokens, ...scssTokens]) {
    if (!names.has(t.name)) {
      tokens.push(t);
      names.add(t.name);
    }
  }

  return tokens;
}

// ── Format detection ───────────────────────────────────────────────────
export function detectFormat(fileName: string): ImportedFileFormat | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "css":
      return "css";
    case "scss":
    case "sass":
      return "scss";
    case "json":
      return "json";
    case "ts":
    case "tsx":
    case "js":
    case "mjs":
      return "ts";
    default:
      return null;
  }
}

// ── Grouping by common prefix ──────────────────────────────────────────
function groupTokens(tokens: ParsedToken[]): ParsedTokenGroup[] {
  const buckets = new Map<string, ParsedToken[]>();

  for (const t of tokens) {
    // Use the first path segment as the group key
    const groupKey = t.path.length > 1 ? t.path[0] : "_ungrouped";
    if (!buckets.has(groupKey)) buckets.set(groupKey, []);
    buckets.get(groupKey)!.push(t);
  }

  const groups: ParsedTokenGroup[] = [];
  for (const [key, toks] of buckets) {
    // If a "group" has only 1 token, merge into ungrouped
    if (toks.length === 1 && key !== "_ungrouped") {
      const misc = buckets.get("_ungrouped") ?? [];
      misc.push(toks[0]);
      buckets.set("_ungrouped", misc);
      continue;
    }
    if (key === "_ungrouped") continue;
    groups.push({
      groupName: key.charAt(0).toUpperCase() + key.slice(1),
      tokens: toks,
    });
  }

  // Append ungrouped at the end
  const ungrouped = buckets.get("_ungrouped");
  if (ungrouped?.length) {
    groups.push({ groupName: "Other", tokens: ungrouped });
  }

  return groups;
}

// ── Main entry point ───────────────────────────────────────────────────
export function parseTokenFile(
  fileName: string,
  content: string
): ImportedTokenFile | null {
  const format = detectFormat(fileName);
  if (!format) return null;

  let tokens: ParsedToken[];
  switch (format) {
    case "css":
      tokens = parseCSS(content);
      break;
    case "scss":
      tokens = parseSCSS(content);
      break;
    case "json":
      tokens = parseJSON(content);
      break;
    case "ts":
      tokens = parseTS(content);
      break;
  }

  if (tokens.length === 0) return null;

  const groups = groupTokens(tokens);

  return {
    fileName,
    format,
    rawContent: content,
    groups,
    totalTokens: tokens.length,
  };
}

// ── Convert parsed groups → SelectedPalettes ───────────────────────────
import type { SelectedPalette } from "./wizard-types";

export function importedGroupsToPalettes(
  groups: ParsedTokenGroup[]
): SelectedPalette[] {
  return groups.map((g) => {
    // Pick the middle token's value as the representative base
    const midIdx = Math.floor(g.tokens.length / 2);
    const baseValue = g.tokens[midIdx].value;

    return {
      libraryId: "imported",
      collectionName: g.groupName,
      baseValue,
      shades: g.tokens.map((t) => ({ name: t.name, value: t.value })),
    };
  });
}
