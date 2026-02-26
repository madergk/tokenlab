import { useState } from "react";
import {
  Code2,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Globe,
  Box,
  Tag,
  SlidersHorizontal,
  Shrink,
  Expand,
} from "lucide-react";
import type {
  WizardState,
  Separator,
  Casing,
  TokenSlot,
  SlotGroupId,
} from "./wizard-types";
import { TOKEN_SLOT_GROUPS } from "./wizard-types";
import { buildTokenFromSlots } from "./wizard-utils";
import React from "react";

interface StepNamingProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

const SEPARATORS: { value: Separator; label: string; example: string }[] = [
  { value: ".", label: "Dot", example: "action.primary.bg" },
  { value: "-", label: "Hyphen", example: "action-primary-bg" },
  { value: "/", label: "Slash", example: "action/primary/bg" },
  { value: "_", label: "Underscore", example: "action_primary_bg" },
];

const CASINGS: { value: Casing; label: string; example: string }[] = [
  { value: "kebab", label: "kebab-case", example: "button-group" },
  { value: "camel", label: "camelCase", example: "buttonGroup" },
  { value: "snake", label: "snake_case", example: "button_group" },
  { value: "none", label: "lowercase", example: "buttongroup" },
];

const GROUP_ICONS: Record<SlotGroupId, React.ReactNode> = {
  namespace: <Globe size={14} />,
  object: <Box size={14} />,
  category: <Tag size={14} />,
  modifiers: <SlidersHorizontal size={14} />,
};

