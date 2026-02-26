import type { TokenLibrary } from "./token-libraries";

interface FrameworkSelectorProps {
  libraries: TokenLibrary[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function FrameworkSelector({
  libraries,
  activeId,
  onSelect,
}: FrameworkSelectorProps) {
  return (
    <div className="flex items-center gap-[6px] flex-wrap">
      {libraries.map((lib) => {
        const isActive = lib.id === activeId;
        return (
          <button
            key={lib.id}
            onClick={() => onSelect(lib.id)}
            className={`flex items-center gap-[8px] px-[14px] py-[8px] rounded-[10px] text-[13px] transition-all cursor-pointer border ${
              isActive
                ? "text-white border-transparent shadow-md"
                : "bg-white text-[#52525b] border-[#e4e4e7] hover:border-[#a1a1aa] hover:shadow-sm"
            }`}
            style={
              isActive
                ? {
                    backgroundColor: lib.accentColor,
                    boxShadow: `0 4px 14px ${lib.accentColor}40`,
                  }
                : undefined
            }
          >
            <span
              className={`w-[24px] h-[24px] rounded-[6px] flex items-center justify-center text-[10px] shrink-0 ${
                isActive ? "bg-white/20" : ""
              }`}
              style={
                !isActive
                  ? {
                      backgroundColor: lib.accentColor + "15",
                      color: lib.accentColor,
                      fontWeight: 700,
                    }
                  : { fontWeight: 700 }
              }
            >
              {lib.icon}
            </span>
            <span className="hidden sm:inline">{lib.name}</span>
          </button>
        );
      })}
    </div>
  );
}
