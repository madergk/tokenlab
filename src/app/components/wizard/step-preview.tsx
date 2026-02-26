import { useMemo, useState } from "react";
import {
  PartyPopper,
  Bell,
  Heart,
  Mail,
  Search,
  ChevronRight,
  Star,
  Check,
  AlertTriangle,
  Info,
  X,
  User,
  Settings,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getBestTextColor } from "../color-utils";
import type { WizardState, GeneratedToken } from "./wizard-types";

interface StepPreviewProps {
  state: WizardState;
}

// Resolve a token value by matching partial name segments
function findToken(
  tokens: GeneratedToken[],
  ...patterns: string[]
): GeneratedToken | undefined {
  for (const pattern of patterns) {
    const parts = pattern.toLowerCase().split(".");
    const match = tokens.find((t) => {
      const name = t.fullName.toLowerCase();
      return parts.every((p) => name.includes(p));
    });
    if (match) return match;
  }
  return undefined;
}

function val(token: GeneratedToken | undefined, fallback: string): string {
  return token?.value ?? fallback;
}

// Build a semantic color map from generated tokens
function buildColorMap(tokens: GeneratedToken[]) {
  return {
    primaryBg: val(findToken(tokens, "action.primary.bg", "action.primary.background", "primary.bg", "primary.background"), "#09090b"),
    primaryText: val(findToken(tokens, "action.primary.text", "primary.text"), "#FFFFFF"),
    primaryBorder: val(findToken(tokens, "action.primary.border", "primary.border"), "#18181b"),

    secondaryBg: val(findToken(tokens, "action.secondary.bg", "secondary.bg", "action.secondary.background"), "#f4f4f5"),
    secondaryText: val(findToken(tokens, "action.secondary.text", "secondary.text"), "#09090b"),
    secondaryBorder: val(findToken(tokens, "action.secondary.border", "secondary.border"), "#e4e4e7"),

    dangerBg: val(findToken(tokens, "action.danger.bg", "danger.bg", "error.bg", "feedback.error.bg"), "#3f3f46"),
    dangerText: val(findToken(tokens, "action.danger.text", "danger.text", "error.text", "feedback.error.text"), "#FFFFFF"),

    successBg: val(findToken(tokens, "feedback.success.bg", "success.bg"), "#52525b"),
    successText: val(findToken(tokens, "feedback.success.text", "success.text"), "#FFFFFF"),

    warningBg: val(findToken(tokens, "feedback.warning.bg", "warning.bg"), "#a1a1aa"),
    warningText: val(findToken(tokens, "feedback.warning.text", "warning.text"), "#09090b"),

    infoBg: val(findToken(tokens, "feedback.info.bg", "info.bg"), "#71717a"),
    infoText: val(findToken(tokens, "feedback.info.text", "info.text"), "#FFFFFF"),

    surfaceBg: val(findToken(tokens, "surface.default.bg", "surface.bg", "surface.default.background"), "#FFFFFF"),
    surfaceText: val(findToken(tokens, "surface.default.text", "surface.text"), "#09090b"),
    surfaceBorder: val(findToken(tokens, "surface.default.border", "surface.border"), "#e4e4e7"),

    raisedBg: val(findToken(tokens, "surface.raised.bg", "surface.raised.background"), "#FFFFFF"),

    controlBg: val(findToken(tokens, "control.default.bg", "control.bg", "control.default.background"), "#FFFFFF"),
    controlBorder: val(findToken(tokens, "control.default.border", "control.border"), "#e4e4e7"),
    controlText: val(findToken(tokens, "control.default.text", "control.text"), "#09090b"),
    controlCheckedBg: val(findToken(tokens, "control.checked.bg", "control.checked.background"), "#09090b"),
  };
}

