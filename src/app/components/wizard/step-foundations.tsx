import { useState } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { FOUNDATION_SCALES } from "../../../data/foundation-tokens";
import type { FoundationCategory, FoundationToken } from "../../../data/foundation-tokens";
import type { WizardState } from "./wizard-types";

interface StepFoundationsProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

// Accent color per category
const CATEGORY_ACCENTS: Record<FoundationCategory, string> = {
  spacing:    "#52525b",
  typography: "#3f3f46",
  radius:     "#3f3f46",
  shadow:     "#a1a1aa",
  motion:     "#71717a",
};

// Visual preview for each token based on its category
function TokenPreview({ token, category }: { token: FoundationToken; category: FoundationCategory }) {
  if (category === "spacing") {
    const px = parseInt(token.value);
    if (!isNaN(px)) {
      const width = Math.min(px, 96);
      return (
        <div className="flex items-center">
          <div
            className="h-[8px] rounded-[2px]"
            style={{ width: `${width}px`, minWidth: "2px", backgroundColor: "#52525b" }}
          />
        </div>
      );
    }
  }

  if (category === "radius") {
    const px = Math.min(parseInt(token.value) || 0, 24);
    return (
      <div
        className="w-[24px] h-[24px] border-[2px] border-[#3f3f46]"
        style={{ borderRadius: `${px}px` }}
      />
    );
  }

  if (category === "shadow") {
    if (token.value === "none") return <div className="w-[24px] h-[24px] rounded-[4px] bg-[#f4f4f5] border border-[#e4e4e7]" />;
    return (
      <div
        className="w-[24px] h-[24px] rounded-[4px] bg-white"
        style={{ boxShadow: token.value }}
      />
    );
  }

  if (category === "typography" && token.dtcgType === "dimension" && token.name.includes("size")) {
    const px = parseInt(token.value);
    if (!isNaN(px)) {
      const clampedPx = Math.min(px, 20);
      return (
        <span
          className="text-[#3f3f46] leading-none"
          style={{ fontSize: `${clampedPx}px`, fontWeight: 600 }}
        >
          Aa
        </span>
      );
    }
  }

  if (category === "motion" && token.dtcgType === "duration") {
    return (
      <span className="text-[10px] text-[#71717a]">
        {token.value}
      </span>
    );
  }

  return null;
}

