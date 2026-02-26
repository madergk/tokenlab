import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Palette,
  Info,
  Download,
  Pencil,
  PencilOff,
  Search,
  RotateCcw,
  WandSparkles,
} from "lucide-react";
import { ColorCollectionCard } from "./color-collection-card";
import { FrameworkSelector } from "./framework-selector";
import { ExportModal } from "./export-modal";
import { tokenLibraries } from "./token-libraries";
import type { ColorCollection } from "./color-utils";
import type { SelectedPalette } from "./wizard/wizard-types";

export function TokenExplorer() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [activeLibraryId, setActiveLibraryId] = useState(
    tokenLibraries[0].id
  );
  const [editMode, setEditMode] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editedCollections, setEditedCollections] = useState<
    Record<string, ColorCollection[]>
  >({});

  const activeLibrary = tokenLibraries.find(
    (l) => l.id === activeLibraryId
  )!;

  const collections = useMemo(() => {
    return editedCollections[activeLibraryId] || activeLibrary.collections;
  }, [activeLibraryId, editedCollections, activeLibrary]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections
      .map((col) => {
        const nameMatch =
          col.name.toLowerCase().includes(q) ||
          col.baseColor.toLowerCase().includes(q);
        const matchingVars = col.variables.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.value.toLowerCase().includes(q) ||
            (v.reference && v.reference.toLowerCase().includes(q))
        );
        if (nameMatch) return col;
        if (matchingVars.length > 0)
          return { ...col, variables: matchingVars };
        return null;
      })
      .filter(Boolean) as ColorCollection[];
  }, [collections, searchQuery]);

  const hasEdits = !!editedCollections[activeLibraryId];

  const handleBaseColorChange = useCallback(
    (collectionIndex: number, newValue: string) => {
      setEditedCollections((prev) => {
        const current =
          prev[activeLibraryId] || activeLibrary.collections.map((c) => ({
            ...c,
            variables: [...c.variables],
          }));
        const updated = current.map((c, i) =>
          i === collectionIndex ? { ...c, baseValue: newValue } : c
        );
        return { ...prev, [activeLibraryId]: updated };
      });
    },
    [activeLibraryId, activeLibrary]
  );

  const handleVariableColorChange = useCallback(
    (
      collectionIndex: number,
      variableIndex: number,
      newValue: string
    ) => {
      setEditedCollections((prev) => {
        const current =
          prev[activeLibraryId] || activeLibrary.collections.map((c) => ({
            ...c,
            variables: c.variables.map((v) => ({ ...v })),
          }));
        const updated = current.map((c, i) => {
          if (i !== collectionIndex) return c;
          const newVars = c.variables.map((v, vi) =>
            vi === variableIndex ? { ...v, value: newValue } : v
          );
          return { ...c, variables: newVars };
        });
        return { ...prev, [activeLibraryId]: updated };
      });
    },
    [activeLibraryId, activeLibrary]
  );

  const handleBaseNameChange = useCallback(
    (collectionIndex: number, newName: string) => {
      setEditedCollections((prev) => {
        const current =
          prev[activeLibraryId] || activeLibrary.collections.map((c) => ({
            ...c,
            variables: [...c.variables],
          }));
        const updated = current.map((c, i) =>
          i === collectionIndex ? { ...c, baseColor: newName } : c
        );
        return { ...prev, [activeLibraryId]: updated };
      });
    },
    [activeLibraryId, activeLibrary]
  );

  const handleVariableNameChange = useCallback(
    (
      collectionIndex: number,
      variableIndex: number,
      newName: string
    ) => {
      setEditedCollections((prev) => {
        const current =
          prev[activeLibraryId] || activeLibrary.collections.map((c) => ({
            ...c,
            variables: c.variables.map((v) => ({ ...v })),
          }));
        const updated = current.map((c, i) => {
          if (i !== collectionIndex) return c;
          const newVars = c.variables.map((v, vi) =>
            vi === variableIndex ? { ...v, name: newName } : v
          );
          return { ...c, variables: newVars };
        });
        return { ...prev, [activeLibraryId]: updated };
      });
    },
    [activeLibraryId, activeLibrary]
  );

  const handleReset = () => {
    setEditedCollections((prev) => {
      const next = { ...prev };
      delete next[activeLibraryId];
      return next;
    });
  };

  const totalTokens = collections.reduce(
    (acc, c) => acc + c.variables.length,
    0
  );
  const totalCollections = collections.length;

  const navigateToWizard = useCallback(() => {
    const palettes: SelectedPalette[] = collections.map((col) => ({
      libraryId: hasEdits ? "custom" : activeLibraryId,
      collectionName: col.name,
      baseValue: col.baseValue,
      shades: col.variables.map((v) => ({ name: v.name, value: v.value })),
    }));
    navigate("/wizard", {
      state: { preselectedPalettes: palettes, sourceLibrary: activeLibrary.name },
    });
  }, [collections, hasEdits, activeLibraryId, activeLibrary, navigate]);

  return (
    <div className="min-h-full bg-[#fafafa]">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#e4e4e7] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-[20px] md:px-[32px] py-[16px]">
          {/* Top row */}
          <div className="flex items-center justify-between gap-[12px] mb-[14px]">
            <div className="flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-gradient-to-br from-[#09090b] to-[#71717a] flex items-center justify-center shrink-0">
                <Palette size={18} color="#FFFFFF" />
              </div>
              <div>
                <h1 className="text-[#09090b] text-[18px] md:text-[22px]">
                  TokenLab
                </h1>
                <p className="text-[11px] md:text-[12px] text-[#71717a] hidden sm:block">
                  Visualize, edit and export design token collections
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[6px]">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] bg-[#fafafa] border border-[#e4e4e7] text-[#52525b] hover:bg-[#e4e4e7] transition-colors cursor-pointer text-[12px]"
              >
                <Info size={13} />
                <span className="hidden md:inline">
                  {showInfo ? "Hide" : "Legend"}
                </span>
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] border transition-all cursor-pointer text-[12px] ${
                  editMode
                    ? "bg-[#FFF3CD] border-[#FFCD39] text-[#664D03]"
                    : "bg-[#fafafa] border-[#e4e4e7] text-[#52525b] hover:bg-[#e4e4e7]"
                }`}
              >
                {editMode ? <PencilOff size={13} /> : <Pencil size={13} />}
                <span className="hidden md:inline">
                  {editMode ? "Editing" : "Edit"}
                </span>
              </button>
              {hasEdits && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] bg-[#FFF1F0] border border-[#FFA39E] text-[#CF1322] hover:bg-[#FFCCC7] transition-colors cursor-pointer text-[12px]"
                  title="Restore originals"
                >
                  <RotateCcw size={13} />
                  <span className="hidden md:inline">Reset</span>
                </button>
              )}
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-[5px] px-[12px] py-[6px] rounded-[8px] text-white transition-all cursor-pointer text-[12px] hover:opacity-90 shadow-sm"
                style={{
                  backgroundColor: activeLibrary.accentColor,
                  boxShadow: `0 2px 8px ${activeLibrary.accentColor}30`,
                }}
              >
                <Download size={13} />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-[10px]">
            <Search
              size={14}
              className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tokens by name, value or reference…"
              className="w-full pl-[32px] pr-[10px] py-[7px] rounded-[8px] border border-[#e4e4e7] bg-[#fafafa] text-[13px] text-[#09090b] placeholder-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#09090b]/20 focus:border-[#09090b]/40 transition-colors"
            />
          </div>

          {/* Framework selector */}
          <FrameworkSelector
            libraries={tokenLibraries}
            activeId={activeLibraryId}
            onSelect={(id) => {
              setActiveLibraryId(id);
              setSearchQuery("");
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-[20px] md:px-[32px] py-[24px]">
        {/* Legend */}
        {showInfo && (
          <div className="flex flex-wrap items-start gap-[16px] mb-[24px] p-[16px] rounded-[12px] bg-white border border-[#e4e4e7] shadow-sm">
            <div className="flex items-start gap-[8px]">
              <Info
                size={16}
                className="text-[#71717a] mt-[2px] shrink-0"
              />
              <div className="text-[12px] text-[#52525b] leading-[1.6]">
                <p>
                  <strong>Contrast Ratio</strong> is calculated against white or
                  black (whichever has greater contrast).
                </p>
                <p className="mt-[4px]">
                  <strong>AA</strong> = 4.5:1 (normal text) | 3:1 (large
                  text) &nbsp;&middot;&nbsp;
                  <strong>AAA</strong> = 7:1 (normal text) | 4.5:1 (large
                  text)
                </p>
                <p className="mt-[4px] text-[#868E96] italic">
                  References indicate aliases or linked semantic tokens.
                  {editMode &&
                    " Click on any name or hex value to edit inline, or use the pencil icon to pick a color."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard CTA card */}
        <div className="mb-[24px] p-[20px] rounded-[14px] bg-gradient-to-r from-[#09090b]/5 to-[#71717a]/5 border border-[#09090b]/15 flex items-center justify-between gap-[16px] flex-wrap">
          <div className="flex items-center gap-[12px]">
            <div className="box-content w-[40px] h-[40px] rounded-[10px] bg-gradient-to-br from-[#09090b] to-[#71717a] flex items-center justify-center shrink-0">
              <WandSparkles size={18} color="#FFFFFF" />
            </div>
            <div>
              <p className="text-[14px] text-[#09090b]" style={{ fontWeight: 600 }}>
                Create your own token system
              </p>
              <p className="text-[12px] text-[#71717a]">
                Guided wizard with standardized naming convention, interactive states
                and multi-format export.
              </p>
            </div>
          </div>
          <button
            onClick={navigateToWizard}
            className="flex items-center gap-[6px] px-[16px] py-[9px] rounded-[8px] bg-gradient-to-r from-[#09090b] to-[#18181b] text-white text-[13px] hover:opacity-90 transition-all cursor-pointer shadow-md shrink-0"
          >
            <WandSparkles size={14} />
            Start Wizard
          </button>
        </div>

        {/* Library description bar */}
        <div className="flex items-center justify-between mb-[24px] flex-wrap gap-[8px]">
          <div className="flex items-center gap-[10px]">
            <div
              className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-white text-[11px] shrink-0"
              style={{
                backgroundColor: hasEdits ? "#D97706" : activeLibrary.accentColor,
                fontWeight: 700,
              }}
            >
              {hasEdits ? "C" : activeLibrary.icon}
            </div>
            <div>
              <h2 className="text-[16px] text-[#09090b]">
                {hasEdits ? (
                  <>
                    Custom{" "}
                    <span className="text-[12px] text-[#71717a] font-normal">
                      (based on {activeLibrary.name})
                    </span>
                  </>
                ) : (
                  activeLibrary.name
                )}
              </h2>
              <p className="text-[11px] text-[#71717a]">
                {hasEdits
                  ? "Custom color system"
                  : activeLibrary.description}{" "}
                &middot; {totalCollections} collections &middot;{" "}
                {totalTokens} tokens
              </p>
            </div>
          </div>
          {editMode && (
            <span className="text-[11px] text-[#D97706] bg-[#FFF3CD] px-[10px] py-[4px] rounded-[6px] border border-[#FFCD39]">
              Edit mode active
            </span>
          )}
        </div>

        {/* Collections grid */}
        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[28px]">
            {filteredCollections.map((collection, filtIdx) => {
              const realIdx = collections.findIndex(
                (c) => c.baseColor === collection.baseColor
              );
              return (
                <ColorCollectionCard
                  key={`${activeLibraryId}-${collection.baseColor}`}
                  collection={collection}
                  editable={editMode}
                  onBaseColorChange={(val) =>
                    handleBaseColorChange(realIdx, val)
                  }
                  onBaseNameChange={(newName) =>
                    handleBaseNameChange(realIdx, newName)
                  }
                  onVariableColorChange={(varIdx, val) =>
                    handleVariableColorChange(realIdx, varIdx, val)
                  }
                  onVariableNameChange={(varIdx, newName) =>
                    handleVariableNameChange(realIdx, varIdx, newName)
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-[80px] text-center">
            <Search size={40} className="text-[#d4d4d8] mb-[12px]" />
            <p className="text-[15px] text-[#71717a]">
              No tokens found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-[10px] text-[13px] cursor-pointer underline"
              style={{ color: activeLibrary.accentColor }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Export modal */}
      {showExport && (
        <ExportModal
          library={activeLibrary}
          collections={collections}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}