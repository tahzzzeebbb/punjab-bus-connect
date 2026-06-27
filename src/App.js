import { useState, useEffect } from "react";
import { fetchRoutes, seedRoutes, auth, googleProvider, REAL_ROUTES } from "./firebase";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const GREEN = "#1a7a3c";
const LIGHT_GREEN = "#e8f5e9";
const DARK_GREEN = "#0d5c2c";
const YELLOW = "#f0c040";

function timeToMins(t) {
  const [time, period] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// ─── SPLASH ──────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${GREEN},${DARK_GREEN})`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24 }}>
      <div style={{ fontSize:90 }}>🚌</div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:28, fontWeight:700, color:"white", letterSpacing:1 }}>Punjab Bus Connect</div>
        <div style={{ fontSize:15, color:"rgba(255,255,255,0.85)", marginTop:6 }}>پنجاب بس کنیکٹ</div>
      </div>
      <div style={{ width:180, height:4, background:"rgba(255,255,255,0.2)", borderRadius:10, overflow:"hidden" }}>
        <div style={{ height:"100%", background:YELLOW, borderRadius:10, animation:"load 2.5s ease forwards" }}/>
      </div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>✦ A Maryam Nawaz Government Initiative</div>
      <style>{`@keyframes load{from{width:0}to{width:100%}}`}</style>
    </div>
  );
}

