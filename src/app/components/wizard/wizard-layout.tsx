import { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Check, WandSparkles, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { STEP_LABELS, INITIAL_WIZARD_STATE } from "./wizard-types";
import type { WizardState, SelectedPalette } from "./wizard-types";
import { StepPalette } from "./step-palette";
import { StepNaming } from "./step-naming";
import { StepSemantic } from "./step-semantic";
import { StepModifiers } from "./step-modifiers";
import { StepFoundations } from "./step-foundations";
import { StepReview } from "./step-review";
import { StepPreview } from "./step-preview";
import { generateAllTokens } from "./wizard-utils";

interface WizardLocationState {
  preselectedPalettes?: SelectedPalette[];
  sourceLibrary?: string;
}

function buildInitialState(locationState: WizardLocationState | null): WizardState {
  const base: WizardState = {
    ...INITIAL_WIZARD_STATE,
    naming: { ...INITIAL_WIZARD_STATE.naming, slots: INITIAL_WIZARD_STATE.naming.slots.map((s) => ({ ...s })) },
  };

  if (locationState?.preselectedPalettes?.length) {
    base.selectedPalettes = locationState.preselectedPalettes;
  }

  return base;
}

export function WizardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? null) as WizardLocationState | null;

  // Lazy initializer — runs once on mount, avoids useMemo([]) anti-pattern
  const [state, setState] = useState<WizardState>(() => buildInitialState(locationState));
  const sourceLibrary = locationState?.sourceLibrary;
  // Count pre-loaded palettes for the banner (derived from locationState, stable)
  const preloadedCount = locationState?.preselectedPalettes?.length ?? 0;

  const step = state.currentStep;
  const totalSteps = STEP_LABELS.length;

  const updateState = useCallback((partial: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return state.selectedPalettes.length > 0;
      case 1:
        return true;
      case 2:
        return state.groups.length > 0 && state.groups.some((g) => g.variants.some((v) => v.paletteRef));
      case 3:
        return state.states.some((s) => s.enabled) && state.scales.some((s) => s.enabled);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      // Generate tokens when moving to review step (step 4 → step 5)
      if (step === 4) {
        const { tokens, warnings } = generateAllTokens(state);
        updateState({ currentStep: step + 1, generatedTokens: tokens, contrastWarnings: warnings });
      } else {
        updateState({ currentStep: step + 1 });
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      updateState({ currentStep: step - 1 });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepPalette state={state} updateState={updateState} />;
      case 1:
        return <StepNaming state={state} updateState={updateState} />;
      case 2:
        return <StepSemantic state={state} updateState={updateState} />;
      case 3:
        return <StepModifiers state={state} updateState={updateState} />;
      case 4:
        return <StepFoundations state={state} updateState={updateState} />;
      case 5:
        return <StepReview state={state} updateState={updateState} />;
      case 6:
        return <StepPreview state={state} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-[#fafafa] flex flex-col">
      {/* Top header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#e4e4e7] shadow-sm">
        <div className="max-w-[1280px] mx-auto px-[20px] md:px-[32px] py-[12px]">
          <div className="flex items-center justify-between gap-[12px]">
            <div className="flex items-center gap-[12px]">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-[4px] text-[13px] text-[#71717a] hover:text-[#09090b] transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Explorer</span>
              </button>
              <div className="w-[1px] h-[20px] bg-[#e4e4e7]" />
              <div className="flex items-center gap-[8px]">
                <div className="w-[30px] h-[30px] rounded-[8px] bg-gradient-to-br from-[#09090b] to-[#71717a] flex items-center justify-center shrink-0">
                  <WandSparkles size={14} color="#FFFFFF" />
                </div>
                <div>
                  <h1 className="text-[15px] text-[#09090b]" style={{ fontWeight: 600 }}>
                    Token System Wizard
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-[6px] text-[12px] text-[#71717a]">
              Step {step + 1} of {totalSteps}
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-[4px] mt-[12px] -mb-[1px]">
            {STEP_LABELS.map((s, i) => {
              const isActive = i === step;
              const isCompleted = i < step;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (i < step) {
                      updateState({ currentStep: i });
                    }
                  }}
                  className={`flex-1 flex flex-col items-center gap-[6px] pb-[12px] border-b-[2px] transition-all cursor-pointer ${
                    isActive
                      ? "border-[#09090b] text-[#09090b]"
                      : isCompleted
                        ? "border-[#71717a] text-[#71717a] hover:text-[#52525b]"
                        : "border-transparent text-[#a1a1aa]"
                  }`}
                  disabled={i > step}
                >
                  <div className="flex items-center gap-[6px]">
                    <div
                      className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                        isActive
                          ? "bg-[#09090b] text-white"
                          : isCompleted
                            ? "bg-[#71717a] text-white"
                            : "bg-[#e4e4e7] text-[#a1a1aa]"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {isCompleted ? <Check size={12} /> : i + 1}
                    </div>
                    <span className="text-[12px] hidden lg:block" style={{ fontWeight: isActive ? 600 : 400 }}>
                      {s.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1280px] mx-auto px-[20px] md:px-[32px] py-[24px]">
          {/* Pre-loaded banner */}
          {step === 0 && sourceLibrary && preloadedCount > 0 && (
            <div className="mb-[16px] flex items-center gap-[10px] p-[12px] rounded-[10px] bg-[#71717a]/8 border border-[#71717a]/20 text-[13px] text-[#52525b]">
              <Check size={16} className="shrink-0" />
              <span>
                <strong>{preloadedCount} palettes</strong> pre-loaded from{" "}
                <strong>{sourceLibrary}</strong> explorer. You can adjust the selection below.
              </span>
            </div>
          )}

          {/* Step header */}
          <div className="mb-[24px]">
            <h2 className="text-[20px] text-[#09090b]" style={{ fontWeight: 600 }}>
              {STEP_LABELS[step].title}
            </h2>
            <p className="text-[13px] text-[#71717a] mt-[4px]">
              {STEP_LABELS[step].description}
            </p>
          </div>

          {renderStep()}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-white border-t border-[#e4e4e7] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1280px] mx-auto px-[20px] md:px-[32px] py-[14px] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-[6px] px-[16px] py-[8px] rounded-[8px] text-[13px] transition-all cursor-pointer ${
              step === 0
                ? "text-[#d4d4d8] cursor-not-allowed"
                : "text-[#52525b] bg-[#f4f4f5] hover:bg-[#e4e4e7] border border-[#e4e4e7]"
            }`}
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          <div className="flex items-center gap-[4px]">
            {STEP_LABELS.map((_, i) => (
              <div
                key={i}
                className={`w-[8px] h-[8px] rounded-full transition-all ${
                  i === step
                    ? "bg-[#09090b] w-[24px]"
                    : i < step
                      ? "bg-[#71717a]"
                      : "bg-[#e4e4e7]"
                }`}
              />
            ))}
          </div>

          {step < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className={`flex items-center gap-[6px] px-[16px] py-[8px] rounded-[8px] text-[13px] transition-all cursor-pointer ${
                canAdvance()
                  ? "bg-[#09090b] text-white hover:bg-[#18181b] shadow-sm"
                  : "bg-[#e4e4e7] text-[#a1a1aa] cursor-not-allowed"
              }`}
            >
              {step === totalSteps - 2 ? "Preview" : "Next"}
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-[6px] px-[16px] py-[8px] rounded-[8px] text-[13px] bg-gradient-to-r from-[#09090b] to-[#71717a] text-white hover:opacity-90 transition-all cursor-pointer shadow-sm"
              style={{ fontWeight: 600 }}
            >
              <Check size={14} />
              Done — Back to Explorer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}