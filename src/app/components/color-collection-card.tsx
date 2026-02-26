import { ColorSwatch } from "./color-swatch";
import type { ColorCollection, ColorVariable } from "./color-utils";

interface ColorCollectionCardProps {
  collection: ColorCollection;
  editable?: boolean;
  onBaseColorChange?: (newValue: string) => void;
  onBaseNameChange?: (newName: string) => void;
  onVariableColorChange?: (variableIndex: number, newValue: string) => void;
  onVariableNameChange?: (variableIndex: number, newName: string) => void;
}

export function ColorCollectionCard({
  collection,
  editable = false,
  onBaseColorChange,
  onBaseNameChange,
  onVariableColorChange,
  onVariableNameChange,
}: ColorCollectionCardProps) {
  return (
    <div className="flex flex-col gap-[6px] items-start shrink-0 w-full min-w-[280px]">
      {/* Base color header */}
      <ColorSwatch
        name={collection.baseColor}
        value={collection.baseValue}
        isBase
        editable={editable}
        onColorChange={onBaseColorChange}
        onNameChange={onBaseNameChange}
      />

      {/* Shade list */}
      <div className="flex flex-col items-start w-full rounded-[4px] overflow-hidden">
        {collection.variables.map((variable: ColorVariable, idx: number) => (
          <ColorSwatch
            key={`${collection.baseColor}-${idx}`}
            name={variable.name}
            value={variable.value}
            reference={variable.reference}
            editable={editable}
            onColorChange={(newVal) => onVariableColorChange?.(idx, newVal)}
            onNameChange={(newName) => onVariableNameChange?.(idx, newName)}
          />
        ))}
      </div>
    </div>
  );
}
