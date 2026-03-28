import { useState } from "react";

const G = "#a8ff3e";
const BK = "#0a0a0a";
const BK2 = "#111111";
const BK3 = "#1a1a1a";
const BK4 = "#222222";

const PRODUCTS = [
  { id: "term", icon: "→", name: "Term Loan", range: "$10K – $500K", term: "3–24 months", desc: "Fixed payments, ideal for one-time investments like hiring, expansion, or equipment." },
  { id: "loc", icon: "⟳", name: "Line of Credit", range: "$10K – $5M", term: "Revolving", desc: "Draw only what you need and repay as you go. Your limit replenishes automatically." },
  { id: "mca", icon: "⚡", name: "Revenue Advance", range: "$5K – $500K", term: "Daily repayment", desc: "Based on your monthly revenue. Fastest approval, funded as soon as today." },
  { id: "equip", icon: "⚙", name: "Equipment Financing", range: "$5K – $2M", term: "Up to 60 months", desc: "Finance the equipment your business needs. Equipment serves as its own collateral." },
];

const STATS = [["$750M+","Funded"], ["8,200+","Businesses"], ["2 hrs","Avg Decision"], ["4.9★","Rating"]];

const REVIEWS = [
  { name: "Marcus T.", biz: "Logistics, Texas", text: "Applied at 9am, approved by noon, funded next morning. Zero phone calls. This is how lending should work.", stars: 5 },
  { name: "Priya S.", biz: "Med Spa, California", text: "The app showed me exactly where my application was at every step. No chasing anyone down. Total transparency.", stars: 5 },
  { name: "Darnell R.", biz: "Construction, Georgia", text: "Got a $200K line of credit. Saw every term clearly before I signed. No surprises. I knew exactly what I agreed to.", stars: 5 },
];

const FAQS = [
  ["How long does approval take?","Most decisions come within 2–4 hours during business hours. Once approved, funds can hit your account the same day or next business day."],
  ["Will applying hurt my credit?","Our initial review uses a soft pull — zero impact to your score. A hard pull only happens if you choose to accept an offer."],
  ["What documents do I need?","Just basic business info. Your bank connects automatically via Plaid — no emailing statements ever."],
  ["Do I need to get on the phone?","Never. Everything happens in the app. Apply, track status, review offers, accept or decline — all on your phone."],
  ["What are the minimum requirements?","6+ months in business, $10K+ monthly revenue, 580+ credit score. We evaluate your full business health, not just a number."],
];

const APPS_DATA = [
  { id:"APP-2041", product:"Term Loan", amount:150000, submitted:"Mar 20, 2026", updated:"2 hrs ago", status:"approved", offer:{ amount:145000, term:"18 months", payment:8055, freq:"Monthly", rate:"1.22 factor", expires:"Apr 4, 2026" } },
  { id:"APP-2038", product:"Line of Credit", amount:75000, submitted:"Mar 15, 2026", updated:"3 days ago", status:"under_review", offer:null },
  { id:"APP-2031", product:"Revenue Advance", amount:30000, submitted:"Mar 1, 2026", updated:"Mar 5, 2026", status:"declined", offer:null, reason:"Insufficient monthly revenue for requested amount. Reduce to $15K or reapply in 60 days." },
];

const LOANS_DATA = [
  { id:"LN-10042", product:"Term Loan", original:150000, balance:84200, paid:65800, payment:6250, freq:"Monthly", nextDue:"Apr 1, 2026", rate:"1.18 factor", status:"current", progress:44, color:"#3b82f6" },
  { id:"LN-10089", product:"Line of Credit", original:75000, balance:31500, paid:43500, payment:875, freq:"Weekly", nextDue:"Mar 28, 2026", rate:"24% APR", status:"current", progress:58, color:"#a8ff3e" },
];

const OFFERS_DATA = [
  { id:"OFF-2041", product:"Term Loan", amount:145000, term:"18 months", payment:8055, freq:"Monthly", rate:"1.22 factor", expires:"Apr 4, 2026", status:"pending" },
  { id:"OFF-RNW", product:"Renewal — LN-10042", amount:200000, term:"24 months", payment:9166, freq:"Monthly", rate:"1.19 factor", expires:"Apr 15, 2026", status:"pending" },
];

const MSGS_DATA = [
  { id:1, from:"advisor", text:"Hey! APP-2041 has been approved. Check your Offers tab to review and accept. No call needed.", time:"2h ago" },
  { id:2, from:"advisor", text:"Your Line of Credit is still under review — expect a decision within 24 hours.", time:"3d ago" },
  { id:3, from:"client", text:"Sounds good. Do you need any extra docs for the LOC?", time:"3d ago" },
  { id:4, from:"advisor", text:"Your bank is connected via Plaid so we're all set — no extra docs needed!", time:"3d ago" },
];

const ADMIN_APPS = [
  { id:1, biz:"Sunrise Trucking LLC", owner:"Marcus Johnson", product:"Term Loan", amount:"$150,000", rev:"$45K/mo", credit:"680", status:"Approved", date:"2026-03-20" },
  { id:2, biz:"Bay Area Bakery", owner:"Sofia Reyes", product:"Line of Credit", amount:"$75,000", rev:"$22K/mo", credit:"710", status:"Under Review", date:"2026-03-21" },
  { id:3, biz:"Peak Fitness Studio", owner:"Derek Wills", product:"Equipment", amount:"$80,000", rev:"$31K/mo", credit:"640", status:"Pending Docs", date:"2026-03-22" },
  { id:4, biz:"Metro Dental Group", owner:"Linda Park", product:"Term Loan", amount:"$500,000", rev:"$120K/mo", credit:"760", status:"Funded", date:"2026-03-18" },
  { id:5, biz:"Urban Cuts Barbershop", owner:"Jamal Thompson", product:"Revenue Advance", amount:"$18,000", rev:"$14K/mo", credit:"595", status:"Funded", date:"2026-03-15" },
];

const STATUS_STYLE = {
  "Approved":{ bg:"#dcfce7", c:"#16a34a" },
  "Funded":{ bg:"#dbeafe", c:"#2563eb" },
  "Under Review":{ bg:"#fef3c7", c:"#d97706" },
  "Pending Docs":{ bg:"#fff7ed", c:"#ea580c" },
  "Declined":{ bg:"#fee2e2", c:"#dc2626" },
};

const APP_STATUS = {
  approved:{ label:"Approved ✓", bg:"#dcfce7", c:"#16a34a" },
  under_review:{ label:"Under Review", bg:"#fef3c7", c:"#d97706" },
  declined:{ label:"Declined", bg:"#fee2e2", c:"#dc2626" },
};

const fmt = n => "$" + Number(n).toLocaleString();

