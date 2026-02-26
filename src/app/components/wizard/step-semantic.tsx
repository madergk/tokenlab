import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  Component,
  Sparkles,
  AlertTriangle,
  Link2,
  Pencil,
  Network,
  Sun,
  Moon,
  Wand2,
} from "lucide-react";
import { buildTokenFromSlots } from "./wizard-utils";
import { getContrastRatio, getBestTextColor } from "../color-utils";
import type {
  WizardState,
  SemanticGroup,
  SemanticVariant,
} from "./wizard-types";
import { PRESET_GROUPS } from "./wizard-types";

interface StepSemanticProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

const TEXT_LIGHT = "#FFFFFF";
const TEXT_DARK = "#09090b";

function resolveTextColor(
  mode: SemanticVariant["textMode"],
  bgColor: string
): string {
  if (mode === "light") return TEXT_LIGHT;
  if (mode === "dark") return TEXT_DARK;
  return getBestTextColor(bgColor);
}

function getElementPreviewColor(
  element: string,
  bgColor: string,
  textMode: SemanticVariant["textMode"]
): string {
  if (!bgColor) return "#a1a1aa";
  if (element === "background") return bgColor;
  if (element === "text" || element === "icon")
    return resolveTextColor(textMode, bgColor);
  if (element === "border") return bgColor;
  return bgColor;
}

