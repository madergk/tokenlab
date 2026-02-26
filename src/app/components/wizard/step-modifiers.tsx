import { useState } from "react";
import { applyColorTransform, buildTokenFromSlots } from "./wizard-utils";
import { SlidersHorizontal, Zap, Eye } from "lucide-react";
import { getBestTextColor } from "../color-utils";
import type { WizardState, StateConfig, ScaleConfig } from "./wizard-types";

interface StepModifiersProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

export function StepModifiers({ state, updateState }: StepModifiersProps) {
  const [previewColor, setPreviewColor] = useState("#52525b");

  const toggleState = (id: string) => {
    updateState({
      states: state.states.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    });
  };

  const updateStateConfig = (id: string, updates: Partial<StateConfig>) => {
    updateState({
      states: state.states.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const toggleScale = (id: string) => {
    updateState({
      scales: state.scales.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    });
  };

  const updateScaleConfig = (id: string, updates: Partial<ScaleConfig>) => {
    updateState({
      scales: state.scales.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  // Preview: generate grid of scale x state
  const enabledScales = state.scales.filter((s) => s.enabled);
  const enabledStates = state.states.filter((s) => s.enabled);

  const getPreviewColor = (scale: ScaleConfig, stateConf: StateConfig) => {
    let color = previewColor;
    color = applyColorTransform(color, scale.colorTransform, scale.amount);
    color = applyColorTransform(
      color,
      stateConf.colorTransform,
      stateConf.amount
    );
    return color;
  };

  const totalTokensPerVariant =
    enabledScales.length *
    enabledStates.length *
    4; // 4 elements (bg, text, border, icon)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-[24px]">
      {/* Left: Configuration */}
      <div className="flex flex-col gap-[24px]">
        {/* States */}
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[20px]">
          <div className="flex items-center gap-[8px] mb-[4px]">
            <Zap size={16} className="text-[#52525b]" />
            <h3 className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
              Interactive states
            </h3>
          </div>
          <p className="text-[12px] text-[#71717a] mb-[16px]">
            Define how colors change in each interactive state. Each state
            generates an additional token per element.
          </p>

          <div className="flex flex-col gap-[10px]">
            {state.states.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-[12px] p-[12px] rounded-[10px] border transition-all ${
                  s.enabled
                    ? "border-[#e4e4e7] bg-white"
                    : "border-[#f4f4f5] bg-[#fafafa] opacity-60"
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleState(s.id)}
                  className={`w-[36px] h-[20px] rounded-full relative transition-colors cursor-pointer shrink-0 ${
                    s.enabled ? "bg-[#09090b]" : "bg-[#d4d4d8]"
                  }`}
                >
                  <div
                    className={`w-[16px] h-[16px] rounded-full bg-white absolute top-[2px] transition-all shadow-sm ${
                      s.enabled ? "left-[18px]" : "left-[2px]"
                    }`}
                  />
                </button>

                {/* Name */}
                <div className="w-[80px]">
                  <p className="text-[13px] text-[#09090b]" style={{ fontWeight: 500 }}>
                    {s.name}
                  </p>
                </div>

                {s.enabled && s.id !== "default" && (
                  <>
                    {/* Transform type */}
                    <select
                      value={s.colorTransform}
                      onChange={(e) =>
                        updateStateConfig(s.id, {
                          colorTransform: e.target.value as StateConfig["colorTransform"],
                        })
                      }
                      className="px-[8px] py-[5px] rounded-[6px] border border-[#e4e4e7] bg-white text-[12px] focus:outline-none focus:border-[#09090b] cursor-pointer"
                    >
                      <option value="lighten">Lighten</option>
                      <option value="darken">Darken</option>
                      <option value="opacity">Opacity</option>
                      <option value="none">None</option>
                    </select>

                    {/* Amount slider */}
                    {s.colorTransform !== "none" && (
                      <div className="flex items-center gap-[8px] flex-1 min-w-[120px]">
                        <input
                          type="range"
                          min={0}
                          max={50}
                          value={s.amount}
                          onChange={(e) =>
                            updateStateConfig(s.id, {
                              amount: parseInt(e.target.value),
                            })
                          }
                          className="flex-1 accent-[#09090b] cursor-pointer"
                        />
                        <span className="text-[11px] text-[#52525b] w-[32px] text-right">
                          {s.amount}%
                        </span>
                      </div>
                    )}

                    {/* Color preview */}
                    <div
                      className="w-[24px] h-[24px] rounded-[5px] shrink-0 border border-black/10"
                      style={{
                        backgroundColor: applyColorTransform(
                          previewColor,
                          s.colorTransform,
                          s.amount
                        ),
                      }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scales */}
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[20px]">
          <div className="flex items-center gap-[8px] mb-[4px]">
            <SlidersHorizontal size={16} className="text-[#71717a]" />
            <h3 className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
              Intensity scales
            </h3>
          </div>
          <p className="text-[12px] text-[#71717a] mb-[16px]">
            Define visual intensity levels. Each scale generates softer or
            stronger color variants.
          </p>

          <div className="flex flex-col gap-[10px]">
            {state.scales.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-[12px] p-[12px] rounded-[10px] border transition-all ${
                  s.enabled
                    ? "border-[#e4e4e7] bg-white"
                    : "border-[#f4f4f5] bg-[#fafafa] opacity-60"
                }`}
              >
                <button
                  onClick={() => toggleScale(s.id)}
                  className={`w-[36px] h-[20px] rounded-full relative transition-colors cursor-pointer shrink-0 ${
                    s.enabled ? "bg-[#71717a]" : "bg-[#d4d4d8]"
                  }`}
                >
                  <div
                    className={`w-[16px] h-[16px] rounded-full bg-white absolute top-[2px] transition-all shadow-sm ${
                      s.enabled ? "left-[18px]" : "left-[2px]"
                    }`}
                  />
                </button>

                <div className="w-[80px]">
                  <p className="text-[13px] text-[#09090b]" style={{ fontWeight: 500 }}>
                    {s.name}
                  </p>
                </div>

                {s.enabled && s.id !== "default" && (
                  <>
                    <select
                      value={s.colorTransform}
                      onChange={(e) =>
                        updateScaleConfig(s.id, {
                          colorTransform: e.target.value as ScaleConfig["colorTransform"],
                        })
                      }
                      className="px-[8px] py-[5px] rounded-[6px] border border-[#e4e4e7] bg-white text-[12px] focus:outline-none focus:border-[#71717a] cursor-pointer"
                    >
                      <option value="lighten">Lighten</option>
                      <option value="darken">Darken</option>
                      <option value="none">None</option>
                    </select>

                    {s.colorTransform !== "none" && (
                      <div className="flex items-center gap-[8px] flex-1 min-w-[120px]">
                        <input
                          type="range"
                          min={0}
                          max={90}
                          value={s.amount}
                          onChange={(e) =>
                            updateScaleConfig(s.id, {
                              amount: parseInt(e.target.value),
                            })
                          }
                          className="flex-1 accent-[#71717a] cursor-pointer"
                        />
                        <span className="text-[11px] text-[#52525b] w-[32px] text-right">
                          {s.amount}%
                        </span>
                      </div>
                    )}

                    <div
                      className="w-[24px] h-[24px] rounded-[5px] shrink-0 border border-black/10"
                      style={{
                        backgroundColor: applyColorTransform(
                          previewColor,
                          s.colorTransform,
                          s.amount
                        ),
                      }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Live preview matrix */}
      <div className="lg:sticky lg:top-[140px] lg:self-start">
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
          <div className="flex items-center gap-[8px] mb-[4px]">
            <Eye size={16} className="text-[#09090b]" />
            <h3 className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
              Preview matrix
            </h3>
          </div>
          <p className="text-[11px] text-[#71717a] mb-[12px]">
            Scale × state combinations
          </p>

          {/* Preview color picker */}
          <div className="flex items-center gap-[8px] mb-[16px]">
            <label className="text-[11px] text-[#71717a]">Base color:</label>
            <input
              type="color"
              value={previewColor}
              onChange={(e) => setPreviewColor(e.target.value)}
              className="w-[28px] h-[28px] rounded-[6px] border border-[#e4e4e7] cursor-pointer"
            />
            <span className="text-[11px] text-[#52525b] uppercase">
              {previewColor}
            </span>
          </div>

          {/* Matrix grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-[10px] text-[#71717a] text-left p-[4px]" style={{ fontWeight: 500 }}>
                    Scale \ State
                  </th>
                  {enabledStates.map((s) => (
                    <th
                      key={s.id}
                      className="text-[10px] text-[#71717a] text-center p-[4px]"
                      style={{ fontWeight: 500 }}
                    >
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enabledScales.map((scale) => (
                  <tr key={scale.id}>
                    <td className="text-[10px] text-[#52525b] p-[4px]" style={{ fontWeight: 500 }}>
                      {scale.name}
                    </td>
                    {enabledStates.map((s) => {
                      const color = getPreviewColor(scale, s);
                      const textColor = getBestTextColor(color);
                      return (
                        <td key={s.id} className="p-[3px]">
                          <div
                            className="w-full h-[32px] rounded-[5px] flex items-center justify-center border border-black/5"
                            style={{ backgroundColor: color }}
                            title={`${scale.name} / ${s.name}: ${color}`}
                          >
                            <span
                              className="text-[8px]"
                              style={{ color: textColor, opacity: 0.8 }}
                            >
                              {color}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats */}
          <div className="mt-[16px] pt-[12px] border-t border-[#e4e4e7]">
            <div className="grid grid-cols-2 gap-[8px] text-[11px]">
              <div className="bg-[#fafafa] rounded-[6px] p-[8px]">
                <span className="text-[#71717a]">Scales</span>
                <p className="text-[#09090b] text-[14px]" style={{ fontWeight: 600 }}>
                  {enabledScales.length}
                </p>
              </div>
              <div className="bg-[#fafafa] rounded-[6px] p-[8px]">
                <span className="text-[#71717a]">States</span>
                <p className="text-[#09090b] text-[14px]" style={{ fontWeight: 600 }}>
                  {enabledStates.length}
                </p>
              </div>
              <div className="bg-[#fafafa] rounded-[6px] p-[8px] col-span-2">
                <span className="text-[#71717a]">Tokens per variant</span>
                <p className="text-[#09090b] text-[14px]" style={{ fontWeight: 600 }}>
                  {totalTokensPerVariant}{" "}
                  <span className="text-[10px] text-[#71717a]" style={{ fontWeight: 400 }}>
                    ({enabledScales.length} &times; {enabledStates.length}{" "}
                    &times; 4 elements)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Example token name */}
          <div className="mt-[12px] bg-[#0A0A0A] rounded-[8px] p-[10px]">
            <p className="text-[9px] text-[#71717a] mb-[4px]">Generated token example:</p>
            <p className="text-[10px] text-[#a1a1aa] leading-[1.8]">
              {buildTokenFromSlots(
                { component: "action", role: "primary", element: "background", property: "color", scale: "subtle", state: "hover" },
                state.naming
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}