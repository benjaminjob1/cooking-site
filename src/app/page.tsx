"use client";
import { useState, useEffect } from "react";
import { Flame, Clock, Thermometer, Minus, Plus, Settings, X, Eye, EyeOff } from "lucide-react";

interface Settings {
  accent: string;
  glow: string;
  brightness: number;
}

export default function CookingCalculator() {
  const [ovenTemp, setOvenTemp] = useState(180);
  const [ovenTime, setOvenTime] = useState(30);
  const [ovenType, setOvenType] = useState<"conventional" | "fan">("fan");
  const [showSettings, setShowSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [settings, setSettings] = useState<Settings>({ accent: "#f97316", glow: "#ea580c", brightness: 1 });

  useEffect(() => { const s = localStorage.getItem("cook-settings"); if (s) try { setSettings(JSON.parse(s)); } catch {} }, []);
  const saveSettings = (k: keyof Settings, v: string | number) => { const n = {...settings, [k]: v}; setSettings(n); localStorage.setItem("cook-settings", JSON.stringify(n)); };

  // Airfryer conversion rules:
  // - Reduce temp by 20°C for fan oven, 30°C for conventional
  // - Reduce time by ~20%
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

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: "#0a0a0a", filter: `brightness(${settings.brightness})` }}>
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
        <button onClick={() => setShowNav(!showNav)} className="p-2 rounded-xl hover:bg-white/10">{showNav ? <EyeOff size={22} /> : <Eye size={22} />}</button>
        <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl hover:bg-white/10"><Settings size={22} /></button>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
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
              <h2 className="text-lg font-semibold" style={{ color: settings.accent }}>Oven Temperature</h2>
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
              <h2 className="text-lg font-semibold" style={{ color: settings.accent }}>Oven Time</h2>
            </div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold" style={{ color: settings.accent }}>{ovenTime}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>minutes</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => adjustTime(-5)} className="flex-1 py-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}><Minus size={20} /></button>
              <button onClick={() => adjustTime(5)} className="flex-1 py-3 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}><Plus size={20} /></button>
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
        <nav className="fixed left-2 right-2 z-20 flex items-center rounded-xl border portrait:bottom-24 landscape:bottom-6" style={{ backgroundColor: "rgba(8,8,8,0.98)", borderColor: "rgba(255,255,255,0.05)" }}>
          <button className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl" style={{ color: settings.accent }}>
            <Flame size={20} />
            <span className="text-[10px] font-medium">Airfryer</span>
          </button>
        </nav>
      )}
    </div>
  );
}