export default function Aprovuit() {
  const [view, setView] = useState("landing");
  const [faqOpen, setFaqOpen] = useState(null);

  const [appTab, setAppTab] = useState("home");
  const [sheet, setSheet] = useState(null);
  const [offers, setOffers] = useState(OFFERS_DATA);
  const [apps, setApps] = useState(APPS_DATA);
  const [msgs, setMsgs] = useState(MSGS_DATA);
  const [msgTxt, setMsgTxt] = useState("");
  const [applyStep, setApplyStep] = useState(0);
  const [applyForm, setApplyForm] = useState({ product:"", amount:"" });
  const [applyDone, setApplyDone] = useState(false);

  const [adminApps, setAdminApps] = useState(ADMIN_APPS);
  const [drawer, setDrawer] = useState(null);
  const [adminTab, setAdminTab] = useState("apps");

  const pendingOffers = offers.filter(o => o.status === "pending").length;

  const sendMsg = () => {
    if (!msgTxt.trim()) return;
    setMsgs(p => [...p, { id: Date.now(), from:"client", text: msgTxt, time:"Just now" }]);
    setMsgTxt("");
    setTimeout(() => setMsgs(p => [...p, { id: Date.now()+1, from:"advisor", text:"Got it! I'll look into that right away.", time:"Just now" }]), 1500);
  };

  const submitApp = () => {
    setApps(p => [{ id:`APP-${2060+p.length}`, product:applyForm.product, amount:Number(applyForm.amount), submitted:"Today", updated:"Just now", status:"under_review", offer:null }, ...p]);
    setApplyDone(true);
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Barlow+Condensed:wght@500;600;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html { scroll-behavior:smooth; }
    :root { --g:${G}; --bk:${BK}; --bk2:${BK2}; --bk3:${BK3}; --bk4:${BK4}; }
    body { background:var(--bk); color:#fff; font-family:'DM Sans',sans-serif; }
    ::selection { background:var(--g); color:#000; }
    .cond { font-family:'Barlow Condensed',sans-serif; }
    .bar { font-family:'Barlow',sans-serif; }
    .dm { font-family:'DM Sans',sans-serif; }
    .nav-link { font-size:14px; font-weight:500; color:rgba(255,255,255,0.6); cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color 0.2s; }
    .nav-link:hover { color:#fff; }
    .btn-g { display:inline-flex; align-items:center; gap:8px; background:var(--g); color:#000; border:none; padding:14px 32px; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; letter-spacing:0.01em; transition:all 0.18s; border-radius:3px; }
    .btn-g:hover { background:#c2ff52; transform:translateY(-1px); }
    .btn-dk { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); color:#fff; border:1px solid rgba(255,255,255,0.12); padding:13px 28px; font-size:15px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.18s; border-radius:3px; }
    .btn-dk:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.25); }
    .prod-card { background:var(--bk3); border:1px solid rgba(255,255,255,0.06); padding:32px; transition:all 0.2s; cursor:default; border-radius:4px; }
    .prod-card:hover { border-color:var(--g); transform:translateY(-2px); }
    .faq-btn { width:100%; background:none; border:none; color:#fff; display:flex; justify-content:space-between; align-items:center; padding:22px 0; cursor:pointer; text-align:left; font-family:'DM Sans',sans-serif; border-bottom:1px solid rgba(255,255,255,0.07); gap:16px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    .fu { animation:fadeUp 0.5s ease both; }
    .fu1 { animation-delay:0.1s; }
    .fu2 { animation-delay:0.2s; }
    .fu3 { animation-delay:0.3s; }
    @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    .tick { display:flex; animation:ticker 30s linear infinite; width:max-content; }
    .phone { width:393px; height:852px; background:#f2f2f7; border-radius:52px; overflow:hidden; position:relative; box-shadow:0 60px 160px rgba(0,0,0,0.8),inset 0 0 0 1px rgba(255,255,255,0.1); display:flex; flex-direction:column; }
    .sb { height:54px; background:#fff; display:flex; align-items:flex-end; justify-content:space-between; padding:0 28px 10px; flex-shrink:0; }
    .scr { flex:1; overflow-y:auto; overflow-x:hidden; }
    .scr::-webkit-scrollbar { display:none; }
    .tb { background:rgba(255,255,255,0.94); backdrop-filter:blur(20px); border-top:0.5px solid rgba(0,0,0,0.1); height:83px; display:flex; align-items:flex-start; padding:10px 0 0; flex-shrink:0; }
    .tbi { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; background:none; border:none; cursor:pointer; position:relative; }
    .badge { position:absolute; top:-2px; right:22px; background:#ef4444; color:#fff; font-size:9px; font-weight:800; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
    .acard { background:#fff; border-radius:16px; margin:0 16px 12px; overflow:hidden; }
    .sl { font-size:20px; font-weight:800; color:#1c1c1e; margin:20px 16px 12px; letter-spacing:-0.4px; font-family:'DM Sans',sans-serif; }
    .row { display:flex; align-items:center; padding:13px 16px; border-bottom:0.5px solid #f2f2f7; gap:12px; }
    .row:last-child { border-bottom:none; }
    .pill { display:inline-flex; align-items:center; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; }
    .abtn { display:flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:14px; font-family:'DM Sans',sans-serif; font-weight:700; cursor:pointer; transition:all 0.15s; }
    .abtn:active { transform:scale(0.97); }
    .ov { position:absolute; inset:0; background:rgba(0,0,0,0.55); z-index:50; display:flex; flex-direction:column; justify-content:flex-end; border-radius:52px; overflow:hidden; }
    .sh { background:#fff; border-radius:24px 24px 0 0; padding:0 20px 36px; max-height:92%; overflow-y:auto; }
    .sh::-webkit-scrollbar { display:none; }
    .hdl { width:36px; height:4px; background:#d1d1d6; border-radius:2px; margin:12px auto 20px; }
    @keyframes sup { from{transform:translateY(100%)} to{transform:translateY(0)} }
    .slup { animation:sup 0.3s cubic-bezier(0.32,0.72,0,1) both; }
    @keyframes sfd { from{opacity:0} to{opacity:1} }
    .sfd { animation:sfd 0.2s ease both; }
    .opt { border:2px solid #e5e5ea; border-radius:14px; padding:14px; cursor:pointer; transition:all 0.15s; background:#fff; }
    .opt.sel { border-color:#1c1c1e; background:#f9f9f9; }
    .gtag { display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #bbf7d0; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:700; color:#16a34a; }
    .tbl-row:hover td { background:#f9f8f5; }
  `;

  // ── LANDING ──────────────────────────────────────────────────────
  if (view === "landing") return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:BK, color:"#fff", minHeight:"100vh" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
        <button onClick={()=>setView("landing")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:15, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000", letterSpacing:"-0.5px" }}>A</span>
          </div>
          <span className="cond" style={{ fontSize:22, fontWeight:800, letterSpacing:"0.02em", color:"#fff" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", gap:32, alignItems:"center" }}>
          {["Products","How It Works","FAQ"].map(l => <button key={l} className="nav-link" onClick={()=>document.getElementById(l.toLowerCase().replace(" ","-"))?.scrollIntoView({behavior:"smooth"})}>{l}</button>)}
          <button className="nav-link" onClick={()=>setView("admin")}>Partner Login</button>
          <button className="btn-g" style={{ padding:"10px 22px", fontSize:14 }} onClick={()=>setView("app")}>Open App →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:BK, minHeight:"90vh", display:"flex", alignItems:"center", padding:"80px 5%", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 20% 50%, ${G}14 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${G}08 0%, transparent 50%)`, pointerEvents:"none" }}></div>
        <div style={{ position:"absolute", top:0, right:0, width:"45%", height:"100%", backgroundImage:`repeating-linear-gradient(0deg, rgba(168,255,62,0.03) 0px, rgba(168,255,62,0.03) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(168,255,62,0.03) 0px, rgba(168,255,62,0.03) 1px, transparent 1px, transparent 60px)`, pointerEvents:"none" }}></div>
        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div className="fu">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,255,62,0.08)", border:`1px solid ${G}33`, padding:"6px 16px", borderRadius:20, marginBottom:28 }}>
              <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
              <span style={{ fontSize:12, color:G, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>No Phone Calls. Ever.</span>
            </div>
            <h1 className="cond" style={{ fontSize:"clamp(52px,7vw,88px)", fontWeight:900, lineHeight:0.92, marginBottom:28, letterSpacing:"-0.02em", textTransform:"uppercase" }}>
              APPROVE IT.<br />
              <span style={{ color:G }}>FUND IT.</span><br />
              TRACK IT.
            </h1>
            <p className="dm" style={{ fontSize:18, color:"rgba(255,255,255,0.55)", lineHeight:1.8, marginBottom:40, fontWeight:300, maxWidth:480 }}>
              Business funding that lives entirely in your phone. Apply with taps, track approvals in real time, accept offers, and manage every loan — without ever picking up the phone.
            </p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <button className="btn-g" style={{ fontSize:16, padding:"16px 40px" }} onClick={()=>setView("app")}>Try the App →</button>
              <button className="btn-dk" onClick={()=>document.getElementById("how-it-works")?.scrollIntoView({behavior:"smooth"})}>See How It Works</button>
            </div>
          </div>

          <div className="fu fu2" style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", inset:-20, background:`radial-gradient(circle, ${G}20 0%, transparent 70%)`, borderRadius:"50%", filter:"blur(20px)" }}></div>
              <div style={{ background:BK2, border:`1px solid ${G}30`, borderRadius:28, padding:24, width:300, position:"relative", zIndex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <span className="cond" style={{ fontSize:16, fontWeight:800, color:G, letterSpacing:"0.05em" }}>APROVUIT</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>9:41 AM</span>
                </div>
                {[
                  { label:"APP-2041 · Term Loan", status:"Approved ✓", statusColor:G, amt:"$150,000", sub:"Offer ready — tap to accept" },
                  { label:"APP-2038 · Line of Credit", status:"Under Review", statusColor:"#f59e0b", amt:"$75,000", sub:"Decision in ~24 hours" },
                  { label:"LN-10042 · Active Loan", status:"Current", statusColor:"#60a5fa", amt:"$84,200 left", sub:"44% paid off · Due Apr 1" },
                ].map((item, i) => (
                  <div key={i} style={{ background:BK3, borderRadius:12, padding:"14px 16px", marginBottom:10, border:`1px solid rgba(255,255,255,0.05)` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{item.label}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:item.statusColor }}>{item.status}</span>
                    </div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#fff", marginBottom:4, fontFamily:"'Barlow Condensed',sans-serif" }}>{item.amt}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{item.sub}</div>
                  </div>
                ))}
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <div style={{ flex:1, background:G, borderRadius:10, padding:"11px 0", textAlign:"center", fontSize:13, fontWeight:800, color:"#000" }}>Accept Offer ✓</div>
                  <div style={{ flex:1, background:BK3, borderRadius:10, padding:"11px 0", textAlign:"center", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.07)" }}>📵 No Calls</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:G, padding:"13px 0", overflow:"hidden" }}>
        <div className="tick">
          {[...Array(2)].map((_,ti) => (
            <span key={ti} style={{ display:"flex" }}>
              {["Apply in Minutes","No Phone Calls Required","Track Approvals in Real Time","Accept Offers in One Tap","Plaid Bank Integration","See Every Term Clearly","No Spam Callers","Funded Same Day","580+ Credit Score OK"].map(t => (
                <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:14, padding:"0 32px" }}>
                  <span style={{ fontSize:13, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#000", whiteSpace:"nowrap" }}>{t}</span>
                  <span style={{ color:"#000", opacity:0.3 }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ background:BK2, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"0 5%" }}>
          {STATS.map(([v,l],i) => (
            <div key={l} style={{ padding:"40px 0", textAlign:"center", borderRight: i<3?"1px solid rgba(255,255,255,0.06)":"none" }}>
              <div className="cond" style={{ fontSize:52, fontWeight:900, color:G, letterSpacing:"-0.02em", lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:8, fontWeight:500, letterSpacing:"0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:"96px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700 }}>Simple Process</p>
          <h2 className="cond" style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>Zero Phone Calls.<br />Total Transparency.</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {[
            ["01","Apply in Minutes","Tap through our smart application. No lengthy forms, no phone interviews. Takes under 5 minutes start to finish."],
            ["02","Track in Real Time","Watch your application status update live in the app. Approved, under review, or declined — you'll know instantly, not when someone calls you back."],
            ["03","Accept & Get Funded","Your offer appears in the app with every term laid out clearly. Accept or decline with one tap. Funds hit your account the same day."],
          ].map(([n,title,desc],i) => (
            <div key={n} style={{ background: i===1?G:BK3, color: i===1?"#000":"#fff", padding:"48px 40px", border:`1px solid ${i===1?G:"rgba(255,255,255,0.06)"}` }}>
              <div className="cond" style={{ fontSize:64, fontWeight:900, opacity:0.12, marginBottom:24, letterSpacing:"-0.04em" }}>{n}</div>
              <h3 className="cond" style={{ fontSize:26, fontWeight:800, textTransform:"uppercase", marginBottom:16 }}>{title}</h3>
              <p style={{ fontSize:15, lineHeight:1.8, opacity: i===1?0.7:0.5, fontWeight:300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" style={{ background:BK2, padding:"80px 5%", borderTop:`1px solid rgba(255,255,255,0.05)`, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:16 }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:12, fontWeight:700 }}>Funding Products</p>
              <h2 className="cond" style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>Every Type of Funding</h2>
            </div>
            <button className="btn-g" onClick={()=>setView("app")}>Apply Now →</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:2 }}>
            {PRODUCTS.map(p => (
              <div key={p.id} className="prod-card">
                <div style={{ fontSize:28, marginBottom:16, color:G }}>{p.icon}</div>
                <h3 className="cond" style={{ fontSize:26, fontWeight:800, textTransform:"uppercase", marginBottom:10 }}>{p.name}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.75, marginBottom:20, fontWeight:300 }}>{p.desc}</p>
                <div style={{ display:"flex", gap:24 }}>
                  <div><p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Amount</p><p style={{ fontSize:14, fontWeight:600, color:G }}>{p.range}</p></div>
                  <div><p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Term</p><p style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{p.term}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY APROVUIT */}
      <section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div>
            <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700 }}>Why Aprovuit</p>
            <h2 className="cond" style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:28 }}>You Deserve to Know Exactly What You Signed.</h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.85, fontWeight:300 }}>Most clients don't understand their own loan terms because the process happens over rushed phone calls. Aprovuit puts everything in writing, on your screen, before you tap Accept. Every term, every payment, every condition — crystal clear.</p>
          </div>
          <div style={{ display:"grid", gap:2 }}>
            {[
              ["📵","No Phone Calls","Apply, track, accept, and message your advisor entirely in the app. Block the spam callers forever."],
              ["🔍","Full Transparency","See exactly what you're approving before you sign. No surprises, no fine print buried in a phone call."],
              ["🏦","Plaid Connected","Link your bank once. We pull statements automatically — no more emailing PDFs every time you apply."],
              ["🔄","Renewals in the App","When you're eligible for renewal, it shows up in the app. Tap to start — no advisor cold call required."],
            ].map(([ic,title,desc]) => (
              <div key={title} style={{ background:BK3, border:`1px solid rgba(255,255,255,0.06)`, padding:"20px 24px", display:"flex", gap:16, alignItems:"flex-start" }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{ic}</span>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{title}</p>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.65, fontWeight:300 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background:BK2, padding:"80px 5%", borderTop:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700, textAlign:"center" }}>Real Results</p>
          <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:56 }}>Business Owners Trust Aprovuit</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
            {REVIEWS.map(r => (
              <div key={r.name} style={{ background:BK3, border:`1px solid rgba(255,255,255,0.06)`, padding:"36px 32px" }}>
                <div style={{ display:"flex", gap:3, marginBottom:20 }}>
                  {[...Array(r.stars)].map((_,i) => <span key={i} style={{ color:G, fontSize:16 }}>★</span>)}
                </div>
                <p style={{ fontSize:15, lineHeight:1.85, color:"rgba(255,255,255,0.6)", marginBottom:28, fontStyle:"italic", fontWeight:300 }}>"{r.text}"</p>
                <div style={{ borderTop:`1px solid rgba(255,255,255,0.07)`, paddingTop:18 }}>
                  <p style={{ fontWeight:700, fontSize:14 }}>{r.name}</p>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:3 }}>{r.biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding:"80px 5%", maxWidth:780, margin:"0 auto" }}>
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700, textAlign:"center" }}>FAQ</p>
        <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:48 }}>Common Questions</h2>
        {FAQS.map(([q,a],i) => (
          <div key={i}>
            <button className="faq-btn" onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
              <span className="bar" style={{ fontSize:17, fontWeight:600 }}>{q}</span>
              <span style={{ fontSize:22, color:"rgba(255,255,255,0.3)", flexShrink:0, transition:"transform 0.2s", transform:faqOpen===i?"rotate(45deg)":"none" }}>+</span>
            </button>
            {faqOpen===i && <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.85, paddingBottom:24, fontWeight:300, borderBottom:`1px solid rgba(255,255,255,0.07)` }}>{a}</p>}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ background:G, padding:"80px 5%", textAlign:"center" }}>
        <h2 className="cond" style={{ fontSize:"clamp(36px,6vw,72px)", fontWeight:900, color:"#000", textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:20 }}>Ready to Get Funded?</h2>
        <p style={{ fontSize:18, color:"rgba(0,0,0,0.6)", marginBottom:40, fontWeight:300 }}>Apply in minutes. No phone call. No commitment.</p>
        <button onClick={()=>setView("app")} style={{ background:"#000", color:G, border:"none", padding:"18px 56px", fontSize:18, fontWeight:800, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.04em", textTransform:"uppercase", borderRadius:3 }}>
          Open Aprovuit →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background:BK, borderTop:`1px solid rgba(255,255,255,0.05)`, padding:"48px 5% 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
            </div>
            <span className="cond" style={{ fontSize:20, fontWeight:800, letterSpacing:"0.02em" }}>APROVUIT</span>
          </div>
          <div style={{ display:"flex", gap:32 }}>
            <button className="nav-link" onClick={()=>setView("app")}>Client App</button>
            <button className="nav-link" onClick={()=>setView("admin")}>Partner Dashboard</button>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2026 Aprovuit. All rights reserved. · aprovuit.com</p>
        </div>
      </footer>
    </div>
  );

  // ── CLIENT APP ───────────────────────────────────────────────────
  if (view === "app") {
    const HomeTab = () => (
      <div>
        <div style={{ background:`linear-gradient(145deg,${BK},#0d1f0d)`, padding:"20px 20px 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:4 }}>Good morning,</p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, background:G, borderRadius:2 }}></div>
                <span className="cond" style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
              </div>
            </div>
            <button onClick={()=>setSheet({type:"notifs"})} style={{ background:"rgba(168,255,62,0.1)", border:`1px solid ${G}33`, width:42, height:42, borderRadius:13, cursor:"pointer", fontSize:20, position:"relative" }}>🔔
              <div style={{ position:"absolute", top:7, right:7, width:9, height:9, background:"#ef4444", borderRadius:"50%", border:`1.5px solid ${BK}` }}></div>
            </button>
          </div>
          <div style={{ background:"rgba(168,255,62,0.05)", border:`1px solid ${G}20`, borderRadius:16, padding:"16px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:24 }}>📵</span>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:G, marginBottom:2 }}>No Phone Calls Needed</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>Apply, track approvals, accept offers & message your advisor — all here.</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[[`${pendingOffers} Offer${pendingOffers!==1?"s":""}`, "💼", ()=>setAppTab("offers")], [`${apps.filter(a=>a.status==="under_review").length} In Review`, "⏳", ()=>setAppTab("apply")], [`${apps.filter(a=>a.status==="approved").length} Approved`, "✅", ()=>setAppTab("apply")]].map(([l,ic,fn]) => (
              <button key={l} onClick={fn} style={{ background:"rgba(168,255,62,0.1)", border:`1px solid ${G}25`, borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:700, color:G, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontFamily:"'DM Sans',sans-serif" }}>{ic} {l}</button>
            ))}
          </div>
        </div>
        <p className="sl">Active Loans</p>
        {LOANS_DATA.map(loan => (
          <button key={loan.id} onClick={()=>setSheet({type:"loan",data:loan})} style={{ display:"block", width:"calc(100% - 32px)", margin:"0 16px 12px", background:`linear-gradient(135deg,${loan.color},${loan.color}cc)`, borderRadius:18, padding:"20px", border:"none", cursor:"pointer", textAlign:"left" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div><p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:4 }}>{loan.id}</p><p style={{ fontSize:17, fontWeight:800, color:"#fff" }}>{loan.product}</p></div>
              <div style={{ textAlign:"right" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:4 }}>Balance</p><p style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{fmt(loan.balance)}</p></div>
            </div>
            <div style={{ height:5, background:"rgba(255,255,255,0.2)", borderRadius:3, overflow:"hidden", marginBottom:6 }}>
              <div style={{ height:"100%", width:`${loan.progress}%`, background:"rgba(255,255,255,0.85)", borderRadius:3 }}></div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{loan.progress}% paid off</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>Due {loan.nextDue}</p>
            </div>
          </button>
        ))}
        <p className="sl">Quick Actions</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, margin:"0 16px 20px" }}>
          {[["🚀","Apply for Funding","#f0f4ff","#3b4fd8",()=>{setApplyStep(0);setApplyDone(false);setApplyForm({product:"",amount:""});setSheet({type:"apply"})}],["📋","Track Applications","#fef9f0","#c2801a",()=>setAppTab("apply")],["💼","View Offers","#f0fff4","#16a34a",()=>setAppTab("offers")],["💬","Message Advisor","#fdf4ff","#9333ea",()=>setAppTab("messages")]].map(([ic,l,bg,c,fn])=>(
            <button key={l} onClick={fn} style={{ background:bg, border:"none", borderRadius:16, padding:"18px 14px", cursor:"pointer", textAlign:"left", display:"flex", flexDirection:"column", gap:8 }}>
              <span style={{ fontSize:26 }}>{ic}</span>
              <span style={{ fontSize:13, fontWeight:700, color:c, fontFamily:"'DM Sans',sans-serif" }}>{l}</span>
            </button>
          ))}
        </div>
      </div>
    );

    const ApplyTab = () => (
      <div>
        <div style={{ background:`linear-gradient(145deg,${BK},#0d1f0d)`, padding:"20px 20px 28px" }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>Applications</p>
          <p className="cond" style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:"-0.02em", textTransform:"uppercase", marginBottom:16 }}>Track Your Funding</p>
          <button onClick={()=>{setApplyStep(0);setApplyDone(false);setApplyForm({product:"",amount:""});setSheet({type:"apply"})}} style={{ background:G, border:"none", borderRadius:12, padding:"12px 22px", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"'DM Sans',sans-serif", color:"#000" }}>
            🚀 New Application
          </button>
        </div>
        <p className="sl">Your Applications</p>
        {apps.map(app => (
          <button key={app.id} onClick={()=>setSheet({type:"app",data:app})} style={{ display:"block", width:"calc(100% - 32px)", margin:"0 16px 10px", background:"#fff", borderRadius:16, padding:"16px", border:"none", cursor:"pointer", textAlign:"left" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div>
                <p style={{ fontSize:12, color:"#8e8e93", marginBottom:3 }}>{app.id}</p>
                <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>{app.product}</p>
                <p style={{ fontSize:13, color:"#555", marginTop:2 }}>{fmt(app.amount)} requested</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <span className="pill" style={{ background:APP_STATUS[app.status].bg, color:APP_STATUS[app.status].c }}>{APP_STATUS[app.status].label}</span>
                {app.offer && <p style={{ fontSize:11, color:"#007aff", fontWeight:700, marginTop:5 }}>Offer Ready →</p>}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, borderTop:"0.5px solid #f2f2f7" }}>
              <p style={{ fontSize:11, color:"#8e8e93" }}>Submitted {app.submitted}</p>
              <p style={{ fontSize:11, color:"#8e8e93" }}>Updated {app.updated}</p>
            </div>
            {app.status === "declined" && app.reason && (
              <div style={{ marginTop:10, background:"#fef2f2", borderRadius:10, padding:"10px 12px" }}>
                <p style={{ fontSize:12, color:"#dc2626", lineHeight:1.5 }}>❌ {app.reason}</p>
              </div>
            )}
            {app.status === "approved" && app.offer && (
              <div style={{ marginTop:10, background:"#f0fdf4", borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:12, color:"#16a34a", fontWeight:700 }}>✓ {fmt(app.offer.amount)} approved</p>
                <p style={{ fontSize:11, color:"#16a34a" }}>Exp {app.offer.expires}</p>
              </div>
            )}
          </button>
        ))}
        <div style={{ height:20 }}></div>
      </div>
    );

    const OffersTab = () => (
      <div>
        <div style={{ background:`linear-gradient(145deg,#064e3b,#022c22)`, padding:"20px 20px 28px" }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:6 }}>Offers</p>
          <p className="cond" style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:"-0.02em", textTransform:"uppercase", marginBottom:6 }}>Review & Accept</p>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)" }}>No calls needed — accept right here. 📵</p>
        </div>
        {offers.filter(o=>o.status==="pending").length > 0 && <>
          <p className="sl">Pending Offers</p>
          {offers.filter(o=>o.status==="pending").map(offer => (
            <div key={offer.id} style={{ margin:"0 16px 14px", background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ background:"linear-gradient(135deg,#064e3b,#022c22)", padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{offer.product}</p>
                  <span style={{ background:"rgba(168,255,62,0.2)", color:G, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>New Offer</span>
                </div>
                <p className="cond" style={{ fontSize:36, fontWeight:900, color:"#fff", marginTop:8, letterSpacing:"-0.5px" }}>{fmt(offer.amount)}</p>
              </div>
              <div style={{ padding:"16px 18px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                  {[["Term",offer.term],["Payment",fmt(offer.payment)],["Frequency",offer.freq],["Rate",offer.rate]].map(([l,v]) => (
                    <div key={l} style={{ background:"#f9f9fb", borderRadius:10, padding:"10px" }}>
                      <p style={{ fontSize:10, color:"#8e8e93", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{l}</p>
                      <p style={{ fontSize:13, fontWeight:700, color:"#1c1c1e" }}>{v}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:12, color:"#8e8e93", marginBottom:12, textAlign:"center" }}>Expires {offer.expires}</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <button onClick={()=>setOffers(p=>p.map(o=>o.id===offer.id?{...o,status:"declined"}:o))} className="abtn" style={{ background:"#fef2f2", color:"#dc2626", padding:"13px", fontSize:14, borderRadius:12 }}>Decline</button>
                  <button onClick={()=>setOffers(p=>p.map(o=>o.id===offer.id?{...o,status:"accepted"}:o))} className="abtn" style={{ background:"#1c1c1e", color:"#fff", padding:"13px", fontSize:14, borderRadius:12 }}>Accept ✓</button>
                </div>
              </div>
            </div>
          ))}
        </>}
        {offers.filter(o=>o.status!=="pending").length > 0 && <>
          <p className="sl" style={{ color:"#8e8e93", fontSize:16 }}>Previous</p>
          {offers.filter(o=>o.status!=="pending").map(offer => (
            <div key={offer.id} className="acard" style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><p style={{ fontSize:14, fontWeight:700, color:"#1c1c1e" }}>{offer.product}</p><p style={{ fontSize:13, color:"#8e8e93" }}>{fmt(offer.amount)}</p></div>
              <span className="pill" style={{ background:offer.status==="accepted"?"#dcfce7":"#fee2e2", color:offer.status==="accepted"?"#16a34a":"#dc2626" }}>{offer.status==="accepted"?"Accepted ✓":"Declined"}</span>
            </div>
          ))}
        </>}
        <div style={{ height:20 }}></div>
      </div>
    );

    const MsgsTab = () => (
      <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
        <div style={{ background:"#fff", borderBottom:"0.5px solid #e5e5ea", padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, background:"#1c1c1e", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:G }}>TW</div>
          <div><p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>Tanya Williams</p><p style={{ fontSize:12, color:"#34c759", fontWeight:600 }}>● Your Funding Advisor</p></div>
          <div style={{ marginLeft:"auto", background:"#fef2f2", borderRadius:20, padding:"5px 12px" }}><p style={{ fontSize:12, fontWeight:700, color:"#dc2626" }}>📵 No Spam Calls</p></div>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
          {msgs.map(m => (
            <div key={m.id} style={{ display:"flex", justifyContent:m.from==="client"?"flex-end":"flex-start", gap:8 }}>
              {m.from==="advisor" && <div style={{ width:30, height:30, background:"#1c1c1e", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:G, flexShrink:0, marginTop:2 }}>TW</div>}
              <div style={{ maxWidth:"75%", background:m.from==="client"?"#1c1c1e":"#fff", borderRadius:m.from==="client"?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"11px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize:14, color:m.from==="client"?"#fff":"#1c1c1e", lineHeight:1.5 }}>{m.text}</p>
                <p style={{ fontSize:10, color:m.from==="client"?"rgba(255,255,255,0.4)":"#c7c7cc", marginTop:4, textAlign:"right" }}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff", borderTop:"0.5px solid #e5e5ea", padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea value={msgTxt} onChange={e=>setMsgTxt(e.target.value)} placeholder="Message your advisor..." style={{ flex:1, border:"1.5px solid #e5e5ea", borderRadius:20, padding:"10px 14px", fontSize:14, resize:"none", height:42, outline:"none", fontFamily:"'DM Sans',sans-serif", lineHeight:1.4, color:"#1c1c1e" }} rows={1} />
          <button onClick={sendMsg} style={{ width:42, height:42, background:"#1c1c1e", border:"none", borderRadius:"50%", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
        </div>
      </div>
    );

    const LoansTab = () => (
      <div>
        <div style={{ background:`linear-gradient(145deg,${BK},#0d1f0d)`, padding:"20px 20px 28px" }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>Outstanding Balance</p>
          <p className="cond" style={{ fontSize:42, fontWeight:900, color:G, letterSpacing:"-1px" }}>{fmt(LOANS_DATA.reduce((s,l)=>s+l.balance,0))}</p>
        </div>
        <p className="sl">Active Loans</p>
        {LOANS_DATA.map(loan => (
          <button key={loan.id} onClick={()=>setSheet({type:"loan",data:loan})} style={{ display:"block", width:"calc(100% - 32px)", margin:"0 16px 12px", background:"#fff", borderRadius:18, padding:"18px", border:"none", cursor:"pointer", textAlign:"left" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:44, height:44, background:loan.color+"18", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:loan.color }}>💳</div>
                <div><p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>{loan.product}</p><p style={{ fontSize:12, color:"#8e8e93", marginTop:1 }}>{loan.id}</p></div>
              </div>
              <span className="pill" style={{ background:"#dcfce7", color:"#16a34a" }}>Current</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
              {[["Balance",fmt(loan.balance)],["Payment",fmt(loan.payment)],["Next Due",loan.nextDue]].map(([l,v]) => (
                <div key={l} style={{ background:"#f9f9fb", borderRadius:10, padding:"8px" }}>
                  <p style={{ fontSize:9, color:"#8e8e93", fontWeight:600, textTransform:"uppercase", marginBottom:3 }}>{l}</p>
                  <p style={{ fontSize:12, fontWeight:700, color:"#1c1c1e" }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ height:5, background:"#f2f2f7", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${loan.progress}%`, background:loan.color, borderRadius:3 }}></div>
            </div>
          </button>
        ))}
        <div style={{ height:20 }}></div>
      </div>
    );

    const SheetContent = () => {
      if (!sheet) return null;
      const close = () => setSheet(null);
      return (
        <div className="ov sfd">
          <div className="sh slup">
            <div className="hdl"></div>
            {sheet.type === "loan" && (() => {
              const l = sheet.data;
              return <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                  <div><p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{l.product}</p><p style={{ fontSize:13, color:"#8e8e93", marginTop:2 }}>{l.id}</p></div>
                  <button onClick={close} style={{ background:"#f2f2f7", border:"none", width:32, height:32, borderRadius:10, cursor:"pointer", color:"#8e8e93", fontSize:16 }}>✕</button>
                </div>
                <div style={{ background:`linear-gradient(135deg,${l.color},${l.color}cc)`, borderRadius:18, padding:20, marginBottom:20, color:"#fff" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    {[["Balance",fmt(l.balance)],["Original",fmt(l.original)],["Paid",fmt(l.paid)],["Payment",fmt(l.payment)]].map(([k,v]) => <div key={k}><p style={{ fontSize:11, opacity:0.6, marginBottom:3 }}>{k}</p><p style={{ fontSize:17, fontWeight:800 }}>{v}</p></div>)}
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.2)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${l.progress}%`, background:"rgba(255,255,255,0.85)", borderRadius:3 }}></div>
                  </div>
                  <p style={{ fontSize:11, opacity:0.5, marginTop:6 }}>{l.progress}% paid · {100-l.progress}% remaining</p>
                </div>
                {[["Rate",l.rate],["Frequency",l.freq],["Next Due",l.nextDue]].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"0.5px solid #f2f2f7" }}>
                    <p style={{ fontSize:14, color:"#8e8e93" }}>{k}</p><p style={{ fontSize:14, fontWeight:700, color:"#1c1c1e" }}>{v}</p>
                  </div>
                ))}
                <button onClick={close} className="abtn" style={{ background:"#f2f2f7", color:"#1c1c1e", width:"100%", padding:14, marginTop:20, fontSize:15 }}>Close</button>
              </div>;
            })()}

            {sheet.type === "app" && (() => {
              const a = sheet.data;
              return <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                  <div><p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{a.product}</p><p style={{ fontSize:13, color:"#8e8e93" }}>{a.id}</p></div>
                  <button onClick={close} style={{ background:"#f2f2f7", border:"none", width:32, height:32, borderRadius:10, cursor:"pointer", color:"#8e8e93", fontSize:16 }}>✕</button>
                </div>
                <span className="pill" style={{ background:APP_STATUS[a.status].bg, color:APP_STATUS[a.status].c, marginBottom:20, display:"inline-flex", fontSize:14 }}>{APP_STATUS[a.status].label}</span>
                <div style={{ marginBottom:20 }}>
                  {[["Submitted",true,a.submitted],["Under Review",a.status!=="under_review"||true,a.updated],["Decision",a.status==="approved"||a.status==="declined",a.status==="approved"?"Approved ✓":a.status==="declined"?"Declined":"Pending"],["Offer Ready",a.status==="approved","View in Offers tab"]].map(([step,done,note],i) => (
                    <div key={step} style={{ display:"flex", gap:14, marginBottom:14 }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:done?"#1c1c1e":"#f2f2f7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:done?"#fff":"#c7c7cc", fontWeight:700, flexShrink:0 }}>{done?"✓":i+1}</div>
                        {i<3 && <div style={{ width:2, flex:1, background:done?"#1c1c1e":"#f2f2f7", minHeight:18, marginTop:4 }}></div>}
                      </div>
                      <div style={{ paddingTop:4 }}>
                        <p style={{ fontSize:14, fontWeight:700, color:done?"#1c1c1e":"#c7c7cc" }}>{step}</p>
                        <p style={{ fontSize:12, color:"#8e8e93", marginTop:1 }}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {a.status==="declined" && a.reason && <div style={{ background:"#fef2f2", borderRadius:14, padding:"14px 16px", marginBottom:14 }}><p style={{ fontSize:13, fontWeight:700, color:"#dc2626", marginBottom:6 }}>Reason</p><p style={{ fontSize:13, color:"#dc2626", lineHeight:1.6 }}>{a.reason}</p></div>}
                {a.status==="approved" && a.offer && <div style={{ background:"#f0fdf4", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", marginBottom:10 }}>Approved Offer</p>
                  {[["Amount",fmt(a.offer.amount)],["Term",a.offer.term],["Payment",`${fmt(a.offer.payment)} / ${a.offer.freq}`],["Expires",a.offer.expires]].map(([k,v]) => <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"0.5px solid #dcfce7" }}><p style={{ fontSize:13, color:"#16a34a" }}>{k}</p><p style={{ fontSize:13, fontWeight:700, color:"#166534" }}>{v}</p></div>)}
                  <button onClick={()=>{close();setAppTab("offers")}} className="abtn" style={{ background:"#16a34a", color:"#fff", width:"100%", padding:13, marginTop:12, fontSize:15 }}>View & Accept →</button>
                </div>}
                <button onClick={close} className="abtn" style={{ background:"#f2f2f7", color:"#1c1c1e", width:"100%", padding:14, fontSize:15 }}>Close</button>
              </div>;
            })()}

            {sheet.type === "apply" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                  <p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{applyDone?"Submitted!":"Apply for Funding"}</p>
                  <button onClick={close} style={{ background:"#f2f2f7", border:"none", width:32, height:32, borderRadius:10, cursor:"pointer", color:"#8e8e93", fontSize:16 }}>✕</button>
                </div>
                {applyDone ? (
                  <div style={{ textAlign:"center", padding:"20px 0" }}>
                    <div style={{ width:68, height:68, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:30 }}>✓</div>
                    <p style={{ fontSize:17, fontWeight:700, color:"#1c1c1e", marginBottom:8 }}>Application Submitted!</p>
                    <p style={{ fontSize:14, color:"#8e8e93", lineHeight:1.6, marginBottom:20 }}>Track your status in the Applications tab. No phone call needed — we'll update you here.</p>
                    <div className="gtag" style={{ justifyContent:"center", marginBottom:20 }}>✓ Bank data auto-pulled via Plaid</div>
                    <button onClick={close} className="abtn" style={{ background:"#1c1c1e", color:"#fff", width:"100%", padding:14, fontSize:15 }}>Done</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display:"flex", gap:6, marginBottom:22 }}>
                      {["Product","Amount","Confirm"].map((s,i) => <div key={s} style={{ flex:1, height:4, borderRadius:2, background:i<=applyStep?"#1c1c1e":"#f2f2f7", transition:"background 0.2s" }}></div>)}
                    </div>
                    {applyStep===0 && <div>
                      <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e", marginBottom:14 }}>What type of funding?</p>
                      <div style={{ display:"grid", gap:10 }}>
                        {[["→","Term Loan","$10K–$500K"],["⟳","Line of Credit","$10K–$5M"],["⚡","Revenue Advance","$5K–$500K"],["⚙","Equipment Financing","$5K–$2M"]].map(([ic,name,range]) => (
                          <div key={name} className={`opt${applyForm.product===name?" sel":""}`} onClick={()=>setApplyForm(f=>({...f,product:name}))} style={{ display:"flex", gap:14, alignItems:"center" }}>
                            <span style={{ fontSize:22, width:32, textAlign:"center" }}>{ic}</span>
                            <div style={{ flex:1 }}><p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>{name}</p><p style={{ fontSize:12, color:"#8e8e93" }}>{range}</p></div>
                            {applyForm.product===name && <span style={{ fontWeight:800, fontSize:18 }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>}
                    {applyStep===1 && <div>
                      <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e", marginBottom:14 }}>How much do you need?</p>
                      <div style={{ background:"#f9f9fb", borderRadius:16, padding:20, marginBottom:14 }}>
                        <p style={{ fontSize:11, color:"#8e8e93", fontWeight:600, marginBottom:8 }}>AMOUNT REQUESTED</p>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:32, fontWeight:700, color:"#1c1c1e" }}>$</span>
                          <input type="number" value={applyForm.amount} onChange={e=>setApplyForm(f=>({...f,amount:e.target.value}))} placeholder="0" style={{ fontSize:36, fontWeight:800, color:"#1c1c1e", border:"none", background:"none", outline:"none", width:"100%", fontFamily:"'DM Sans',sans-serif" }} />
                        </div>
                      </div>
                      <div className="gtag">✓ Bank statements auto-pulled via Plaid — no uploads</div>
                    </div>}
                    {applyStep===2 && <div>
                      <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e", marginBottom:14 }}>Confirm & Submit</p>
                      <div style={{ background:"#f9f9fb", borderRadius:16, padding:16, marginBottom:14 }}>
                        {[["Product",applyForm.product||"—"],["Amount",`$${Number(applyForm.amount||0).toLocaleString()}`],["Bank","Auto-pulled via Plaid ✓"],["Phone Call","Not required 📵"]].map(([k,v]) => (
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"0.5px solid #e5e5ea" }}>
                            <p style={{ fontSize:14, color:"#8e8e93" }}>{k}</p><p style={{ fontSize:14, fontWeight:700, color:"#1c1c1e" }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>}
                    <div style={{ display:"flex", gap:10, marginTop:20 }}>
                      {applyStep>0 && <button onClick={()=>setApplyStep(s=>s-1)} className="abtn" style={{ background:"#f2f2f7", color:"#1c1c1e", flex:1, padding:14, fontSize:15 }}>Back</button>}
                      {applyStep<2
                        ? <button onClick={()=>setApplyStep(s=>s+1)} className="abtn" style={{ background:"#1c1c1e", color:"#fff", flex:2, padding:14, fontSize:15 }}>Continue →</button>
                        : <button onClick={submitApp} className="abtn" style={{ background:G, color:"#000", flex:2, padding:14, fontSize:15 }}>Submit ✓</button>
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {sheet.type === "notifs" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                  <p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>Notifications</p>
                  <button onClick={close} style={{ background:"#f2f2f7", border:"none", width:32, height:32, borderRadius:10, cursor:"pointer", color:"#8e8e93", fontSize:16 }}>✕</button>
                </div>
                {[{ic:"🎉",t:"APP-2041 Approved!",b:"Your $150K Term Loan approved. View offer in Offers tab.",time:"2h ago",unread:true},{ic:"⏳",t:"APP-2038 In Review",b:"Decision expected within 24 hours.",time:"3d ago",unread:false},{ic:"🏦",t:"Bank Connected",b:"Chase Business Checking linked via Plaid.",time:"5d ago",unread:false}].map(n => (
                  <div key={n.t} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom:"0.5px solid #f2f2f7" }}>
                    <div style={{ width:42, height:42, background:n.unread?"#1c1c1e":"#f2f2f7", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{n.ic}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:n.unread?700:600, color:"#1c1c1e" }}>{n.t}</p>
                      <p style={{ fontSize:13, color:"#8e8e93", marginTop:2, lineHeight:1.4 }}>{n.b}</p>
                      <p style={{ fontSize:11, color:"#c7c7cc", marginTop:3 }}>{n.time}</p>
                    </div>
                    {n.unread && <div style={{ width:8, height:8, background:"#007aff", borderRadius:"50%", marginTop:6, flexShrink:0 }}></div>}
                  </div>
                ))}
                <button onClick={close} className="abtn" style={{ background:"#f2f2f7", color:"#1c1c1e", width:"100%", padding:14, marginTop:16, fontSize:15 }}>Close</button>
              </div>
            )}
          </div>
        </div>
      );
    };

    const TABS = [
      { id:"home", icon:"🏠", label:"Home" },
      { id:"apply", icon:"📋", label:"Apply", badge:apps.filter(a=>a.status==="under_review").length },
      { id:"offers", icon:"💼", label:"Offers", badge:pendingOffers },
      { id:"messages", icon:"💬", label:"Advisor", badge:1 },
      { id:"loans", icon:"💳", label:"Loans" },
    ];

    return (
      <div style={{ background:BK, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
        <style>{CSS}</style>
        <button onClick={()=>setView("landing")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, cursor:"pointer", marginBottom:16, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6 }}>← Back to aprovuit.com</button>
        <div className="phone">
          <div className="sb">
            <span style={{ fontSize:14, fontWeight:700, color:"#1c1c1e" }}>9:41</span>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:7, height:7, background:G, borderRadius:2 }}></div>
              <span className="cond" style={{ fontSize:13, fontWeight:800, color:"#1c1c1e", letterSpacing:"0.03em" }}>APROVUIT</span>
            </div>
            <span style={{ fontSize:12, color:"#1c1c1e" }}>●●● 🔋</span>
          </div>
          <div className="scr">
            {appTab==="home" && <HomeTab />}
            {appTab==="apply" && <ApplyTab />}
            {appTab==="offers" && <OffersTab />}
            {appTab==="messages" && <MsgsTab />}
            {appTab==="loans" && <LoansTab />}
          </div>
          {sheet && <SheetContent />}
          <div className="tb">
            {TABS.map(t => (
              <button key={t.id} className="tbi" onClick={()=>setAppTab(t.id)}>
                {t.badge > 0 && <div className="badge">{t.badge}</div>}
                <span style={{ fontSize:22 }}>{t.icon}</span>
                <span style={{ fontSize:10, fontWeight:600, color:appTab===t.id?"#1c1c1e":"#8e8e93" }}>{t.label}</span>
                {appTab===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:G, marginTop:1 }}></div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ──────────────────────────────────────────────
  if (view === "admin") return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", display:"flex", minHeight:"100vh", background:"#f5f4f1" }}>
      <style>{CSS}</style>
      <div style={{ width:230, background:BK, flexShrink:0, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid rgba(255,255,255,0.06)`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
          </div>
          <span className="cond" style={{ fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </div>
        <div style={{ padding:"12px 0", flex:1 }}>
          {[["📋","Applications",true],["📊","Analytics",false],["👥","Clients",false],["⚙","Settings",false]].map(([ic,l,a]) => (
            <div key={l} onClick={()=>setAdminTab(l.toLowerCase())} style={{ padding:"12px 20px", display:"flex", gap:12, alignItems:"center", background:a||adminTab===l.toLowerCase()?"rgba(168,255,62,0.08)":"none", color:a||adminTab===l.toLowerCase()?G:"rgba(255,255,255,0.4)", fontSize:14, cursor:"pointer", borderLeft:a||adminTab===l.toLowerCase()?`2px solid ${G}`:"2px solid transparent", fontWeight:a||adminTab===l.toLowerCase()?600:400 }}>
              <span>{ic}</span><span>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"16px 20px", borderTop:`1px solid rgba(255,255,255,0.06)`, display:"flex", flexDirection:"column", gap:8 }}>
          <button onClick={()=>setView("app")} style={{ background:"rgba(168,255,62,0.08)", border:`1px solid ${G}20`, color:G, padding:"9px 0", fontSize:13, cursor:"pointer", width:"100%", fontFamily:"'DM Sans',sans-serif", fontWeight:600, borderRadius:4 }}>📱 Client App</button>
          <button onClick={()=>setView("landing")} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)", padding:"9px 0", fontSize:13, cursor:"pointer", width:"100%", fontFamily:"'DM Sans',sans-serif", borderRadius:4 }}>← View Site</button>
        </div>
      </div>
      <div style={{ flex:1, padding:"36px 40px", overflow:"auto" }}>
        <div style={{ marginBottom:32, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h1 className="cond" style={{ fontSize:40, fontWeight:900, letterSpacing:"-0.02em", textTransform:"uppercase", marginBottom:4 }}>Applications</h1>
            <p style={{ fontSize:14, color:"#888" }}>Track and manage all funding applications</p>
          </div>
          <button onClick={()=>setView("app")} style={{ background:BK, color:G, border:`1px solid ${G}40`, padding:"11px 24px", fontSize:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, borderRadius:4, display:"flex", alignItems:"center", gap:8 }}>
            + New Application
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
          {[["Total",adminApps.length,"#fff"],["Funded",adminApps.filter(a=>a.status==="Funded").length,"#eff6ff"],["Approved",adminApps.filter(a=>a.status==="Approved").length,"#f0fdf4"],["In Review",adminApps.filter(a=>a.status==="Under Review").length,"#fffbeb"]].map(([l,v,bg]) => (
            <div key={l} style={{ background:bg, border:"1px solid #e5e3de", padding:"24px 28px", borderRadius:4 }}>
              <p style={{ fontSize:11, color:"#888", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>{l}</p>
              <p className="cond" style={{ fontSize:48, fontWeight:900, letterSpacing:"-0.02em", color:BK }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff", border:"1px solid #e5e3de", overflow:"hidden", borderRadius:4 }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #e5e3de" }}>
                {["Business","Owner","Product","Amount","Revenue","Credit","Status","Date",""].map(h => (
                  <th key={h} style={{ padding:"14px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.1em", textTransform:"uppercase", background:"#fafaf8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adminApps.map(app => (
                <tr key={app.id} className="tbl-row" style={{ borderBottom:"1px solid #f5f4f1", cursor:"pointer" }} onClick={()=>setDrawer(app)}>
                  <td style={{ padding:"14px 16px", fontSize:14, fontWeight:700 }}>{app.biz}</td>
                  <td style={{ padding:"14px 16px", fontSize:14, color:"#555" }}>{app.owner}</td>
                  <td style={{ padding:"14px 16px", fontSize:13, color:"#666" }}>{app.product}</td>
                  <td style={{ padding:"14px 16px", fontSize:14, fontWeight:700 }}>{app.amount}</td>
                  <td style={{ padding:"14px 16px", fontSize:13, color:"#666" }}>{app.rev}</td>
                  <td style={{ padding:"14px 16px", fontSize:13, color:"#666" }}>{app.credit}</td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:12, padding:"4px 12px", fontWeight:700, borderRadius:20, background:STATUS_STYLE[app.status]?.bg||"#f5f4f1", color:STATUS_STYLE[app.status]?.c||"#555" }}>{app.status}</span>
                  </td>
                  <td style={{ padding:"14px 16px", fontSize:13, color:"#aaa" }}>{app.date}</td>
                  <td style={{ padding:"14px 16px" }}><button style={{ background:"none", border:"none", fontSize:13, color:"#aaa", cursor:"pointer", fontWeight:600 }} onClick={e=>{e.stopPropagation();setDrawer(app);}}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {drawer && (
        <div style={{ position:"fixed", right:0, top:0, bottom:0, width:400, background:"#fff", borderLeft:"1px solid #e5e3de", padding:36, overflow:"auto", boxShadow:"-12px 0 40px rgba(0,0,0,0.07)", zIndex:200 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <h3 className="cond" style={{ fontSize:26, fontWeight:900, textTransform:"uppercase", paddingRight:16 }}>{drawer.biz}</h3>
            <button onClick={()=>setDrawer(null)} style={{ background:"none", border:"none", fontSize:24, cursor:"pointer", color:"#ccc" }}>×</button>
          </div>
          <p style={{ fontSize:14, color:"#888", marginBottom:20 }}>{drawer.owner}</p>
          <span style={{ fontSize:12, padding:"5px 14px", fontWeight:700, borderRadius:20, background:STATUS_STYLE[drawer.status]?.bg||"#f5f4f1", color:STATUS_STYLE[drawer.status]?.c||"#555", display:"inline-block", marginBottom:28 }}>{drawer.status}</span>
          {[["Product",drawer.product],["Amount",drawer.amount],["Monthly Revenue",drawer.rev],["Credit Score",drawer.credit],["Date",drawer.date]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f5f4f1", fontSize:14 }}>
              <span style={{ color:"#888" }}>{k}</span><span style={{ fontWeight:700 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop:28 }}>
            <p style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"#aaa", marginBottom:14, fontWeight:600 }}>Update Status</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {["Approved","Funded","Under Review","Pending Docs","Declined"].map(s => (
                <button key={s} onClick={()=>{setAdminApps(a=>a.map(x=>x.id===drawer.id?{...x,status:s}:x));setDrawer(d=>({...d,status:s}));}}
                  style={{ padding:"10px 0", fontSize:13, border:"1.5px solid", borderColor:drawer.status===s?BK:"#e5e3de", background:drawer.status===s?BK:"#fff", color:drawer.status===s?G:"#555", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, borderRadius:4, gridColumn:s==="Declined"?"1/-1":"auto" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button style={{ background:BK, color:G, border:"none", padding:"13px 0", fontSize:14, cursor:"pointer", width:"100%", fontFamily:"'DM Sans',sans-serif", fontWeight:700, borderRadius:4, marginTop:16 }} onClick={()=>setDrawer(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