export function StepPreview({ state }: StepPreviewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const c = useMemo(() => buildColorMap(state.generatedTokens), [state.generatedTokens]);

  const palettes = state.selectedPalettes;

  return (
    <div className="flex flex-col gap-[32px]">
      {/* Success header */}
      <div className="text-center py-[8px]">
        <div className="w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#09090b] to-[#71717a] flex items-center justify-center mx-auto mb-[16px] shadow-lg">
          <PartyPopper size={28} color="#FFFFFF" />
        </div>
        <h2 className="text-[24px] text-[#09090b]" style={{ fontWeight: 700 }}>
          Your design system is ready
        </h2>
        <p className="text-[14px] text-[#71717a] mt-[6px] max-w-[520px] mx-auto">
          Here&rsquo;s a live preview of how your tokens look applied to common UI patterns.
          Go back to any step to adjust, or export from the previous step.
        </p>
      </div>

      {/* Primitive palette strip */}
      <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[20px]">
        <h3 className="text-[13px] text-[#71717a] mb-[12px]" style={{ fontWeight: 600 }}>
          Primitive palettes
        </h3>
        <div className="flex flex-wrap gap-[12px]">
          {palettes.map((p) => (
            <div key={`${p.libraryId}:${p.collectionName}`} className="flex flex-col gap-[4px]">
              <div className="flex rounded-[8px] overflow-hidden shadow-sm">
                {p.shades.map((s, i) => (
                  <div
                    key={i}
                    className="w-[24px] h-[28px]"
                    style={{ backgroundColor: s.value }}
                    title={`${s.name}: ${s.value}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#71717a] text-center">{p.collectionName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Component showcase grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">

        {/* ── Buttons ──────────────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[24px]">
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Buttons
          </h3>
          <div className="flex flex-wrap gap-[10px]">
            <button
              className="px-[20px] py-[10px] rounded-[8px] text-[13px] shadow-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: c.primaryBg, color: c.primaryText, fontWeight: 600 }}
            >
              Primary action
            </button>
            <button
              className="px-[20px] py-[10px] rounded-[8px] text-[13px] border transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: c.secondaryBg, color: c.secondaryText, borderColor: c.secondaryBorder, fontWeight: 500 }}
            >
              Secondary
            </button>
            <button
              className="px-[20px] py-[10px] rounded-[8px] text-[13px] shadow-sm transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: c.dangerBg, color: c.dangerText, fontWeight: 600 }}
            >
              Danger
            </button>
            <button
              className="px-[16px] py-[10px] rounded-[8px] text-[13px] border-2 bg-transparent"
              style={{ borderColor: c.primaryBg, color: c.primaryBg, fontWeight: 600 }}
            >
              Outlined
            </button>
          </div>
          <div className="flex gap-[8px] mt-[14px]">
            <button
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: c.primaryBg, color: c.primaryText }}
            >
              <Heart size={16} />
            </button>
            <button
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: c.dangerBg, color: c.dangerText }}
            >
              <Bell size={16} />
            </button>
            <button
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center border"
              style={{ borderColor: c.secondaryBorder, color: c.secondaryText, backgroundColor: c.secondaryBg }}
            >
              <Mail size={16} />
            </button>
          </div>
        </div>

        {/* ── Card ──────────────────────────────────────────────── */}
        <div
          className="rounded-[16px] border p-[24px] shadow-sm"
          style={{ backgroundColor: c.raisedBg, borderColor: c.surfaceBorder }}
        >
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Card
          </h3>
          <div
            className="rounded-[12px] border overflow-hidden"
            style={{ borderColor: c.surfaceBorder, backgroundColor: c.surfaceBg }}
          >
            <div className="h-[6px]" style={{ backgroundColor: c.primaryBg }} />
            <div className="p-[20px]">
              <div className="flex items-center gap-[10px] mb-[10px]">
                <div
                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[13px] shrink-0"
                  style={{ backgroundColor: c.primaryBg, color: c.primaryText, fontWeight: 700 }}
                >
                  JD
                </div>
                <div>
                  <p className="text-[14px]" style={{ color: c.surfaceText, fontWeight: 600 }}>Jane Doe</p>
                  <p className="text-[11px]" style={{ color: c.surfaceText + "99" }}>Product Designer</p>
                </div>
              </div>
              <p className="text-[13px] leading-[1.6]" style={{ color: c.surfaceText + "CC" }}>
                This card previews your surface tokens — background, text, and border colors
                applied to a realistic component.
              </p>
              <div className="flex items-center gap-[6px] mt-[14px]">
                <button
                  className="px-[14px] py-[6px] rounded-[6px] text-[12px]"
                  style={{ backgroundColor: c.primaryBg, color: c.primaryText, fontWeight: 600 }}
                >
                  View profile
                </button>
                <button
                  className="px-[14px] py-[6px] rounded-[6px] text-[12px] border"
                  style={{ borderColor: c.surfaceBorder, color: c.surfaceText, fontWeight: 500 }}
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feedback / Alerts ─────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[24px]">
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Alerts &amp; Feedback
          </h3>
          <div className="flex flex-col gap-[8px]">
            {[
              { icon: <Check size={14} />, label: "Success", bg: c.successBg, text: c.successText, msg: "Changes saved successfully." },
              { icon: <AlertTriangle size={14} />, label: "Warning", bg: c.warningBg, text: c.warningText, msg: "Some fields need your attention." },
              { icon: <X size={14} />, label: "Error", bg: c.dangerBg, text: c.dangerText, msg: "Something went wrong. Try again." },
              { icon: <Info size={14} />, label: "Info", bg: c.infoBg, text: c.infoText, msg: "A new version is available." },
            ].map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-[10px]"
                style={{ backgroundColor: a.bg, color: a.text }}
              >
                <span className="shrink-0">{a.icon}</span>
                <span className="text-[12px] flex-1" style={{ fontWeight: 500 }}>{a.msg}</span>
                <span className="text-[10px] opacity-70 shrink-0">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form controls ────────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[24px]">
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Form controls
          </h3>
          <div className="space-y-[14px]">
            {/* Text input */}
            <div>
              <label className="text-[11px] block mb-[4px]" style={{ color: c.controlText, fontWeight: 500 }}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-[10px] top-1/2 -translate-y-1/2"
                  style={{ color: c.controlText + "66" }}
                />
                <div
                  className="w-full pl-[32px] pr-[12px] py-[8px] rounded-[8px] border text-[13px]"
                  style={{
                    backgroundColor: c.controlBg,
                    borderColor: c.controlBorder,
                    color: c.controlText + "99",
                  }}
                >
                  jane@example.com
                </div>
              </div>
            </div>
            {/* Search input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-[10px] top-1/2 -translate-y-1/2"
                style={{ color: c.controlText + "66" }}
              />
              <div
                className="w-full pl-[32px] pr-[12px] py-[8px] rounded-[8px] border text-[13px]"
                style={{
                  backgroundColor: c.controlBg,
                  borderColor: c.controlBorder,
                  color: c.controlText + "44",
                }}
              >
                Search...
              </div>
            </div>
            {/* Checkbox + switch row */}
            <div className="flex items-center gap-[20px]">
              <label className="flex items-center gap-[8px] text-[12px]" style={{ color: c.controlText }}>
                <div
                  className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center"
                  style={{ backgroundColor: c.controlCheckedBg, color: getBestTextColor(c.controlCheckedBg) }}
                >
                  <Check size={12} />
                </div>
                Remember me
              </label>
              <label className="flex items-center gap-[8px] text-[12px]" style={{ color: c.controlText }}>
                <div className="relative w-[36px] h-[20px] rounded-full" style={{ backgroundColor: c.controlCheckedBg }}>
                  <div
                    className="absolute top-[2px] right-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm"
                  />
                </div>
                Dark mode
              </label>
            </div>
          </div>
        </div>

        {/* ── Badges & chips ───────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[24px]">
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Badges &amp; Chips
          </h3>
          <div className="flex flex-wrap gap-[8px]">
            {[
              { label: "Primary", bg: c.primaryBg, text: c.primaryText },
              { label: "Success", bg: c.successBg, text: c.successText },
              { label: "Warning", bg: c.warningBg, text: c.warningText },
              { label: "Danger", bg: c.dangerBg, text: c.dangerText },
              { label: "Info", bg: c.infoBg, text: c.infoText },
            ].map((b) => (
              <span
                key={b.label}
                className="px-[12px] py-[5px] rounded-full text-[11px]"
                style={{ backgroundColor: b.bg, color: b.text, fontWeight: 600 }}
              >
                {b.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-[8px] mt-[12px]">
            {[
              { label: "Primary", bg: c.primaryBg },
              { label: "Secondary", bg: c.secondaryBorder },
              { label: "Danger", bg: c.dangerBg },
              { label: "Info", bg: c.infoBg },
            ].map((b) => (
              <span
                key={b.label}
                className="px-[12px] py-[5px] rounded-full text-[11px] border"
                style={{
                  borderColor: b.bg,
                  color: b.bg,
                  backgroundColor: b.bg + "14",
                  fontWeight: 500,
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Navigation / Tabs ────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[24px]">
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Navigation
          </h3>
          {/* Tabs */}
          <div className="flex items-center gap-[2px] bg-[#f4f4f5] rounded-[8px] p-[3px] mb-[16px]">
            {["Overview", "Settings", "Activity"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="flex-1 py-[7px] rounded-[6px] text-[12px] transition-all cursor-pointer"
                style={{
                  backgroundColor: i === activeTab ? c.primaryBg : "transparent",
                  color: i === activeTab ? c.primaryText : c.surfaceText + "99",
                  fontWeight: i === activeTab ? 600 : 400,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* List items */}
          <div
            className="rounded-[10px] border divide-y overflow-hidden"
            style={{ borderColor: c.surfaceBorder, backgroundColor: c.surfaceBg }}
          >
            {[
              { icon: <User size={14} />, label: "Profile", desc: "Manage your account" },
              { icon: <Settings size={14} />, label: "Preferences", desc: "Configure options" },
              { icon: <ShieldCheck size={14} />, label: "Security", desc: "Two-factor & passwords" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-[10px] px-[14px] py-[10px] hover:opacity-90 transition-opacity cursor-pointer"
                style={{ borderColor: c.surfaceBorder }}
              >
                <div
                  className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c.primaryBg + "18", color: c.primaryBg }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]" style={{ color: c.surfaceText, fontWeight: 500 }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: c.surfaceText + "88" }}>{item.desc}</p>
                </div>
                <ChevronRight size={14} style={{ color: c.surfaceText + "44" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Typography specimen ──────────────────────────────── */}
        <div
          className="rounded-[16px] border p-[24px] lg:col-span-2"
          style={{ backgroundColor: c.surfaceBg, borderColor: c.surfaceBorder }}
        >
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Typography &amp; Color mapping
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {/* Text hierarchy */}
            <div className="space-y-[10px]">
              <p className="text-[28px] leading-[1.2]" style={{ color: c.surfaceText, fontWeight: 700 }}>
                Display heading
              </p>
              <p className="text-[20px] leading-[1.3]" style={{ color: c.surfaceText, fontWeight: 600 }}>
                Section title
              </p>
              <p className="text-[14px] leading-[1.6]" style={{ color: c.surfaceText + "CC" }}>
                Body text — this is how paragraph content will look using your surface text token.
                The color adapts to whichever palette you mapped to the surface group.
              </p>
              <p className="text-[12px]" style={{ color: c.surfaceText + "88" }}>
                Caption or helper text with reduced opacity for hierarchy.
              </p>
              <a
                className="inline-flex items-center gap-[4px] text-[13px] cursor-pointer"
                style={{ color: c.primaryBg, fontWeight: 600 }}
              >
                Link with primary color <ArrowRight size={13} />
              </a>
            </div>

            {/* Semantic color map */}
            <div className="space-y-[6px]">
              {[
                { label: "action / primary", bg: c.primaryBg, text: c.primaryText },
                { label: "action / secondary", bg: c.secondaryBg, text: c.secondaryText },
                { label: "action / danger", bg: c.dangerBg, text: c.dangerText },
                { label: "feedback / success", bg: c.successBg, text: c.successText },
                { label: "feedback / warning", bg: c.warningBg, text: c.warningText },
                { label: "feedback / info", bg: c.infoBg, text: c.infoText },
                { label: "surface / default", bg: c.surfaceBg, text: c.surfaceText },
                { label: "control / checked", bg: c.controlCheckedBg, text: getBestTextColor(c.controlCheckedBg) },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-[8px]">
                  <div
                    className="w-[32px] h-[20px] rounded-[4px] border border-black/8 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: row.bg }}
                  >
                    <span className="text-[7px]" style={{ color: row.text, fontWeight: 700 }}>Aa</span>
                  </div>
                  <span className="text-[11px]" style={{ color: c.surfaceText + "99" }}>
                    {row.label}
                  </span>
                  <span className="ml-auto text-[10px]" style={{ color: c.surfaceText + "66" }}>
                    {row.bg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Rating / Stars ───────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[24px]">
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Rating &amp; Micro-interactions
          </h3>
          <div className="flex items-center gap-[4px] mb-[12px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={22}
                fill={i <= 4 ? c.warningBg : "none"}
                stroke={i <= 4 ? c.warningBg : c.surfaceBorder}
                strokeWidth={1.5}
              />
            ))}
            <span className="text-[13px] ml-[6px]" style={{ color: c.surfaceText, fontWeight: 600 }}>
              4.0
            </span>
            <span className="text-[11px]" style={{ color: c.surfaceText + "88" }}>
              (128 reviews)
            </span>
          </div>
          {/* Progress bars */}
          <div className="space-y-[6px]">
            {[
              { label: "5 star", pct: 60 },
              { label: "4 star", pct: 25 },
              { label: "3 star", pct: 10 },
              { label: "2 star", pct: 3 },
              { label: "1 star", pct: 2 },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-[8px]">
                <span className="text-[10px] w-[40px] text-right" style={{ color: c.surfaceText + "88" }}>
                  {bar.label}
                </span>
                <div className="flex-1 h-[6px] rounded-full" style={{ backgroundColor: c.surfaceBorder }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${bar.pct}%`, backgroundColor: c.primaryBg }}
                  />
                </div>
                <span className="text-[10px] w-[28px]" style={{ color: c.surfaceText + "88" }}>
                  {bar.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Avatar group ─────────────────────────────────────── */}
        <div className="bg-white rounded-[16px] border border-[#e4e4e7] p-[24px]">
          <h3 className="text-[12px] text-[#a1a1aa] mb-[16px] uppercase tracking-[1px]" style={{ fontWeight: 600 }}>
            Avatars &amp; Status
          </h3>
          <div className="flex items-center -space-x-[8px] mb-[16px]">
            {palettes.slice(0, 5).map((p, i) => {
              const initials = p.collectionName.slice(0, 2).toUpperCase();
              return (
                <div
                  key={i}
                  className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 border-white text-[12px] shadow-sm"
                  style={{
                    backgroundColor: p.baseValue,
                    color: getBestTextColor(p.baseValue),
                    fontWeight: 700,
                    zIndex: 5 - i,
                  }}
                >
                  {initials}
                </div>
              );
            })}
            {palettes.length > 5 && (
              <div
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 border-white text-[11px] bg-[#f4f4f5] text-[#71717a] shadow-sm"
                style={{ fontWeight: 600 }}
              >
                +{palettes.length - 5}
              </div>
            )}
          </div>
          {/* Status indicators */}
          <div className="flex flex-wrap gap-[12px]">
            {[
              { label: "Online", color: c.successBg },
              { label: "Away", color: c.warningBg },
              { label: "Busy", color: c.dangerBg },
              { label: "Offline", color: c.surfaceBorder },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-[6px]">
                <div className="w-[10px] h-[10px] rounded-full border border-white shadow-sm" style={{ backgroundColor: s.color }} />
                <span className="text-[11px]" style={{ color: c.surfaceText + "99" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token stats footer */}
      <div className="text-center py-[8px]">
        <p className="text-[12px] text-[#a1a1aa]">
          {state.generatedTokens.length} color tokens &middot;{" "}
          {palettes.length} palettes &middot;{" "}
          {state.groups.length} semantic groups
        </p>
      </div>
    </div>
  );
}
