import { useState, useEffect } from "react";
import { fetchRoutes, seedRoutes } from "./firebase";

const GREEN = "#1a7a3c";
const LIGHT_GREEN = "#e8f5e9";
const DARK_GREEN = "#0d5c2c";
const YELLOW = "#f0c040";

const ROUTES = [
  { id: "R1", name: "Shahdara → Thokar Niaz Baig", stops: ["Shahdara Terminal","GT Road","Bhatti Chowk","Kalma Chowk","Liberty Market","Gulberg","Thokar Niaz Baig"], freq: 8, first: "5:30 AM", last: "11:00 PM", km: 32 },
  { id: "R4", name: "Kalma Chowk → Airport", stops: ["Kalma Chowk","Ferozepur Road","Johar Town","Thokar","Airport Terminal"], freq: 12, first: "4:00 AM", last: "12:00 AM", km: 18 },
  { id: "R7", name: "Data Darbar → Packages Mall", stops: ["Data Darbar","Mcleod Road","Shadman","Gulberg","MM Alam","Packages Mall"], freq: 10, first: "6:00 AM", last: "10:30 PM", km: 22 },
  { id: "R9", name: "Sabzazar → Qila Gujjar Singh", stops: ["Sabzazar","Shalamar","Bund Road","Railway Station","Qila Gujjar Singh"], freq: 15, first: "6:30 AM", last: "9:30 PM", km: 14 },
];

