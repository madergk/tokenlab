import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileCode2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { parseTokenFile, importedGroupsToPalettes } from "./token-file-parser";
import type { ImportedTokenFile, SelectedPalette } from "./wizard-types";

const ACCEPT = ".css,.json,.scss,.ts,.tsx,.js";
const FORMAT_LABELS: Record<string, string> = {
  css: "CSS Custom Properties",
  scss: "SCSS Variables",
  json: "JSON / Design Tokens",
  ts: "TypeScript / JavaScript",
};

interface TokenFileUploaderProps {
  onImport: (palettes: SelectedPalette[], file: ImportedTokenFile) => void;
  existingNames: string[];
}

export function TokenFileUploader({
  onImport,
  existingNames,
}: TokenFileUploaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState<ImportedTokenFile | null>(null);
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
      const result = parseTokenFile(file.name, content);
      if (!result) {
        setError("No color tokens found. Ensure the file contains hex colors (#RRGGBB).");
        return;
      }
      setParsed(result);
      setExpandedGroup(result.groups[0]?.groupName ?? null);
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
    const palettes = importedGroupsToPalettes(parsed.groups);

    // Dedupe against existing palette names
    const deduped = palettes.map((p) => {
      let name = p.collectionName;
      let i = 2;
      while (existingNames.includes(name)) {
        name = `${p.collectionName} (${i++})`;
      }
      return { ...p, collectionName: name };
    });

    onImport(deduped, parsed);
    setParsed(null);
    setIsExpanded(false);
  };

  const handleReset = () => {
    setParsed(null);
    setError(null);
  };

  // ── Collapsed button ───────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-[8px] px-[16px] py-[12px] rounded-[12px] border-2 border-dashed border-[#a1a1aa] text-[#52525b] hover:border-[#09090b] hover:text-[#09090b] hover:bg-[#fafafa] transition-colors"
        style={{ fontWeight: 500, fontSize: "14px", fontFamily: "'Geist', system-ui, sans-serif" }}
      >
        <Upload size={18} />
        Import token file
      </button>
    );
  }

  // ── Expanded panel ─────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-[12px] border-2 border-dashed border-[#a1a1aa] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] py-[12px] bg-[#fafafa] border-b border-[#e4e4e7]">
        <div className="flex items-center gap-[8px]">
          <FileCode2 size={16} className="text-[#52525b]" />
          <h3
            className="text-[14px] text-[#09090b]"
            style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
          >
            Import Token File
          </h3>
        </div>
        <button
          onClick={() => {
            setIsExpanded(false);
            handleReset();
          }}
          className="text-[#71717a] hover:text-[#3f3f46] transition-colors cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-[16px] space-y-[14px]">
        {/* Accepted formats legend */}
        <div className="flex flex-wrap gap-[6px]">
          {["CSS", "SCSS", "JSON", "TS"].map((f) => (
            <span
              key={f}
              className="px-[8px] py-[2px] rounded-[4px] bg-[#f4f4f5] text-[10px] text-[#52525b]"
              style={{ fontWeight: 600 }}
            >
              .{f.toLowerCase()}
            </span>
          ))}
          <span className="text-[11px] text-[#71717a] self-center ml-[4px]">
            — theme, variables or design token files
          </span>
        </div>

        {/* Drop zone */}
        {!parsed && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-[8px] py-[28px] rounded-[10px] border-2 border-dashed transition-all cursor-pointer ${
              dragOver
                ? "border-[#09090b] bg-[#fafafa]"
                : "border-[#e4e4e7] hover:border-[#a1a1aa] bg-[#FAFAFA]"
            }`}
          >
            <Upload
              size={28}
              className={dragOver ? "text-[#09090b]" : "text-[#a1a1aa]"}
            />
            <p className="text-[13px] text-[#71717a]">
              {dragOver ? (
                <span className="text-[#09090b]" style={{ fontWeight: 600 }}>
                  Drop file here
                </span>
              ) : (
                <>
                  Drag & drop or{" "}
                  <span className="text-[#09090b] underline">browse</span>
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
            <div className="flex items-center justify-between p-[10px] rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0]">
              <div className="flex items-center gap-[8px]">
                <FileCode2 size={16} className="text-[#3f3f46] shrink-0" />
                <div>
                  <p
                    className="text-[12px] text-[#09090b] truncate max-w-[200px]"
                    style={{ fontWeight: 600 }}
                  >
                    {parsed.fileName}
                  </p>
                  <p className="text-[10px] text-[#71717a]">
                    {FORMAT_LABELS[parsed.format]} &middot;{" "}
                    {parsed.totalTokens} color tokens &middot;{" "}
                    {parsed.groups.length} groups
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
            <div className="max-h-[240px] overflow-y-auto space-y-[6px] pr-[4px]">
              {parsed.groups.map((group) => {
                const isOpen = expandedGroup === group.groupName;
                return (
                  <div
                    key={group.groupName}
                    className="rounded-[8px] border border-[#e4e4e7] overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedGroup(isOpen ? null : group.groupName)
                      }
                      className="w-full flex items-center justify-between px-[12px] py-[8px] hover:bg-[#fafafa] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-[8px]">
                        {/* Mini color strip */}
                        <div className="flex gap-[1px] rounded-[3px] overflow-hidden h-[16px] w-[48px] shrink-0">
                          {group.tokens.slice(0, 6).map((t, i) => (
                            <div
                              key={i}
                              className="flex-1"
                              style={{ backgroundColor: t.value }}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[12px] text-[#09090b]"
                          style={{ fontWeight: 500 }}
                        >
                          {group.groupName}
                        </span>
                        <span className="text-[10px] text-[#a1a1aa]">
                          {group.tokens.length}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronDown size={14} className="text-[#71717a]" />
                      ) : (
                        <ChevronRight size={14} className="text-[#71717a]" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-[12px] pb-[10px] grid grid-cols-2 gap-[4px]">
                        {group.tokens.map((t) => (
                          <div
                            key={t.name}
                            className="flex items-center gap-[6px] px-[6px] py-[4px] rounded-[4px] bg-[#fafafa]"
                          >
                            <div
                              className="w-[14px] h-[14px] rounded-[3px] shrink-0 border border-black/10"
                              style={{ backgroundColor: t.value }}
                            />
                            <span className="text-[10px] text-[#52525b] truncate">
                              {t.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Import action */}
            <button
              onClick={handleImport}
              className="w-full flex items-center justify-center gap-[6px] px-[16px] py-[10px] rounded-[8px] bg-[#09090b] text-white text-[13px] hover:opacity-90 transition-all cursor-pointer"
              style={{ fontWeight: 600, fontFamily: "'Geist', system-ui, sans-serif" }}
            >
              <Check size={14} />
              Import {parsed.totalTokens} tokens as palettes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
