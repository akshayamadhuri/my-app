import { useState, useEffect } from "react";
import { Heart, MessageCircle, Crown, Lock, X, Plus, Trash2, ChevronLeft, Eye, EyeOff, Copy, Check, Play, LogOut, User, Shield, Key } from "lucide-react";

// ═══════════════════════════════════════
//  ⚙️  CONFIG — edit these values
// ═══════════════════════════════════════
const CFG = {
  siteName:    "LUMINARY",
  creatorName: "Sunitha",
  bio:         "Content Creator · Photographer · Storyteller",
  upiId:       "akshayamadh@ybl",
  upiName:     "Sunitha",
  price:       300,
  creatorUser: "admin",        // ← your login username
  creatorPass: "creator123",   // ← your login password (change this!)
  accessCode:  "LUMINARY2025", // ← secret code you share after payment
};

const UPI_QR = `https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=${encodeURIComponent(
  `upi://pay?pa=${CFG.upiId}&pn=${encodeURIComponent(CFG.upiName)}&am=${CFG.price}&cu=INR&tn=PremiumAccess`
)}`;

const SEEDS = [
  { id:"s1", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679390/image_1711498_kujtcg.jpg", caption:"Golden hour magic ✨ Exclusive for premium members", likes:847,  comments:23, time:"2h" },
  { id:"s2", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679390/image_1711538_zg4jpl.jpg", caption:"Behind the scenes 📸 Real moments, unfiltered",       likes:1203, comments:45, time:"5h" },
  { id:"s3", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679390/image_1711598_u5dfzg.jpg", caption:"A moment frozen in time 🌿",                           likes:634,  comments:18, time:"1d" },
  { id:"s4", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679388/56_v4mqpo.png", caption:"Where sky meets earth 🌊",                             likes:2341, comments:67, time:"2d" },
  { id:"s5", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679388/58_eev6nb.png", caption:"New collection drop 🔥",                               likes:987,  comments:34, time:"3d" },
  { id:"s6", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679387/57_qhybhq.png", caption:"Nature's masterpiece 🌈",                              likes:1567, comments:52, time:"4d" },
  { id:"s7", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679386/59_kwfbjy.png", caption:"Peaceful mornings ☀️",                                likes:723,  comments:29, time:"5d" },
  { id:"s9", type:"image", url:"https://res.cloudinary.com/dngizw3ju/image/upload/v1776679349/78_xwdzcl.png", caption:"The summit awaits 🏔️",                                likes:3241, comments:98, time:"1w" },
];

// ── localStorage helpers ──────────────
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

const fmt  = n => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
const fmtC = v => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const fmtE = v => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; };

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080808;overflow-x:hidden}
  input,button,select,textarea{font-family:'DM Sans',sans-serif}
  input:focus{outline:none!important;border-color:rgba(201,168,76,0.65)!important;box-shadow:0 0 0 3px rgba(201,168,76,0.08)!important}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#282828;border-radius:2px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0)}50%{box-shadow:0 0 0 10px rgba(201,168,76,0.07)}}
  .cell:hover .hov{opacity:1!important}
  .hvr:hover{background:rgba(255,255,255,0.07)!important}
  .gld:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
  .gld:active:not(:disabled){transform:scale(0.98)}
  .gld{transition:all 0.18s ease}
  @media(max-width:620px){
    .pg{grid-template-columns:repeat(2,1fr)!important}
    .mi{flex-direction:column!important}
    .mm{min-height:220px!important;max-height:300px!important}
    .ms{flex:0 0 auto!important;max-height:240px!important}
  }
`;