export function StepSemantic({ state, updateState }: StepSemanticProps) {
  const [expandedGroup, setExpandedGroup] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<"group" | "component">(
    "group"
  );

  const paletteOptions = state.selectedPalettes.map((p) => ({
    value: `${p.libraryId}:${p.collectionName}`,
    label: p.collectionName,
    baseValue: p.baseValue,
    shades: p.shades,
  }));

  const getEffectiveBg = useCallback(
    (variant: SemanticVariant) => {
      const pal = paletteOptions.find((p) => p.value === variant.paletteRef);
      if (!pal) return "";
      if (variant.shadeIndex != null && pal.shades[variant.shadeIndex])
        return pal.shades[variant.shadeIndex].value;
      return pal.baseValue;
    },
    [paletteOptions]
  );

  const updateShade = useCallback(
    (paletteRef: string, shadeIdx: number, field: "name" | "value", val: string) => {
      updateState({
        selectedPalettes: state.selectedPalettes.map((p) => {
          if (`${p.libraryId}:${p.collectionName}` !== paletteRef) return p;
          const shades = p.shades.map((s, i) => {
            if (i !== shadeIdx) return s;
            return { ...s, [field]: val };
          });
          const baseShade = shades.find(
            (s) => s.value.toUpperCase() === p.baseValue.toUpperCase()
          );
          return {
            ...p,
            shades,
            baseValue: field === "value" && shadeIdx === shades.findIndex(
              (s) => s.value.toUpperCase() === p.baseValue.toUpperCase()
            )
              ? val
              : baseShade
                ? baseShade.value
                : p.baseValue,
          };
        }),
      });
    },
    [state.selectedPalettes, updateState]
  );

  const addPresetGroups = () => {
    const existing = state.groups.map((g) => g.id);
    const newGroups = PRESET_GROUPS.filter(
      (g) => !existing.includes(g.id)
    ).map((g) => ({
      ...g,
      variants: g.variants.map((v) => ({
        ...v,
        elements: v.elements.map((e) => ({ ...e })),
      })),
    }));
    updateState({ groups: [...state.groups, ...newGroups] });
  };

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    const id = newGroupName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const group: SemanticGroup = {
      id,
      type: newGroupType,
      name: newGroupName.toLowerCase().trim(),
      variants: [],
    };
    updateState({ groups: [...state.groups, group] });
    setNewGroupName("");
    setExpandedGroup(id);
  };

  const removeGroup = (groupId: string) => {
    updateState({
      groups: state.groups.filter((g) => g.id !== groupId),
    });
  };

  const updateGroup = (groupId: string, updates: Partial<SemanticGroup>) => {
    updateState({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    });
  };

  const addVariant = (groupId: string) => {
    updateState({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        const vid = `${g.id}-variant-${Date.now()}`;
        const newVariant: SemanticVariant = {
          id: vid,
          name: "",
          paletteRef: "",
          elements: [
            { id: `${vid}-bg`, name: "background", property: "color" },
            { id: `${vid}-text`, name: "text", property: "color" },
            { id: `${vid}-border`, name: "border", property: "color" },
            { id: `${vid}-icon`, name: "icon", property: "color" },
          ],
        };
        return { ...g, variants: [...g.variants, newVariant] };
      }),
    });
  };

  const updateVariant = (
    groupId: string,
    variantId: string,
    updates: Partial<SemanticVariant>
  ) => {
    updateState({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          variants: g.variants.map((v) =>
            v.id === variantId ? { ...v, ...updates } : v
          ),
        };
      }),
    });
  };

  const removeVariant = (groupId: string, variantId: string) => {
    updateState({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          variants: g.variants.filter((v) => v.id !== variantId),
        };
      }),
    });
  };

  const toggleElement = (
    groupId: string,
    variantId: string,
    elementName: string
  ) => {
    updateState({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          variants: g.variants.map((v) => {
            if (v.id !== variantId) return v;
            const exists = v.elements.find((e) => e.name === elementName);
            if (exists) {
              return {
                ...v,
                elements: v.elements.filter((e) => e.name !== elementName),
              };
            } else {
              return {
                ...v,
                elements: [
                  ...v.elements,
                  {
                    id: `${v.id}-${elementName}`,
                    name: elementName,
                    property: "color",
                  },
                ],
              };
            }
          }),
        };
      }),
    });
  };

  const mappedCount = state.groups.reduce(
    (acc, g) => acc + g.variants.filter((v) => v.paletteRef && v.name).length,
    0
  );

  // Compute inline contrast warnings for visible variants
  const contrastIssues = useMemo(() => {
    const issues: {
      groupId: string;
      variantId: string;
      bgColor: string;
      textColor: string;
      ratio: number;
    }[] = [];

    for (const group of state.groups) {
      for (const variant of group.variants) {
        if (!variant.paletteRef) continue;

        const hasBg = variant.elements.some(e => e.name === "background");
        const hasText = variant.elements.some(e => e.name === "text");
        if (!hasBg || !hasText) continue;

        const bgColor = getEffectiveBg(variant);
        if (!bgColor) continue;
        const textColor = resolveTextColor(variant.textMode ?? "auto", bgColor);

        try {
          const ratio = getContrastRatio(bgColor, textColor);
          if (ratio < 4.5) {
            issues.push({
              groupId: group.id,
              variantId: variant.id,
              bgColor,
              textColor,
              ratio,
            });
          }
        } catch {
          // skip invalid colors
        }
      }
    }
    return issues;
  }, [state.groups, getEffectiveBg]);

  const totalContrastIssues = contrastIssues.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[24px]">
      {/* Left: Group management */}
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center justify-between flex-wrap gap-[8px]">
          <p className="text-[13px] text-[#52525b] max-w-[520px]">
            Define the <strong>semantic groups</strong> of your system and map
            each variant to a base palette. Groups provide{" "}
            <strong>context</strong> and variants define the{" "}
            <strong>category</strong>.
          </p>
          {state.groups.length === 0 && (
            <button
              onClick={addPresetGroups}
              className="flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] bg-[#09090b] text-white text-[12px] hover:bg-[#18181b] transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles size={13} />
              Use recommended presets
            </button>
          )}
        </div>

        {/* Imported semantic structure banner */}
        {state.importedSemanticFile && (
          <div className="flex items-start gap-[10px] p-[12px] rounded-[10px] bg-[#FAFAFA] border border-[#e4e4e7]">
            <Network size={16} className="text-[#27272a] shrink-0 mt-[1px]" />
            <div>
              <p className="text-[12px] text-[#09090b]" style={{ fontWeight: 600 }}>
                Structure imported from {state.importedSemanticFile.fileName}
              </p>
              <p className="text-[11px] text-[#71717a] mt-[2px]">
                {state.importedSemanticFile.detectedGroups.length} groups and{" "}
                {state.importedSemanticFile.detectedGroups.reduce(
                  (a, g) => a + g.variants.length, 0
                )}{" "}
                variants were pre-loaded. Map each variant to a base palette below.
              </p>
            </div>
          </div>
        )}

        {/* Global contrast warnings banner */}
        {totalContrastIssues > 0 && (
          <div className="flex items-start gap-[10px] p-[12px] rounded-[10px] bg-[#FFF8E1] border border-[#FFE082]">
            <AlertTriangle size={16} className="text-[#a1a1aa] shrink-0 mt-[1px]" />
            <div>
              <p className="text-[12px] text-[#92400E]" style={{ fontWeight: 600 }}>
                {totalContrastIssues} {totalContrastIssues === 1 ? "pair" : "pairs"} bg/text do not meet AA contrast (4.5:1)
              </p>
              <p className="text-[11px] text-[#B45309] mt-[2px]">
                White text on these backgrounds may be difficult to read. Consider using darker text or a background with higher contrast.
              </p>
            </div>
          </div>
        )}

        {/* Groups list */}
        {state.groups.map((group) => {
          const isExpanded = expandedGroup === group.id;
          return (
            <div
              key={group.id}
              className="bg-white rounded-[12px] border border-[#e4e4e7] overflow-hidden"
            >
              {/* Group header */}
              <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-[#e4e4e7]">
                <div className="flex items-center gap-[10px] flex-1 min-w-0">
                  <button
                    onClick={() =>
                      setExpandedGroup(isExpanded ? "" : group.id)
                    }
                    className="shrink-0 cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-[#71717a]" />
                    ) : (
                      <ChevronRight size={16} className="text-[#71717a]" />
                    )}
                  </button>
                  <div
                    className={`w-[24px] h-[24px] rounded-[6px] flex items-center justify-center shrink-0 ${
                      group.type === "group"
                        ? "bg-[#fafafa] text-[#09090b]"
                        : "bg-[#E0F2FE] text-[#0369A1]"
                    }`}
                  >
                    {group.type === "group" ? (
                      <Layers size={12} />
                    ) : (
                      <Component size={12} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[6px] group/name">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) =>
                          updateGroup(group.id, {
                            name: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                        className="text-[13px] text-[#09090b] bg-transparent border-b border-transparent hover:border-[#e4e4e7] focus:border-[#09090b] focus:bg-[#fafafa] outline-none px-[4px] py-[1px] rounded-[3px] transition-all max-w-[200px]"
                        style={{ fontWeight: 600 }}
                        title="Click to edit group name"
                      />
                      <Pencil
                        size={10}
                        className="text-[#d4d4d8] group-hover/name:text-[#09090b] transition-colors shrink-0"
                      />
                    </div>
                    <p className="text-[10px] text-[#71717a] px-[4px]">
                      {group.type === "group" ? "Group" : "Component"}{" "}
                      &middot; {group.variants.length} variants
                      {contrastIssues.filter(c => c.groupId === group.id).length > 0 && (
                        <span className="ml-[6px] text-[#a1a1aa]">
                          <AlertTriangle size={10} className="inline -mt-[1px]" />{" "}
                          {contrastIssues.filter(c => c.groupId === group.id).length} contrast
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[6px] shrink-0">
                  <button
                    onClick={() => addVariant(group.id)}
                    className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-[6px] bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7] transition-colors cursor-pointer text-[11px]"
                  >
                    <Plus size={11} />
                    Variant
                  </button>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="p-[4px] rounded-[6px] text-[#a1a1aa] hover:text-[#3f3f46] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Variants */}
              {isExpanded && (
                <div className="p-[12px] flex flex-col gap-[10px]">
                  {group.variants.length === 0 ? (
                    <p className="text-center text-[12px] text-[#a1a1aa] py-[16px]">
                      No variants. Add one to get started.
                    </p>
                  ) : (
                    group.variants.map((variant) => {
                      const selectedPalette = paletteOptions.find(
                        (p) => p.value === variant.paletteRef
                      );
                      const effectiveBg = getEffectiveBg(variant);
                      const textMode = variant.textMode ?? "auto";
                      const effectiveText = effectiveBg
                        ? resolveTextColor(textMode, effectiveBg)
                        : "#888";
                      const variantContrastIssue = contrastIssues.find(
                        c => c.groupId === group.id && c.variantId === variant.id
                      );
                      let contrastRatio: number | null = null;
                      if (effectiveBg) {
                        try { contrastRatio = getContrastRatio(effectiveBg, effectiveText); }
                        catch { /* skip */ }
                      }
                      const passesAA = contrastRatio != null && contrastRatio >= 4.5;

                      const activeShadeIdx = variant.shadeIndex ?? (
                        selectedPalette
                          ? selectedPalette.shades.findIndex(
                              (s) => s.value.toUpperCase() === selectedPalette.baseValue.toUpperCase()
                            )
                          : -1
                      );

                      return (
                        <div
                          key={variant.id}
                          className={`p-[12px] rounded-[10px] border bg-[#FAFAFA] ${
                            variantContrastIssue
                              ? "border-[#d4d4d8]"
                              : "border-[#e4e4e7]"
                          }`}
                        >
                          <div className="flex items-start gap-[10px] flex-wrap">
                            {/* Variant name */}
                            <div className="flex flex-col gap-[4px]">
                              <label className="text-[10px] text-[#71717a]" style={{ fontWeight: 500 }}>
                                Variant
                              </label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) =>
                                  updateVariant(group.id, variant.id, {
                                    name: e.target.value
                                      .toLowerCase()
                                      .replace(/[^a-z0-9-]/g, ""),
                                  })
                                }
                                placeholder="primary, danger..."
                                className="w-[140px] px-[10px] py-[6px] rounded-[6px] border border-[#e4e4e7] bg-white text-[12px] focus:outline-none focus:border-[#09090b] transition-colors"
                              />
                            </div>

                            {/* Palette mapping */}
                            <div className="flex flex-col gap-[4px] flex-1 min-w-[180px]">
                              <label className="text-[10px] text-[#71717a]" style={{ fontWeight: 500 }}>
                                Base color (primitive palette)
                              </label>
                              <div className="relative">
                                <select
                                  value={variant.paletteRef}
                                  onChange={(e) =>
                                    updateVariant(group.id, variant.id, {
                                      paletteRef: e.target.value,
                                      shadeIndex: undefined,
                                      textMode: "auto",
                                    })
                                  }
                                  className="w-full px-[10px] py-[6px] rounded-[6px] border border-[#e4e4e7] bg-white text-[12px] focus:outline-none focus:border-[#09090b] transition-colors appearance-none pr-[30px] cursor-pointer"
                                >
                                  <option value="">
                                    Select color...
                                  </option>
                                  {paletteOptions.map((opt) => (
                                    <option
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label} ({opt.baseValue})
                                    </option>
                                  ))}
                                </select>
                                {selectedPalette && (
                                  <div
                                    className="absolute right-[8px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-[3px] border border-black/10"
                                    style={{
                                      backgroundColor: effectiveBg || selectedPalette.baseValue,
                                    }}
                                  />
                                )}
                              </div>

                              {/* Primitive reference — always visible when palette selected */}
                              {selectedPalette && (
                                <div className="flex items-center gap-[4px] mt-[2px]">
                                  <Link2 size={9} className="text-[#71717a] shrink-0" />
                                  <span className="text-[9px] text-[#71717a] truncate">
                                    {state.naming.prefix ? `${state.naming.prefix}${state.naming.separator}` : ""}
                                    {selectedPalette.label.toLowerCase().replace(/\s+/g, "-")}
                                    {(() => {
                                      const shade = selectedPalette.shades[activeShadeIdx];
                                      const num = shade?.name.match(/(\d+)$/)?.[1];
                                      return num ? `${state.naming.separator}${num}` : "";
                                    })()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Remove */}
                            <button
                              onClick={() =>
                                removeVariant(group.id, variant.id)
                              }
                              className="mt-[18px] p-[4px] rounded-[6px] text-[#a1a1aa] hover:text-[#3f3f46] transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Shade scale picker + text mode + live preview */}
                          {selectedPalette && selectedPalette.shades.length > 1 && (
                            <div className="mt-[10px] space-y-[8px]">
                              {/* Shade strip */}
                              <div>
                                <label className="text-[10px] text-[#71717a] mb-[4px] block" style={{ fontWeight: 500 }}>
                                  Shade scale
                                </label>
                                <div className="flex gap-[2px] rounded-[6px] overflow-hidden">
                                  {selectedPalette.shades.map((shade, idx) => {
                                    const isActive = idx === activeShadeIdx;
                                    return (
                                      <button
                                        key={`${shade.name}-${idx}`}
                                        onClick={() =>
                                          updateVariant(group.id, variant.id, {
                                            shadeIndex: idx,
                                          })
                                        }
                                        className="relative flex-1 cursor-pointer transition-all group/shade"
                                        style={{
                                          backgroundColor: shade.value,
                                          height: isActive ? 28 : 20,
                                          outline: isActive
                                            ? "2px solid #09090b"
                                            : "none",
                                          outlineOffset: -1,
                                          borderRadius: isActive ? 4 : 0,
                                          zIndex: isActive ? 2 : 1,
                                        }}
                                        title={`${shade.name}: ${shade.value}`}
                                      >
                                        {isActive && (
                                          <span
                                            className="absolute inset-0 flex items-center justify-center text-[8px]"
                                            style={{
                                              color: getBestTextColor(shade.value),
                                              fontWeight: 700,
                                              fontFamily: "'Geist', system-ui, sans-serif",
                                            }}
                                          >
                                            {shade.name.match(/(\d+)$/)?.[1] ?? shade.name}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Active shade editor (name + hex value) */}
                              {activeShadeIdx >= 0 && selectedPalette.shades[activeShadeIdx] && (
                                <div className="flex items-center gap-[8px] flex-wrap">
                                  <div className="flex flex-col gap-[2px]">
                                    <label className="text-[9px] text-[#a1a1aa]" style={{ fontWeight: 500 }}>
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      value={selectedPalette.shades[activeShadeIdx].name}
                                      onChange={(e) =>
                                        updateShade(
                                          variant.paletteRef,
                                          activeShadeIdx,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-[90px] px-[8px] py-[4px] rounded-[5px] border border-[#e4e4e7] bg-white text-[11px] focus:outline-none focus:border-[#09090b] transition-colors"
                                      title="Edit shade name"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-[2px]">
                                    <label className="text-[9px] text-[#a1a1aa]" style={{ fontWeight: 500 }}>
                                      Hex value
                                    </label>
                                    <div className="flex items-center gap-[4px]">
                                      <input
                                        type="color"
                                        value={selectedPalette.shades[activeShadeIdx].value}
                                        onChange={(e) =>
                                          updateShade(
                                            variant.paletteRef,
                                            activeShadeIdx,
                                            "value",
                                            e.target.value.toUpperCase()
                                          )
                                        }
                                        className="w-[24px] h-[24px] rounded-[4px] border border-[#e4e4e7] cursor-pointer p-0"
                                        title="Pick color"
                                      />
                                      <input
                                        type="text"
                                        value={selectedPalette.shades[activeShadeIdx].value}
                                        onChange={(e) => {
                                          let v = e.target.value.toUpperCase();
                                          if (!v.startsWith("#")) v = "#" + v;
                                          if (/^#[0-9A-F]{0,6}$/.test(v)) {
                                            updateShade(
                                              variant.paletteRef,
                                              activeShadeIdx,
                                              "value",
                                              v
                                            );
                                          }
                                        }}
                                        className="w-[80px] px-[8px] py-[4px] rounded-[5px] border border-[#e4e4e7] bg-white text-[11px] focus:outline-none focus:border-[#09090b] transition-colors"
                                        title="Edit hex value"
                                        maxLength={7}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className="w-[28px] h-[28px] rounded-[6px] border border-black/10 mt-[14px] shrink-0"
                                    style={{
                                      backgroundColor: selectedPalette.shades[activeShadeIdx].value,
                                    }}
                                  />
                                </div>
                              )}

                              {/* Text mode toggle + live preview */}
                              <div className="flex items-center gap-[10px] flex-wrap">
                                <div className="flex flex-col gap-[3px]">
                                  <label className="text-[10px] text-[#71717a]" style={{ fontWeight: 500 }}>
                                    Foreground text
                                  </label>
                                  <div className="flex items-center gap-[2px] bg-[#f4f4f5] rounded-[6px] p-[2px]">
                                    {(["auto", "light", "dark"] as const).map((m) => {
                                      const isActive = textMode === m;
                                      return (
                                        <button
                                          key={m}
                                          onClick={() =>
                                            updateVariant(group.id, variant.id, {
                                              textMode: m,
                                            })
                                          }
                                          className={`flex items-center gap-[4px] px-[8px] py-[3px] rounded-[5px] text-[10px] transition-all cursor-pointer ${
                                            isActive
                                              ? "bg-white shadow-sm text-[#09090b]"
                                              : "text-[#71717a] hover:text-[#52525b]"
                                          }`}
                                          style={isActive ? { fontWeight: 600 } : undefined}
                                          title={
                                            m === "auto"
                                              ? "Auto-detect best contrast"
                                              : m === "light"
                                                ? "White foreground"
                                                : "Dark foreground"
                                          }
                                        >
                                          {m === "auto" && <Wand2 size={10} />}
                                          {m === "light" && <Sun size={10} />}
                                          {m === "dark" && <Moon size={10} />}
                                          {m === "auto" ? "Auto" : m === "light" ? "Light" : "Dark"}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Live contrast preview swatch */}
                                {effectiveBg && (
                                  <div className="flex items-end gap-[8px] ml-auto">
                                    <div
                                      className="w-[56px] h-[36px] rounded-[6px] border border-black/10 flex items-center justify-center"
                                      style={{ backgroundColor: effectiveBg }}
                                    >
                                      <span
                                        className="text-[11px]"
                                        style={{
                                          color: effectiveText,
                                          fontWeight: 700,
                                          fontFamily: "'Geist', system-ui, sans-serif",
                                        }}
                                      >
                                        Aa
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-[1px]">
                                      <span
                                        className={`text-[10px] px-[5px] py-[1px] rounded-[4px] ${
                                          passesAA
                                            ? "bg-[#FAFAFA] text-[#3f3f46]"
                                            : "bg-[#f4f4f5] text-[#27272a]"
                                        }`}
                                        style={{ fontWeight: 600 }}
                                      >
                                        {contrastRatio != null
                                          ? `${contrastRatio.toFixed(1)}:1`
                                          : "—"}
                                      </span>
                                      <span className="text-[9px] text-[#a1a1aa]">
                                        {passesAA ? "AA Pass" : "AA Fail"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Contrast warning with fix suggestion */}
                          {variantContrastIssue && (
                            <div className="mt-[8px] flex items-center gap-[8px] p-[8px] rounded-[6px] bg-[#FFF8E1] border border-[#FFE082]">
                              <AlertTriangle size={12} className="text-[#a1a1aa] shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-[#92400E]" style={{ fontWeight: 600 }}>
                                  Insufficient contrast: {variantContrastIssue.ratio.toFixed(1)}:1 (minimum 4.5:1 for AA)
                                </p>
                                <p className="text-[9px] text-[#B45309] mt-[1px]">
                                  Try switching foreground to <strong>{textMode === "dark" ? "light" : "dark"}</strong> or pick a {textMode === "dark" ? "lighter" : "darker"} shade.
                                </p>
                              </div>
                              <div className="flex items-center gap-[3px] shrink-0">
                                <div
                                  className="w-[20px] h-[20px] rounded-[3px] border border-black/10 flex items-center justify-center"
                                  style={{ backgroundColor: variantContrastIssue.bgColor }}
                                >
                                  <span
                                    className="text-[7px]"
                                    style={{ color: variantContrastIssue.textColor, fontWeight: 700 }}
                                  >
                                    Aa
                                  </span>
                                </div>
                                <span className="text-[9px] px-[4px] py-[1px] rounded-[3px] bg-[#f4f4f5] text-[#27272a]">
                                  Fail
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Elements */}
                          <div className="mt-[10px] flex items-center gap-[6px] flex-wrap">
                            <span className="text-[10px] text-[#71717a] mr-[4px]" style={{ fontWeight: 500 }}>
                              Elements:
                            </span>
                            {["background", "text", "border", "icon", "shadow"].map(
                              (el) => {
                                const active = variant.elements.some(
                                  (e) => e.name === el
                                );
                                return (
                                  <button
                                    key={el}
                                    onClick={() =>
                                      toggleElement(
                                        group.id,
                                        variant.id,
                                        el
                                      )
                                    }
                                    className={`px-[8px] py-[3px] rounded-[5px] text-[10px] transition-all cursor-pointer ${
                                      active
                                        ? "bg-[#09090b] text-white"
                                        : "bg-[#e4e4e7] text-[#71717a] hover:bg-[#e4e4e7]"
                                    }`}
                                  >
                                    {state.naming.abbreviate
                                      ? (el === "background" ? "bg" : el)
                                      : el}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          {/* Token reference chain: semantic > primitive > value */}
                          {selectedPalette && (
                            <div className="mt-[8px] bg-[#0A0A0A] rounded-[8px] px-[12px] py-[8px] space-y-[4px]">
                              {(variant.name
                                ? variant.elements
                                : [{ id: "preview", name: "background", property: "color" }]
                              ).map((el) => {
                                const sep = state.naming.separator;
                                const primitiveName = [
                                  state.naming.prefix,
                                  selectedPalette.label.toLowerCase().replace(/\s+/g, "-"),
                                  (() => {
                                    const shade = selectedPalette.shades[activeShadeIdx];
                                    return shade?.name.match(/(\d+)$/)?.[1] ?? "";
                                  })(),
                                ].filter(Boolean).join(sep);

                                const semanticName = variant.name
                                  ? buildTokenFromSlots(
                                      {
                                        component: group.name,
                                        role: variant.name,
                                        element: el.name,
                                        property: el.property,
                                      },
                                      state.naming
                                    )
                                  : `${group.name}${sep}…${sep}${state.naming.abbreviate && el.name === "background" ? "bg" : el.name}`;

                                const hexValue = el.name === "text" || el.name === "icon"
                                  ? effectiveText
                                  : effectiveBg || selectedPalette.baseValue;

                                return (
                                  <div key={el.id} className="flex items-center gap-[6px] text-[10px]">
                                    <span className="text-[#a1a1aa]">{semanticName}</span>
                                    <span className="text-[#546E7A]">&rsaquo;</span>
                                    <span className="text-[#71717a]">{primitiveName}</span>
                                    <span className="text-[#546E7A]">&rsaquo;</span>
                                    <span className="flex items-center gap-[4px]">
                                      <span
                                        className="inline-block w-[8px] h-[8px] rounded-[2px] border border-white/20"
                                        style={{ backgroundColor: hexValue }}
                                      />
                                      <span className="text-[#d4d4d8]">{hexValue}</span>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add new group */}
        <div className="bg-white rounded-[12px] border border-dashed border-[#a1a1aa] p-[16px]">
          <p className="text-[12px] text-[#71717a] mb-[10px]" style={{ fontWeight: 500 }}>
            Add new group
          </p>
          <div className="flex items-center gap-[8px] flex-wrap">
            <div className="flex items-center gap-[4px] bg-[#f4f4f5] rounded-[6px] p-[3px]">
              <button
                onClick={() => setNewGroupType("group")}
                className={`px-[10px] py-[4px] rounded-[5px] text-[11px] transition-all cursor-pointer ${
                  newGroupType === "group"
                    ? "bg-white text-[#09090b] shadow-sm"
                    : "text-[#71717a]"
                }`}
                style={newGroupType === "group" ? { fontWeight: 500 } : undefined}
              >
                Group
              </button>
              <button
                onClick={() => setNewGroupType("component")}
                className={`px-[10px] py-[4px] rounded-[5px] text-[11px] transition-all cursor-pointer ${
                  newGroupType === "component"
                    ? "bg-white text-[#0369A1] shadow-sm"
                    : "text-[#71717a]"
                }`}
                style={newGroupType === "component" ? { fontWeight: 500 } : undefined}
              >
                Component
              </button>
            </div>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGroup()}
              placeholder={
                newGroupType === "group"
                  ? "e.g.: action, feedback, surface"
                  : "e.g.: button, avatar, toggle"
              }
              className="flex-1 min-w-[180px] px-[10px] py-[6px] rounded-[6px] border border-[#e4e4e7] bg-[#fafafa] text-[12px] focus:outline-none focus:border-[#09090b] focus:bg-white transition-colors"
            />
            <button
              onClick={addGroup}
              disabled={!newGroupName.trim()}
              className={`flex items-center gap-[4px] px-[12px] py-[6px] rounded-[6px] text-[12px] transition-all cursor-pointer ${
                newGroupName.trim()
                  ? "bg-[#09090b] text-white hover:bg-[#18181b]"
                  : "bg-[#e4e4e7] text-[#a1a1aa] cursor-not-allowed"
              }`}
            >
              <Plus size={13} />
              Add
            </button>
          </div>
        </div>

        {/* Preset button if groups exist but user wants more */}
        {state.groups.length > 0 && (
          <button
            onClick={addPresetGroups}
            className="flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] bg-[#fafafa] text-[#09090b] text-[12px] hover:bg-[#e4e4e7] transition-colors cursor-pointer self-start"
          >
            <Sparkles size={13} />
            Add recommended presets
          </button>
        )}
      </div>

      {/* Right: Summary */}
      <div className="lg:sticky lg:top-[140px] lg:self-start">
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
          <h3 className="text-[14px] text-[#09090b] mb-[16px]" style={{ fontWeight: 600 }}>
            Mapping summary
          </h3>

          {state.groups.length === 0 ? (
            <p className="text-center text-[12px] text-[#a1a1aa] py-[20px]">
              Define at least one group to continue
            </p>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {state.groups.map((g) => (
                <div key={g.id} className="p-[10px] rounded-[8px] bg-[#fafafa]">
                  <div className="flex items-center gap-[6px] mb-[6px]">
                    <div
                      className={`w-[16px] h-[16px] rounded-[4px] flex items-center justify-center ${
                        g.type === "group"
                          ? "bg-[#fafafa] text-[#09090b]"
                          : "bg-[#E0F2FE] text-[#0369A1]"
                      }`}
                    >
                      {g.type === "group" ? (
                        <Layers size={9} />
                      ) : (
                        <Component size={9} />
                      )}
                    </div>
                    <span className="text-[12px] text-[#09090b]" style={{ fontWeight: 600 }}>
                      {g.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-[4px]">
                    {g.variants.map((v) => {
                      const pal = state.selectedPalettes.find(
                        (p) =>
                          `${p.libraryId}:${p.collectionName}` ===
                          v.paletteRef
                      );
                      const hasContrastIssue = contrastIssues.some(
                        c => c.groupId === g.id && c.variantId === v.id
                      );
                      return (
                        <span
                          key={v.id}
                          className="flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px] text-[10px]"
                          style={{
                            backgroundColor: pal
                              ? pal.baseValue + "20"
                              : "#e4e4e7",
                            color: pal ? pal.baseValue : "#a1a1aa",
                            fontWeight: 500,
                          }}
                        >
                          {pal && (
                            <div
                              className="w-[8px] h-[8px] rounded-full"
                              style={{ backgroundColor: pal.baseValue }}
                            />
                          )}
                          {v.name || "unnamed"}
                          {hasContrastIssue && (
                            <AlertTriangle size={8} className="text-[#a1a1aa]" />
                          )}
                        </span>
                      );
                    })}
                    {g.variants.length === 0 && (
                      <span className="text-[10px] text-[#a1a1aa] italic">
                        no variants
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-[8px] pt-[8px] border-t border-[#e4e4e7] text-[11px] text-[#71717a]">
                <span style={{ fontWeight: 600 }}>{state.groups.length}</span>{" "}
                groups &middot;{" "}
                <span style={{ fontWeight: 600 }}>{mappedCount}</span> mapped
                variants
                {totalContrastIssues > 0 && (
                  <span className="block mt-[4px] text-[#a1a1aa]">
                    <AlertTriangle size={10} className="inline -mt-[1px]" />{" "}
                    {totalContrastIssues} {totalContrastIssues === 1 ? "alert" : "alerts"} contrast
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}