function timeToMins(t) {
  const [time, period] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// ─── SPLASH SCREEN ───────────────────────────────────────────
function SplashScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(160deg, ${GREEN} 0%, ${DARK_GREEN} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24
    }}>
      {/* Bus Logo */}
      <div style={{ fontSize: 80, animation: "bounce 1s infinite alternate" }}>🚌</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: 1 }}>Punjab Bus Connect</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>پنجاب بس کنیکٹ</div>
      </div>
      {/* Loading bar */}
      <div style={{ width: 180, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          height: "100%", background: YELLOW, borderRadius: 10,
          animation: "load 2s ease forwards"
        }} />
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
        ✦ A Maryam Nawaz Government Initiative
      </div>
      <style>{`
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-16px); } }
        @keyframes load { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────
function Header({ lang, setLang, title, subtitle, onBack }) {
  return (
    <div>
      <div style={{ background: GREEN, color: "white", padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {onBack && (
            <span onClick={onBack} style={{ fontSize: 22, cursor: "pointer" }}>←</span>
          )}
          {!onBack && <span style={{ fontSize: 22 }}>🚌</span>}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>{subtitle}</div>}
          </div>
          <button onClick={() => setLang(lang === "en" ? "ur" : "en")}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {lang === "en" ? "اردو" : "EN"}
          </button>
        </div>
      </div>
      <div style={{ background: DARK_GREEN, padding: "5px 16px", fontSize: 11, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, background: YELLOW, borderRadius: "50%" }} />
        A Maryam Nawaz Government Service · Lahore Punjab
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────
function BottomNav({ screen, setScreen, lang }) {
  const items = [
    { key: "home", icon: "🏠", en: "Home", ur: "ہوم" },
    { key: "routes", icon: "🚌", en: "Routes", ur: "روٹس" },
    { key: "finder", icon: "🔍", en: "Finder", ur: "ڈھونڈیں" },
    { key: "timings", icon: "⏰", en: "Timings", ur: "اوقات" },
  ];
  return (
    <div style={{ background: "white", display: "flex", borderTop: "1px solid #eee", paddingBottom: 8, position: "sticky", bottom: 0, zIndex: 10 }}>
      {items.map(n => {
        const active = screen === n.key || (screen === "detail" && n.key === "routes");
        return (
          <div key={n.key} onClick={() => setScreen(n.key)}
            style={{ flex: 1, textAlign: "center", padding: "8px 0 4px", cursor: "pointer", color: active ? GREEN : "#aaa", borderTop: active ? `2px solid ${GREEN}` : "2px solid transparent", transition: "all 0.15s" }}>
            <div style={{ fontSize: 22 }}>{n.icon}</div>
            <div style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{lang === "en" ? n.en : n.ur}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────
function HomeScreen({ setScreen, setSelectedRoute, lang }) {
  return (
    <div style={{ padding: "12px 0" }}>
      {/* Search bar */}
      <div onClick={() => setScreen("routes")}
        style={{ margin: "0 12px 12px", background: "white", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${GREEN}`, cursor: "pointer", boxShadow: "0 2px 8px rgba(26,122,60,0.08)" }}>
        <span style={{ fontSize: 18 }}>🔍</span>
        <span style={{ fontSize: 14, color: "#aaa" }}>{lang === "en" ? "Where do you want to go?" : "آپ کہاں جانا چاہتے ہیں؟"}</span>
      </div>

      {/* Quick buttons */}
      <div style={{ display: "flex", gap: 10, margin: "0 12px 16px" }}>
        {[
          { icon: "📍", en: "Near Me", ur: "قریب", screen: "routes" },
          { icon: "⏰", en: "Timings", ur: "اوقات", screen: "timings" },
          { icon: "🔍", en: "Route Finder", ur: "روٹ ڈھونڈیں", screen: "finder" },
        ].map(b => (
          <div key={b.en} onClick={() => setScreen(b.screen)}
            style={{ flex: 1, background: LIGHT_GREEN, borderRadius: 12, padding: "10px 6px", textAlign: "center", cursor: "pointer", border: `1px solid #c8e6c9` }}>
            <div style={{ fontSize: 20 }}>{b.icon}</div>
            <div style={{ fontSize: 11, color: GREEN, fontWeight: 600, marginTop: 4 }}>{lang === "en" ? b.en : b.ur}</div>
          </div>
        ))}
      </div>

      {/* Popular routes */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#444", margin: "0 14px 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {lang === "en" ? "🚌 Popular Routes" : "🚌 مشہور روٹس"}
      </div>
      {ROUTES.map((r, i) => (
        <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
          style={{ background: "white", margin: "0 12px 10px", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", cursor: "pointer", border: "1px solid #f0f0f0" }}>
          <div style={{ background: [GREEN,"#1565c0","#6a1b9a","#e65100"][i], color: "white", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 700, minWidth: 44, textAlign: "center" }}>
            {r.id}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{r.stops.length} stops · {r.km} km · Every {r.freq} min</div>
          </div>
          <span style={{ fontSize: 20, color: "#ccc" }}>›</span>
        </div>
      ))}
    </div>
  );
}

// ─── ROUTES SCREEN ───────────────────────────────────────────
function RoutesScreen({ setScreen, setSelectedRoute, lang }) {
  const [search, setSearch] = useState("");
  const filtered = ROUTES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.stops.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div>
      <div style={{ padding: "12px 12px 8px" }}>
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === "en" ? "Search route or stop..." : "روٹ یا اسٹاپ تلاش کریں..."}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${GREEN}`, fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ fontSize: 12, color: "#888", margin: "0 14px 8px" }}>{filtered.length} routes found</div>
      {filtered.map(r => (
        <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
          style={{ background: "white", margin: "0 12px 8px", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: "pointer" }}>
          <div style={{ background: GREEN, color: "white", borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: 13 }}>{r.id}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{r.stops.length} stops · Every {r.freq} min</div>
          </div>
          <span style={{ color: "#ccc", fontSize: 20 }}>›</span>
        </div>
      ))}
    </div>
  );
}

// ─── ROUTE DETAIL ────────────────────────────────────────────
function DetailScreen({ route, lang }) {
  return (
    <div>
      {/* Mini map */}
      <div style={{ background: "#e8f5e9", margin: 12, borderRadius: 16, height: 160, position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="160" viewBox="0 0 320 160">
          <rect width="320" height="160" fill="#dcedc8"/>
          <rect x="0" y="74" width="320" height="10" fill="#c5d5c5" rx="3"/>
          <rect x="148" y="0" width="8" height="160" fill="#c5d5c5" rx="3"/>
          <polyline points="20,78 70,78 100,58 150,78 200,78 250,84 300,78" fill="none" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round"/>
          {[20,70,150,200,300].map((x,i) => (
            <circle key={i} cx={x} cy={78} r={6} fill="white" stroke={GREEN} strokeWidth="2.5"/>
          ))}
          <rect x="90" y="62" width="28" height="16" rx="5" fill={GREEN}/>
          <text x="104" y="74" textAnchor="middle" fontSize="10" fill="white">🚌</text>
          <text x="20" y="96" textAnchor="middle" fontSize="7" fill={DARK_GREEN}>{route.stops[0]}</text>
          <text x="300" y="96" textAnchor="middle" fontSize="7" fill={DARK_GREEN}>{route.stops[route.stops.length-1]}</text>
        </svg>
        <div style={{ position:"absolute", bottom:8, left:10, background:"rgba(255,255,255,0.92)", borderRadius:8, padding:"3px 10px", fontSize:11, color:GREEN, fontWeight:600 }}>
          🟢 Live Tracking
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display:"flex", gap:8, margin:"0 12px 12px" }}>
        {[
          { l: lang==="en"?"First Bus":"پہلی بس", v: route.first, c: LIGHT_GREEN, tc: GREEN },
          { l: lang==="en"?"Last Bus":"آخری بس", v: route.last, c: "#f5f5f5", tc: "#333" },
          { l: lang==="en"?"Every":"ہر", v: `${route.freq} min`, c: GREEN, tc: "white" },
        ].map((item,i) => (
          <div key={i} style={{ flex:1, background:item.c, borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:item.tc, opacity:0.8 }}>{item.l}</div>
            <div style={{ fontSize:15, fontWeight:700, color:item.tc, marginTop:3 }}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Stops list */}
      <div style={{ fontSize:13, fontWeight:700, color:"#444", margin:"0 14px 8px" }}>
        {lang==="en"?"All Stops":"تمام اسٹاپس"}
      </div>
      <div style={{ background:"white", margin:"0 12px 12px", borderRadius:16, overflow:"hidden", border:"1px solid #f0f0f0" }}>
        {route.stops.map((stop,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 16px", borderBottom: i<route.stops.length-1?"0.5px solid #f5f5f5":"none", background: i===0?"#f0faf4":"white" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background: i===0||i===route.stops.length-1?GREEN:"#ddd", border:`2px solid ${i===0||i===route.stops.length-1?GREEN:"#ccc"}` }}/>
              {i<route.stops.length-1&&<div style={{width:2,height:22,background:"#e0e0e0",margin:"2px 0"}}/>}
            </div>
            <span style={{ fontSize:13, color:"#1a1a1a", fontWeight: i===0||i===route.stops.length-1?600:400 }}>{stop}</span>
            {i===0&&<span style={{marginLeft:"auto",fontSize:11,color:GREEN,fontWeight:700,background:LIGHT_GREEN,padding:"2px 8px",borderRadius:8}}>Start</span>}
            {i===route.stops.length-1&&<span style={{marginLeft:"auto",fontSize:11,color:"#888",background:"#f5f5f5",padding:"2px 8px",borderRadius:8}}>End</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROUTE FINDER ────────────────────────────────────────────
function FinderScreen({ setScreen, setSelectedRoute, lang }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState(null);

  function find() {
    const found = ROUTES.filter(r =>
      r.stops.some(s => s.toLowerCase().includes(from.toLowerCase())) &&
      r.stops.some(s => s.toLowerCase().includes(to.toLowerCase()))
    );
    setResult(found);
  }

  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>
        🔍 {lang === "en" ? "Find Your Route" : "اپنا روٹ ڈھونڈیں"}
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{lang === "en" ? "FROM" : "سے"}</div>
        <input value={from} onChange={e => { setFrom(e.target.value); setResult(null); }}
          placeholder="e.g. Shahdara"
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
        <div style={{ textAlign: "center", fontSize: 20, margin: "0 0 8px" }}>⬇️</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{lang === "en" ? "TO" : "تک"}</div>
        <input value={to} onChange={e => { setTo(e.target.value); setResult(null); }}
          placeholder="e.g. Liberty Market"
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>
      <button onClick={find}
        style={{ width: "100%", padding: 14, background: GREEN, color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        {lang === "en" ? "🔍 Find Route" : "🔍 روٹ تلاش کریں"}
      </button>

      {result !== null && (
        <div style={{ marginTop: 16 }}>
          {result.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, background: "white", borderRadius: 14, color: "#888" }}>
              <div style={{ fontSize: 32 }}>😔</div>
              <div style={{ marginTop: 8 }}>No direct route found</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Try nearby stop names</div>
            </div>
          ) : result.map(r => (
            <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
              style={{ background: "white", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer" }}>
              <div style={{ background: GREEN, color: "white", borderRadius: 8, padding: "6px 10px", fontWeight: 700 }}>{r.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>Every {r.freq} min</div>
              </div>
              <span style={{ color: GREEN, fontSize: 20 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TIMINGS SCREEN ──────────────────────────────────────────
function TimingsScreen({ setScreen, setSelectedRoute, lang }) {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const buses = ROUTES.map(r => {
    let next = timeToMins(r.first);
    while (next < mins) next += r.freq;
    return { ...r, nextIn: next - mins };
  }).sort((a, b) => a.nextIn - b.nextIn);

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#444", margin: "0 14px 10px", textTransform: "uppercase" }}>
        {lang === "en" ? "⏰ Next Buses" : "⏰ اگلی بسیں"}
      </div>
      {buses.map(r => (
        <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
          style={{ background: "white", margin: "0 12px 8px", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: "pointer" }}>
          <div style={{ background: GREEN, color: "white", borderRadius: 8, padding: "6px 10px", fontWeight: 700 }}>{r.id}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name.split("→")[0].trim()}</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Every {r.freq} min · {r.stops.length} stops</div>
          </div>
          <div style={{ background: r.nextIn <= 2 ? GREEN : LIGHT_GREEN, color: r.nextIn <= 2 ? "white" : GREEN, fontWeight: 700, fontSize: 13, padding: "6px 12px", borderRadius: 10, minWidth: 56, textAlign: "center" }}>
            {r.nextIn <= 1 ? "Now!" : `${r.nextIn}m`}
          </div>
        </div>
      ))}
      <div style={{ background: "#fff8e1", margin: "4px 12px", borderRadius: 12, padding: "10px 14px", border: "1px solid #ffe082", display: "flex", gap: 8 }}>
        <span>⚠️</span>
        <span style={{ fontSize: 12, color: "#7a5c00" }}>
          {lang === "en" ? "Delays possible during peak hours 8–10 AM & 5–8 PM" : "رش کے اوقات میں تاخیر ممکن ہے"}
        </span>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true);
  const [screen, setScreen] = useState("home");
  const [lang, setLang] = useState("en");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [dbRoutes, setDbRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes().then(data => {
      if (data.length === 0) seedRoutes();
      else setDbRoutes(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  if (splash) return <SplashScreen />;

  const getTitle = () => {
    if (screen === "detail" && selectedRoute) return `Route ${selectedRoute.id}`;
    if (screen === "routes") return lang === "en" ? "All Routes" : "تمام روٹس";
    if (screen === "finder") return lang === "en" ? "Route Finder" : "روٹ ڈھونڈیں";
    if (screen === "timings") return lang === "en" ? "Live Timings" : "براہ راست اوقات";
    return lang === "en" ? "Punjab Bus Connect" : "پنجاب بس کنیکٹ";
  };

  const getSub = () => {
    if (screen === "detail" && selectedRoute) return selectedRoute.name;
    return "CM Punjab Initiative · Lahore";
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f5f5f5", minHeight: "100vh", maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <Header lang={lang} setLang={setLang} title={getTitle()} subtitle={getSub()}
        onBack={screen !== "home" ? () => setScreen(screen === "detail" ? "routes" : "home") : null} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {screen === "home" && <HomeScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} />}
        {screen === "routes" && <RoutesScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} />}
        {screen === "detail" && selectedRoute && <DetailScreen route={selectedRoute} lang={lang} />}
        {screen === "finder" && <FinderScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} />}
        {screen === "timings" && <TimingsScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} />}
      </div>

      <BottomNav screen={screen} setScreen={setScreen} lang={lang} />
    </div>
  );
}