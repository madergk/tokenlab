import { useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { generateTonalScale, tonalScaleToSelectedPalette } from "../tonal-scale";
import { getBestTextColor } from "../color-utils";
import type { SelectedPalette } from "./wizard-types";

interface CustomColorInputProps {
  onAddPalette: (palette: SelectedPalette) => void;
  existingNames: string[];
}

export function CustomColorInput({
  onAddPalette,
  existingNames,
}: CustomColorInputProps) {
  const [hexInput, setHexInput] = useState("#");
  const [colorName, setColorName] = useState("");
  const [previewScale, setPreviewScale] = useState<ReturnType<
    typeof generateTonalScale
  > | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Validate hex color (6-char hex with or without #)
  const isValidHex = (hex: string): boolean => {
    const cleanHex = hex.replace("#", "").toUpperCase();
    return cleanHex.length === 6 && /^[0-9A-F]{6}$/.test(cleanHex);
  };

  // Auto-slugify name (lowercase, replace spaces with hyphens)
  const slugifyName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  // Normalize hex input (add # if missing)
  const normalizeHex = (input: string): string => {
    if (!input) return "#";
    const cleaned = input.trim().toUpperCase();
    if (cleaned.startsWith("#")) {
      return cleaned;
    }
    return "#" + cleaned;
  };

  const handleHexColorChange = (color: string) => {
    setHexInput(color);
  };

  const handleHexTextChange = (text: string) => {
    const normalized = normalizeHex(text);
    setHexInput(normalized);
  };

  const handleNameChange = (text: string) => {
    setColorName(text);
  };

  const isDuplicateName =
    colorName &&
    existingNames.some((n) => n.toLowerCase() === colorName.toLowerCase());

  const canGenerate = isValidHex(hexInput) && colorName && !isDuplicateName;

  const handleGenerateScale = () => {
    if (!canGenerate) return;

    try {
      const scale = generateTonalScale(hexInput, colorName);
      setPreviewScale(scale);
    } catch (error) {
      console.error("Failed to generate tonal scale:", error);
    }
  };

  const handleAddPalette = () => {
    if (!previewScale) return;

    try {
      const palette = tonalScaleToSelectedPalette(previewScale, "custom");
      onAddPalette(palette);

      // Reset form
      setHexInput("#");
      setColorName("");
      setPreviewScale(null);
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to add palette:", error);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-[8px] px-[16px] py-[12px] rounded-[12px] border-2 border-[#09090b] text-[#09090b] hover:bg-[#fafafa] transition-colors"
        style={{ fontWeight: 500, fontSize: "14px", fontFamily: "'Geist', system-ui, sans-serif" }}
      >
        <Plus size={18} />
        Create custom palette
      </button>
    );
  }

  return (
    <div
      className="bg-white rounded-[12px] border-2 overflow-hidden"
      style={{ borderColor: "#09090b" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[16px] py-[12px] bg-[#fafafa]"
        style={{ borderBottom: "1px solid #09090b" }}
      >
        <div className="flex items-center gap-[8px]">
          <Sparkles size={16} color="#09090b" />
          <h3
            className="text-[14px] text-[#09090b]"
            style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
          >
            Custom Color
          </h3>
        </div>
        <button
          onClick={() => {
            setIsExpanded(false);
            setHexInput("#");
            setColorName("");
            setPreviewScale(null);
          }}
          className="text-[#71717a] hover:text-[#3f3f46] transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-[16px] space-y-[16px]">
        {/* Inputs Section */}
        <div className="grid grid-cols-2 gap-[12px]">
          {/* Left: Color picker and hex input */}
          <div className="space-y-[8px]">
            <label
              className="text-[12px] text-[#52525b]"
              style={{ fontWeight: 500, fontFamily: "'Geist', system-ui, sans-serif" }}
            >
              Color
            </label>
            <div className="flex gap-[8px]">
              <input
                type="color"
                value={isValidHex(hexInput) ? hexInput : "#09090b"}
                onChange={(e) => handleHexColorChange(e.target.value)}
                className="w-[48px] h-[40px] rounded-[8px] cursor-pointer border border-[#e4e4e7]"
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexTextChange(e.target.value)}
                placeholder="Hex"
                className={`flex-1 px-[10px] py-[8px] rounded-[8px] border text-[12px] transition-colors ${
                  isValidHex(hexInput)
                    ? "border-[#e4e4e7] bg-white text-[#09090b]"
                    : "border-[#3f3f46] bg-[#FFEBEE] text-[#3f3f46]"
                }`}
                style={{ fontWeight: 500 }}
              />
            </div>
            {!isValidHex(hexInput) && hexInput !== "#" && (
              <p className="text-[10px] text-[#3f3f46]">Invalid hex color</p>
            )}
          </div>

          {/* Right: Name input */}
          <div className="space-y-[8px]">
            <label
              className="text-[12px] text-[#52525b]"
              style={{ fontWeight: 500, fontFamily: "'Geist', system-ui, sans-serif" }}
            >
              Name
            </label>
            <input
              type="text"
              value={colorName}
              onChange={(e) => handleNameChange(slugifyName(e.target.value))}
              placeholder="e.g. brand-primary"
              className={`w-full px-[10px] py-[8px] rounded-[8px] border text-[12px] transition-colors ${
                isDuplicateName
                  ? "border-[#3f3f46] bg-[#FFEBEE] text-[#3f3f46]"
                  : "border-[#e4e4e7] bg-white text-[#09090b]"
              }`}
              style={{ fontWeight: 500, fontFamily: "'Geist', system-ui, sans-serif" }}
            />
            {isDuplicateName && (
              <p className="text-[10px] text-[#3f3f46]">Name already exists</p>
            )}
          </div>
        </div>

        {/* Generate Scale Button */}
        <button
          onClick={handleGenerateScale}
          disabled={!canGenerate}
          className={`w-full px-[16px] py-[10px] rounded-[8px] text-[13px] transition-all ${
            canGenerate
              ? "bg-[#09090b] text-white hover:opacity-90 cursor-pointer"
              : "bg-[#e4e4e7] text-[#a1a1aa] cursor-not-allowed"
          }`}
          style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
        >
          Generate Scale
        </button>

        {/* Preview Section */}
        {previewScale && (
          <div className="border-t border-[#e4e4e7] pt-[16px] space-y-[12px]">
            {/* Color Strip */}
            <div className="space-y-[8px]">
              <p
                className="text-[11px] text-[#71717a]"
                style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
              >
                11-Stop Tonal Scale
              </p>
              <div className="flex gap-[2px] rounded-[8px] overflow-hidden h-[48px] border border-[#e4e4e7]">
                {previewScale.stops.map((stop) => (
                  <div
                    key={stop.stop}
                    className="flex-1 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: stop.hex,
                      color: getBestTextColor(stop.hex),
                    }}
                    title={stop.hex}
                  >
                    {stop.stop}
                  </div>
                ))}
              </div>
            </div>

            {/* Hex Values */}
            <div className="space-y-[6px]">
              <p
                className="text-[11px] text-[#71717a]"
                style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
              >
                Values
              </p>
              <div className="grid grid-cols-4 gap-[4px] text-[10px]">
                {previewScale.stops.map((stop) => (
                  <div
                    key={stop.stop}
                    className="px-[6px] py-[4px] rounded-[6px] bg-[#fafafa] border border-[#e4e4e7] text-[#52525b] text-center overflow-hidden text-ellipsis whitespace-nowrap"
                    title={stop.hex}
                  >
                    {stop.hex.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Palettes Button */}
            <button
              onClick={handleAddPalette}
              className="w-full px-[16px] py-[10px] rounded-[8px] text-[13px] bg-[#09090b] text-white hover:opacity-90 transition-all cursor-pointer"
              style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
            >
              Add to Palettes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