export function StepFoundations({ state, updateState }: StepFoundationsProps) {
  const [expandedCategory, setExpandedCategory] = useState<FoundationCategory | null>("spacing");

  const isEnabled = (id: FoundationCategory) => state.enabledFoundations.includes(id);

  const toggleCategory = (id: FoundationCategory) => {
    const current = state.enabledFoundations;
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    updateState({ enabledFoundations: updated });
  };

  const totalEnabled = state.enabledFoundations.length;
  const totalTokens = FOUNDATION_SCALES
    .filter((s) => state.enabledFoundations.includes(s.id))
    .reduce((sum, s) => sum + s.tokens.length, 0);

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Intro */}
      <div className="bg-[#fafafa] border border-[#09090b] border-opacity-30 rounded-[10px] px-[16px] py-[12px]">
        <p className="text-[13px] text-[#09090b]">
          Select which <strong>foundation token scales</strong> to include alongside your color tokens.
          These provide consistent, standardized values for spacing, typography, and other non-color properties.
        </p>
      </div>

      {/* Category cards */}
      <div className="flex flex-col gap-[10px]">
        {FOUNDATION_SCALES.map((scale) => {
          const enabled = isEnabled(scale.id);
          const isOpen = expandedCategory === scale.id;
          const accent = CATEGORY_ACCENTS[scale.id];

          return (
            <div
              key={scale.id}
              className="bg-white rounded-[12px] border overflow-hidden transition-all"
              style={{ borderColor: enabled ? accent : "#e4e4e7", borderWidth: enabled ? "2px" : "1px" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-[16px] py-[12px] cursor-pointer hover:bg-[#fafafa] transition-colors"
                onClick={() => setExpandedCategory(isOpen ? null : scale.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedCategory(isOpen ? null : scale.id);
                  }
                }}
              >
                <div className="flex items-center gap-[12px]">
                  {/* Icon circle */}
                  <div
                    className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center text-[16px] shrink-0"
                    style={{ backgroundColor: enabled ? accent : "#f4f4f5" }}
                  >
                    <span style={{ filter: enabled ? "none" : "grayscale(1) opacity(0.4)" }}>
                      {scale.icon}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-[14px] text-[#09090b]"
                      style={{ fontWeight: 600 }}
                    >
                      {scale.label}
                    </p>
                    <p className="text-[11px] text-[#71717a]">
                      {scale.tokens.length} tokens &mdash; {scale.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-[10px]">
                  {/* Toggle switch */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(scale.id);
                    }}
                    className="relative shrink-0 w-[40px] h-[22px] rounded-full transition-colors"
                    style={{ backgroundColor: enabled ? accent : "#e4e4e7" }}
                    aria-label={enabled ? `Disable ${scale.label}` : `Enable ${scale.label}`}
                    title={enabled ? "Enabled — click to disable" : "Disabled — click to enable"}
                  >
                    <div
                      className="absolute top-[3px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-all"
                      style={{ left: enabled ? "21px" : "3px" }}
                    />
                  </button>
                  {isOpen ? (
                    <ChevronDown size={16} className="text-[#71717a] shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-[#71717a] shrink-0" />
                  )}
                </div>
              </div>

              {/* Expanded token list */}
              {isOpen && (
                <div className="border-t border-[#f4f4f5]">
                  <div
                    className="overflow-x-auto"
                    style={{ maxHeight: "320px", overflowY: "auto" }}
                  >
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-[#fafafa] sticky top-0">
                          <th className="text-left px-[16px] py-[8px] text-[11px] text-[#71717a] font-semibold">Token</th>
                          <th className="text-left px-[12px] py-[8px] text-[11px] text-[#71717a] font-semibold">Value</th>
                          <th className="text-left px-[12px] py-[8px] text-[11px] text-[#71717a] font-semibold">Type</th>
                          <th className="text-left px-[12px] py-[8px] text-[11px] text-[#71717a] font-semibold">Preview</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scale.tokens.map((token, i) => (
                          <tr
                            key={token.name}
                            className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}
                          >
                            <td className="px-[16px] py-[7px]">
                              <span
                                className="text-[11px] text-[#09090b]"
                                style={{ fontWeight: 500 }}
                              >
                                {token.name}
                              </span>
                            </td>
                            <td className="px-[12px] py-[7px]">
                              <span className="text-[11px] text-[#52525b] truncate block max-w-[200px]">
                                {token.value}
                              </span>
                            </td>
                            <td className="px-[12px] py-[7px]">
                              <span
                                className="px-[6px] py-[2px] rounded-[4px] text-[10px]"
                                style={{
                                  backgroundColor: `${accent}18`,
                                  color: accent,
                                  fontWeight: 600,
                                }}
                              >
                                {token.dtcgType}
                              </span>
                            </td>
                            <td className="px-[12px] py-[7px]">
                              <TokenPreview token={token} category={scale.id} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="flex items-center gap-[16px] px-[16px] py-[12px] bg-[#fafafa] rounded-[10px] border border-[#e4e4e7]">
        <div className="flex items-center gap-[6px]">
          <div
            className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center"
            style={{ backgroundColor: totalEnabled > 0 ? "#09090b" : "#e4e4e7" }}
          >
            <Check size={14} color={totalEnabled > 0 ? "#FFFFFF" : "#a1a1aa"} />
          </div>
          <div>
            <p className="text-[13px] text-[#09090b]" style={{ fontWeight: 600 }}>
              {totalEnabled} categor{totalEnabled === 1 ? "y" : "ies"} enabled
            </p>
            <p className="text-[11px] text-[#71717a]">
              {totalTokens} foundation tokens will be included in your export
            </p>
          </div>
        </div>
        {totalEnabled === 0 && (
          <p className="ml-auto text-[11px] text-[#a1a1aa]" style={{ fontWeight: 500 }}>
            You can continue without foundation tokens
          </p>
        )}
      </div>
    </div>
  );
}
