import { useState, useMemo } from "react";
import {
  Download,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  FileCode,
  TreeDeciduous,
  List,
  ChartBarBig,
  AlertTriangle,
  Link2,
} from "lucide-react";
import { getBestTextColor, getContrastRatio, getAccessibilityLevel } from "../color-utils";
import {
  tokensToCSS,
  tokensToSCSS,
  tokensToJSON,
  tokensToDTCG,
  tokensToTailwind,
  tokensToJS,
} from "./wizard-utils";
import {
  foundationTokensToDTCG,
  foundationTokensToCSS,
  FOUNDATION_SCALES,
} from "../../../data/foundation-tokens";
import type { WizardState, GeneratedToken, ContrastWarning } from "./wizard-types";

interface StepReviewProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

type ViewMode = "tree" | "flat" | "contrast";
type ExportFormat = "css" | "scss" | "json" | "dtcg" | "tailwind" | "js";

const FORMAT_OPTIONS: { id: ExportFormat; label: string; ext: string }[] = [
  { id: "css", label: "CSS Variables", ext: ".css" },
  { id: "scss", label: "SCSS", ext: ".scss" },
  { id: "json", label: "JSON", ext: ".json" },
  { id: "dtcg", label: "DTCG (W3C)", ext: ".tokens.json" },
  { id: "tailwind", label: "Tailwind", ext: ".config.js" },
  { id: "js", label: "JS Module", ext: ".js" },
];