export default function App() {
  const [page,      setPage]     = useState("landing");
  const [role,      setRole]     = useState(null);
  const [posts,     setPosts]    = useState(SEEDS);
  const [liked,     setLiked]    = useState(new Set());
  const [openPost,  setOpenPost] = useState(null);

  // payment
  const [tab,       setTab]      = useState("upi");
  const [pStep,     setPStep]    = useState("idle"); // idle | entercode | success
  const [codeInput, setCodeInput]= useState("");
  const [codeErr,   setCodeErr]  = useState("");
  const [card,      setCard]     = useState({ num:"", exp:"", cvv:"", name:"" });
  const [copied,    setCopied]   = useState(false);

  // creator login
  const [cUser, setCUser] = useState("");
  const [cPass, setCPass] = useState("");
  const [cVis,  setCVis]  = useState(false);
  const [cErr,  setCErr]  = useState("");

  // admin panel
  const [adminOpen, setAdminOpen] = useState(false);
  const [addOpen,   setAddOpen]   = useState(false);
  const [newPost,   setNewPost]   = useState({ url:"", caption:"", type:"image" });
  const [saving,    setSaving]    = useState(false);

  // ── load persisted state on mount ──
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.appendChild(s);

    const savedPosts = store.get("lum_posts");
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const savedLiked = store.get("lum_liked");
    if (savedLiked) setLiked(new Set(JSON.parse(savedLiked)));

    const savedRole = store.get("lum_role");
    if (savedRole) { setRole(savedRole); setPage("feed"); }

    return () => { if (s.parentNode) s.parentNode.removeChild(s); };
  }, []);

  // ── helpers ──────────────────────────
  const savePosts = (arr) => {
    setPosts(arr);
    store.set("lum_posts", JSON.stringify(arr));
  };

  const creatorLogin = () => {
    if (cUser === CFG.creatorUser && cPass === CFG.creatorPass) {
      store.set("lum_role", "creator");
      setRole("creator"); setPage("feed"); setCErr("");
    } else {
      setCErr("Invalid username or password.");
    }
  };

  const logout = () => {
    store.del("lum_role");
    setRole(null); setPage("landing");
    setCUser(""); setCPass(""); setCErr("");
  };

  const toggleLike = (id) => {
    const was = liked.has(id);
    const n = new Set(liked);
    was ? n.delete(id) : n.add(id);
    setLiked(n);
    setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes + (was ? -1 : 1) } : x));
    store.set("lum_liked", JSON.stringify([...n]));
  };

  const markPaid = () => {
    store.set("lum_role", "sub");
    setRole("sub");
    setPStep("success");
  };

  const doUPI  = () => setPStep("entercode");
  const doCard = () => {
    if (!card.num || !card.exp || !card.cvv || !card.name) return;
    setPStep("entercode");
  };

  const verifyCode = () => {
    if (codeInput.trim().toUpperCase() === CFG.accessCode.toUpperCase()) {
      markPaid();
    } else {
      setCodeErr("Invalid code. Please contact the creator.");
    }
  };

  const addPost = () => {
    if (!newPost.url) return;
    setSaving(true);
    const p = {
      id: Date.now().toString(),
      type: newPost.type,
      url: newPost.url,
      caption: newPost.caption || "",
      likes: 0, comments: 0, time: "now"
    };
    savePosts([p, ...posts]);
    setNewPost({ url:"", caption:"", type:"image" });
    setAddOpen(false);
    setSaving(false);
  };

  const gold  = "linear-gradient(135deg,#C9A84C,#9E7A28)";
  const serif = "'Cormorant Garamond',serif";
  const sans  = "'DM Sans',sans-serif";

  // ══════════════════════════════════════
  //  LANDING PAGE
  // ══════════════════════════════════════
  if (page === "landing") return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#F5F0E8", fontFamily:sans, overflowX:"hidden" }}>

      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(to bottom,rgba(8,8,8,0.97),transparent)", backdropFilter:"blur(20px)" }}>
        <span style={{ fontFamily:serif, fontSize:"21px", fontWeight:600, letterSpacing:"5px", color:"#C9A84C" }}>{CFG.siteName}</span>
        <div style={{ display:"flex", gap:"9px", alignItems:"center" }}>
          <button onClick={() => setPage("creator-login")} className="hvr"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"100px", padding:"9px 20px", color:"#888", fontSize:"13px", fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", transition:"background 0.18s" }}>
            <Key size={12}/> Creator Login
          </button>
          <button onClick={() => setPage("payment")} className="gld"
            style={{ background:gold, color:"#080808", border:"none", borderRadius:"100px", padding:"10px 24px", fontWeight:700, fontSize:"13px", cursor:"pointer" }}>
            Get Premium
          </button>
        </div>
      </nav>

      {/* hero */}
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 24px 80px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"2px", opacity:0.09, overflow:"hidden" }}>
          {SEEDS.slice(0, 6).map(p => (
            <div key={p.id} style={{ backgroundImage:`url(${p.url})`, backgroundSize:"cover", backgroundPosition:"center", filter:"blur(5px)", transform:"scale(1.1)" }}/>
          ))}
        </div>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 45%,rgba(8,8,8,0.25) 0%,rgba(8,8,8,0.8) 55%,#080808 100%)" }}/>
        <div style={{ position:"relative", textAlign:"center", maxWidth:"700px", animation:"fadeUp 0.9s ease" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"7px", background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.24)", borderRadius:"100px", padding:"6px 18px", marginBottom:"26px", color:"#C9A84C", fontSize:"11px", fontWeight:600, letterSpacing:"2px" }}>
            <Crown size={12}/> EXCLUSIVE PREMIUM CONTENT
          </div>
          <h1 style={{ fontFamily:serif, fontSize:"clamp(48px,8vw,86px)", fontWeight:300, lineHeight:1.06, marginBottom:"20px", letterSpacing:"-1px" }}>
            Unlock the<br/><em style={{ color:"#C9A84C", fontStyle:"italic" }}>Full Experience</em>
          </h1>
          <p style={{ fontSize:"16px", color:"#666", lineHeight:1.8, marginBottom:"42px", fontWeight:300 }}>
            Lifetime access to exclusive photos, videos &amp; behind-the-scenes content.<br/>One-time payment. No subscriptions. Ever.
          </p>
          <button onClick={() => setPage("payment")} className="gld"
            style={{ background:gold, color:"#080808", border:"none", borderRadius:"100px", padding:"17px 52px", fontWeight:700, fontSize:"16px", cursor:"pointer", boxShadow:"0 0 55px rgba(201,168,76,0.22)" }}>
            Unlock Now — ₹{CFG.price.toLocaleString()}
          </button>
          <div style={{ marginTop:"12px", color:"#3a3a3a", fontSize:"12px" }}>One-time · Lifetime access · Instant unlock</div>
        </div>
      </div>

      {/* features */}
      <div style={{ padding:"40px 24px 70px", maxWidth:"880px", margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"14px" }}>
        {[
          ["📸","Exclusive Photos","High-res photography not available anywhere else."],
          ["🎬","Videos & Reels","Behind-the-scenes & unfiltered creator content."],
          ["♾️","Lifetime Access","Pay once, access forever. No recurring charges."],
        ].map(([e, t, d], i) => (
          <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", padding:"22px", animation:`fadeUp 0.7s ease ${0.1+i*0.12}s both` }}>
            <div style={{ fontSize:"26px", marginBottom:"11px" }}>{e}</div>
            <h3 style={{ fontFamily:serif, fontSize:"18px", fontWeight:400, marginBottom:"7px" }}>{t}</h3>
            <p style={{ color:"#4a4a4a", lineHeight:1.7, fontSize:"13px", fontWeight:300 }}>{d}</p>
          </div>
        ))}
      </div>

      {/* locked preview */}
      <div style={{ padding:"0 24px 70px", maxWidth:"880px", margin:"0 auto" }}>
        <div style={{ position:"relative", borderRadius:"14px", overflow:"hidden" }}>
          <div className="pg" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"3px" }}>
            {SEEDS.slice(0, 6).map(p => (
              <div key={p.id} style={{ aspectRatio:"1", backgroundImage:`url(${p.url})`, backgroundSize:"cover", backgroundPosition:"center", filter:"blur(16px)", transform:"scale(1.1)" }}/>
            ))}
          </div>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(8,8,8,0.7)" }}>
            <div style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:"50%", width:"56px", height:"56px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"11px" }}>
              <Lock size={21} color="#C9A84C"/>
            </div>
            <p style={{ fontFamily:serif, fontSize:"19px", fontWeight:400, marginBottom:"5px" }}>{posts.length}+ Premium Posts</p>
            <p style={{ color:"#4a4a4a", fontSize:"13px", marginBottom:"18px" }}>Subscribe to unlock all content</p>
            <button onClick={() => setPage("payment")} className="gld"
              style={{ background:gold, color:"#080808", border:"none", borderRadius:"100px", padding:"12px 28px", fontWeight:700, fontSize:"13px", cursor:"pointer" }}>
              Unlock for ₹{CFG.price.toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)", padding:"22px", textAlign:"center", color:"#242424", fontSize:"12px" }}>
        <div style={{ fontFamily:serif, fontSize:"15px", color:"#C9A84C", marginBottom:"5px", letterSpacing:"4px" }}>{CFG.siteName}</div>
        © 2025 {CFG.creatorName}
      </div>
    </div>
  );

  // ══════════════════════════════════════
  //  CREATOR LOGIN
  // ══════════════════════════════════════
  if (page === "creator-login") return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#F5F0E8", fontFamily:sans, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"15px 22px", display:"flex", alignItems:"center", gap:"11px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={() => setPage("landing")} className="hvr"
          style={{ background:"rgba(255,255,255,0.05)", border:"none", borderRadius:"50%", width:"33px", height:"33px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#777", transition:"background 0.18s" }}>
          <ChevronLeft size={16}/>
        </button>
        <span style={{ fontFamily:serif, fontSize:"17px", letterSpacing:"4px", color:"#C9A84C" }}>{CFG.siteName}</span>
      </div>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 20px" }}>
        <div style={{ width:"100%", maxWidth:"390px", animation:"scaleIn 0.4s ease" }}>
          <div style={{ textAlign:"center", marginBottom:"26px" }}>
            <div style={{ width:"58px", height:"58px", borderRadius:"50%", background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.26)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", animation:"glowPulse 2.5s ease infinite" }}>
              <Shield size={22} color="#C9A84C"/>
            </div>
            <h2 style={{ fontFamily:serif, fontSize:"28px", fontWeight:300, marginBottom:"5px" }}>Creator Access</h2>
            <p style={{ color:"#4a4a4a", fontSize:"13px" }}>Sign in to manage your content</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"14px" }}>
            <div>
              <label style={{ display:"block", color:"#444", fontSize:"10px", fontWeight:500, letterSpacing:"1px", textTransform:"uppercase", marginBottom:"5px" }}>Username</label>
              <div style={{ position:"relative" }}>
                <User size={13} style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"#3a3a3a", pointerEvents:"none" }}/>
                <input value={cUser} onChange={e => { setCUser(e.target.value); setCErr(""); }}
                  onKeyDown={e => e.key === "Enter" && creatorLogin()} placeholder="Enter username"
                  style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${cErr?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.09)"}`, borderRadius:"11px", padding:"13px 14px 13px 36px", color:"#F5F0E8", fontSize:"14px" }}/>
              </div>
            </div>
            <div>
              <label style={{ display:"block", color:"#444", fontSize:"10px", fontWeight:500, letterSpacing:"1px", textTransform:"uppercase", marginBottom:"5px" }}>Password</label>
              <div style={{ position:"relative" }}>
                <Key size={13} style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"#3a3a3a", pointerEvents:"none" }}/>
                <input value={cPass} onChange={e => { setCPass(e.target.value); setCErr(""); }}
                  onKeyDown={e => e.key === "Enter" && creatorLogin()} type={cVis ? "text" : "password"} placeholder="Enter password"
                  style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${cErr?"rgba(239,68,68,0.45)":"rgba(255,255,255,0.09)"}`, borderRadius:"11px", padding:"13px 42px 13px 36px", color:"#F5F0E8", fontSize:"14px" }}/>
                <button onClick={() => setCVis(p => !p)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#555", display:"flex" }}>
                  {cVis ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
              </div>
            </div>
          </div>

          {cErr && <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)", borderRadius:"8px", padding:"9px 13px", color:"#f87171", fontSize:"13px", marginBottom:"12px" }}>{cErr}</div>}

          <button onClick={creatorLogin} className="gld"
            style={{ width:"100%", background:gold, color:"#080808", border:"none", borderRadius:"11px", padding:"14px", fontWeight:700, fontSize:"15px", cursor:"pointer" }}>
            Sign In as Creator →
          </button>

          <div style={{ textAlign:"center", marginTop:"16px" }}>
            <span style={{ color:"#3a3a3a", fontSize:"13px" }}>Not a creator? </span>
            <button onClick={() => setPage("payment")} style={{ background:"none", border:"none", color:"#C9A84C", cursor:"pointer", fontSize:"13px", fontWeight:500, fontFamily:sans }}>
              Subscribe for access
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  //  PAYMENT PAGE
  // ══════════════════════════════════════
  if (page === "payment") {

    // Enter access code screen
    if (pStep === "entercode") return (
      <div style={{ minHeight:"100vh", background:"#080808", display:"flex", flexDirection:"column", fontFamily:sans, color:"#F5F0E8" }}>
        <div style={{ padding:"13px 18px", display:"flex", alignItems:"center", gap:"10px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setPStep("idle")}
            style={{ background:"rgba(255,255,255,0.05)", border:"none", borderRadius:"50%", width:"31px", height:"31px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#777" }}>
            <ChevronLeft size={15}/>
          </button>
          <span style={{ fontFamily:serif, fontSize:"16px", letterSpacing:"4px", color:"#C9A84C" }}>{CFG.siteName}</span>
        </div>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
          <div style={{ textAlign:"center", maxWidth:"380px", width:"100%", animation:"fadeUp 0.5s ease" }}>
            <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"26px" }}>
              🔑
            </div>
            <h2 style={{ fontFamily:serif, fontSize:"30px", fontWeight:300, marginBottom:"8px" }}>Enter Access Code</h2>
            <p style={{ color:"#555", fontSize:"13px", lineHeight:1.8, marginBottom:"28px" }}>
              After paying ₹{CFG.price.toLocaleString()}, contact the creator to receive your access code.<br/>
              <span style={{ color:"#C9A84C" }}>Your access is lifetime once unlocked.</span>
            </p>
            <input
              value={codeInput}
              onChange={e => { setCodeInput(e.target.value); setCodeErr(""); }}
              onKeyDown={e => e.key === "Enter" && verifyCode()}
              placeholder="Enter your access code"
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${codeErr?"rgba(239,68,68,0.45)":"rgba(201,168,76,0.25)"}`, borderRadius:"10px", padding:"14px", color:"#F5F0E8", fontSize:"16px", textAlign:"center", letterSpacing:"3px", marginBottom:"10px" }}/>
            {codeErr && <p style={{ color:"#f87171", fontSize:"12px", marginBottom:"10px" }}>{codeErr}</p>}
            <button onClick={verifyCode} disabled={!codeInput} className="gld"
              style={{ width:"100%", background:codeInput?gold:"rgba(255,255,255,0.06)", color:codeInput?"#080808":"#2e2e2e", border:"none", borderRadius:"10px", padding:"15px", fontWeight:700, fontSize:"15px", cursor:codeInput?"pointer":"not-allowed", fontFamily:sans }}>
              Unlock Lifetime Access →
            </button>
            <p style={{ color:"#2e2e2e", fontSize:"11px", marginTop:"12px" }}>Already have a code? Enter it above ↑</p>
          </div>
        </div>
      </div>
    );

    // Success screen
    if (pStep === "success") return (
      <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:sans, color:"#F5F0E8", padding:"24px" }}>
        <div style={{ textAlign:"center", animation:"fadeUp 0.6s ease", maxWidth:"360px" }}>
          <div style={{ width:"76px", height:"76px", borderRadius:"50%", background:gold, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:"0 0 65px rgba(201,168,76,0.28)" }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <path d="M6 17l8 8 14-14" stroke="#080808" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily:serif, fontSize:"36px", fontWeight:300, marginBottom:"9px" }}>Welcome aboard!</h2>
          <p style={{ color:"#555", marginBottom:"28px", fontSize:"14px" }}>You now have lifetime premium access 🎉</p>
          <button onClick={() => { setPage("feed"); setPStep("idle"); }} className="gld"
            style={{ background:gold, color:"#080808", border:"none", borderRadius:"100px", padding:"14px 40px", fontWeight:700, fontSize:"14px", cursor:"pointer" }}>
            View Content →
          </button>
        </div>
      </div>
    );

    // Main payment form
    return (
      <div style={{ minHeight:"100vh", background:"#080808", color:"#F5F0E8", fontFamily:sans }}>
        <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:"11px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setPage("landing")} className="hvr"
            style={{ background:"rgba(255,255,255,0.05)", border:"none", borderRadius:"50%", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#777", transition:"background 0.18s" }}>
            <ChevronLeft size={16}/>
          </button>
          <span style={{ fontFamily:serif, fontSize:"17px", letterSpacing:"4px", color:"#C9A84C" }}>{CFG.siteName}</span>
        </div>

        <div style={{ maxWidth:"440px", margin:"0 auto", padding:"28px 20px" }}>
          {/* amount card */}
          <div style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.09),rgba(201,168,76,0.02))", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"14px", padding:"20px", marginBottom:"22px", textAlign:"center" }}>
            <div style={{ color:"#C9A84C", fontSize:"10px", fontWeight:600, letterSpacing:"2.5px", marginBottom:"5px" }}>PREMIUM ACCESS</div>
            <div style={{ fontFamily:serif, fontSize:"46px", fontWeight:300, lineHeight:1 }}>₹{CFG.price.toLocaleString()}</div>
            <div style={{ color:"#3a3a3a", fontSize:"13px", marginTop:"5px" }}>One-time · Lifetime access</div>
          </div>

          {/* UPI / Card tabs */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px", marginBottom:"20px", background:"rgba(255,255,255,0.04)", padding:"4px", borderRadius:"12px" }}>
            {[["upi","📱 UPI"],["card","💳 Card"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight:500, fontSize:"12px", transition:"all 0.2s", background:tab===id?gold:"transparent", color:tab===id?"#080808":"#555", fontFamily:sans }}>
                {label} Payment
              </button>
            ))}
          </div>

          {/* UPI tab */}
          {tab === "upi" && (
            <div style={{ animation:"fadeUp 0.25s ease" }}>
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"13px", padding:"20px", marginBottom:"11px", display:"flex", flexDirection:"column", alignItems:"center", gap:"15px" }}>
                <div style={{ background:"#fff", padding:"9px", borderRadius:"9px", lineHeight:0 }}>
                  <img src={UPI_QR} alt="UPI QR Code" width={198} height={198}/>
                </div>
                <div style={{ textAlign:"center", width:"100%" }}>
                  <div style={{ color:"#3a3a3a", fontSize:"11px", marginBottom:"6px" }}>Or pay to UPI ID directly</div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:"9px", background:"rgba(255,255,255,0.05)", borderRadius:"8px", padding:"9px 14px" }}>
                    <span style={{ fontFamily:"monospace", fontSize:"13px", color:"#C9A84C", fontWeight:500 }}>{CFG.upiId}</span>
                    <button onClick={() => { try { navigator.clipboard.writeText(CFG.upiId); } catch {} setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ background:"none", border:"none", cursor:"pointer", color:copied?"#4ade80":"#444", display:"flex" }}>
                      {copied ? <Check size={13}/> : <Copy size={13}/>}
                    </button>
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:"9px", padding:"12px", width:"100%" }}>
                  {[
                    `Open GPay, PhonePe, or Paytm`,
                    `Scan QR — ₹${CFG.price.toLocaleString()} is pre-filled`,
                    `Complete the payment`,
                    `Click "I've Paid" and enter the access code you receive`,
                  ].map((s, i) => (
                    <div key={i} style={{ display:"flex", gap:"8px", marginBottom:i<3?"8px":0, alignItems:"flex-start" }}>
                      <div style={{ width:"17px", height:"17px", borderRadius:"50%", background:"rgba(201,168,76,0.14)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"9px", color:"#C9A84C", fontWeight:700 }}>{i+1}</div>
                      <span style={{ color:"#666", fontSize:"12px", lineHeight:1.55 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={doUPI} className="gld"
                style={{ width:"100%", background:gold, color:"#080808", border:"none", borderRadius:"11px", padding:"14px", fontWeight:700, fontSize:"14px", cursor:"pointer" }}>
                ✓  I've Paid — Enter Access Code
              </button>
            </div>
          )}

          {/* Card tab */}
          {tab === "card" && (
            <div style={{ animation:"fadeUp 0.25s ease" }}>
              <div style={{ background:"linear-gradient(145deg,#151515,#1e1e1e)", borderRadius:"13px", padding:"19px", marginBottom:"16px", position:"relative", overflow:"hidden", minHeight:"142px" }}>
                <div style={{ position:"absolute", top:"-18px", right:"-18px", width:"110px", height:"110px", borderRadius:"50%", background:"rgba(201,168,76,0.06)" }}/>
                <Crown size={15} color="#C9A84C" style={{ marginBottom:"14px" }}/>
                <div style={{ fontFamily:"monospace", fontSize:"14px", letterSpacing:"2px", marginBottom:"14px", color:"#F5F0E8" }}>{card.num || "•••• •••• •••• ••••"}</div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ color:"#3a3a3a", fontSize:"8px", letterSpacing:"1px", marginBottom:"2px" }}>CARDHOLDER</div>
                    <div style={{ fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.6px", color:"#bbb" }}>{card.name || "YOUR NAME"}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:"#3a3a3a", fontSize:"8px", letterSpacing:"1px", marginBottom:"2px" }}>EXPIRES</div>
                    <div style={{ fontSize:"11px", color:"#bbb" }}>{card.exp || "MM/YY"}</div>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"12px" }}>
                {[
                  { l:"Card Number",     k:"num",  ph:"1234 5678 9012 3456", f:fmtC, t:"text" },
                  { l:"Cardholder Name", k:"name", ph:"Your Full Name",       f:v=>v, t:"text" },
                ].map(x => (
                  <div key={x.k}>
                    <label style={{ display:"block", color:"#3a3a3a", fontSize:"9px", fontWeight:500, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:"4px" }}>{x.l}</label>
                    <input value={card[x.k]} onChange={e => setCard(p => ({ ...p, [x.k]: x.f(e.target.value) }))} placeholder={x.ph} type={x.t}
                      style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"9px", padding:"11px 13px", color:"#F5F0E8", fontSize:"13px" }}/>
                  </div>
                ))}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  {[
                    { l:"Expiry", k:"exp", ph:"MM/YY", f:fmtE,                              t:"text" },
                    { l:"CVV",    k:"cvv", ph:"• • •",  f:v=>v.replace(/\D/g,"").slice(0,4), t:"password" },
                  ].map(x => (
                    <div key={x.k}>
                      <label style={{ display:"block", color:"#3a3a3a", fontSize:"9px", fontWeight:500, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:"4px" }}>{x.l}</label>
                      <input value={card[x.k]} onChange={e => setCard(p => ({ ...p, [x.k]: x.f(e.target.value) }))} placeholder={x.ph} type={x.t}
                        style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"9px", padding:"11px 13px", color:"#F5F0E8", fontSize:"13px" }}/>
                    </div>
                  ))}
                </div>
              </div>
              {(() => {
                const ok = card.num && card.exp && card.cvv && card.name;
                return (
                  <button onClick={doCard} disabled={!ok} className="gld"
                    style={{ width:"100%", background:ok?gold:"rgba(255,255,255,0.06)", color:ok?"#080808":"#2e2e2e", border:"none", borderRadius:"11px", padding:"14px", fontWeight:700, fontSize:"14px", cursor:ok?"pointer":"not-allowed" }}>
                    Pay ₹{CFG.price.toLocaleString()} →
                  </button>
                );
              })()}
              <p style={{ textAlign:"center", color:"#222", fontSize:"10px", marginTop:"9px" }}>🔒 Integrate Razorpay for live card payments</p>
            </div>
          )}

          <div style={{ textAlign:"center", marginTop:"16px" }}>
            <span style={{ color:"#2e2e2e", fontSize:"12px" }}>Are you the creator? </span>
            <button onClick={() => setPage("creator-login")} style={{ background:"none", border:"none", color:"#C9A84C", cursor:"pointer", fontSize:"12px", fontWeight:500, fontFamily:sans }}>
              Login here
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════
  //  FEED (creator or subscriber)
  // ══════════════════════════════════════
  const isCreator = role === "creator";

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#F5F0E8", fontFamily:sans, paddingBottom:"50px" }}>

      {/* sticky header */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(8,8,8,0.97)", backdropFilter:"blur(22px)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"0 18px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"54px" }}>
        <span style={{ fontFamily:serif, fontSize:"18px", fontWeight:600, letterSpacing:"4px", color:"#C9A84C" }}>{CFG.siteName}</span>
        <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"5px", background:isCreator?"rgba(255,255,255,0.05)":"rgba(201,168,76,0.09)", border:isCreator?"1px solid rgba(255,255,255,0.09)":"1px solid rgba(201,168,76,0.2)", borderRadius:"100px", padding:"5px 11px" }}>
            {isCreator ? <Shield size={10} color="#888"/> : <Crown size={10} color="#C9A84C"/>}
            <span style={{ fontSize:"10px", fontWeight:600, letterSpacing:"0.4px", color:isCreator?"#888":"#C9A84C" }}>{isCreator ? "Creator" : "Premium"}</span>
          </div>
          {isCreator && (
            <button onClick={() => setAdminOpen(true)} className="hvr"
              style={{ background:"rgba(201,168,76,0.09)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"7px", padding:"6px 11px", color:"#C9A84C", cursor:"pointer", fontSize:"11px", fontWeight:500, display:"flex", alignItems:"center", gap:"5px", fontFamily:sans, transition:"background 0.18s" }}>
              <Plus size={11}/> New Post
            </button>
          )}
          <button onClick={logout} className="hvr" title="Sign out"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"7px", padding:"6px 9px", cursor:"pointer", color:"#555", display:"flex", alignItems:"center", transition:"background 0.18s" }}>
            <LogOut size={13}/>
          </button>
        </div>
      </div>

      {/* profile */}
      <div style={{ maxWidth:"580px", margin:"0 auto", padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center", gap:"13px" }}>
        <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"19px", flexShrink:0, boxShadow:"0 0 0 3px #080808,0 0 0 5px rgba(201,168,76,0.38)" }}>✨</div>
        <div>
          <div style={{ fontWeight:600, fontSize:"14px", marginBottom:"2px" }}>{CFG.creatorName}</div>
          <div style={{ color:"#3a3a3a", fontSize:"11px", marginBottom:"8px" }}>{CFG.bio}</div>
          <div style={{ display:"flex", gap:"18px" }}>
            {[["Posts", posts.length], ["Access", isCreator?"Owner":"∞"], ["Tier", isCreator?"Creator":"Premium"]].map(([k, v], i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontWeight:700, fontSize:"13px", color:k==="Tier"?"#C9A84C":undefined }}>{v}</div>
                <div style={{ color:"#2e2e2e", fontSize:"9px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* posts grid */}
      <div style={{ maxWidth:"880px", margin:"0 auto" }}>
        {posts.length === 0
          ? <div style={{ textAlign:"center", padding:"70px 24px", color:"#2e2e2e" }}><div style={{ fontSize:"36px", marginBottom:"11px" }}>📸</div><p style={{ fontSize:"13px" }}>No posts yet.</p></div>
          : (
            <div className="pg" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"3px", padding:"3px" }}>
              {posts.map(post => (
                <div key={post.id} className="cell" onClick={() => setOpenPost(post)} style={{ aspectRatio:"1", position:"relative", cursor:"pointer", overflow:"hidden", background:"#0e0e0e" }}>
                  {post.type === "video"
                    ? <video src={post.url} style={{ width:"100%", height:"100%", objectFit:"cover" }} muted playsInline/>
                    : <img src={post.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy"/>
                  }
                  <div className="hov" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", opacity:0, transition:"opacity 0.2s" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:"4px", color:"#fff", fontWeight:600, fontSize:"12px" }}><Heart size={14} fill="#fff"/> {fmt(post.likes)}</span>
                    <span style={{ display:"flex", alignItems:"center", gap:"4px", color:"#fff", fontWeight:600, fontSize:"12px" }}><MessageCircle size={14} fill="#fff"/> {fmt(post.comments)}</span>
                  </div>
                  {post.type === "video" && <div style={{ position:"absolute", top:"6px", right:"6px" }}><Play size={11} fill="#fff" color="#fff"/></div>}
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* post modal */}
      {openPost && (
        <div onClick={() => setOpenPost(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"10px" }}>
          <div onClick={e => e.stopPropagation()} className="mi" style={{ background:"#111", borderRadius:"13px", overflow:"hidden", maxWidth:"840px", width:"100%", display:"flex", maxHeight:"92vh", animation:"scaleIn 0.22s ease" }}>
            <div className="mm" style={{ flex:"1 1 280px", minHeight:"320px", background:"#000", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              {openPost.type === "video"
                ? <video src={openPost.url} controls autoPlay style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <img src={openPost.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              }
            </div>
            <div className="ms" style={{ flex:"0 0 270px", display:"flex", flexDirection:"column", overflow:"auto" }}>
              <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px" }}>✨</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:"12px" }}>{CFG.creatorName}</div>
                    <div style={{ color:"#2e2e2e", fontSize:"10px" }}>{openPost.time} ago</div>
                  </div>
                </div>
                <button onClick={() => setOpenPost(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#444", display:"flex" }}><X size={15}/></button>
              </div>
              <div style={{ padding:"12px 14px", flex:1, overflowY:"auto" }}>
                <p style={{ color:"#aaa", fontSize:"13px", lineHeight:1.65 }}>
                  <strong style={{ color:"#F5F0E8" }}>{CFG.creatorName} </strong>{openPost.caption}
                </p>
              </div>
              <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display:"flex", gap:"12px" }}>
                  <button onClick={() => toggleLike(openPost.id)}
                    style={{ background:"none", border:"none", cursor:"pointer", color:liked.has(openPost.id)?"#ef4444":"#F5F0E8", display:"flex", alignItems:"center", gap:"5px", fontSize:"12px", fontWeight:500, fontFamily:sans }}>
                    <Heart size={18} fill={liked.has(openPost.id)?"#ef4444":"none"}/> {fmt(openPost.likes)}
                  </button>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", color:"#444", fontSize:"12px" }}>
                    <MessageCircle size={18}/> {fmt(openPost.comments)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* admin panel — creator only */}
      {adminOpen && isCreator && (
        <div onClick={() => { setAdminOpen(false); setAddOpen(false); }} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#141414", borderRadius:"14px", width:"100%", maxWidth:"400px", padding:"20px", animation:"scaleIn 0.26s ease", maxHeight:"88vh", overflow:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <h3 style={{ fontFamily:serif, fontSize:"19px", fontWeight:400 }}>Manage Posts</h3>
              <button onClick={() => { setAdminOpen(false); setAddOpen(false); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#444", display:"flex" }}><X size={16}/></button>
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
              <span style={{ color:"#3a3a3a", fontSize:"12px" }}>{posts.length} posts</span>
              <button onClick={() => setAddOpen(p => !p)} className="hvr"
                style={{ display:"flex", alignItems:"center", gap:"5px", background:"rgba(201,168,76,0.09)", border:"1px solid rgba(201,168,76,0.22)", borderRadius:"7px", padding:"6px 12px", color:"#C9A84C", cursor:"pointer", fontSize:"12px", fontWeight:500, fontFamily:sans, transition:"background 0.18s" }}>
                <Plus size={11}/> New Post
              </button>
            </div>

            {addOpen && (
              <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"10px", padding:"13px", marginBottom:"11px", animation:"fadeUp 0.2s ease" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px", marginBottom:"9px" }}>
                  {["image","video"].map(t => (
                    <button key={t} onClick={() => setNewPost(p => ({ ...p, type:t }))}
                      style={{ padding:"7px", borderRadius:"7px", border:"none", cursor:"pointer", fontFamily:sans, fontSize:"11px", fontWeight:500, background:newPost.type===t?"rgba(201,168,76,0.15)":"rgba(255,255,255,0.04)", color:newPost.type===t?"#C9A84C":"#555" }}>
                      {t==="image" ? "📸 Image" : "🎬 Video"}
                    </button>
                  ))}
                </div>
                {[{ l:"URL", k:"url", ph:"https://…" },{ l:"Caption", k:"caption", ph:"Write a caption…" }].map(f => (
                  <div key={f.k} style={{ marginBottom:"8px" }}>
                    <label style={{ display:"block", color:"#3a3a3a", fontSize:"9px", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:"3px" }}>{f.l}</label>
                    <input value={newPost[f.k]} onChange={e => setNewPost(p => ({ ...p, [f.k]:e.target.value }))} placeholder={f.ph}
                      style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"8px", padding:"9px 11px", color:"#F5F0E8", fontSize:"12px" }}/>
                  </div>
                ))}
                <button onClick={addPost} disabled={saving || !newPost.url} className="gld"
                  style={{ width:"100%", background:newPost.url?gold:"rgba(255,255,255,0.05)", color:newPost.url?"#080808":"#2e2e2e", border:"none", borderRadius:"8px", padding:"10px", fontWeight:700, fontSize:"12px", cursor:newPost.url?"pointer":"not-allowed", fontFamily:sans }}>
                  {saving ? "Publishing…" : "Publish Post"}
                </button>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"5px", maxHeight:"280px", overflowY:"auto" }}>
              {posts.map(p => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"9px", background:"rgba(255,255,255,0.03)", borderRadius:"9px", padding:"8px 10px" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"6px", backgroundImage:`url(${p.url})`, backgroundSize:"cover", backgroundPosition:"center", flexShrink:0, background:"#1a1a1a" }}/>
                  <div style={{ flex:1, overflow:"hidden" }}>
                    <div style={{ fontSize:"11px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:"#aaa" }}>{p.caption || "(No caption)"}</div>
                    <div style={{ fontSize:"9px", color:"#2e2e2e", marginTop:"2px" }}>{p.type} · {p.time} · ♥ {fmt(p.likes)}</div>
                  </div>
                  <button onClick={() => savePosts(posts.filter(x => x.id !== p.id))} style={{ background:"none", border:"none", cursor:"pointer", color:"#333", padding:"2px", display:"flex", flexShrink:0 }}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
