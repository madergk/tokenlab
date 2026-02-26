import { useState } from "react";
import { Check, Palette, ChevronDown, ChevronRight } from "lucide-react";
import { tokenLibraries } from "../token-libraries";
import { getBestTextColor } from "../color-utils";
import { CustomColorInput } from "./custom-color-input";
import { TokenFileUploader } from "./token-file-uploader";
import { SemanticFileUploader } from "./semantic-file-uploader";
import type {
  WizardState,
  SelectedPalette,
  ImportedTokenFile,
  ImportedSemanticFile,
  SemanticGroup,
} from "./wizard-types";

interface StepPaletteProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

export function StepPalette({ state, updateState }: StepPaletteProps) {
  const [expandedLib, setExpandedLib] = useState<string>(tokenLibraries[0].id);

  const isSelected = (libId: string, colName: string) =>
    state.selectedPalettes.some(
      (p) => p.libraryId === libId && p.collectionName === colName
    );

  const togglePalette = (libId: string, colName: string) => {
    const lib = tokenLibraries.find((l) => l.id === libId);
    const col = lib?.collections.find((c) => c.name === colName);
    if (!col) return;

    if (isSelected(libId, colName)) {
      updateState({
        selectedPalettes: state.selectedPalettes.filter(
          (p) => !(p.libraryId === libId && p.collectionName === colName)
        ),
      });
    } else {
      const palette: SelectedPalette = {
        libraryId: libId,
        collectionName: colName,
        baseValue: col.baseValue,
        shades: col.variables.map((v) => ({ name: v.name, value: v.value })),
      };
      updateState({
        selectedPalettes: [...state.selectedPalettes, palette],
      });
    }
  };

  const removePalette = (libId: string, colName: string) => {
    updateState({
      selectedPalettes: state.selectedPalettes.filter(
        (p) => !(p.libraryId === libId && p.collectionName === colName)
      ),
    });
  };

  const addCustomPalette = (palette: SelectedPalette) => {
    updateState({
      selectedPalettes: [...state.selectedPalettes, palette],
    });
  };

  const handleFileImport = (palettes: SelectedPalette[], file: ImportedTokenFile) => {
    updateState({
      selectedPalettes: [...state.selectedPalettes, ...palettes],
      importedFile: file,
    });
  };

  const handleSemanticImport = (groups: SemanticGroup[], file: ImportedSemanticFile) => {
    updateState({
      groups,
      importedSemanticFile: file,
    });
  };

  const selectAllFromLib = (libId: string) => {
    const lib = tokenLibraries.find((l) => l.id === libId);
    if (!lib) return;

    const allSelected = lib.collections.every((c) =>
      isSelected(libId, c.name)
    );

    if (allSelected) {
      updateState({
        selectedPalettes: state.selectedPalettes.filter(
          (p) => p.libraryId !== libId
        ),
      });
    } else {
      const existing = state.selectedPalettes.filter(
        (p) => p.libraryId !== libId
      );
      const newPalettes: SelectedPalette[] = lib.collections.map((col) => ({
        libraryId: libId,
        collectionName: col.name,
        baseValue: col.baseValue,
        shades: col.variables.map((v) => ({
          name: v.name,
          value: v.value,
        })),
      }));
      updateState({ selectedPalettes: [...existing, ...newPalettes] });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[24px]">
      {/* Left: Library browser */}
      <div className="flex flex-col gap-[12px]">
        <p className="text-[13px] text-[#52525b]">
          Select the color palettes that will serve as <strong>primitive tokens</strong> for your system.
          These base colors will be used to map semantic tokens in the next step.
        </p>

        {/* Custom brand color generator */}
        <CustomColorInput
          onAddPalette={addCustomPalette}
          existingNames={state.selectedPalettes.map((p) => p.collectionName)}
        />

        {/* File importer */}
        <TokenFileUploader
          onImport={handleFileImport}
          existingNames={state.selectedPalettes.map((p) => p.collectionName)}
        />

        {/* Imported file indicator */}
        {state.importedFile && (
          <div className="flex items-center gap-[8px] px-[14px] py-[10px] rounded-[10px] bg-[#FAFAFA] border border-[#e4e4e7] text-[12px] text-[#3f3f46]">
            <Check size={14} className="shrink-0" />
            <span>
              <strong>{state.importedFile.fileName}</strong> imported &middot;{" "}
              {state.importedFile.totalTokens} tokens in {state.importedFile.groups.length} groups.
              Structure available for override/mixin/extension in later steps.
            </span>
          </div>
        )}

        {/* Semantic structure importer */}
        <SemanticFileUploader
          onImport={handleSemanticImport}
          hasExistingGroups={state.groups.length > 0}
        />

        {/* Imported semantic indicator */}
        {state.importedSemanticFile && (
          <div className="flex items-center gap-[8px] px-[14px] py-[10px] rounded-[10px] bg-[#FAFAFA] border border-[#e4e4e7] text-[12px] text-[#27272a]">
            <Check size={14} className="shrink-0" />
            <span>
              <strong>{state.importedSemanticFile.fileName}</strong> &middot;{" "}
              {state.importedSemanticFile.detectedGroups.length} groups,{" "}
              {state.importedSemanticFile.detectedGroups.reduce(
                (a, g) => a + g.variants.length, 0
              )}{" "}
              variants detected. Structure will pre-populate the Semantic Tokens step.
            </span>
          </div>
        )}

        {tokenLibraries.map((lib) => {
          const isExpanded = expandedLib === lib.id;
          const selectedCount = state.selectedPalettes.filter(
            (p) => p.libraryId === lib.id
          ).length;
          const allSelected =
            lib.collections.length > 0 &&
            lib.collections.every((c) => isSelected(lib.id, c.name));

          return (
            <div
              key={lib.id}
              className="bg-white rounded-[12px] border border-[#e4e4e7] overflow-hidden"
            >
              {/* Library header */}
              <div
                onClick={() => setExpandedLib(isExpanded ? "" : lib.id)}
                className="w-full flex items-center justify-between px-[16px] py-[12px] hover:bg-[#fafafa] transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedLib(isExpanded ? "" : lib.id);
                  }
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <div
                    className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-white text-[11px] shrink-0"
                    style={{
                      backgroundColor: lib.accentColor,
                      fontWeight: 700,
                    }}
                  >
                    {lib.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] text-[#09090b]" style={{ fontWeight: 500 }}>
                      {lib.name}
                    </p>
                    <p className="text-[11px] text-[#71717a]">
                      {lib.collections.length} palettes
                      {selectedCount > 0 && (
                        <span
                          className="ml-[6px] px-[6px] py-[1px] rounded-full text-[10px] text-white"
                          style={{ backgroundColor: lib.accentColor }}
                        >
                          {selectedCount} selected
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-[8px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAllFromLib(lib.id);
                    }}
                    className={`text-[11px] px-[10px] py-[3px] rounded-[6px] transition-all cursor-pointer ${
                      allSelected
                        ? "bg-[#71717a] text-white"
                        : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
                    }`}
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-[#71717a]" />
                  ) : (
                    <ChevronRight size={16} className="text-[#71717a]" />
                  )}
                </div>
              </div>

              {/* Collections grid */}
              {isExpanded && (
                <div className="px-[16px] pb-[16px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[8px]">
                  {lib.collections.map((col) => {
                    const selected = isSelected(lib.id, col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => togglePalette(lib.id, col.name)}
                        className={`relative flex flex-col items-start rounded-[10px] border-[2px] p-[10px] transition-all cursor-pointer ${
                          selected
                            ? "border-[#09090b] bg-[#fafafa] shadow-sm"
                            : "border-[#e4e4e7] hover:border-[#a1a1aa] bg-white"
                        }`}
                      >
                        {/* Color strip */}
                        <div className="flex gap-[2px] w-full mb-[8px] rounded-[4px] overflow-hidden h-[24px]">
                          {col.variables.slice(0, 7).map((v, i) => (
                            <div
                              key={i}
                              className="flex-1"
                              style={{ backgroundColor: v.value }}
                            />
                          ))}
                        </div>
                        <p className="text-[12px] text-[#09090b] truncate w-full text-left" style={{ fontWeight: 500 }}>
                          {col.name}
                        </p>
                        <p className="text-[10px] text-[#71717a] uppercase">
                          {col.baseValue}
                        </p>
                        {selected && (
                          <div className="absolute top-[6px] right-[6px] w-[18px] h-[18px] rounded-full bg-[#09090b] flex items-center justify-center">
                            <Check size={10} color="white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Selected summary */}
      <div className="lg:sticky lg:top-[140px] lg:self-start">
        <div className="bg-white rounded-[12px] border border-[#e4e4e7] p-[16px]">
          <div className="flex items-center gap-[8px] mb-[16px]">
            <Palette size={16} className="text-[#09090b]" />
            <h3 className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
              Selected palettes
            </h3>
            <span className="ml-auto text-[12px] px-[8px] py-[2px] rounded-full bg-[#fafafa] text-[#09090b]" style={{ fontWeight: 600 }}>
              {state.selectedPalettes.length}
            </span>
          </div>

          {state.selectedPalettes.length === 0 ? (
            <div className="text-center py-[24px] text-[13px] text-[#a1a1aa]">
              <Palette size={28} className="mx-auto mb-[8px] text-[#e4e4e7]" />
              <p>Select at least one palette</p>
              <p className="text-[11px] mt-[2px]">to continue to the next step</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[8px] max-h-[50vh] overflow-y-auto pr-[4px]">
              {state.selectedPalettes.map((p) => {
                const lib = tokenLibraries.find(
                  (l) => l.id === p.libraryId
                );
                return (
                  <div
                    key={`${p.libraryId}:${p.collectionName}`}
                    className="flex items-center gap-[8px] p-[8px] rounded-[8px] bg-[#fafafa] border border-[#e4e4e7]"
                  >
                    <div
                      className="w-[28px] h-[28px] rounded-[6px] shrink-0 flex items-center justify-center text-[10px]"
                      style={{
                        backgroundColor: p.baseValue,
                        color: getBestTextColor(p.baseValue),
                        fontWeight: 600,
                      }}
                    >
                      {p.collectionName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#09090b] truncate" style={{ fontWeight: 500 }}>
                        {p.collectionName}
                      </p>
                      <p className="text-[10px] text-[#71717a]">
                        {lib?.name ?? (p.libraryId === "imported" ? "Imported" : "Custom")} &middot; {p.shades.length} shades
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        removePalette(p.libraryId, p.collectionName)
                      }
                      className="text-[#a1a1aa] hover:text-[#3f3f46] transition-colors cursor-pointer text-[14px]"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Color count */}
          {state.selectedPalettes.length > 0 && (
            <div className="mt-[12px] pt-[12px] border-t border-[#e4e4e7] text-[11px] text-[#71717a]">
              <span style={{ fontWeight: 600 }}>
                {state.selectedPalettes.reduce(
                  (acc, p) => acc + p.shades.length,
                  0
                )}
              </span>{" "}
              primitive color tokens
            </div>
          )}
        </div>
      </div>
    </div>
  );
}