export function StepNaming({ state, updateState }: StepNamingProps) {
  const { naming } = state;
  const [expandedGroups, setExpandedGroups] = useState<Set<SlotGroupId>>(
    new Set(["namespace", "object", "category", "modifiers"])
  );

  const updateNaming = (partial: Partial<typeof naming>) => {
    updateState({ naming: { ...naming, ...partial } });
  };

  const toggleSlot = (slotId: string) => {
    updateNaming({
      slots: naming.slots.map((s) =>
        s.id === slotId ? { ...s, enabled: !s.enabled } : s
      ),
    });
  };

  const updateSlotExample = (slotId: string, value: string) => {
    updateNaming({
      slots: naming.slots.map((s) =>
        s.id === slotId ? { ...s, selectedExample: value } : s
      ),
    });
  };

  const toggleGroupExpand = (groupId: SlotGroupId) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Group slots by their taxonomy group for display
  const slotsByGroup = TOKEN_SLOT_GROUPS.map((g) => ({
    ...g,
    slots: naming.slots.filter((s) => s.group === g.id),
  }));

  // Build live preview from enabled slots + selected examples
  const previewValues: Record<string, string | undefined> = {};
  for (const slot of naming.slots) {
    if (slot.enabled) {
      previewValues[slot.id] = slot.selectedExample;
    }
  }
  const previewName = buildTokenFromSlots(previewValues, naming);

  // Build a few example token names using common patterns
  const exampleSets = [
    { component: "action", role: "primary", element: "bg", property: "color" },
    { component: "action", role: "danger", element: "text", property: "color", state: "hovered" },
    { component: "feedback", role: "success", element: "border", property: "color", scale: "subtle" },
    { component: "surface", role: "neutral", element: "bg", property: "color", scale: "md", state: "active" },
    { component: "button", role: "primary", element: "icon", property: "color", state: "disabled" },
  ];
  const exampleNames = exampleSets.map((ex) => buildTokenFromSlots(ex, naming));

  // Count enabled/disabled
  const enabledCount = naming.slots.filter((s) => s.enabled).length;
  const totalSlots = naming.slots.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-[24px]">
      {/* Left: Slot Configuration */}
      <div className="flex flex-col gap-[20px]">
        {/* Interactive anatomy header */}
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
          <p className="text-[12px] text-[#71717a] mb-[12px]">
            Define the <strong>semantic structure</strong> of your token names.
            Enable or disable each slot and select example values.
          </p>

          {/* Visual anatomy bar — shows enabled slots in order */}
          <div className="bg-[#0A0A0A] rounded-[10px] p-[12px] overflow-x-auto">
            <div className="flex items-center gap-[3px] min-w-[400px]">
              {naming.slots
                .filter((s) => s.enabled)
                .map((slot, i, arr) => (
                  <div key={slot.id} className="flex items-center">
                    {i > 0 && (
                      <span className="text-[14px] text-[#71717a] mx-[3px]">
                        {naming.separator}
                      </span>
                    )}
                    <div className="flex flex-col items-center gap-[3px]">
                      <span
                        className="px-[8px] py-[3px] rounded-[5px] text-white text-[11px] whitespace-nowrap"
                        style={{ backgroundColor: slot.color, fontWeight: 600 }}
                      >
                        {slot.selectedExample}
                      </span>
                      <span className="text-[8px] text-[#71717a] whitespace-nowrap" style={{ fontWeight: 500 }}>
                        {slot.label}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Slot groups */}
        {slotsByGroup.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const enabledInGroup = group.slots.filter((s) => s.enabled).length;

          return (
            <div
              key={group.id}
              className="bg-white rounded-[12px] border border-[#e4e4e7] overflow-hidden"
            >
              {/* Group header */}
              <button
                onClick={() => toggleGroupExpand(group.id)}
                className="w-full flex items-center gap-[10px] px-[16px] py-[12px] hover:bg-[#fafafa] transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-[#71717a]" />
                ) : (
                  <ChevronRight size={14} className="text-[#71717a]" />
                )}
                <div
                  className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: group.color }}
                >
                  {GROUP_ICONS[group.id]}
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
                      {group.label}
                    </span>
                    <span className="text-[10px] text-[#71717a] bg-[#f4f4f5] px-[6px] py-[1px] rounded-full">
                      {group.sublabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717a] mt-[1px]">
                    {group.description}
                  </p>
                </div>
                <span
                  className="text-[10px] px-[6px] py-[2px] rounded-full shrink-0"
                  style={{
                    backgroundColor: enabledInGroup > 0 ? group.color + "18" : "#f4f4f5",
                    color: enabledInGroup > 0 ? group.color : "#a1a1aa",
                    fontWeight: 600,
                  }}
                >
                  {enabledInGroup}/{group.slots.length}
                </span>
              </button>

              {/* Slots */}
              {isExpanded && (
                <div className="border-t border-[#e4e4e7]">
                  {group.slots.map((slot) => (
                    <SlotRow
                      key={slot.id}
                      slot={slot}
                      groupColor={group.color}
                      separator={naming.separator}
                      onToggle={() => toggleSlot(slot.id)}
                      onExampleChange={(val) => updateSlotExample(slot.id, val)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Separator + Casing + Abbreviation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {/* Separator */}
          <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
            <h3 className="text-[13px] text-[#09090b] mb-[10px]" style={{ fontWeight: 600 }}>
              Separator
            </h3>
            <div className="grid grid-cols-4 gap-[6px]">
              {SEPARATORS.map((sep) => (
                <button
                  key={sep.value}
                  onClick={() => updateNaming({ separator: sep.value })}
                  className={`flex flex-col items-center gap-[4px] p-[8px] rounded-[8px] border-[2px] transition-all cursor-pointer ${
                    naming.separator === sep.value
                      ? "border-[#09090b] bg-[#fafafa]"
                      : "border-[#e4e4e7] hover:border-[#a1a1aa] bg-white"
                  }`}
                >
                  <span
                    className="text-[18px] text-[#09090b]"
                    style={{ fontWeight: 600 }}
                  >
                    {sep.value}
                  </span>
                  <span className="text-[9px] text-[#71717a]" style={{ fontWeight: 500 }}>
                    {sep.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Casing */}
          <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
            <h3 className="text-[13px] text-[#09090b] mb-[10px]" style={{ fontWeight: 600 }}>
              Casing
            </h3>
            <div className="grid grid-cols-2 gap-[6px]">
              {CASINGS.map((cas) => (
                <button
                  key={cas.value}
                  onClick={() => updateNaming({ casing: cas.value })}
                  className={`flex flex-col items-center gap-[4px] p-[8px] rounded-[8px] border-[2px] transition-all cursor-pointer ${
                    naming.casing === cas.value
                      ? "border-[#09090b] bg-[#fafafa]"
                      : "border-[#e4e4e7] hover:border-[#a1a1aa] bg-white"
                  }`}
                >
                  <span className="text-[12px] text-[#09090b]" style={{ fontWeight: 500 }}>
                    {cas.label}
                  </span>
                  <span className="text-[10px] text-[#a1a1aa]">
                    {cas.example}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prefix + Abbreviation row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {/* Prefix */}
          <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
            <h3 className="text-[13px] text-[#09090b] mb-[4px]" style={{ fontWeight: 600 }}>
              Prefix <span className="text-[10px] text-[#71717a]" style={{ fontWeight: 400 }}>(optional)</span>
            </h3>
            <p className="text-[11px] text-[#71717a] mb-[8px]">
              Global prefix to avoid conflicts (e.g., "ds", "mad")
            </p>
            <input
              type="text"
              value={naming.prefix}
              onChange={(e) =>
                updateNaming({ prefix: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "") })
              }
              placeholder="E.g., ds, ui, mad"
              className="w-full px-[10px] py-[7px] rounded-[8px] border border-[#e4e4e7] bg-[#fafafa] text-[12px] focus:outline-none focus:border-[#09090b] focus:bg-white transition-colors"
            />
          </div>

          {/* Abbreviation toggle */}
          <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
            <h3 className="text-[13px] text-[#09090b] mb-[4px]" style={{ fontWeight: 600 }}>
              Short mode
            </h3>
            <p className="text-[11px] text-[#71717a] mb-[8px]">
              Abbreviate elements (<code className="bg-[#f4f4f5] px-[3px] rounded text-[10px]">bg</code> instead of{" "}
              <code className="bg-[#f4f4f5] px-[3px] rounded text-[10px]">background</code>) and omit{" "}
              <code className="bg-[#f4f4f5] px-[3px] rounded text-[10px]">color</code>
            </p>
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => updateNaming({ abbreviate: !naming.abbreviate })}
                className="flex items-center gap-[6px] cursor-pointer"
              >
                {naming.abbreviate ? (
                  <Shrink size={16} className="text-[#71717a]" />
                ) : (
                  <Expand size={16} className="text-[#71717a]" />
                )}
                <span
                  className={`text-[12px] ${naming.abbreviate ? "text-[#71717a]" : "text-[#71717a]"}`}
                  style={{ fontWeight: naming.abbreviate ? 600 : 400 }}
                >
                  {naming.abbreviate ? "Enabled" : "Disabled"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:sticky lg:top-[140px] lg:self-start flex flex-col gap-[16px]">
        {/* Main preview */}
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
          <div className="flex items-center gap-[8px] mb-[12px]">
            <Code2 size={16} className="text-[#09090b]" />
            <h3 className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
              Live preview
            </h3>
          </div>

          {/* Current example */}
          <div className="bg-[#0A0A0A] rounded-[10px] p-[14px] mb-[12px]">
            <p className="text-[9px] text-[#71717a] mb-[6px]" style={{ fontWeight: 500 }}>
              Token built with selected examples:
            </p>
            <p className=" text-[13px] text-[#a1a1aa] break-all leading-[1.6]">
              <span className="text-[#a1a1aa]">--</span>
              {previewName}
            </p>
          </div>

          {/* More examples */}
          <div className="bg-[#0A0A0A] rounded-[10px] p-[14px] overflow-x-auto">
            <p className="text-[9px] text-[#71717a] mb-[6px]" style={{ fontWeight: 500 }}>
              Examples with real system data:
            </p>
            <pre className=" text-[10px] leading-[2]">
              {exampleNames.map((ex, i) => (
                <span key={i}>
                  <span className="text-[#a1a1aa]">--</span>
                  <span className="text-[#a1a1aa]">{ex}</span>
                  <span className="text-[#71717a]">: </span>
                  <span className="text-[#d4d4d8]">#value</span>
                  <span className="text-[#71717a]">;</span>
                  {"\n"}
                </span>
              ))}
            </pre>
          </div>
        </div>

        {/* Config summary */}
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
          <h4 className="text-[12px] text-[#09090b] mb-[10px]" style={{ fontWeight: 600 }}>
            Current configuration
          </h4>
          <div className="space-y-[6px]">
            <SummaryRow label="Separator" value={`${SEPARATORS.find(s => s.value === naming.separator)?.label} ${naming.separator}`} />
            <SummaryRow label="Casing" value={CASINGS.find(c => c.value === naming.casing)?.label || ""} />
            <SummaryRow label="Prefix" value={naming.prefix || "—"} />
            <SummaryRow label="Abbreviated" value={naming.abbreviate ? "Yes" : "No"} />
            <SummaryRow label="Active slots" value={`${enabledCount} / ${totalSlots}`} />
          </div>

          {/* Slot order display */}
          <div className="mt-[12px] pt-[12px] border-t border-[#e4e4e7]">
            <p className="text-[10px] text-[#71717a] mb-[6px]" style={{ fontWeight: 600 }}>
              Order of active slots:
            </p>
            <div className="flex flex-wrap gap-[4px]">
              {naming.slots
                .filter((s) => s.enabled)
                .map((slot, i) => (
                  <div key={slot.id} className="flex items-center">
                    {i > 0 && (
                      <span className="text-[10px] text-[#a1a1aa] mx-[2px]">{naming.separator}</span>
                    )}
                    <span
                      className="text-[9px] px-[5px] py-[1px] rounded-[4px] text-white"
                      style={{ backgroundColor: slot.color, fontWeight: 600 }}
                    >
                      {slot.label}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Sub-components =====

function SlotRow({
  slot,
  groupColor,
  separator,
  onToggle,
  onExampleChange,
}: {
  slot: TokenSlot;
  groupColor: string;
  separator: string;
  onToggle: () => void;
  onExampleChange: (val: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  // Show first 12 presets, or all if expanded
  const visiblePresets = showAll ? slot.presets : slot.presets.slice(0, 12);
  const hasMore = slot.presets.length > 12;

  return (
    <div
      className={`px-[16px] py-[12px] border-b border-[#f4f4f5] last:border-b-0 transition-all ${
        slot.enabled ? "bg-white" : "bg-[#FAFAFA]"
      }`}
    >
      <div className="flex items-start gap-[10px]">
        {/* Toggle */}
        <button
          onClick={onToggle}
          className="mt-[2px] shrink-0 cursor-pointer"
        >
          {slot.enabled ? (
            <ToggleRight size={22} style={{ color: slot.color }} />
          ) : (
            <ToggleLeft size={22} className="text-[#d4d4d8]" />
          )}
        </button>

        {/* Slot info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[2px]">
            <span
              className="text-[12px] text-[#09090b]"
              style={{ fontWeight: 600, opacity: slot.enabled ? 1 : 0.5 }}
            >
              {slot.label}
            </span>
            <div
              className="w-[8px] h-[8px] rounded-full shrink-0"
              style={{
                backgroundColor: slot.color,
                opacity: slot.enabled ? 1 : 0.3,
              }}
            />
          </div>
          <p
            className="text-[10px] text-[#71717a] mb-[8px]"
            style={{ opacity: slot.enabled ? 1 : 0.6 }}
          >
            {slot.description}
          </p>

          {/* Preset chips */}
          {slot.enabled && (
            <div className="flex flex-wrap gap-[4px]">
              {visiblePresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onExampleChange(preset)}
                  className={`px-[7px] py-[2px] rounded-[5px] text-[10px] transition-all cursor-pointer ${
                    slot.selectedExample === preset
                      ? "text-white"
                      : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
                  }`}
                  style={
                    slot.selectedExample === preset
                      ? { backgroundColor: slot.color, fontWeight: 600 }
                      : undefined
                  }
                >
                  {preset}
                </button>
              ))}
              {hasMore && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-[7px] py-[2px] rounded-[5px] text-[10px] text-[#09090b] bg-[#fafafa] hover:bg-[#e4e4e7] transition-colors cursor-pointer"
                >
                  {showAll ? "less" : `+${slot.presets.length - 12} more`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Current value indicator */}
        {slot.enabled && (
          <div className="shrink-0 mt-[2px]">
            <span
              className="text-[10px] px-[6px] py-[2px] rounded-[4px] text-white"
              style={{ backgroundColor: slot.color, fontWeight: 500 }}
            >
              {slot.selectedExample}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[#71717a]">{label}</span>
      <span
        className=" text-[#09090b] bg-[#fafafa] px-[6px] py-[1px] rounded-[4px]"
        style={{ fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  );
}
