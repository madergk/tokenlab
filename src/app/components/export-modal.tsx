import { useState } from "react";
import { X, Copy, Check, Download, FileJson, FileCode } from "lucide-react";
import type { TokenLibrary } from "./token-libraries";
import type { ColorCollection } from "./color-utils";

type ExportFormat = "dtcg" | "css" | "scss" | "json" | "tailwind" | "js";

interface ExportModalProps {
  library: TokenLibrary;
  collections: ColorCollection[];
  onClose: () => void;
}

function generateCSS(
  collections: ColorCollection[],
  prefix: string
): string {
  let css = `:root {\n`;
  for (const col of collections) {
    css += `  /* ${col.name} */\n`;
    const cleanBase = col.baseColor.replace("$", "").replace(/\./g, "-");
    css += `  --${cleanBase}: ${col.baseValue};\n`;
    for (const v of col.variables) {
      const cleanName = v.name.replace("$", "").replace(/\./g, "-");
      css += `  --${cleanName}: ${v.value};`;
      if (v.reference) css += ` /* ${v.reference} */`;
      css += `\n`;
    }
    css += `\n`;
  }
  css += `}`;
  return css;
}

function generateSCSS(
  collections: ColorCollection[],
  prefix: string
): string {
  let scss = `// Color Tokens\n\n`;
  for (const col of collections) {
    scss += `// ${col.name}\n`;
    const cleanBase = col.baseColor.replace("$", "");
    scss += `$${cleanBase}: ${col.baseValue};\n`;
    for (const v of col.variables) {
      const cleanName = v.name.replace("$", "");
      scss += `$${cleanName}: ${v.value};`;
      if (v.reference) scss += ` // ${v.reference}`;
      scss += `\n`;
    }
    scss += `\n`;
  }

  // Also generate a map
  scss += `// Color Maps\n`;
  for (const col of collections) {
    const cleanBase = col.baseColor
      .replace("$", "")
      .replace(/\./g, "-")
      .toLowerCase();
    scss += `$${cleanBase}-map: (\n`;
    for (const v of col.variables) {
      const shade = v.name.split(/[-.]/).pop() || "";
      scss += `  "${shade}": ${v.value},\n`;
    }
    scss += `);\n\n`;
  }
  return scss;
}

function generateJSON(collections: ColorCollection[]): string {
  const obj: Record<string, Record<string, { value: string; reference?: string }>> = {};
  for (const col of collections) {
    const key = col.name.toLowerCase().replace(/\s+/g, "-");
    obj[key] = {};
    for (const v of col.variables) {
      const shade = v.name.split(/[-.]/).pop() || v.name;
      obj[key][shade] = { value: v.value };
      if (v.reference) obj[key][shade].reference = v.reference;
    }
  }
  return JSON.stringify(obj, null, 2);
}

function generateDTCG(collections: ColorCollection[]): string {
  const obj: Record<string, Record<string, { $value: string; $type: string; $description?: string }>> = {};
  for (const col of collections) {
    const key = col.name.toLowerCase().replace(/\s+/g, "-");
    obj[key] = {};
    for (const v of col.variables) {
      const shade = v.name.split(/[-.]/).pop() || v.name;
      const entry: { $value: string; $type: string; $description?: string } = {
        $value: v.value,
        $type: "color",
      };
      if (v.reference) entry.$description = `Reference: ${v.reference}`;
      obj[key][shade] = entry;
    }
  }
  return JSON.stringify(obj, null, 2);
}

function generateTailwindConfig(collections: ColorCollection[]): string {
  let config = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
  for (const col of collections) {
    const colorName = col.name.toLowerCase().replace(/\s+/g, "-");
    config += `        '${colorName}': {\n`;
    config += `          DEFAULT: '${col.baseValue}',\n`;
    for (const v of col.variables) {
      const shade = v.name.split(/[-.]/).pop() || "";
      config += `          '${shade}': '${v.value}',\n`;
    }
    config += `        },\n`;
  }
  config += `      },\n    },\n  },\n};`;
  return config;
}

