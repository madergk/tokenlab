import { useRef, useState, useEffect } from "react";
import { Check, X, Link2, Pencil } from "lucide-react";
import {
  getBestTextColor,
  getContrastRatio,
  getAccessibilityLevel,
} from "./color-utils";

interface ColorSwatchProps {
  name: string;
  value: string;
  reference?: string;
  isBase?: boolean;
  editable?: boolean;
  onColorChange?: (newValue: string) => void;
  onNameChange?: (newName: string) => void;
}

function AccessibilityBadge({
  label,
  passes,
  textColor,
}: {
  label: string;
  passes: boolean;
  textColor: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-[3px] rounded-full px-[6px] py-[1px]"
      style={{
        backgroundColor: passes
          ? textColor === "#FFFFFF"
            ? "rgba(255,255,255,0.15)"
            : "rgba(0,0,0,0.08)"
          : textColor === "#FFFFFF"
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)",
        color: textColor,
        opacity: passes ? 1 : 0.5,
      }}
    >
      {passes ? (
        <Check size={10} strokeWidth={3} />
      ) : (
        <X size={10} strokeWidth={3} />
      )}
      <span className="text-[10px]">{label}</span>
    </span>
  );
}

export function ColorSwatch({
  name,
  value,
  reference,
  isBase = false,
  editable = false,
  onColorChange,
  onNameChange,
}: ColorSwatchProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const textColor = getBestTextColor(value);
  const contrastOnWhite = getContrastRatio(value, "#FFFFFF");
  const contrastOnBlack = getContrastRatio(value, "#000000");
  const bestContrast = Math.max(contrastOnWhite, contrastOnBlack);
  const contrastBackground =
    contrastOnWhite > contrastOnBlack ? "#FFFFFF" : "#000000";
  const accessibility = getAccessibilityLevel(bestContrast);

  const [editingName, setEditingName] = useState(false);
  const [editingValue, setEditingValue] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftValue, setDraftValue] = useState(value);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraftName(name); }, [name]);
  useEffect(() => { setDraftValue(value); }, [value]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.select();
  }, [editingName]);

  useEffect(() => {
    if (editingValue) valueInputRef.current?.select();
  }, [editingValue]);

  const commitName = () => {
    setEditingName(false);
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== name) onNameChange?.(trimmed);
    else setDraftName(name);
  };

  const commitValue = () => {
    setEditingValue(false);
    const normalized = draftValue.trim().toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(normalized) && normalized !== value) {
      onColorChange?.(normalized);
    } else {
      setDraftValue(value);
    }
  };

  const handlePickerClick = () => {
    if (editable && colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  return (
    <div
      className="relative shrink-0 w-full transition-all duration-150 hover:scale-[1.01] hover:z-10 hover:shadow-lg group"
      style={{ backgroundColor: value }}
    >
      <div
        className={`flex items-start justify-between w-full ${isBase ? "p-[16px]" : "px-[16px] py-[10px]"}`}
        style={{ color: textColor }}
      >
        {/* Left side: name, value, reference */}
        <div className="flex flex-col gap-[2px] min-w-0 flex-1">
          {editable && editingName ? (
            <input
              ref={nameInputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
                if (e.key === "Escape") { setDraftName(name); setEditingName(false); }
              }}
              className="bg-transparent border-b leading-[1.4] outline-none w-full min-w-0"
              style={{ color: textColor, borderColor: textColor + "60" }}
            />
          ) : (
            <p
              className={`leading-[1.4] truncate ${editable ? "cursor-text hover:underline decoration-dotted underline-offset-2" : ""}`}
              onClick={() => editable && setEditingName(true)}
            >
              {name}
            </p>
          )}
          <div className="flex items-center gap-[6px]">
            {editable && editingValue ? (
              <input
                ref={valueInputRef}
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                onBlur={commitValue}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitValue();
                  if (e.key === "Escape") { setDraftValue(value); setEditingValue(false); }
                }}
                className="bg-transparent border-b text-[12px] leading-[1.3] tracking-wide uppercase outline-none w-[90px]"
                style={{ color: textColor, borderColor: textColor + "60" }}
                maxLength={7}
              />
            ) : (
              <p
                className={`text-[12px] leading-[1.3] tracking-wide uppercase ${editable ? "cursor-text hover:underline decoration-dotted underline-offset-2" : ""}`}
                onClick={() => editable && setEditingValue(true)}
              >
                {value}
              </p>
            )}
            {editable && (
              <button
                onClick={handlePickerClick}
                className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity cursor-pointer"
                style={{ color: textColor }}
                title="Pick color"
              >
                <Pencil size={12} />
              </button>
            )}
            {editable && (
              <input
                ref={colorInputRef}
                type="color"
                value={value}
                onChange={(e) => onColorChange?.(e.target.value.toUpperCase())}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                tabIndex={-1}
              />
            )}
          </div>
          {reference && (
            <div
              className="flex items-center gap-[4px] mt-[2px]"
              style={{ opacity: 0.8 }}
            >
              <Link2 size={11} />
              <span className="text-[11px] leading-[1.3] italic">
                {reference}
              </span>
            </div>
          )}
        </div>

        {/* Right side: contrast ratio and accessibility */}
        <div className="flex flex-col items-end gap-[4px] shrink-0 ml-[12px]">
          <div className="flex items-center gap-[4px]">
            <span
              className="text-[11px]"
              style={{ opacity: 0.8 }}
            >
              vs {contrastBackground === "#FFFFFF" ? "white" : "black"}
            </span>
            <span
              className="text-[14px] tabular-nums"
              style={{ fontWeight: 600 }}
            >
              {bestContrast.toFixed(2)}:1
            </span>
          </div>
          <div className="flex items-center gap-[4px]">
            <AccessibilityBadge
              label="AA"
              passes={accessibility.normalAA}
              textColor={textColor}
            />
            <AccessibilityBadge
              label="AAA"
              passes={accessibility.normalAAA}
              textColor={textColor}
            />
          </div>
          {(accessibility.largeAA || accessibility.largeAAA) &&
            !accessibility.normalAA && (
              <div className="flex items-center gap-[4px]">
                <AccessibilityBadge
                  label="AA lg"
                  passes={accessibility.largeAA}
                  textColor={textColor}
                />
                <AccessibilityBadge
                  label="AAA lg"
                  passes={accessibility.largeAAA}
                  textColor={textColor}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}