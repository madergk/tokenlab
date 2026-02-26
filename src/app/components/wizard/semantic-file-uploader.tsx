import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Layers,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Component,
  Network,
} from "lucide-react";
import { parseSemanticFile } from "./semantic-file-parser";
import type { ImportedSemanticFile, SemanticGroup } from "./wizard-types";

const ACCEPT = ".css,.json,.scss,.ts,.tsx,.js";
const FORMAT_LABELS: Record<string, string> = {
  css: "CSS Custom Properties",
  scss: "SCSS Variables",
  json: "JSON / Design Tokens",
  ts: "TypeScript / JavaScript",
};

interface SemanticFileUploaderProps {
  onImport: (groups: SemanticGroup[], file: ImportedSemanticFile) => void;
  hasExistingGroups: boolean;
}

export function SemanticFileUploader({
  onImport,
  hasExistingGroups,
}: SemanticFileUploaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<ImportedSemanticFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    setParsed(null);

    if (file.size > 512_000) {
      setError("File too large (max 500 KB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const result = parseSemanticFile(file.name, content);
      if (!result || result.detectedGroups.length === 0) {
        setError(
          "No semantic structure detected. " +
          "Tokens need at least a group and variant in their name " +
          "(e.g. --action-primary-bg, $feedback-success-text)."
        );
        return;
      }
      setParsed(result);
      setExpandedGroup(result.detectedGroups[0]?.id ?? null);
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFile]
  );

  const handleImport = () => {
    if (!parsed) return;
    onImport(parsed.detectedGroups, parsed);
    setParsed(null);
    setIsExpanded(false);
  };

  const handleReset = () => {
    setParsed(null);
    setError(null);
  };

  const totalVariants = parsed
    ? parsed.detectedGroups.reduce((a, g) => a + g.variants.length, 0)
    : 0;

  // ── Collapsed button ─────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-[8px] px-[16px] py-[12px] rounded-[12px] border-2 border-dashed border-[#9F7AEA] text-[#27272a] hover:bg-[#FAF5FF] transition-colors"
        style={{ fontWeight: 500, fontSize: "14px", fontFamily: "'Geist', system-ui, sans-serif" }}
      >
        <Network size={18} />
        Import semantic structure
      </button>
    );
  }

  // ── Expanded panel ───────────────────────────────────────────────
  return (
    <div className="bg-white rounded-[12px] border-2 border-dashed border-[#9F7AEA] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] py-[12px] bg-[#FAF5FF] border-b border-[#E9D5FF]">
        <div className="flex items-center gap-[8px]">
          <Network size={16} className="text-[#27272a]" />
          <h3
            className="text-[14px] text-[#09090b]"
            style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
          >
            Import Semantic Structure
          </h3>
        </div>
        <button
          onClick={() => { setIsExpanded(false); handleReset(); }}
          className="text-[#71717a] hover:text-[#3f3f46] transition-colors cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-[16px] space-y-[14px]">
        {/* Info */}
        <p className="text-[12px] text-[#52525b] leading-[1.5]">
          Upload a file with your existing token naming structure.
          The parser detects <strong>groups</strong>, <strong>variants</strong>,
          and <strong>elements</strong> from hierarchical token names — these will
          pre-populate the <em>Semantic Tokens</em> step.
        </p>

        {/* Accepted formats */}
        <div className="flex flex-wrap gap-[6px]">
          {["CSS", "SCSS", "JSON", "TS"].map((f) => (
            <span
              key={f}
              className="px-[8px] py-[2px] rounded-[4px] bg-[#fafafa] text-[10px] text-[#27272a]"
              style={{ fontWeight: 600 }}
            >
              .{f.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Examples */}
        <div className="rounded-[8px] bg-[#1E1E2E] p-[12px]">
          <p className="text-[10px] text-[#71717a] mb-[6px]" style={{ fontWeight: 600 }}>
            Detected naming patterns
          </p>
          <div className="space-y-[2px] text-[10px]">
            <p><span className="text-[#a1a1aa]">--action</span><span className="text-[#d4d4d8]">-</span><span className="text-[#a1a1aa]">primary</span><span className="text-[#d4d4d8]">-</span><span className="text-[#d4d4d8]">bg</span><span className="text-[#d4d4d8]">-</span><span className="text-[#a1a1aa]">color</span></p>
            <p><span className="text-[#a1a1aa]">--feedback</span><span className="text-[#d4d4d8]">-</span><span className="text-[#a1a1aa]">success</span><span className="text-[#d4d4d8]">-</span><span className="text-[#d4d4d8]">text</span></p>
            <p><span className="text-[#a1a1aa]">$surface</span><span className="text-[#d4d4d8]">-</span><span className="text-[#a1a1aa]">default</span><span className="text-[#d4d4d8]">-</span><span className="text-[#d4d4d8]">border</span></p>
          </div>
          <div className="flex gap-[12px] mt-[8px] text-[9px]">
            <span className="flex items-center gap-[4px]"><span className="w-[8px] h-[8px] rounded-[2px] bg-[#a1a1aa]" /> group</span>
            <span className="flex items-center gap-[4px]"><span className="w-[8px] h-[8px] rounded-[2px] bg-[#a1a1aa]" /> variant</span>
            <span className="flex items-center gap-[4px]"><span className="w-[8px] h-[8px] rounded-[2px] bg-[#d4d4d8]" /> element</span>
            <span className="flex items-center gap-[4px]"><span className="w-[8px] h-[8px] rounded-[2px] bg-[#a1a1aa]" /> property</span>
          </div>
        </div>

        {/* Drop zone */}
        {!parsed && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-[8px] py-[28px] rounded-[10px] border-2 border-dashed transition-all cursor-pointer ${
              dragOver
                ? "border-[#27272a] bg-[#FAF5FF]"
                : "border-[#e4e4e7] hover:border-[#9F7AEA] bg-[#FAFAFA]"
            }`}
          >
            <Upload
              size={28}
              className={dragOver ? "text-[#27272a]" : "text-[#a1a1aa]"}
            />
            <p className="text-[13px] text-[#71717a]">
              {dragOver ? (
                <span className="text-[#27272a]" style={{ fontWeight: 600 }}>
                  Drop file here
                </span>
              ) : (
                <>
                  Drag & drop or{" "}
                  <span className="text-[#27272a] underline">browse</span>
                </>
              )}
            </p>
            <p className="text-[10px] text-[#a1a1aa]">Max 500 KB</p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-[8px] p-[12px] rounded-[8px] bg-[#FFF1F0] border border-[#FFA39E] text-[12px] text-[#3f3f46]">
            <AlertTriangle size={14} className="shrink-0 mt-[1px]" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed preview */}
        {parsed && (
          <div className="space-y-[12px]">
            {/* File summary */}
            <div className="flex items-center justify-between p-[10px] rounded-[8px] bg-[#FAF5FF] border border-[#E9D5FF]">
              <div className="flex items-center gap-[8px]">
                <Network size={16} className="text-[#27272a] shrink-0" />
                <div>
                  <p className="text-[12px] text-[#09090b] truncate max-w-[200px]" style={{ fontWeight: 600 }}>
                    {parsed.fileName}
                  </p>
                  <p className="text-[10px] text-[#71717a]">
                    {FORMAT_LABELS[parsed.format]} &middot;{" "}
                    {parsed.detectedGroups.length} groups &middot;{" "}
                    {totalVariants} variants
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-[11px] text-[#71717a] hover:text-[#3f3f46] px-[8px] py-[3px] rounded-[6px] bg-white border border-[#e4e4e7] transition-colors cursor-pointer"
              >
                Replace
              </button>
            </div>

            {/* Groups preview */}
            <div className="max-h-[260px] overflow-y-auto space-y-[6px] pr-[4px]">
              {parsed.detectedGroups.map((group) => {
                const isOpen = expandedGroup === group.id;
                return (
                  <div
                    key={group.id}
                    className="rounded-[8px] border border-[#e4e4e7] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedGroup(isOpen ? null : group.id)}
                      className="w-full flex items-center justify-between px-[12px] py-[8px] hover:bg-[#fafafa] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-[8px]">
                        <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center ${
                          group.type === "group"
                            ? "bg-[#fafafa] text-[#09090b]"
                            : "bg-[#E0F2FE] text-[#0369A1]"
                        }`}>
                          {group.type === "group" ? <Layers size={10} /> : <Component size={10} />}
                        </div>
                        <span className="text-[12px] text-[#09090b]" style={{ fontWeight: 600 }}>
                          {group.name}
                        </span>
                        <span className="text-[10px] text-[#a1a1aa]">
                          {group.variants.length} variant{group.variants.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronDown size={14} className="text-[#71717a]" />
                      ) : (
                        <ChevronRight size={14} className="text-[#71717a]" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-[12px] pb-[10px] space-y-[6px]">
                        {group.variants.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center gap-[8px] px-[8px] py-[5px] rounded-[6px] bg-[#FAFAFA] border border-[#f4f4f5]"
                          >
                            <span
                              className="text-[11px] text-[#09090b]"
                              style={{ fontWeight: 500 }}
                            >
                              {v.name}
                            </span>
                            <div className="flex gap-[3px] ml-auto">
                              {v.elements.map((el) => (
                                <span
                                  key={el.id}
                                  className="px-[5px] py-[1px] rounded-[3px] bg-[#fafafa] text-[9px] text-[#27272a]"
                                  style={{ fontWeight: 500 }}
                                >
                                  {el.name === "background" ? "bg" : el.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Warning if existing groups */}
            {hasExistingGroups && (
              <div className="flex items-start gap-[8px] p-[10px] rounded-[8px] bg-[#FFF8E1] border border-[#FFE082] text-[11px] text-[#92400E]">
                <AlertTriangle size={13} className="shrink-0 mt-[1px]" />
                <span>
                  Importing will <strong>replace</strong> existing semantic groups.
                  Manual groups defined in Step 3 will be overwritten.
                </span>
              </div>
            )}

            {/* Import action */}
            <button
              onClick={handleImport}
              className="w-full flex items-center justify-center gap-[6px] px-[16px] py-[10px] rounded-[8px] bg-[#27272a] text-white text-[13px] hover:opacity-90 transition-all cursor-pointer"
              style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
            >
              <Check size={14} />
              Import {parsed.detectedGroups.length} groups &middot; {totalVariants} variants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