function generateJS(collections: ColorCollection[]): string {
  let js = `export const colors = {\n`;
  for (const col of collections) {
    const colorName = col.name.toLowerCase().replace(/\s+/g, "");
    js += `  ${colorName}: {\n`;
    js += `    DEFAULT: '${col.baseValue}',\n`;
    for (const v of col.variables) {
      const shade = v.name.split(/[-.]/).pop() || "";
      js += `    '${shade}': '${v.value}',\n`;
    }
    js += `  },\n`;
  }
  js += `};\n`;
  return js;
}

const formatOptions: { id: ExportFormat; label: string; ext: string }[] = [
  { id: "dtcg", label: "DTCG (W3C)", ext: ".tokens.json" },
  { id: "css", label: "CSS Variables", ext: ".css" },
  { id: "scss", label: "SCSS", ext: ".scss" },
  { id: "json", label: "JSON", ext: ".json" },
  { id: "tailwind", label: "Tailwind Config", ext: ".config.js" },
  { id: "js", label: "JS Module", ext: ".js" },
];

export function ExportModal({
  library,
  collections,
  onClose,
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("dtcg");
  const [copied, setCopied] = useState(false);

  const getOutput = () => {
    switch (format) {
      case "dtcg":
        return generateDTCG(collections);
      case "css":
        return generateCSS(collections, library.prefix);
      case "scss":
        return generateSCSS(collections, library.prefix);
      case "json":
        return generateJSON(collections);
      case "tailwind":
        return generateTailwindConfig(collections);
      case "js":
        return generateJS(collections);
    }
  };

  const output = getOutput();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const selected = formatOptions.find((f) => f.id === format);
    const name = library.id + "-tokens" + (selected?.ext || ".txt");
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-[16px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] w-full max-w-[720px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[#e4e4e7]">
          <div className="flex items-center gap-[12px]">
            <div
              className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white text-[12px]"
              style={{
                backgroundColor: library.accentColor,
                fontWeight: 700,
              }}
            >
              <FileCode size={16} />
            </div>
            <div>
              <h3 className="text-[#09090b]">
                Export {library.name}
              </h3>
              <p className="text-[12px] text-[#71717a]">
                {collections.length} collections &middot;{" "}
                {collections.reduce(
                  (acc, c) => acc + c.variables.length,
                  0
                )}{" "}
                tokens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center hover:bg-[#f4f4f5] transition-colors cursor-pointer text-[#71717a]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Format selector */}
        <div className="flex items-center gap-[6px] px-[24px] py-[14px] border-b border-[#e4e4e7] overflow-x-auto">
          {formatOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id)}
              className={`px-[14px] py-[6px] rounded-[8px] text-[13px] whitespace-nowrap transition-all cursor-pointer ${
                format === opt.id
                  ? "text-white shadow-sm"
                  : "bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7]"
              }`}
              style={
                format === opt.id
                  ? { backgroundColor: library.accentColor }
                  : undefined
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Code output */}
        <div className="flex-1 overflow-auto p-[24px] bg-[#fafafa]">
          <pre className="text-[12px] leading-[1.7] text-[#27272a] whitespace-pre overflow-x-auto">
            {output}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-[#e4e4e7]">
          <button
            onClick={handleCopy}
            className="flex items-center gap-[6px] px-[16px] py-[8px] rounded-[8px] bg-[#f4f4f5] text-[#52525b] hover:bg-[#e4e4e7] transition-colors cursor-pointer text-[13px]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-[6px] px-[16px] py-[8px] rounded-[8px] text-white transition-colors cursor-pointer text-[13px] hover:opacity-90"
            style={{ backgroundColor: library.accentColor }}
          >
            <Download size={14} />
            Download {formatOptions.find((f) => f.id === format)?.ext}
          </button>
        </div>
      </div>
    </div>
  );
}
