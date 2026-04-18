"use client";
import { useState, useEffect, useRef } from "react";
import { Flame, Clock, Thermometer, Minus, Plus, Settings, X, Eye, EyeOff, Camera } from "lucide-react";

interface Settings {
  accent: string;
  glow: string;
  brightness: number;
}

interface ScanResult {
  ovenType: "fan" | "conventional" | null;
  temperature: number | null;
  time: number | null;
  confidence: number;
}

export default function CookingCalculator() {
  const [ovenTemp, setOvenTemp] = useState(180);
  const [ovenTime, setOvenTime] = useState(30);
  const [ovenType, setOvenType] = useState<"conventional" | "fan">("fan");
  const [showSettings, setShowSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [settings, setSettings] = useState<Settings>({ accent: "#f97316", glow: "#ea580c", brightness: 1 });
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const s = localStorage.getItem("cook-settings"); if (s) try { setSettings(JSON.parse(s)); } catch {} }, []);
  const saveSettings = (k: keyof Settings, v: string | number) => { const n = {...settings, [k]: v}; setSettings(n); localStorage.setItem("cook-settings", JSON.stringify(n)); };

  const getAirfryerTemp = () => {
    if (ovenType === "fan") return Math.max(ovenTemp - 20, 50);
    return Math.max(ovenTemp - 30, 50);
  };

  const getAirfryerTime = () => {
    return Math.round(ovenTime * 0.8);
  };

  const adjustTemp = (delta: number) => setOvenTemp(t => Math.max(50, Math.min(250, t + delta)));
  const adjustTime = (delta: number) => setOvenTime(t => Math.max(1, Math.min(240, t + delta)));

  const tempOptions = [140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250];
  const timeOptions = [5, 10, 15, 20, 25, 30, 40, 45, 60, 90];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setShowScanner(false);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Scan failed");
      }

      const result = await response.json();
      setScanResult({
        ovenType: result.ovenType || null,
        temperature: result.temperature || null,
        time: result.time || null,
        confidence: result.confidence || 0.5,
      });
    } catch (error) {
      console.error("Scan error:", error);
      setScanResult({
        ovenType: null,
        temperature: null,
        time: null,
        confidence: 0,
      });
    } finally {
      setScanning(false);
    }
  };

  const applyScanResult = () => {
    if (!scanResult) return;
    if (scanResult.ovenType) setOvenType(scanResult.ovenType);
    if (scanResult.temperature) setOvenTemp(scanResult.temperature);
    if (scanResult.time) setOvenTime(scanResult.time);
    setScanResult(null);
  };

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: "#0a0a0a", filter: `brightness(${settings.brightness})` }}>
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div className="w-full max-w-md rounded-2xl p-5 border backdrop-blur-xl" style={{ backgroundColor: "rgba(10,10,10,0.98)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scan Recipe</h3>
              <button onClick={() => setShowScanner(false)} className="p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
            </div>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              Take a photo of a recipe to extract oven settings automatically
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2"
              style={{ borderColor: settings.accent }}
            >
              <Camera size={32} style={{ color: settings.accent }} />
              <span>Tap to take photo</span>
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
          <div className="w-72 rounded-2xl p-5 border backdrop-blur-xl" style={{ backgroundColor: "rgba(10,10,10,0.98)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Accent</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.accent} onChange={e => saveSettings("accent", e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border-0" />
                  <input type="text" value={settings.accent} onChange={e => saveSettings("accent", e.target.value)} className="flex-1 px-3 rounded-lg text-sm font-mono border" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Glow</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.glow} onChange={e => saveSettings("glow", e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border-0" />
                  <input type="text" value={settings.glow} onChange={e => saveSettings("glow", e.target.value)} className="flex-1 px-3 rounded-lg text-sm font-mono border" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Brightness</label>
                <input type="range" min="0.5" max="1.5" step="0.05" value={settings.brightness} onChange={e => saveSettings("brightness", parseFloat(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="relative z-10 p-4 flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold" style={{ color: settings.accent }}>Cooking</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowScanner(true)} className="p-2 rounded-xl hover:bg-white/10"><Camera size={22} /></button>
          <button onClick={() => setShowNav(!showNav)} className="p-2 rounded-xl hover:bg-white/10">{showNav ? <EyeOff size={22} /> : <Eye size={22} />}</button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl hover:bg-white/10"><Settings size={22} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Scan Result Preview */}
          {scanResult && scanResult.confidence > 0 && (
            <div className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(20,20,20,0.9)", borderColor: settings.accent, boxShadow: `0 0 20px ${settings.glow}22` }}>
              <h3 className="font-semibold mb-3" style={{ color: settings.accent }}>Scanned Settings</h3>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                {scanResult.ovenType && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${settings.accent}11` }}>
                    <Flame size={20} className="mx-auto mb-1" style={{ color: settings.accent }} />
                    <div className="text-sm">{scanResult.ovenType === "fan" ? "Fan" : "Conventional"}</div>
                  </div>
                )}
                {scanResult.temperature && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${settings.accent}11` }}>
                    <Thermometer size={20} className="mx-auto mb-1" style={{ color: settings.accent }} />
                    <div className="text-sm">{scanResult.temperature}°C</div>
                  </div>
                )}
                {scanResult.time && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${settings.accent}11` }}>
                    <Clock size={20} className="mx-auto mb-1" style={{ color: settings.accent }} />
                    <div className="text-sm">{scanResult.time} min</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={applyScanResult} className="flex-1 py-2 rounded-xl" style={{ backgroundColor: settings.accent }}>Apply</button>
                <button onClick={() => setScanResult(null)} className="py-2 px-4 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>Dismiss</button>
              </div>
              <div className="mt-2 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Confidence: {Math.round(scanResult.confidence * 100)}%
              </div>
            </div>
          )}

          {/* Scanning indicator */}
          {scanning && (
            <div className="rounded-2xl p-5 border text-center" style={{ backgroundColor: "rgba(20,20,20,0.9)", borderColor: settings.accent }}>
              <div className="animate-pulse mb-3">
                <Camera size={32} className="mx-auto" style={{ color: settings.accent }} />
              </div>
              <p>Scanning image...</p>
            </div>
          )}

          {/* Oven Type */}
          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(20,20,20,0.9)", borderColor: "rgba(255,255,255,0.08)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: settings.accent }}>Oven Type</h2>
            <div className="flex gap-2">
              <button onClick={() => setOvenType("fan")} className="flex-1 py-3 px-4 rounded-xl border transition-all" style={ovenType === "fan" ? { backgroundColor: `${settings.accent}22`, borderColor: settings.accent } : { borderColor: "rgba(255,255,255,0.1)" }}>
                <Flame className="mx-auto mb-1" size={24} />
                <div className="text-sm">Fan Oven</div>
              </button>
              <button onClick={() => setOvenType("conventional")} className="flex-1 py-3 px-4 rounded-xl border transition-all" style={ovenType === "conventional" ? { backgroundColor: `${settings.accent}22`, borderColor: settings.accent } : { borderColor: "rgba(255,255,255,0.1)" }}>
                <Flame className="mx-auto mb-1" size={24} />
                <div className="text-sm">Conventional</div>
              </button>
            </div>
          </div>

          {/* Temperature */}
          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(20,20,20,0.9)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Thermometer size={20} style={{ color: settings.accent }} />
              <h2 className="text-lg font-semibold" style={{ color: settings.accent }}>Temperature</h2>
            </div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold" style={{ color: settings.accent }}>{ovenTemp}°C</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{Math.round(ovenTemp * 9/5 + 32)}°F</div>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => adjustTemp(-10)} className="flex-1 py-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}><Minus size={20} /></button>
              <button onClick={() => adjustTemp(10)} className="flex-1 py-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}><Plus size={20} /></button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {tempOptions.map(t => (
                <button key={t} onClick={() => setOvenTemp(t)} className="py-2 rounded-lg text-sm font-mono border transition-all" style={ovenTemp === t ? { backgroundColor: settings.accent, borderColor: settings.accent } : { borderColor: "rgba(255,255,255,0.1)" }}>
                  {t}°C
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(20,20,20,0.9)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} style={{ color: settings.accent }} />
              <h2 className="text-lg font-semibold" style={{ color: settings.accent }}>Time</h2>
            </div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold" style={{ color: settings.accent }}>{ovenTime}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>minutes</div>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => adjustTime(-5)} className="flex-1 py-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}><Minus size={20} /></button>
              <button onClick={() => adjustTime(5)} className="flex-1 py-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}><Plus size={20} /></button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {timeOptions.map(t => (
                <button key={t} onClick={() => setOvenTime(t)} className="py-2 rounded-lg text-sm font-mono border transition-all" style={ovenTime === t ? { backgroundColor: settings.accent, borderColor: settings.accent } : { borderColor: "rgba(255,255,255,0.1)" }}>
                  {t}m
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: "rgba(20,20,20,0.9)", borderColor: settings.accent, boxShadow: `0 0 40px ${settings.glow}22` }}>
            <h2 className="text-lg font-semibold mb-4 text-center" style={{ color: settings.accent }}>Airfryer Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${settings.accent}11` }}>
                <Thermometer size={28} className="mx-auto mb-2" style={{ color: settings.accent }} />
                <div className="text-3xl font-bold" style={{ color: settings.accent }}>{getAirfryerTemp()}°C</div>
                <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{Math.round(getAirfryerTemp() * 9/5 + 32)}°F</div>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${settings.accent}11` }}>
                <Clock size={28} className="mx-auto mb-2" style={{ color: settings.accent }} />
                <div className="text-3xl font-bold" style={{ color: settings.accent }}>{getAirfryerTime()}</div>
                <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>minutes</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {ovenType === "fan" ? "20°C lower" : "30°C lower"} + 20% less time
            </div>
          </div>
        </div>
      </main>

      {showNav && (
        <nav className="fixed left-2 right-2 z-20 flex items-center rounded-xl border" style={{ backgroundColor: "rgba(8,8,8,0.98)", borderColor: "rgba(255,255,255,0.05)", bottom: "5rem" }}>
          <button className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl" style={{ color: settings.accent }}>
            <Flame size={20} />
            <span className="text-[10px] font-medium">Airfryer</span>
          </button>
        </nav>
      )}
    </div>
  );
}
