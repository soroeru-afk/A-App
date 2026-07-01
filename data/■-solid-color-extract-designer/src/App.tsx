import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Copy,
  Check,
  Eye,
  Hash,
  SlidersHorizontal,
  Settings2,
  Code2,
  Paintbrush2,
  Type,
  Palette,
  Bookmark,
  BookmarkPlus,
  Pipette,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  hsvToRgb,
  rgbToHsv,
  rgbToHex,
  hexToRgb,
  rgbToCmyk,
  cmykToRgb,
  getContrastRatio,
  hexToArgb,
  getLuminance,
  parseColorString,
} from "./lib/colorUtils";

// --- Custom Components ---

function NumericInput({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    // Only update if not active to avoid cursor jumps
    if (document.activeElement !== inputRef.current) {
      setLocalValue(value.toString());
    }
  }, [value]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    // Attempt real-time update if it looks like a valid number
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    let parsed = parseInt(localValue, 10);
    if (isNaN(parsed)) parsed = 0;
    parsed = Math.max(0, Math.min(max, parsed));
    setLocalValue(parsed.toString());
    onChange(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBlur();
  };

  return (
    <div className="flex border border-app-border bg-app-input focus-within:border-app-accent group transition-all flex-1 h-[28px] overflow-hidden">
      <div className="bg-app-panel px-1.5 flex items-center justify-center border-r border-app-border text-app-text-secondary text-[8px] font-mono tracking-tighter w-6 group-focus-within:text-app-accent">
        {label}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="w-full bg-transparent text-app-text-primary text-xs font-mono px-2 outline-none text-right placeholder-app-text-muted"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

const WHEEL_SIZE = 160;
const RING_THICKNESS = 14;
const INNER_R = WHEEL_SIZE / 2 - RING_THICKNESS;
const SQUARE_SIZE = Math.floor(INNER_R * Math.sqrt(2)) - 4;

function ColorWheel({
  h,
  s,
  v,
  onChangeH,
  onChangeSV,
}: {
  h: number;
  s: number;
  v: number;
  onChangeH: (h: number) => void;
  onChangeSV: (s: number, v: number) => void;
}) {
  const handleRing = (
    clientX: number,
    clientY: number,
    el: HTMLDivElement | null,
  ) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let angle =
      (Math.atan2(
        clientY - (rect.top + rect.height / 2),
        clientX - (rect.left + rect.width / 2),
      ) *
        180) /
        Math.PI +
      90;
    if (angle < 0) angle += 360;
    onChangeH(angle % 360);
  };

  const handleSquare = (
    clientX: number,
    clientY: number,
    el: HTMLDivElement | null,
  ) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    let y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    onChangeSV((x / rect.width) * 100, 100 - (y / rect.height) * 100);
  };

  const rRad = ((h - 90) * Math.PI) / 180,
    rR = WHEEL_SIZE / 2 - RING_THICKNESS / 2;

  return (
    <div
      className="relative flex items-center justify-center mx-auto"
      style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
    >
      <div
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleRing(e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerMove={(e) =>
          e.buttons > 0 && handleRing(e.clientX, e.clientY, e.currentTarget)
        }
        className="absolute inset-0 rounded-full cursor-crosshair touch-none"
        style={{
          background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`,
          WebkitMask: `radial-gradient(transparent ${INNER_R - 0.5}px, #000 ${INNER_R}px)`,
        }}
      />
      <div
        className="absolute w-4 h-4 rounded-full border-[2px] border-white pointer-events-none z-10 box-content"
        style={{
          left: WHEEL_SIZE / 2 + rR * Math.cos(rRad) - 8,
          top: WHEEL_SIZE / 2 + rR * Math.sin(rRad) - 8,
          outline: "1px solid rgba(0,0,0,0.5)",
          outlineOffset: "-3px",
        }}
      />

      <div
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleSquare(e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerMove={(e) =>
          e.buttons > 0 && handleSquare(e.clientX, e.clientY, e.currentTarget)
        }
        className="absolute cursor-crosshair touch-none overflow-hidden border border-app-border"
        style={{
          width: SQUARE_SIZE,
          height: SQUARE_SIZE,
          backgroundColor: `hsl(${h}, 100%, 50%)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, #fff, transparent)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #000, transparent)" }}
        />
        <div
          className="absolute w-3 h-3 rounded-full border-[1.5px] border-white pointer-events-none z-10 box-content drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          style={{
            left: (s / 100) * SQUARE_SIZE - 6,
            top: (1 - v / 100) * SQUARE_SIZE - 6,
          }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-app-panel border border-app-border flex flex-col ${className}`}
    >
      <div className="bg-app-header border-b border-app-border px-3 py-1.5 flex items-center gap-2 text-[10px] font-mono tracking-widest text-app-text-secondary">
        <Icon size={12} className="text-app-accent opacity-80" /> {title}
      </div>
      <div className="p-3 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

function CodeOutput({
  label,
  value,
  onParsed,
}: {
  label: string;
  value: string;
  onParsed?: (parsed: { r: number; g: number; b: number; a?: number }) => void;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [copied, setCopied] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setLocalValue(value);
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (onParsed) {
      const parsed = parseColorString(val);
      if (parsed) onParsed(parsed);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className={`flex border transition-all mt-0.5 group ${isFocused ? "border-app-accent bg-app-panel" : "border-app-border bg-app-input"}`}
    >
      <div
        className={`bg-app-panel px-2.5 py-1.5 flex items-center justify-center border-r transition-colors text-[9px] font-mono tracking-widest min-w-[70px] whitespace-nowrap ${isFocused ? "border-app-accent text-app-accent" : "border-app-border text-app-text-secondary"}`}
      >
        {label}
      </div>
      <div className="relative flex-1 flex items-center">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-app-accent text-xs font-mono px-2.5 outline-none selection:bg-app-accent/20"
        />
        {isFocused && (
          <div className="absolute right-2 text-[8px] font-mono text-app-accent/50 pointer-events-none uppercase">
            Editing
          </div>
        )}
      </div>
      <button
        onClick={handleCopy}
        className="px-2.5 border-l border-app-border bg-app-panel hover:bg-app-border transition-colors flex items-center justify-center text-app-text-secondary group-hover:text-app-text-primary"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check size={13} className="text-app-accent" />
        ) : (
          <Copy size={13} />
        )}
      </button>
    </div>
  );
}

export default function App() {
  // Theme State
  const [theme, setTheme] = useState("navy");

  // Primary State
  const [hsv, setHsv] = useState({ h: 190, s: 90, v: 95 });
  const [alpha, setAlpha] = useState(1);
  const [hexInput, setHexInput] = useState("");

  // Custom text preview state
  const [previewTitle, setPreviewTitle] = useState("TYPOGRAPHY SPECIMEN");
  const [previewText, setPreviewText] = useState(
    "Visualizes paragraph readability on the selected color. You can edit this text to test contrast against the selected background color.",
  );
  const [previewTextHex, setPreviewTextHex] = useState("#FFFFFF");
  const [previewFontSize, setPreviewFontSize] = useState(12);
  const [previewFontWeight, setPreviewFontWeight] = useState("400");
  const [previewFontFamily, setPreviewFontFamily] = useState("font-sans");

  // Stock colors state
  const [stockColors, setStockColors] = useState<string[]>(Array(10).fill(""));
  const [isEyeDropperActive, setIsEyeDropperActive] = useState(false);
  const [pickedFlashColor, setPickedFlashColor] = useState<string | null>(null);
  
  // Compact Mode State
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [compactCopied, setCompactCopied] = useState(false);

  const handleStockColor = () => {
    if (!stockColors.includes(hex)) {
      setStockColors((prev) =>
        [hex, ...prev.filter((c) => c !== "")]
          .slice(0, 10)
          .concat(Array(10).fill(""))
          .slice(0, 10),
      );
    }
  };

  const handleApplyStock = (colorHex: string) => {
    if (!colorHex) return;
    let val = colorHex.toUpperCase();
    if (!val.startsWith("#")) val = "#" + val;
    setHexInput(val);
    const parsedRgb = hexToRgb(val);
    if (parsedRgb) {
      const [h, s, v] = rgbToHsv(parsedRgb[0], parsedRgb[1], parsedRgb[2]);
      setHsv((prev) => ({ h: s === 0 ? prev.h : h, s, v }));
      setAlpha(1); // Reset to solid when selecting a stock hex color
    }
  };

  const handleRemoveStock = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setStockColors((prev) => {
      const newStock = [...prev];
      newStock[index] = "";
      const filtered = newStock.filter((c) => c !== "");
      return filtered.concat(Array(10).fill("")).slice(0, 10);
    });
  };

  // Derived
  const [r, g, b] = useMemo(() => hsvToRgb(hsv.h, hsv.s, hsv.v), [hsv]);
  const [c, m, y, k] = useMemo(() => rgbToCmyk(r, g, b), [r, g, b]);
  const hex = useMemo(() => rgbToHex(r, g, b), [r, g, b]);
  const rgbaCss = `rgba(${r}, ${g}, ${b}, ${alpha})`;

  // Tints & Shades calculations
  const mixCalc = (c: number, target: number, weight: number) =>
    Math.round(c * weight + target * (1 - weight));
  const tints = useMemo(
    () =>
      [0.85, 0.7, 0.55, 0.4, 0.25]
        .map((w) => [
          mixCalc(r, 255, w),
          mixCalc(g, 255, w),
          mixCalc(b, 255, w),
        ])
        .reverse(),
    [r, g, b],
  );
  const shades = useMemo(
    () =>
      [0.85, 0.7, 0.55, 0.4, 0.25].map((w) => [
        mixCalc(r, 0, w),
        mixCalc(g, 0, w),
        mixCalc(b, 0, w),
      ]),
    [r, g, b],
  );

  const handleColorClick = (rgb: number[]) => {
    const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
    setHsv((prev) => ({ h: s === 0 ? prev.h : h, s, v }));
  };

  // Derived specific outputs
  const swiftUI = `Color(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, opacity: ${alpha})`;
  const uiColor = `UIColor(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, alpha: ${alpha})`;
  const androidXml = hexToArgb(hex, alpha);
  const androidCompose = `Color(0x${androidXml.replace("#", "")})`;
  const floatRgb = `vec4(${(r / 255).toFixed(2)}, ${(g / 255).toFixed(2)}, ${(b / 255).toFixed(2)}, ${alpha})`;

  const hexInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== hexInputRef.current) {
      setHexInput(hex);
    }
  }, [hex]);

  // Auto switch text preview color based on luminance when the text color hasn't been manually set differently?
  // It's better to update it automatically so the user immediately sees a visible text.
  useEffect(() => {
    setPreviewTextHex(getLuminance(r, g, b) > 0.5 ? "#000000" : "#FFFFFF");
  }, [hex]);

  // Apply Theme to body
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleParsedColor = (parsed: {
    r: number;
    g: number;
    b: number;
    a?: number;
  }) => {
    setHsv((prev) => {
      const [h, s, v] = rgbToHsv(parsed.r, parsed.g, parsed.b);
      return { h: s === 0 ? prev.h : h, s, v };
    });
    // Default to solid if alpha isn't provided in the ingest string
    setAlpha(parsed.a !== undefined ? parsed.a : 1);
  };

  const handleEyeDropper = async () => {
    if (!("EyeDropper" in window)) {
      alert("Your browser does not support the EyeDropper API. Please try a Chromium-based browser (Chrome, Edge).");
      return;
    }
    setIsEyeDropperActive(true);
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const parsed = parseColorString(result.sRGBHex);
      if (parsed) {
        handleParsedColor(parsed);
        setPickedFlashColor(result.sRGBHex);
        setTimeout(() => setPickedFlashColor(null), 300);
      }
    } catch (e) {
      console.log("EyeDropper canceled or failed");
    } finally {
      setIsEyeDropperActive(false);
    }
  };

  // Sync Input Handlers
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (val && !val.startsWith("#")) val = "#" + val;
    setHexInput(val);

    // Only update core state if we have a valid 3 or 6 digit hex
    const cleanHex = val.replace("#", "");
    if (cleanHex.length === 3 || cleanHex.length === 6) {
      const parsedRgb = hexToRgb(val);
      if (parsedRgb) {
        const [h, s, v] = rgbToHsv(parsedRgb[0], parsedRgb[1], parsedRgb[2]);
        setHsv((prev) => ({ h: s === 0 ? prev.h : h, s, v }));
        if (alpha < 1) setAlpha(1);
      }
    }
  };

  const updateRgb = (channel: "r" | "g" | "b", value: number) => {
    const newRgb = { r, g, b, [channel]: value };
    const [h, s, v] = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHsv((prev) => ({ h: s === 0 ? prev.h : h, s, v }));
  };

  const updateCmyk = (channel: "c" | "m" | "y" | "k", value: number) => {
    const newCmyk = { c, m, y, k, [channel]: value };
    const [nR, nG, nB] = cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
    const [h, s, v] = rgbToHsv(nR, nG, nB);
    setHsv((prev) => ({ h: s === 0 ? prev.h : h, s, v }));
  };

  const contrastWhite = getContrastRatio(r, g, b, 255, 255, 255).toFixed(2);
  const contrastBlack = getContrastRatio(r, g, b, 15, 17, 21).toFixed(2); // Approximated dark bg

  const handleCompactCopy = () => {
    navigator.clipboard.writeText(hex);
    setCompactCopied(true);
    setTimeout(() => setCompactCopied(false), 2000);
  };

  if (isCompactMode) {
    return (
      <div 
        className="min-h-screen bg-app-bg text-app-text-primary font-sans p-4 flex items-center justify-center transition-colors duration-300"
      >
        <div className="w-full max-w-[280px] bg-app-panel border border-app-border shadow-2xl flex flex-col items-center overflow-hidden">
          {/* Header */}
          <div className="w-full flex justify-between items-center py-2 px-3 border-b border-app-border bg-app-header">
            <div className="flex items-center gap-1.5 text-app-accent opacity-80 text-[10px] font-mono tracking-widest uppercase">
              <Pipette size={12} />
              <span>EYE DROPPER</span>
            </div>
            <button 
              onClick={() => setIsCompactMode(false)} 
              className="text-app-text-muted hover:text-white transition-colors" 
              title="Return to Full Mode"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          <div className="w-full p-4 flex flex-col gap-4">
            <button
              onClick={handleEyeDropper}
              className={`group w-full flex flex-col items-center justify-center py-8 border border-dashed transition-all duration-700 ${
                isEyeDropperActive 
                  ? "bg-app-input border-app-accent animate-pulse" 
                  : "bg-app-bg/30 border-app-text-muted/70 hover:border-app-accent/80 hover:bg-app-input"
              }`}
              style={pickedFlashColor ? { backgroundColor: pickedFlashColor, borderColor: pickedFlashColor, transitionDuration: '50ms' } : {}}
              title="Pick color from screen"
            >
              <div className={`flex items-center gap-2 font-bold font-mono text-[14px] uppercase tracking-widest transition-colors ${
                isEyeDropperActive ? "text-app-accent" : "text-app-text-primary group-hover:text-app-accent"
              }`}>
                <Pipette size={20} />
                <span>{isEyeDropperActive ? "SEARCHING..." : "PICK SCREEN"}</span>
              </div>
              <div className={`text-[9px] font-mono tracking-[0.2em] uppercase mt-2 transition-colors ${
                isEyeDropperActive ? "text-app-accent/70" : "text-app-text-muted/70"
              }`}>
                {isEyeDropperActive ? "SELECT COLOR ON SCREEN" : "CLICK TO PICK COLOR"}
              </div>
            </button>

            <div className="flex items-center justify-between gap-3 bg-app-input border border-app-border p-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-sm shadow-inner border border-black/20" 
                  style={{ backgroundColor: hex }}
                />
                <div className="flex flex-col">
                  <span className="text-[9px] text-app-text-muted font-mono mb-0.5 tracking-widest uppercase">HEX</span>
                  <span className="font-mono text-sm tracking-widest text-app-text-primary">{hex}</span>
                </div>
              </div>
              <button 
                onClick={handleCompactCopy} 
                className="w-8 h-8 flex items-center justify-center border border-app-border bg-app-bg/50 hover:border-app-accent hover:text-white transition-all text-app-text-muted shrink-0"
                title="Copy HEX"
              >
                {compactCopied ? <Check size={14} className="text-app-accent" /> : <Copy size={14} />}
              </button>
            </div>
            
            <div className="flex justify-between items-center gap-2 border border-app-border bg-app-bg/30 px-2 py-1.5 focus-within:border-app-accent">
              <span className="text-[9px] text-app-text-muted font-mono tracking-widest uppercase shrink-0">RGB</span>
              <input
                 type="text"
                 readOnly
                 value={`rgb(${r}, ${g}, ${b})`}
                 className="bg-transparent font-mono text-[10px] text-app-text-primary text-right outline-none w-full"
                 onFocus={(e) => { e.target.select(); document.execCommand('copy'); }}
                 title="Click to copy"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text-primary font-sans p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden selection:bg-app-border-focus transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-3">
        {/* Header - Software like */}
        <header className="flex flex-wrap gap-3 items-end justify-between border-b border-app-border pb-2 px-1 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-app-border bg-app-panel flex items-center justify-center p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <div
                className="w-full h-full"
                style={{ backgroundColor: hex }}
              ></div>
            </div>
            <div>
              <h1 className="text-[13px] font-bold tracking-[0.3em] text-app-text-primary leading-none uppercase">
                SOLID COLOR EXTRACT DESIGNER
              </h1>
              <div className="text-app-text-secondary text-[8px] mt-1.5 font-mono tracking-[0.2em] flex items-center gap-1.5 uppercase">
                <span
                  className="w-1 h-1 bg-app-accent rounded-full"
                  style={{ boxShadow: `0 0 8px var(--theme-accent)` }}
                ></span>
                COLOR ENGINE ONLINE
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-app-panel border border-app-border px-2 py-1 text-app-text-muted font-mono text-[10px] tracking-widest shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] outline-none uppercase cursor-pointer hover:border-app-border-focus focus:border-app-accent transition-colors"
            >
              <option value="navy">NAVY THEME</option>
              <option value="midnight">MIDNIGHT</option>
              <option value="light">LIGHT MODE</option>
            </select>
            <div className="bg-app-panel border border-app-border px-3 py-1.5 text-app-text-muted font-mono text-[10px] tracking-widest shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
              ENV: PRODUCTION
            </div>
            <div className="bg-app-panel border border-app-border px-3 py-1.5 text-app-text-primary font-mono text-[10px] tracking-widest shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border-l-[1.5px] border-l-app-accent">
              SYS. V4
            </div>
            <button
              onClick={() => setIsCompactMode(true)}
              className="bg-app-panel border border-app-border text-app-text-muted hover:text-white px-2.5 flex items-center justify-center focus:border-app-accent transition-colors"
              title="Compact Mode"
            >
              <Minimize2 size={14} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-stretch">
          {/* Left Col: Primary Controls */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-3">
            <Section title="01. COLOR MATRIX" icon={Paintbrush2}>
              <div className="mb-4 mt-1">
                <ColorWheel
                  h={hsv.h}
                  s={hsv.s}
                  v={hsv.v}
                  onChangeH={(newH) => {
                    setHsv((p) => ({ ...p, h: newH }));
                    if (alpha < 1) setAlpha(1);
                  }}
                  onChangeSV={(newS, newV) => {
                    setHsv((p) => ({ ...p, s: newS, v: newV }));
                    if (alpha < 1) setAlpha(1);
                  }}
                />
              </div>

              {/* PICK SCREEN FEATURE */}
              <div className="mb-5 mt-2 px-1">
                <button
                  onClick={handleEyeDropper}
                  className={`group w-full flex flex-col items-center justify-center py-4 border border-dashed transition-all duration-700 ${
                    isEyeDropperActive 
                      ? "bg-app-input border-app-accent animate-pulse" 
                      : "bg-app-bg/30 border-app-text-muted/70 hover:border-app-accent/80 hover:bg-app-panel"
                  }`}
                  style={pickedFlashColor ? { backgroundColor: pickedFlashColor, borderColor: pickedFlashColor, transitionDuration: '50ms' } : {}}
                  title="Pick color from screen"
                >
                  <div className={`flex items-center gap-2 font-bold font-mono text-[12px] uppercase tracking-widest transition-colors ${
                    isEyeDropperActive ? "text-app-accent" : "text-app-text-primary group-hover:text-app-accent"
                  }`}>
                    <Pipette size={14} />
                    <span>{isEyeDropperActive ? "SEARCHING..." : "PICK SCREEN"}</span>
                  </div>
                  <div className={`text-[9px] font-mono tracking-[0.2em] uppercase mt-1 transition-colors ${
                    isEyeDropperActive ? "text-app-accent/70" : "text-app-text-muted/70"
                  }`}>
                    {isEyeDropperActive ? "SELECT COLOR ON SCREEN" : "NATIVE API / EYE DROPPER"}
                  </div>
                </button>
              </div>

              {/* HSV Inputs */}
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-mono text-app-text-muted tracking-widest mb-1">
                  HSV MASTER CONTROL
                </div>
                <div className="flex gap-2 items-center">
                  <NumericInput
                    label="H"
                    value={Math.round(hsv.h)}
                    onChange={(v) => setHsv((p) => ({ ...p, h: v }))}
                    max={360}
                  />
                  <span className="text-app-text-muted text-[10px]">°</span>
                </div>
                <div className="flex gap-2 items-center">
                  <NumericInput
                    label="S"
                    value={Math.round(hsv.s)}
                    onChange={(v) => setHsv((p) => ({ ...p, s: v }))}
                    max={100}
                  />
                  <span className="text-app-text-muted text-[10px]">%</span>
                </div>
                <div className="flex gap-2 items-center">
                  <NumericInput
                    label="V"
                    value={Math.round(hsv.v)}
                    onChange={(v) => setHsv((p) => ({ ...p, v: v }))}
                    max={100}
                  />
                  <span className="text-app-text-muted text-[10px]">%</span>
                </div>
              </div>
            </Section>

            <Section title="02. ALPHA & HEX" icon={Settings2}>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono text-app-text-muted tracking-widest flex justify-between mb-2">
                    <span>OPACITY / ALPHA</span>
                    <div className="flex items-center gap-2">
                       {alpha < 1 && (
                         <button 
                           onClick={() => setAlpha(1)}
                           className="text-[8px] bg-app-accent/20 text-app-accent px-1 py-0.5 rounded border border-app-accent/30 hover:bg-app-accent hover:text-white transition-all uppercase"
                         >
                           Set Solid
                         </button>
                       )}
                       <span className="text-app-accent">
                         {(alpha * 100).toFixed(0)}%
                       </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={alpha}
                    onChange={(e) => setAlpha(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
                <div className="pt-2 border-t border-app-border">
                  <div className="text-[10px] font-mono text-app-text-muted tracking-widest mb-2">
                    HEX BASE
                  </div>
                  <div className="flex border border-app-border bg-app-input focus-within:border-app-accent transition-colors">
                    <div className="bg-app-panel px-3 flex items-center justify-center border-r border-app-border text-app-text-secondary font-mono">
                      <Hash size={14} />
                    </div>
                    <input
                      ref={hexInputRef}
                      type="text"
                      value={hexInput}
                      onChange={handleHexInputChange}
                      className="w-full bg-transparent p-2 font-mono text-app-text-primary uppercase outline-none placeholder-app-text-muted"
                      maxLength={7}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="03. STOCK COLORS"
              icon={Bookmark}
              className="flex-1"
            >
              <div className="flex flex-col gap-2 h-full">
                <button
                  onClick={handleStockColor}
                  className="w-full bg-app-input border border-app-border hover:border-app-border-focus text-app-text-secondary hover:text-app-text-primary text-[10px] font-mono py-1 transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookmarkPlus size={12} /> SAVE CURRENT COLOR
                </button>
                <div className="grid grid-cols-5 gap-2 mt-auto pb-1">
                  {stockColors.map((sc, i) => (
                    <div
                      key={i}
                      onClick={() => sc && handleApplyStock(sc)}
                      onContextMenu={(e) => sc && handleRemoveStock(e, i)}
                      className={`w-full h-7 border ${sc ? "cursor-pointer border-black/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]" : "border-app-border border-dashed opacity-30"} transition-transform hover:scale-105`}
                      style={{ backgroundColor: sc || "transparent" }}
                      title={
                        sc ? `${sc} (Right click to remove)` : "Empty Slot"
                      }
                    />
                  ))}
                </div>
              </div>
            </Section>
          </div>

          {/* Middle Col: Converters */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-3">
            <Section title="04. RGB DOMAIN (WEB)" icon={SlidersHorizontal}>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <NumericInput
                    label="R"
                    value={r}
                    onChange={(v) => updateRgb("r", v)}
                    max={255}
                  />
                  <NumericInput
                    label="G"
                    value={g}
                    onChange={(v) => updateRgb("g", v)}
                    max={255}
                  />
                  <NumericInput
                    label="B"
                    value={b}
                    onChange={(v) => updateRgb("b", v)}
                    max={255}
                  />
                </div>
                {/* RGB Sliders for fine tuning */}
                <div className="space-y-3 mt-2 px-1">
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={r}
                    onChange={(e) => updateRgb("r", parseInt(e.target.value))}
                    className="w-full"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgb(0, ${g}, ${b}), rgb(255, ${g}, ${b}))`,
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={g}
                    onChange={(e) => updateRgb("g", parseInt(e.target.value))}
                    className="w-full"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgb(${r}, 0, ${b}), rgb(${r}, 255, ${b}))`,
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={b}
                    onChange={(e) => updateRgb("b", parseInt(e.target.value))}
                    className="w-full"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgb(${r}, ${g}, 0), rgb(${r}, ${g}, 255))`,
                    }}
                  />
                </div>
              </div>
            </Section>

            <Section title="05. CMYK DOMAIN (PRINT)" icon={SlidersHorizontal}>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <NumericInput
                    label="C"
                    value={c}
                    onChange={(v) => updateCmyk("c", v)}
                    max={100}
                  />
                  <NumericInput
                    label="M"
                    value={m}
                    onChange={(v) => updateCmyk("m", v)}
                    max={100}
                  />
                </div>
                <div className="flex gap-2">
                  <NumericInput
                    label="Y"
                    value={y}
                    onChange={(v) => updateCmyk("y", v)}
                    max={100}
                  />
                  <NumericInput
                    label="K"
                    value={k}
                    onChange={(v) => updateCmyk("k", v)}
                    max={100}
                  />
                </div>
              </div>
            </Section>

            <Section
              title="06. CONTRAST ANALYSIS"
              icon={Eye}
              className="flex-1"
            >
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Dark BG Test */}
                <div className="flex flex-col border border-app-border bg-[#0c0d10] py-2 px-1 text-center transition-colors">
                  <span className="text-[9px] font-mono text-[#5e6678] mb-1 uppercase">
                    ON DARK
                  </span>
                  <span
                    className="text-base font-bold font-mono"
                    style={{
                      color:
                        Number(contrastBlack) >= 4.5 ? "#4ade80" : "#f87171",
                    }}
                  >
                    {contrastBlack}
                  </span>
                  <span className="text-[8px] font-mono text-[#5e6678] mt-0.5">
                    WCAG AA: {Number(contrastBlack) >= 4.5 ? "PASS" : "FAIL"}
                  </span>
                </div>
                {/* Light BG Test */}
                <div className="flex flex-col border border-app-border bg-[#ffffff] py-2 px-1 text-center transition-colors">
                  <span className="text-[9px] font-mono text-[#a1a1aa] mb-1 uppercase">
                    ON WHITE
                  </span>
                  <span
                    className="text-base font-bold font-mono"
                    style={{
                      color:
                        Number(contrastWhite) >= 4.5 ? "#166534" : "#b91c1c",
                    }}
                  >
                    {contrastWhite}
                  </span>
                  <span className="text-[8px] font-mono text-[#a1a1aa] mt-0.5">
                    WCAG AA: {Number(contrastWhite) >= 4.5 ? "PASS" : "FAIL"}
                  </span>
                </div>
              </div>

              {/* Live Text Preview */}
              <div className="flex flex-col h-full gap-2 mt-auto">
                <div className="flex border border-app-border bg-app-input focus-within:border-app-accent group transition-all h-[26px]">
                  <div className="bg-app-panel px-2 flex items-center justify-center border-r border-app-border text-app-text-secondary text-[8px] font-mono tracking-tighter min-w-[70px] group-focus-within:text-app-accent">
                    TEXT COLOR
                  </div>
                  <div className="relative flex items-center px-2 border-r border-app-border h-full bg-app-panel/50">
                    <input 
                      type="color" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      value={previewTextHex.length === 7 && previewTextHex.startsWith('#') ? previewTextHex : '#000000'}
                      onChange={(e) => setPreviewTextHex(e.target.value.toUpperCase())}
                    />
                    <div 
                      className="w-3.5 h-3.5 rounded-sm border border-white/20 shadow-sm"
                      style={{ backgroundColor: previewTextHex }}
                    />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-transparent text-app-text-primary text-[10px] font-mono px-2 outline-none uppercase placeholder-app-text-muted"
                    value={previewTextHex}
                    onChange={(e) => setPreviewTextHex(e.target.value)}
                    placeholder="#000000"
                  />
                  <div className="flex border-l border-app-border h-full bg-app-panel shrink-0">
                    <button 
                      onClick={() => setPreviewTextHex("#000000")}
                      className="px-2 text-[10px] font-mono text-app-text-secondary hover:text-white border-r border-app-border hover:bg-black transition-colors"
                      title="Set Black"
                    >
                      B
                    </button>
                    <button 
                      onClick={() => setPreviewTextHex("#FFFFFF")}
                      className="px-2 text-[10px] font-mono text-app-text-secondary hover:text-black hover:bg-white transition-colors"
                      title="Set White"
                    >
                      W
                    </button>
                  </div>
                </div>
                <div className="bg-checkerboard border border-app-border flex-1 min-h-[80px] relative overflow-hidden transition-all group">
                  <div 
                    className="absolute inset-0 w-full h-full flex flex-col focus-within:ring-1 focus-within:ring-inset focus-within:ring-black/20"
                    style={{ backgroundColor: rgbaCss }}
                  >
                    <input
                      className={`w-full bg-transparent px-3 pt-3 pb-1 outline-none font-bold placeholder-black/20 uppercase ${previewFontFamily}`}
                      style={{
                        color: previewTextHex,
                        fontSize: `${Math.max(14, previewFontSize * 1.2)}px`,
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                      }}
                      value={previewTitle}
                      onChange={(e) => setPreviewTitle(e.target.value)}
                      spellCheck="false"
                    />
                    <textarea
                      className={`w-full flex-1 bg-transparent px-3 pb-3 resize-none outline-none leading-relaxed placeholder-black/20 ${previewFontFamily}`}
                      style={{
                        color: previewTextHex,
                        fontSize: `${previewFontSize}px`,
                        fontWeight: previewFontWeight,
                      }}
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setPreviewTextHex(
                        getLuminance(r, g, b) > 0.5 ? "#000000" : "#FFFFFF",
                      )
                    }
                    className="absolute top-1 right-1 bg-black/30 hover:bg-black/50 text-white rounded px-1.5 py-0.5 text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    AUTO COLOR
                  </button>
                </div>
                {/* Font Controls */}
                <div className="mt-1 space-y-2">
                  <div>
                    <div className="text-[9px] font-mono text-app-text-muted tracking-widest flex justify-between mb-1 uppercase">
                      <span>FONT SIZE</span>
                      <span className="text-app-accent">{previewFontSize}PX</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={72}
                      step={1}
                      value={previewFontSize}
                      onChange={(e) => setPreviewFontSize(parseInt(e.target.value))}
                      className="w-full cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] font-mono text-app-text-muted tracking-widest mb-1.5 uppercase">
                        WEIGHT
                      </div>
                      <div className="flex border border-app-border bg-app-input overflow-hidden h-6">
                        {[400, 700].map((w) => (
                          <button
                            key={w}
                            onClick={() => setPreviewFontWeight(w.toString())}
                            className={`flex-1 text-[8px] font-mono transition-all border-b-2 ${
                              previewFontWeight === w.toString()
                                ? "border-app-accent text-app-accent font-bold"
                                : "border-transparent text-app-text-secondary hover:bg-app-panel"
                            }`}
                          >
                            {w === 400 ? "REG" : "BOLD"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-app-text-muted tracking-widest mb-1.5 uppercase">
                        FAMILY
                      </div>
                      <select
                        value={previewFontFamily}
                        onChange={(e) => setPreviewFontFamily(e.target.value)}
                        className="w-full bg-app-input border border-app-border text-app-text-secondary font-mono text-[8px] h-6 px-1 outline-none focus:border-app-accent cursor-pointer"
                      >
                        <option value="font-sans">SANS</option>
                        <option value="font-mono">MONO</option>
                        <option value="font-serif">SERIF</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Right Col: Output & Export */}
          <div className="col-span-2 lg:col-span-5 flex flex-col gap-3">
            <Section
              title="07. COLOR VARIATIONS"
              icon={Palette}
              className="shrink-0"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <div className="text-[9px] font-mono text-app-text-muted tracking-widest mb-1 uppercase flex justify-between">
                    <span>TINTS (LIGHTER)</span>
                    <span>SHADES (DARKER)</span>
                  </div>
                  <div className="flex h-6 w-full overflow-hidden border border-app-border shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] cursor-pointer">
                    {tints.map((tc, i) => (
                      <div
                        key={`tint-${i}`}
                        className="flex-1 hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `rgb(${tc[0]},${tc[1]},${tc[2]})`,
                        }}
                        onClick={() => handleColorClick(tc)}
                      ></div>
                    ))}
                    <div
                      className="flex-1 border-x border-app-border-focus/50 relative"
                      style={{ backgroundColor: `rgb(${r},${g},${b})` }}
                    >
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/20" />
                      <div className="absolute -bottom-0.5 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 drop-shadow-md"></div>
                    </div>
                    {shades.map((sc, i) => (
                      <div
                        key={`shade-${i}`}
                        className="flex-1 hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `rgb(${sc[0]},${sc[1]},${sc[2]})`,
                        }}
                        onClick={() => handleColorClick(sc)}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <div>
                    <div className="text-[8px] font-mono text-app-text-muted tracking-widest mb-1 uppercase">
                      ANALOGOUS
                    </div>
                    <div className="flex h-3 w-full overflow-hidden border border-app-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] cursor-pointer">
                      <div
                        className="flex-1 hover:opacity-80"
                        style={{
                          backgroundColor: `hsl(${(hsv.h + 330) % 360}, ${hsv.s}%, ${hsv.v}%)`,
                        }}
                        onClick={() =>
                          setHsv((p) => ({ ...p, h: (hsv.h + 330) % 360 }))
                        }
                      ></div>
                      <div
                        className="flex-1 border-x border-black/20 relative"
                        style={{
                          backgroundColor: `hsl(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
                        }}
                      >
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/20" />
                      </div>
                      <div
                        className="flex-1 hover:opacity-80"
                        style={{
                          backgroundColor: `hsl(${(hsv.h + 30) % 360}, ${hsv.s}%, ${hsv.v}%)`,
                        }}
                        onClick={() =>
                          setHsv((p) => ({ ...p, h: (hsv.h + 30) % 360 }))
                        }
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-mono text-app-text-muted tracking-widest mb-1 uppercase">
                      COMPLEMENTARY
                    </div>
                    <div className="flex h-3 w-full overflow-hidden border border-app-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] cursor-pointer">
                      <div
                        className="flex-1 border-r border-black/20 relative"
                        style={{
                          backgroundColor: `hsl(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
                        }}
                      >
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/20" />
                      </div>
                      <div
                        className="flex-1 hover:opacity-80"
                        style={{
                          backgroundColor: `hsl(${(hsv.h + 180) % 360}, ${hsv.s}%, ${hsv.v}%)`,
                        }}
                        onClick={() =>
                          setHsv((p) => ({ ...p, h: (hsv.h + 180) % 360 }))
                        }
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="08. INGEST & TERMINAL"
              icon={Code2}
              className="flex-1"
            >
              <div className="flex flex-col gap-1 pr-1 overflow-y-auto max-h-[800px]">
                <div className="bg-app-bg/50 border border-app-border mb-3 p-2 group focus-within:border-app-accent transition-colors">
                  <div className="text-[9px] font-mono text-app-accent mb-1 flex justify-between items-center">
                    <span>FAST COLOR INGEST (PASTE HERE)</span>
                  </div>
                  <textarea
                    className="w-full bg-transparent border-none outline-none font-mono text-[11px] text-app-text-primary resize-none placeholder-app-text-muted/50 h-12"
                    placeholder="Paste any color string... (e.g. rgba, hex, android xml, swiftui color)"
                    onChange={(e) => {
                      const parsed = parseColorString(e.target.value);
                      if (parsed) handleParsedColor(parsed);
                    }}
                  />
                </div>

                <div className="text-[10px] font-mono text-app-text-muted tracking-widest mt-1 mb-1">
                  WEB STANDARDS
                </div>
                <CodeOutput
                  label="CSS RGBA"
                  value={rgbaCss}
                  onParsed={handleParsedColor}
                />
                <CodeOutput
                  label="HEX (RAW)"
                  value={hex}
                  onParsed={handleParsedColor}
                />
                <CodeOutput
                  label="HEX (ALPHA)"
                  value={hexToArgb(hex, alpha).replace("#", "")}
                  onParsed={handleParsedColor}
                />
                <CodeOutput
                  label="CSS VAR"
                  value={`--color-primary: ${alpha < 1 ? rgbaCss : hex};`}
                  onParsed={handleParsedColor}
                />

                <div className="text-[10px] font-mono text-app-text-muted tracking-widest mt-4 mb-1">
                  APPLE PLATFORMS
                </div>
                <CodeOutput
                  label="SWIFTUI"
                  value={swiftUI}
                  onParsed={handleParsedColor}
                />
                <CodeOutput
                  label="UICOLOR"
                  value={uiColor}
                  onParsed={handleParsedColor}
                />

                <div className="text-[10px] font-mono text-app-text-muted tracking-widest mt-4 mb-1">
                  ANDROID PLATFORMS
                </div>
                <CodeOutput
                  label="XML HEX"
                  value={androidXml}
                  onParsed={handleParsedColor}
                />
                <CodeOutput
                  label="COMPOSE"
                  value={androidCompose}
                  onParsed={handleParsedColor}
                />

                <div className="text-[10px] font-mono text-app-text-muted tracking-widest mt-4 mb-1">
                  GRAPHICS / SHADER
                </div>
                <CodeOutput
                  label="GLSL VEC4"
                  value={floatRgb}
                  onParsed={handleParsedColor}
                />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