// ─── AUTH SCREEN ─────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmail() {
    if (!email || !pass) return setErr("Please fill all fields");
    setLoading(true); setErr("");
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (e) {
      setErr(e.message.replace("Firebase: ", "").replace(/\(.*\)/, ""));
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true); setErr("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setErr("Google sign-in failed. Try email instead.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${GREEN},${DARK_GREEN})`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ fontSize:50, marginBottom:12 }}>🚌</div>
      <div style={{ fontSize:22, fontWeight:700, color:"white", marginBottom:4 }}>Punjab Bus Connect</div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", marginBottom:28 }}>پنجاب بس کنیکٹ</div>

      <div style={{ background:"white", borderRadius:20, padding:24, width:"100%", maxWidth:360, boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
        {/* Tabs */}
        <div style={{ display:"flex", background:"#f5f5f5", borderRadius:12, padding:4, marginBottom:20 }}>
          {["login","register"].map(m => (
            <div key={m} onClick={() => { setMode(m); setErr(""); }}
              style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:10, cursor:"pointer", background:mode===m?GREEN:"transparent", color:mode===m?"white":"#666", fontWeight:600, fontSize:14, transition:"all 0.2s" }}>
              {m==="login"?"Login":"Register"}
            </div>
          ))}
        </div>

        {mode==="register" && (
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1.5px solid #e0e0e0", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
        )}

        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email address" type="email"
          style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1.5px solid #e0e0e0", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>

        <input value={pass} onChange={e => setPass(e.target.value)}
          placeholder="Password" type="password"
          style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1.5px solid #e0e0e0", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14 }}/>

        {err && <div style={{ background:"#ffebee", color:"#c62828", padding:"8px 12px", borderRadius:8, fontSize:12, marginBottom:12 }}>{err}</div>}

        <button onClick={handleEmail} disabled={loading}
          style={{ width:"100%", padding:13, background:GREEN, color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:12, opacity:loading?0.7:1 }}>
          {loading?"Please wait...":(mode==="login"?"🔑 Login":"✅ Register")}
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 0 12px" }}>
          <div style={{ flex:1, height:1, background:"#eee" }}/>
          <span style={{ fontSize:12, color:"#999" }}>OR</span>
          <div style={{ flex:1, height:1, background:"#eee" }}/>
        </div>

        <button onClick={handleGoogle} disabled={loading}
          style={{ width:"100%", padding:13, background:"white", color:"#333", border:"1.5px solid #e0e0e0", borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>🇬</span> Continue with Google
        </button>

        <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:"#999" }}>
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <span onClick={() => setMode(mode==="login"?"register":"login")}
            style={{ color:GREEN, fontWeight:600, cursor:"pointer" }}>
            {mode==="login"?"Register":"Login"}
          </span>
        </div>
      </div>

      <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:20 }}>
        ✦ A Maryam Nawaz Government Service
      </div>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────
function Header({ lang, setLang, title, subtitle, onBack, user, onLogout }) {
  return (
    <div>
      <div style={{ background:GREEN, color:"white", padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {onBack
            ? <span onClick={onBack} style={{ fontSize:22, cursor:"pointer" }}>←</span>
            : <span style={{ fontSize:22 }}>🚌</span>
          }
          <div style={{ flex:1 }}>
            <div style={{ fontSize:17, fontWeight:700 }}>{title}</div>
            {subtitle && <div style={{ fontSize:11, opacity:0.8, marginTop:1 }}>{subtitle}</div>}
          </div>
          <button onClick={() => setLang(lang==="en"?"ur":"en")}
            style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"white", borderRadius:20, padding:"4px 12px", fontSize:12, cursor:"pointer", fontWeight:600, marginRight:6 }}>
            {lang==="en"?"اردو":"EN"}
          </button>
          {user && (
            <div onClick={onLogout} title="Logout"
              style={{ width:32, height:32, borderRadius:"50%", background:YELLOW, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16, fontWeight:700, color:DARK_GREEN }}>
              {user.displayName?user.displayName[0].toUpperCase():user.email[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <div style={{ background:DARK_GREEN, padding:"5px 16px", fontSize:11, color:"rgba(255,255,255,0.8)", display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:6, height:6, background:YELLOW, borderRadius:"50%" }}/>
        {user ? `Welcome, ${user.displayName||user.email.split("@")[0]}! · CM Punjab Initiative` : "A Maryam Nawaz Government Service · Lahore"}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────
function BottomNav({ screen, setScreen, lang }) {
  const items = [
    { key:"home", icon:"🏠", en:"Home", ur:"ہوم" },
    { key:"routes", icon:"🚌", en:"Routes", ur:"روٹس" },
    { key:"finder", icon:"🔍", en:"Finder", ur:"ڈھونڈیں" },
    { key:"timings", icon:"⏰", en:"Timings", ur:"اوقات" },
  ];
  return (
    <div style={{ background:"white", display:"flex", borderTop:"1px solid #eee", paddingBottom:8, position:"sticky", bottom:0, zIndex:10 }}>
      {items.map(n => {
        const active = screen===n.key||(screen==="detail"&&n.key==="routes");
        return (
          <div key={n.key} onClick={() => setScreen(n.key)}
            style={{ flex:1, textAlign:"center", padding:"8px 0 4px", cursor:"pointer", color:active?GREEN:"#aaa", borderTop:active?`2px solid ${GREEN}`:"2px solid transparent", transition:"all 0.15s" }}>
            <div style={{ fontSize:22 }}>{n.icon}</div>
            <div style={{ fontSize:10, fontWeight:active?700:400 }}>{lang==="en"?n.en:n.ur}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────
function HomeScreen({ setScreen, setSelectedRoute, lang, routes }) {
  return (
    <div style={{ padding:"12px 0" }}>
      <div onClick={() => setScreen("routes")}
        style={{ margin:"0 12px 12px", background:"white", borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:10, border:`1.5px solid ${GREEN}`, cursor:"pointer", boxShadow:"0 2px 8px rgba(26,122,60,0.08)" }}>
        <span style={{ fontSize:18 }}>🔍</span>
        <span style={{ fontSize:14, color:"#aaa" }}>{lang==="en"?"Where do you want to go?":"آپ کہاں جانا چاہتے ہیں؟"}</span>
      </div>
      <div style={{ display:"flex", gap:10, margin:"0 12px 16px" }}>
        {[
          { icon:"📍", en:"Near Me", ur:"قریب", sc:"routes" },
          { icon:"⏰", en:"Timings", ur:"اوقات", sc:"timings" },
          { icon:"🔍", en:"Finder", ur:"ڈھونڈیں", sc:"finder" },
        ].map(b => (
          <div key={b.en} onClick={() => setScreen(b.sc)}
            style={{ flex:1, background:LIGHT_GREEN, borderRadius:12, padding:"10px 6px", textAlign:"center", cursor:"pointer", border:"1px solid #c8e6c9" }}>
            <div style={{ fontSize:20 }}>{b.icon}</div>
            <div style={{ fontSize:11, color:GREEN, fontWeight:600, marginTop:4 }}>{lang==="en"?b.en:b.ur}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"#444", margin:"0 14px 10px", textTransform:"uppercase", letterSpacing:0.5 }}>
        {lang==="en"?"🚌 Popular Routes":"🚌 مشہور روٹس"}
      </div>
      {routes.map((r,i) => (
        <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
          style={{ background:"white", margin:"0 12px 10px", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", cursor:"pointer", border:"1px solid #f0f0f0" }}>
          <div style={{ background:r.color||GREEN, color:"white", borderRadius:10, padding:"8px 12px", fontSize:13, fontWeight:700, minWidth:44, textAlign:"center" }}>{r.id}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#1a1a1a" }}>{r.name}</div>
            <div style={{ fontSize:12, color:"#888", marginTop:3 }}>{r.stops.length} stops · {r.km} km · Every {r.freq} min</div>
          </div>
          <span style={{ fontSize:20, color:"#ccc" }}>›</span>
        </div>
      ))}
    </div>
  );
}

// ─── ROUTES ──────────────────────────────────────────────────
function RoutesScreen({ setScreen, setSelectedRoute, lang, routes }) {
  const [search, setSearch] = useState("");
  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.stops.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div>
      <div style={{ padding:"12px 12px 8px" }}>
        <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang==="en"?"Search route or stop...":"روٹ یا اسٹاپ تلاش کریں..."}
          style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:`1.5px solid ${GREEN}`, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
      </div>
      <div style={{ fontSize:12, color:"#888", margin:"0 14px 8px" }}>{filtered.length} {lang==="en"?"routes found":"روٹس ملے"}</div>
      {filtered.map(r => (
        <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
          style={{ background:"white", margin:"0 12px 8px", borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 6px rgba(0,0,0,0.05)", cursor:"pointer" }}>
          <div style={{ background:r.color||GREEN, color:"white", borderRadius:8, padding:"6px 10px", fontWeight:700, fontSize:13 }}>{r.id}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600 }}>{r.name}</div>
            <div style={{ fontSize:12, color:"#999", marginTop:2 }}>{r.stops.length} stops · Every {r.freq} min</div>
          </div>
          <span style={{ color:"#ccc", fontSize:20 }}>›</span>
        </div>
      ))}
    </div>
  );
}

// ─── DETAIL ──────────────────────────────────────────────────
function DetailScreen({ route, lang }) {
  const coords = route.coords || [];
  return (
    <div>
      {coords.length > 0 && (
        <div style={{ margin:12, borderRadius:16, overflow:"hidden", height:220, border:`1px solid ${LIGHT_GREEN}` }}>
          <MapContainer center={coords[0]} zoom={13} style={{ height:"100%", width:"100%" }} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap"/>
            <Polyline positions={coords} color={route.color||GREEN} weight={4}/>
            {coords.map((pos,i) => (
              <Marker key={i} position={pos}>
                <Popup><b>{route.stops[i]}</b></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
      <div style={{ display:"flex", gap:8, margin:"0 12px 12px" }}>
        {[
          { l:lang==="en"?"First Bus":"پہلی بس", v:route.first, c:LIGHT_GREEN, tc:GREEN },
          { l:lang==="en"?"Last Bus":"آخری بس", v:route.last, c:"#f5f5f5", tc:"#333" },
          { l:lang==="en"?"Every":"ہر", v:`${route.freq} min`, c:GREEN, tc:"white" },
        ].map((item,i) => (
          <div key={i} style={{ flex:1, background:item.c, borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:item.tc, opacity:0.8 }}>{item.l}</div>
            <div style={{ fontSize:15, fontWeight:700, color:item.tc, marginTop:3 }}>{item.v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"#444", margin:"0 14px 8px" }}>
        {lang==="en"?"All Stops":"تمام اسٹاپس"}
      </div>
      <div style={{ background:"white", margin:"0 12px 12px", borderRadius:16, overflow:"hidden", border:"1px solid #f0f0f0" }}>
        {route.stops.map((stop,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 16px", borderBottom:i<route.stops.length-1?"0.5px solid #f5f5f5":"none", background:i===0?"#f0faf4":"white" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:i===0||i===route.stops.length-1?route.color||GREEN:"#ddd", border:`2px solid ${i===0||i===route.stops.length-1?route.color||GREEN:"#ccc"}` }}/>
              {i<route.stops.length-1&&<div style={{ width:2, height:22, background:"#e0e0e0", margin:"2px 0" }}/>}
            </div>
            <span style={{ fontSize:13, color:"#1a1a1a", fontWeight:i===0||i===route.stops.length-1?600:400 }}>{stop}</span>
            {i===0&&<span style={{ marginLeft:"auto", fontSize:11, color:GREEN, fontWeight:700, background:LIGHT_GREEN, padding:"2px 8px", borderRadius:8 }}>Start</span>}
            {i===route.stops.length-1&&<span style={{ marginLeft:"auto", fontSize:11, color:"#888", background:"#f5f5f5", padding:"2px 8px", borderRadius:8 }}>End</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FINDER ──────────────────────────────────────────────────
function FinderScreen({ setScreen, setSelectedRoute, lang, routes }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState(null);

  function find() {
    const found = routes.filter(r =>
      r.stops.some(s => s.toLowerCase().includes(from.toLowerCase())) &&
      r.stops.some(s => s.toLowerCase().includes(to.toLowerCase()))
    );
    setResult(found);
  }

  return (
    <div style={{ padding:14 }}>
      <div style={{ fontSize:16, fontWeight:700, color:"#1a1a1a", marginBottom:16 }}>
        🔍 {lang==="en"?"Find Your Route":"اپنا روٹ ڈھونڈیں"}
      </div>
      <div style={{ background:"white", borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginBottom:14 }}>
        <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>{lang==="en"?"FROM":"سے"}</div>
        <input value={from} onChange={e => { setFrom(e.target.value); setResult(null); }}
          placeholder="e.g. Shahdara"
          style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #e0e0e0", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:12 }}/>
        <div style={{ textAlign:"center", fontSize:20, margin:"0 0 8px" }}>⬇️</div>
        <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>{lang==="en"?"TO":"تک"}</div>
        <input value={to} onChange={e => { setTo(e.target.value); setResult(null); }}
          placeholder="e.g. Liberty Market"
          style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #e0e0e0", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
      </div>
      <button onClick={find}
        style={{ width:"100%", padding:14, background:GREEN, color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer" }}>
        {lang==="en"?"🔍 Find Route":"🔍 روٹ تلاش کریں"}
      </button>
      {result!==null&&(
        <div style={{ marginTop:16 }}>
          {result.length===0?(
            <div style={{ textAlign:"center", padding:24, background:"white", borderRadius:14, color:"#888" }}>
              <div style={{ fontSize:32 }}>😔</div>
              <div style={{ marginTop:8 }}>No direct route found</div>
              <div style={{ fontSize:12, marginTop:4 }}>Try nearby stop names</div>
            </div>
          ):result.map(r=>(
            <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
              style={{ background:"white", borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:8, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", cursor:"pointer" }}>
              <div style={{ background:r.color||GREEN, color:"white", borderRadius:8, padding:"6px 10px", fontWeight:700 }}>{r.id}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{r.name}</div>
                <div style={{ fontSize:12, color:"#999", marginTop:2 }}>Every {r.freq} min</div>
              </div>
              <span style={{ color:GREEN, fontSize:20 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TIMINGS ─────────────────────────────────────────────────
function TimingsScreen({ setScreen, setSelectedRoute, lang, routes }) {
  const now = new Date();
  const mins = now.getHours()*60+now.getMinutes();
  const buses = routes.map(r => {
    let next = timeToMins(r.first);
    while(next<mins) next+=r.freq;
    return { ...r, nextIn:next-mins };
  }).sort((a,b)=>a.nextIn-b.nextIn);

  return (
    <div style={{ padding:"12px 0" }}>
      <div style={{ fontSize:13, fontWeight:700, color:"#444", margin:"0 14px 10px", textTransform:"uppercase" }}>
        {lang==="en"?"⏰ Next Buses":"⏰ اگلی بسیں"}
      </div>
      {buses.map(r=>(
        <div key={r.id} onClick={() => { setSelectedRoute(r); setScreen("detail"); }}
          style={{ background:"white", margin:"0 12px 8px", borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 6px rgba(0,0,0,0.05)", cursor:"pointer" }}>
          <div style={{ background:r.color||GREEN, color:"white", borderRadius:8, padding:"6px 10px", fontWeight:700 }}>{r.id}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>{r.name.split("→")[0].trim()}</div>
            <div style={{ fontSize:11, color:"#999", marginTop:2 }}>Every {r.freq} min · {r.stops.length} stops</div>
          </div>
          <div style={{ background:r.nextIn<=2?GREEN:LIGHT_GREEN, color:r.nextIn<=2?"white":GREEN, fontWeight:700, fontSize:13, padding:"6px 12px", borderRadius:10, minWidth:56, textAlign:"center" }}>
            {r.nextIn<=1?"Now!":`${r.nextIn}m`}
          </div>
        </div>
      ))}
      <div style={{ background:"#fff8e1", margin:"4px 12px", borderRadius:12, padding:"10px 14px", border:"1px solid #ffe082", display:"flex", gap:8 }}>
        <span>⚠️</span>
        <span style={{ fontSize:12, color:"#7a5c00" }}>
          {lang==="en"?"Delays possible during peak hours 8–10 AM & 5–8 PM":"رش کے اوقات میں تاخیر ممکن ہے"}
        </span>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [lang, setLang] = useState("en");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState(REAL_ROUTES);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Splash
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // Fetch routes from Firebase
  useEffect(() => {
    fetchRoutes().then(data => {
      if (data.length === 0) seedRoutes();
      else setRoutes(data);
    }).catch(() => setRoutes(REAL_ROUTES));
  }, []);

  async function handleLogout() {
    await signOut(auth);
    setScreen("home");
  }

  if (splash) return <SplashScreen/>;
  if (authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:GREEN }}>
      <div style={{ fontSize:40 }}>🚌</div>
    </div>
  );
  if (!user) return <AuthScreen/>;

  const getTitle = () => {
    if (screen==="detail"&&selectedRoute) return `Route ${selectedRoute.id}`;
    if (screen==="routes") return lang==="en"?"All Routes":"تمام روٹس";
    if (screen==="finder") return lang==="en"?"Route Finder":"روٹ ڈھونڈیں";
    if (screen==="timings") return lang==="en"?"Live Timings":"براہ راست اوقات";
    return lang==="en"?"Punjab Bus Connect":"پنجاب بس کنیکٹ";
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", background:"#f5f5f5", minHeight:"100vh", maxWidth:420, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      <Header lang={lang} setLang={setLang} title={getTitle()}
        subtitle={screen==="detail"&&selectedRoute?selectedRoute.name:"CM Punjab Initiative · Lahore"}
        onBack={screen!=="home"?()=>setScreen(screen==="detail"?"routes":"home"):null}
        user={user} onLogout={handleLogout}/>
      <div style={{ flex:1, overflowY:"auto" }}>
        {screen==="home"&&<HomeScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} routes={routes}/>}
        {screen==="routes"&&<RoutesScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} routes={routes}/>}
        {screen==="detail"&&selectedRoute&&<DetailScreen route={selectedRoute} lang={lang}/>}
        {screen==="finder"&&<FinderScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} routes={routes}/>}
        {screen==="timings"&&<TimingsScreen setScreen={setScreen} setSelectedRoute={setSelectedRoute} lang={lang} routes={routes}/>}
      </div>
      <BottomNav screen={screen} setScreen={setScreen} lang={lang}/>
    </div>
  );
}