export function StepReview({ state }: StepReviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["all"])
  );

  const tokens = state.generatedTokens;
  const warnings = state.contrastWarnings || [];

  // Filter tokens
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;
    const q = searchQuery.toLowerCase();
    return tokens.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.value.toLowerCase().includes(q) ||
        (t.primitiveRef && t.primitiveRef.toLowerCase().includes(q))
    );
  }, [tokens, searchQuery]);

  // Group tokens for tree view
  const groupedTokens = useMemo(() => {
    const groups: Record<string, Record<string, GeneratedToken[]>> = {};
    for (const t of filteredTokens) {
      const groupKey = t.parts.group || t.parts.component || "other";
      const varKey = t.parts.variant || "default";
      if (!groups[groupKey]) groups[groupKey] = {};
      if (!groups[groupKey][varKey]) groups[groupKey][varKey] = [];
      groups[groupKey][varKey].push(t);
    }
    return groups;
  }, [filteredTokens]);

  // Stats
  const stats = useMemo(() => {
    const groups = new Set<string>();
    const variants = new Set<string>();
    const elements = new Set<string>();
    for (const t of tokens) {
      if (t.parts.group) groups.add(t.parts.group);
      if (t.parts.component) groups.add(t.parts.component);
      if (t.parts.variant) variants.add(t.parts.variant);
      if (t.parts.element) elements.add(t.parts.element);
    }
    return {
      total: tokens.length,
      groups: groups.size,
      variants: variants.size,
      elements: elements.size,
    };
  }, [tokens]);

  // Foundation token count
  const foundationTokenCount = useMemo(() => {
    return FOUNDATION_SCALES
      .filter(s => state.enabledFoundations.includes(s.id))
      .reduce((sum, s) => sum + s.tokens.length, 0);
  }, [state.enabledFoundations]);

  // Export code — memoized; merges color tokens + enabled foundation tokens.
  // Avoids re-running expensive JSON.parse/stringify on every render.
  const exportCode = useMemo(() => {
    const hasFdn = state.enabledFoundations.length > 0;

    switch (exportFormat) {
      case "css": {
        const base = tokensToCSS(tokens, state.naming);
        if (!hasFdn) return base;
        return base + "\n" + foundationTokensToCSS(state.enabledFoundations);
      }
      case "scss": {
        // tokensToSCSS no longer takes a naming param
        const base = tokensToSCSS(tokens);
        if (!hasFdn) return base;
        // Reformat the CSS `:root { --var: val; }` block into SCSS `$var: val;` declarations
        const fdnCss = foundationTokensToCSS(state.enabledFoundations);
        const fdnScss = fdnCss
          .replace(":root {", "\n// ── Foundation tokens ──")
          .replace(/^\}$/m, "")
          .replace(/  --([\w.-]+):\s*(.+);/gm, "  \$$1: $2;");
        return base + fdnScss;
      }
      case "json": {
        const obj = JSON.parse(tokensToJSON(tokens, state.naming.separator)) as Record<string, unknown>;
        if (hasFdn) {
          const fdnObj: Record<string, Record<string, string>> = {};
          FOUNDATION_SCALES
            .filter(s => state.enabledFoundations.includes(s.id))
            .forEach(scale => {
              fdnObj[scale.id] = {};
              scale.tokens.forEach(t => { fdnObj[scale.id][t.name] = t.value; });
            });
          obj["foundation"] = fdnObj;
        }
        return JSON.stringify(obj, null, 2);
      }
      case "dtcg": {
        const obj = JSON.parse(tokensToDTCG(tokens, state.naming.separator)) as Record<string, unknown>;
        if (hasFdn) {
          const fdnDtcg = foundationTokensToDTCG(state.enabledFoundations);
          Object.assign(obj, fdnDtcg);
        }
        return JSON.stringify(obj, null, 2);
      }
      case "tailwind":
        return tokensToTailwind(tokens);
      case "js":
        return tokensToJS(tokens);
    }
  }, [exportFormat, tokens, state.enabledFoundations, state.naming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fmt = FORMAT_OPTIONS.find((f) => f.id === exportFormat);
    const name = `design-tokens${fmt?.ext || ".txt"}`;
    const blob = new Blob([exportCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[12px]">
        {[
          {
            label: "Color tokens",
            value: stats.total,
            color: "#09090b",
            icon: <ChartBarBig size={16} />,
          },
          {
            label: "Groups",
            value: stats.groups,
            color: "#71717a",
            icon: <TreeDeciduous size={16} />,
          },
          {
            label: "Variants",
            value: stats.variants,
            color: "#a1a1aa",
            icon: <List size={16} />,
          },
          {
            label: "Elements",
            value: stats.elements,
            color: "#52525b",
            icon: <FileCode size={16} />,
          },
          {
            label: "Foundation tokens",
            value: foundationTokenCount,
            color: foundationTokenCount > 0 ? "#52525b" : "#a1a1aa",
            icon: <FileCode size={16} />,
          },
          {
            label: "Contrast alerts",
            value: warnings.length,
            color: warnings.length > 0 ? "#3f3f46" : "#52525b",
            icon: <AlertTriangle size={16} />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px] flex items-center gap-[12px]"
          >
            <div
              className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: s.color }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-[22px] text-[#09090b]" style={{ fontWeight: 700 }}>
                {s.value}
              </p>
              <p className="text-[11px] text-[#71717a]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contrast warnings panel */}
      {warnings.length > 0 && (
        <div className="bg-[#fafafa] rounded-[12px] border border-[#e4e4e7] p-[16px]">
          <div className="flex items-center gap-[8px] mb-[12px]">
            <AlertTriangle size={16} className="text-[#a1a1aa]" />
            <h3 className="text-[14px] text-[#52525b]" style={{ fontWeight: 600 }}>
              WCAG AA contrast alerts
            </h3>
            <span className="text-[10px] px-[6px] py-[1px] rounded-full bg-[#f4f4f5] text-[#27272a]" style={{ fontWeight: 600 }}>
              {warnings.length} {warnings.length === 1 ? "pair" : "pairs"} fail
            </span>
          </div>
          <p className="text-[11px] text-[#71717a] mb-[12px]">
            The following background and text pairs do not meet the minimum contrast ratio of 4.5:1 required by WCAG AA for normal text.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[8px] max-h-[240px] overflow-y-auto">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-center gap-[8px] p-[8px] rounded-[8px] bg-white border border-[#e4e4e7]">
                {/* Visual preview */}
                <div
                  className="w-[36px] h-[36px] rounded-[6px] flex items-center justify-center shrink-0 border border-black/8"
                  style={{ backgroundColor: w.bgColor }}
                >
                  <span
                    className="text-[10px]"
                    style={{ color: w.textColor, fontWeight: 700 }}
                  >
                    Aa
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#09090b] truncate" style={{ fontWeight: 600 }}>
                    {w.groupName} / {w.variantName}
                    {w.scale && ` / ${w.scale}`}
                    {w.state && ` / ${w.state}`}
                  </p>
                  <p className="text-[9px] text-[#71717a] truncate">
                    bg: {w.bgColor} &middot; text: {w.textColor}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] text-[#3f3f46]" style={{ fontWeight: 600 }}>
                    {w.contrastRatio.toFixed(1)}:1
                  </span>
                  <span className="text-[8px] text-[#27272a]">min 4.5:1</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-[12px] flex-wrap">
        <div className="flex items-center gap-[6px]">
          {/* View toggles */}
          <div className="flex items-center gap-[2px] bg-[#f4f4f5] rounded-[8px] p-[3px]">
            {(
              [
                { id: "tree" as ViewMode, icon: <TreeDeciduous size={13} />, label: "Tree" },
                { id: "flat" as ViewMode, icon: <List size={13} />, label: "List" },
                { id: "contrast" as ViewMode, icon: <AlertTriangle size={13} />, label: "Contrast" },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`flex items-center gap-[4px] px-[10px] py-[5px] rounded-[6px] text-[11px] transition-all cursor-pointer ${
                  viewMode === v.id
                    ? "bg-white text-[#09090b] shadow-sm"
                    : "text-[#71717a] hover:text-[#52525b]"
                }`}
                style={viewMode === v.id ? { fontWeight: 500 } : undefined}
              >
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
                {v.id === "contrast" && warnings.length > 0 && (
                  <span className="w-[16px] h-[16px] rounded-full bg-[#3f3f46] text-white text-[8px] flex items-center justify-center" style={{ fontWeight: 700 }}>
                    {warnings.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#a1a1aa]"
            />
            <input
              type="text"
              placeholder="Search token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-[30px] pr-[12px] py-[6px] rounded-[8px] border border-[#e4e4e7] bg-white text-[12px] w-[160px] md:w-[220px] focus:outline-none focus:border-[#09090b] transition-colors"
            />
          </div>
        </div>

        {/* Export controls */}
        <div className="flex items-center gap-[6px]">
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-[5px] px-[12px] py-[7px] rounded-[8px] bg-[#09090b] text-white text-[12px] hover:bg-[#18181b] transition-colors cursor-pointer shadow-sm"
          >
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Export panel */}
      {showExport && (
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] overflow-hidden">
          {/* Format tabs */}
          <div className="flex items-center gap-[4px] px-[16px] py-[10px] border-b border-[#e4e4e7] overflow-x-auto">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setExportFormat(fmt.id)}
                className={`px-[12px] py-[5px] rounded-[7px] text-[12px] whitespace-nowrap transition-all cursor-pointer ${
                  exportFormat === fmt.id
                    ? "bg-[#09090b] text-white"
                    : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Code preview */}
          <div className="bg-[#0A0A0A] max-h-[320px] overflow-auto p-[16px]">
            <pre className="text-[11px] leading-[1.7] text-[#d4d4d8] whitespace-pre overflow-x-auto">
              {exportCode}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-[8px] px-[16px] py-[10px] border-t border-[#e4e4e7]">
            <button
              onClick={handleCopy}
              className="flex items-center gap-[5px] px-[14px] py-[6px] rounded-[8px] bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7] transition-colors cursor-pointer text-[12px]"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-[5px] px-[14px] py-[6px] rounded-[8px] bg-[#09090b] text-white hover:bg-[#18181b] transition-colors cursor-pointer text-[12px]"
            >
              <Download size={13} />
              Download{" "}
              {FORMAT_OPTIONS.find((f) => f.id === exportFormat)?.ext}
            </button>
          </div>
        </div>
      )}

      {/* Token list */}
      <div className="bg-white rounded-[12px] border border-[#e4e4e7] overflow-hidden">
        {viewMode === "contrast" ? (
          /* Contrast view */
          <div>
            {warnings.length === 0 ? (
              <div className="text-center py-[40px]">
                <div className="w-[48px] h-[48px] rounded-full bg-[#f4f4f5] flex items-center justify-center mx-auto mb-[12px]">
                  <Check size={24} className="text-[#3f3f46]" />
                </div>
                <p className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
                  All pairs pass WCAG AA
                </p>
                <p className="text-[12px] text-[#71717a] mt-[4px]">
                  All background and text combinations achieve a contrast ratio of at least 4.5:1
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f4f4f5]">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-[#fafafa]/30 transition-colors">
                    {/* Visual preview */}
                    <div
                      className="w-[40px] h-[40px] rounded-[8px] flex items-center justify-center shrink-0 border border-black/8"
                      style={{ backgroundColor: w.bgColor }}
                    >
                      <span
                        className="text-[12px]"
                        style={{ color: w.textColor, fontWeight: 700 }}
                      >
                        Aa
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#09090b]" style={{ fontWeight: 600 }}>
                        {w.groupName} / {w.variantName}
                        {w.scale && <span className="text-[#71717a]"> / {w.scale}</span>}
                        {w.state && <span className="text-[#09090b]"> / {w.state}</span>}
                      </p>
                      <div className="flex items-center gap-[8px] mt-[2px]">
                        <span className="text-[9px] text-[#71717a] truncate">
                          bg: {w.bgToken}
                        </span>
                        <span className="text-[9px] text-[#a1a1aa]">&harr;</span>
                        <span className="text-[9px] text-[#71717a] truncate">
                          text: {w.textToken}
                        </span>
                      </div>
                    </div>

                    {/* Ratio */}
                    <div className="flex items-center gap-[6px] shrink-0">
                      <div className="text-right">
                        <p className="text-[14px] text-[#3f3f46]" style={{ fontWeight: 700 }}>
                          {w.contrastRatio.toFixed(2)}:1
                        </p>
                        <p className="text-[9px] text-[#71717a]">min 4.5:1</p>
                      </div>
                      <span className="text-[9px] px-[6px] py-[2px] rounded-[4px] bg-[#f4f4f5] text-[#27272a]" style={{ fontWeight: 600 }}>
                        FAIL AA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-[40px] text-[13px] text-[#a1a1aa]">
            {searchQuery
              ? `No tokens found for "${searchQuery}"`
              : "No tokens generated. Check the previous configuration."}
          </div>
        ) : viewMode === "tree" ? (
          /* Tree view */
          <div>
            {Object.entries(groupedTokens).map(([groupKey, variants]) => {
              const groupExpanded =
                expandedGroups.has("all") || expandedGroups.has(groupKey);
              return (
                <div key={groupKey} className="border-b border-[#e4e4e7] last:border-b-0">
                  <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center gap-[8px] px-[16px] py-[10px] hover:bg-[#fafafa] transition-colors cursor-pointer"
                  >
                    {groupExpanded ? (
                      <ChevronDown size={14} className="text-[#71717a]" />
                    ) : (
                      <ChevronRight size={14} className="text-[#71717a]" />
                    )}
                    <span className="text-[13px] text-[#09090b]" style={{ fontWeight: 600 }}>
                      {groupKey}
                    </span>
                    <span className="text-[10px] text-[#71717a] bg-[#f4f4f5] px-[6px] py-[1px] rounded-full">
                      {Object.values(variants).flat().length}
                    </span>
                  </button>

                  {groupExpanded && (
                    <div>
                      {Object.entries(variants).map(
                        ([varKey, varTokens]) => (
                          <div key={varKey} className="ml-[24px] border-l-[2px] border-[#e4e4e7]">
                            <div className="px-[12px] py-[6px] flex items-center gap-[6px]">
                              <span className="text-[11px] text-[#71717a]" style={{ fontWeight: 500 }}>
                                {varKey}
                              </span>
                              <span className="text-[9px] text-[#a1a1aa]">
                                {varTokens.length} tokens
                              </span>
                              {/* Show primitive reference for variant */}
                              {varTokens[0]?.primitiveRef && (
                                <span className="flex items-center gap-[3px] text-[9px] text-[#71717a]">
                                  <Link2 size={8} />
                                  {varTokens[0].primitiveRef}
                                </span>
                              )}
                            </div>
                            {varTokens.map((t) => (
                              <TokenRow key={t.fullName} token={t} warnings={warnings} />
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat view */
          <div className="divide-y divide-[#f4f4f5]">
            {filteredTokens.map((t) => (
              <TokenRow key={t.fullName} token={t} warnings={warnings} />
            ))}
          </div>
        )}
      </div>

      {filteredTokens.length > 0 && viewMode !== "contrast" && (
        <p className="text-center text-[11px] text-[#a1a1aa]">
          Showing {filteredTokens.length} of {tokens.length} tokens
        </p>
      )}
    </div>
  );
}

function TokenRow({ token, warnings }: { token: GeneratedToken; warnings: ContrastWarning[] }) {
  const textColor = getBestTextColor(token.value);
  const contrastOnWhite = getContrastRatio(token.value, "#FFFFFF");
  const contrastOnBlack = getContrastRatio(token.value, "#09090b");
  const bestContrast = Math.max(contrastOnWhite, contrastOnBlack);
  const accessibility = getAccessibilityLevel(bestContrast);

  // Check if this token is part of a failing contrast pair
  const isInWarning = warnings.some(
    w => w.bgToken === token.fullName || w.textToken === token.fullName
  );

  return (
    <div className={`flex items-center gap-[10px] px-[16px] py-[7px] hover:bg-[#fafafa] transition-colors group ${isInWarning ? "bg-[#fafafa]/20" : ""}`}>
      {/* Color swatch */}
      <div
        className="w-[28px] h-[28px] rounded-[6px] shrink-0 border border-black/8 flex items-center justify-center"
        style={{ backgroundColor: token.value }}
        title={token.value}
      >
        <span
          className="text-[7px] opacity-0 group-hover:opacity-80 transition-opacity"
          style={{ color: textColor }}
        >
          {token.value.slice(1, 4)}
        </span>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#09090b] truncate" style={{ fontWeight: 500 }}>
          {token.fullName}
        </p>
        <div className="flex items-center gap-[4px] mt-[1px]">
          {token.parts.state && (
            <span className="text-[9px] px-[4px] py-[0.5px] rounded-[3px] bg-[#f4f4f5] text-[#09090b]">
              {token.parts.state}
            </span>
          )}
          {token.parts.scale && (
            <span className="text-[9px] px-[4px] py-[0.5px] rounded-[3px] bg-[#fafafa] text-[#71717a]">
              {token.parts.scale}
            </span>
          )}
          {token.primitiveRef && (
            <span className="flex items-center gap-[2px] text-[9px] px-[4px] py-[0.5px] rounded-[3px] bg-[#f4f4f5] text-[#71717a]">
              <Link2 size={7} />
              {token.primitiveRef}
            </span>
          )}
          {isInWarning && (
            <span className="flex items-center gap-[2px] text-[9px] px-[4px] py-[0.5px] rounded-[3px] bg-[#fafafa] text-[#52525b]">
              <AlertTriangle size={7} />
              contrast
            </span>
          )}
        </div>
      </div>

      {/* Value */}
      <span className="text-[11px] text-[#52525b] uppercase shrink-0">
        {token.value}
      </span>

      {/* Accessibility badges */}
      <div className="flex items-center gap-[3px] shrink-0">
        <span
          className={`text-[9px] px-[4px] py-[1px] rounded-[3px] ${
            accessibility.normalAA
              ? "bg-[#f4f4f5] text-[#3f3f46]"
              : "bg-[#f4f4f5] text-[#27272a]"
          }`}
        >
          AA
        </span>
        <span
          className={`text-[9px] px-[4px] py-[1px] rounded-[3px] ${
            accessibility.normalAAA
              ? "bg-[#f4f4f5] text-[#3f3f46]"
              : "bg-[#f4f4f5] text-[#27272a]"
          }`}
        >
          AAA
        </span>
      </div>

      {/* Contrast */}
      <span className="text-[10px] text-[#a1a1aa] tabular-nums w-[48px] text-right shrink-0">
        {bestContrast.toFixed(1)}:1
      </span>
    </div>
  );
}
