import { useState } from "react";
const G = "#a8ff3e";
const BK = "#0a0a0a";
const BK2 = "#111111";
const BK3 = "#1a1a1a";
const BK4 = "#222222";
const PRODUCTS = [
{ id: "term", icon: "→", name: "Term Loan", range: "$10K – $500K", term: "3–24 month { id: "loc", icon: "⟳", name: "Line of Credit", range: "$10K – $5M", term: "Revolvin {id:"mca",icon:" ",name:"RevenueAdvance",range:"$5K–$500K",term:"Daily { id: "equip", icon: "⚙", name: "Equipment Financing", range: "$5K – $2M", term: "Up
];
const STATS = [["$750M+","Funded"], ["8,200+","Businesses"], ["2 hrs","Avg Decision"],
const REVIEWS = [
  { name: "Marcus T.", biz: "Logistics, Texas", text: "Applied at 9am, approved by noo
  { name: "Priya S.", biz: "Med Spa, California", text: "The app showed me exactly whe
  { name: "Darnell R.", biz: "Construction, Georgia", text: "Got a $200K line of credi
];
const FAQS = [
  ["How long does approval take?","Most decisions come within 2–4 hours during busines
  ["Will applying hurt my credit?","Our initial review uses a soft pull — zero impact
  ["What documents do I need?","Just basic business info. Your bank connects automatic
  ["Do I need to get on the phone?","Never. Everything happens in the app. Apply, trac
  ["What are the minimum requirements?","6+ months in business, $10K+ monthly revenue,
];
const APPS_DATA = [
  { id:"APP-2041", product:"Term Loan", amount:150000, submitted:"Mar 20, 2026", updat
  { id:"APP-2038", product:"Line of Credit", amount:75000, submitted:"Mar 15, 2026", u
  { id:"APP-2031", product:"Revenue Advance", amount:30000, submitted:"Mar 1, 2026", u
];
const LOANS_DATA = [
  { id:"LN-10042", product:"Term Loan", original:150000, balance:84200, paid:65800, pa
  { id:"LN-10089", product:"Line of Credit", original:75000, balance:31500, paid:43500
];
const OFFERS_DATA = [
  { id:"OFF-2041", product:"Term Loan", amount:145000, term:"18 months", payment:8055,
 s", des
g", de
 repay
 to 60
["4.9★
n, fund
re my a
t. Saw
s hours
to your
ally vi
k statu
580+ c
ed:"2 h
pdated:
pdated:
yment:6
, payme
freq:"
s m
   { id:"OFF-RNW", product:"Renewal — LN-10042", amount:200000, term:"24 months", payme
];
const MSGS_DATA = [
  { id:1, from:"advisor", text:"Hey! APP-2041 has been approved. Check your Offers tab
  { id:2, from:"advisor", text:"Your Line of Credit is still under review — expect a d
  { id:3, from:"client", text:"Sounds good. Do you need any extra docs for the LOC?",
  { id:4, from:"advisor", text:"Your bank is connected via Plaid so we're all set — no
];
const ADMIN_APPS = [
  { id:1, biz:"Sunrise Trucking LLC", owner:"Marcus Johnson", product:"Term Loan", amo
  { id:2, biz:"Bay Area Bakery", owner:"Sofia Reyes", product:"Line of Credit", amount
  { id:3, biz:"Peak Fitness Studio", owner:"Derek Wills", product:"Equipment", amount:
  { id:4, biz:"Metro Dental Group", owner:"Linda Park", product:"Term Loan", amount:"$
  { id:5, biz:"Urban Cuts Barbershop", owner:"Jamal Thompson", product:"Revenue Advanc
];
const STATUS_STYLE = {
  "Approved":{ bg:"#dcfce7", c:"#16a34a" },
  "Funded":{ bg:"#dbeafe", c:"#2563eb" },
  "Under Review":{ bg:"#fef3c7", c:"#d97706" },
  "Pending Docs":{ bg:"#fff7ed", c:"#ea580c" },
  "Declined":{ bg:"#fee2e2", c:"#dc2626" },
};
const APP_STATUS = {
approved:{ label:"Approved ✓", bg:"#dcfce7", c:"#16a34a" }, under_review:{ label:"Under Review", bg:"#fef3c7", c:"#d97706" }, declined:{ label:"Declined", bg:"#fee2e2", c:"#dc2626" },
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
nt:9166
 to rev
ecision
time:"3
extra
unt:"$1
:"$75,0
"$80,00
500,000
e", amo

 const [adminApps, setAdminApps] = useState(ADMIN_APPS);
const [drawer, setDrawer] = useState(null);
const [adminTab, setAdminTab] = useState("apps");
const pendingOffers = offers.filter(o => o.status === "pending").length;
const sendMsg = () => {
  if (!msgTxt.trim()) return;
  setMsgs(p => [...p, { id: Date.now(), from:"client", text: msgTxt, time:"Just now"
  setMsgTxt("");
  setTimeout(() => setMsgs(p => [...p, { id: Date.now()+1, from:"advisor", text:"Got
};
const submitApp = () => {
  setApps(p => [{ id:`APP-${2060+p.length}`, product:applyForm.product, amount:Numbe
  setApplyDone(true);
};
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  :root { --g:${G}; --bk:${BK}; --bk2:${BK2}; --bk3:${BK3}; --bk4:${BK4}; }
  body { background:var(--bk); color:#fff; font-family:'DM Sans',sans-serif; }
  ::selection { background:var(--g); color:#000; }
  .cond { font-family:'Barlow Condensed',sans-serif; }
  .bar { font-family:'Barlow',sans-serif; }
  .dm { font-family:'DM Sans',sans-serif; }
  .nav-link { font-size:14px; font-weight:500; color:rgba(255,255,255,0.6); cursor:p
  .nav-link:hover { color:#fff; }
  .btn-g { display:inline-flex; align-items:center; gap:8px; background:var(--g); co
  .btn-g:hover { background:#c2ff52; transform:translateY(-1px); }
  .btn-dk { display:inline-flex; align-items:center; gap:8px; background:rgba(255,25
  .btn-dk:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.
  .prod-card { background:var(--bk3); border:1px solid rgba(255,255,255,0.06); paddi
  .prod-card:hover { border-color:var(--g); transform:translateY(-2px); }
  .faq-btn { width:100%; background:none; border:none; color:#fff; display:flex; jus
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transf
  .fu { animation:fadeUp 0.5s ease both; }
  .fu1 { animation-delay:0.1s; }
  .fu2 { animation-delay:0.2s; }
  .fu3 { animation-delay:0.3s; }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .tick { display:flex; animation:ticker 30s linear infinite; width:max-content; }
  .phone { width:393px; height:852px; background:#f2f2f7; border-radius:52px; overfl
  .sb { height:54px; background:#fff; display:flex; align-items:flex-end; justify-co
}]); it! I'
r(apply
;0,600;
ointer;
lor:#00
5,255,0
25); }
ng:32px
tify-co
orm:tra
ow:hidd
ntent:s

   .scr { flex:1; overflow-y:auto; overflow-x:hidden; }
  .scr::-webkit-scrollbar { display:none; }
  .tb { background:rgba(255,255,255,0.94); backdrop-filter:blur(20px); border-top:0.
  .tbi { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; b
  .badge { position:absolute; top:-2px; right:22px; background:#ef4444; color:#fff;
  .acard { background:#fff; border-radius:16px; margin:0 16px 12px; overflow:hidden;
  .sl { font-size:20px; font-weight:800; color:#1c1c1e; margin:20px 16px 12px; lette
  .row { display:flex; align-items:center; padding:13px 16px; border-bottom:0.5px so
  .row:last-child { border-bottom:none; }
  .pill { display:inline-flex; align-items:center; padding:4px 12px; border-radius:2
  .abtn { display:flex; align-items:center; justify-content:center; gap:8px; border:
  .abtn:active { transform:scale(0.97); }
  .ov { position:absolute; inset:0; background:rgba(0,0,0,0.55); z-index:50; display
  .sh { background:#fff; border-radius:24px 24px 0 0; padding:0 20px 36px; max-heigh
  .sh::-webkit-scrollbar { display:none; }
  .hdl { width:36px; height:4px; background:#d1d1d6; border-radius:2px; margin:12px
  @keyframes sup { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .slup { animation:sup 0.3s cubic-bezier(0.32,0.72,0,1) both; }
  @keyframes sfd { from{opacity:0} to{opacity:1} }
  .sfd { animation:sfd 0.2s ease both; }
  .opt { border:2px solid #e5e5ea; border-radius:14px; padding:14px; cursor:pointer;
  .opt.sel { border-color:#1c1c1e; background:#f9f9f9; }
  .gtag { display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; bord
  .tbl-row:hover td { background:#f9f8f5; }
`;
// ── LANDING ──────────────────────────────────────────────────────
if (view === "landing") return (
  <div style={{ fontFamily:"'DM Sans',sans-serif", background:BK, color:"#fff", minH
    <style>{CSS}</style>
    {/* NAV */}
    <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,0.
      <button onClick={()=>setView("landing")} style={{ background:"none", border:"n
        <div style={{ width:30, height:30, background:G, borderRadius:4, display:"fl
          <span style={{ fontSize:15, fontWeight:900, fontFamily:"'Barlow Condensed'
</div>
        <span className="cond" style={{ fontSize:22, fontWeight:800, letterSpacing:"
      </button>
      <div style={{ display:"flex", gap:32, alignItems:"center" }}>
        {["Products","How It Works","FAQ"].map(l => <button key={l} className="nav-l
        <button className="nav-link" onClick={()=>setView("admin")}>Partner Login</b
        <button className="btn-g" style={{ padding:"10px 22px", fontSize:14 }} onCli
      </div>
    </nav>
{/* HERO */}
5px sol
ackgrou
font-si
 }
r-spaci
lid #f2
0px; fo
none; b
:flex;
t:92%;
auto 20
 transi
er:1px
eight:"
92)", b
one", c
ex", al
,sans-s
0.02em"
ink" on
utton>
ck={()=

 <section style={{ background:BK, minHeight:"90vh", display:"flex", alignItems:"c
  <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(c
  <div style={{ position:"absolute", top:0, right:0, width:"45%", height:"100%",
  <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"grid", gr
    <div className="fu">
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, backgroun
        <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></d
        <span style={{ fontSize:12, color:G, fontWeight:600, letterSpacing:"0.1e
      </div>
      <h1 className="cond" style={{ fontSize:"clamp(52px,7vw,88px)", fontWeight:
        APPROVE IT.<br />
        <span style={{ color:G }}>FUND IT.</span><br />
        TRACK IT.
      </h1>
      <p className="dm" style={{ fontSize:18, color:"rgba(255,255,255,0.55)", li
        Business funding that lives entirely in your phone. Apply with taps, tra
      </p>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
        <button className="btn-g" style={{ fontSize:16, padding:"16px 40px" }} o
        <button className="btn-dk" onClick={()=>document.getElementById("how-it-
      </div>
    </div>
    <div className="fu fu2" style={{ display:"flex", justifyContent:"center" }}>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", inset:-20, background:`radial-gradien
        <div style={{ background:BK2, border:`1px solid ${G}30`, borderRadius:28
          <div style={{ display:"flex", justifyContent:"space-between", alignIte
            <span className="cond" style={{ fontSize:16, fontWeight:800, color:G
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>9:41 AM
</div> {[
{ label:"APP-2041 · Term Loan", status:"Approved ✓", statusColor:G, { label:"APP-2038 · Line of Credit", status:"Under Review", statusCo { label:"LN-10042 · Active Loan", status:"Current", statusColor:"#60
          ].map((item, i) => (
            <div key={i} style={{ background:BK3, borderRadius:12, padding:"14px
              <div style={{ display:"flex", justifyContent:"space-between", marg
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{it
                <span style={{ fontSize:11, fontWeight:700, color:item.statusCol
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:"#fff", marginBot
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{item.
</div> ))}
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <div style={{ flex:1, background:G, borderRadius:10, padding:"11px 0
enter",
ircle a
 backgr
idTempl
d:"rgba
iv>
m", tex
900, li
neHeigh
ck appr
nClick=
works")
t(circl
, paddi
ms:"cen
, lette
</span>
amt:"$1
lor:"#f
a5fa",
 16px",
inBotto
em.labe
or }}>{
tom:4,
sub}</d
", text

             <div style={{ flex:1, background:BK3, borderRadius:10, padding:"11px
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
        {["Apply in Minutes","No Phone Calls Required","Track Approvals in Real
<span key={t} style={{ display:"inline-flex", alignItems:"center", gap <span style={{ fontSize:13, fontWeight:700, letterSpacing:"0.08em", <span style={{ color:"#000", opacity:0.3 }}>◆</span>
</span> ))}
</span> ))}
  </div>
</div>
{/* STATS */}
<section style={{ background:BK2, borderBottom:`1px solid rgba(255,255,255,0.05)
  <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColu
    {STATS.map(([v,l],i) => (
      <div key={l} style={{ padding:"40px 0", textAlign:"center", borderRight: i
        <div className="cond" style={{ fontSize:52, fontWeight:900, color:G, let
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:8, f
</div> ))}
  </div>
</section>
{/* HOW IT WORKS */}
<section id="how-it-works" style={{ padding:"96px 5%", maxWidth:1100, margin:"0
  <div style={{ textAlign:"center", marginBottom:64 }}>
    <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase",
    <h2 className="cond" style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:90
  </div>
  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
    {[
      ["01","Apply in Minutes","Tap through our smart application. No lengthy fo
      ["02","Track in Real Time","Watch your application status update live in t
      ["03","Accept & Get Funded","Your offer appears in the app with every term
0", te
Time","
:14, pa
textTra
` }}> mns:"re
<3?"1px
terSpac
ontWeig
auto" }
color:G
0, text
rms, no
he app.
 laid o

     ].map(([n,title,desc],i) => (
      <div key={n} style={{ background: i===1?G:BK3, color: i===1?"#000":"#fff",
        <div className="cond" style={{ fontSize:64, fontWeight:900, opacity:0.12
        <h3 className="cond" style={{ fontSize:26, fontWeight:800, textTransform
        <p style={{ fontSize:15, lineHeight:1.8, opacity: i===1?0.7:0.5, fontWei
</div> ))}
  </div>
</section>
{/* PRODUCTS */}
<section id="products" style={{ background:BK2, padding:"80px 5%", borderTop:`1p
  <div style={{ maxWidth:1100, margin:"0 auto" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"fl
      <div>
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercas
        <h2 className="cond" style={{ fontSize:"clamp(32px,4vw,52px)", fontWeigh
</div>
      <button className="btn-g" onClick={()=>setView("app")}>Apply Now →</button
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:2 }}>
      {PRODUCTS.map(p => (
        <div key={p.id} className="prod-card">
          <div style={{ fontSize:28, marginBottom:16, color:G }}>{p.icon}</div>
          <h3 className="cond" style={{ fontSize:26, fontWeight:800, textTransfo
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.
          <div style={{ display:"flex", gap:24 }}>
            <div><p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWei
            <div><p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWei
          </div>
</div> ))}
    </div>
  </div>
</section>
{/* WHY APROVUIT */}
<section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItem
    <div>
      <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase"
      <h2 className="cond" style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:
      <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.85, f
    </div>
    <div style={{ display:"grid", gap:2 }}>
{[
[" ","NoPhoneCalls","Apply,track,accept,andmessageyouradvisore
  paddin
, margi
:"upper
ght:300
x solid
ex-end"
e", col
t:900,
>
rm:"upp
75, mar
ght:600
ght:600
s:"cent
, color
900, te
ontWeig
ntirel
y

  [" ","FullTransparency","Seeexactlywhatyou'reapprovingbeforeyou [" ","PlaidConnected","Linkyourbankonce.Wepullstatementsautomat [" ","RenewalsintheApp","Whenyou'reeligibleforrenewal,itshows
      ].map(([ic,title,desc]) => (
        <div key={title} style={{ background:BK3, border:`1px solid rgba(255,255
          <span style={{ fontSize:24, flexShrink:0 }}>{ic}</span>
          <div>
            <p style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{title}</
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:
          </div>
</div> ))}
    </div>
  </div>
</section>
{/* REVIEWS */}
<section style={{ background:BK2, padding:"80px 5%", borderTop:`1px solid rgba(2
  <div style={{ maxWidth:1100, margin:"0 auto" }}>
    <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase",
    <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:90
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
      {REVIEWS.map(r => (
        <div key={r.name} style={{ background:BK3, border:`1px solid rgba(255,25
          <div style={{ display:"flex", gap:3, marginBottom:20 }}>
            {[...Array(r.stars)].map((_,i) => <span key={i} style={{ color:G, fo
          </div>
          <p style={{ fontSize:15, lineHeight:1.85, color:"rgba(255,255,255,0.6)
          <div style={{ borderTop:`1px solid rgba(255,255,255,0.07)`, paddingTop
            <p style={{ fontWeight:700, fontSize:14 }}>{r.name}</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:3
          </div>
</div> ))}
    </div>
  </div>
</section>
{/* FAQ */}
<section id="faq" style={{ padding:"80px 5%", maxWidth:780, margin:"0 auto" }}>
  <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", co
  <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900,
  {FAQS.map(([q,a],i) => (
    <div key={i}>
      <button className="faq-btn" onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
        <span className="bar" style={{ fontSize:17, fontWeight:600 }}>{q}</span>
        <span style={{ fontSize:22, color:"rgba(255,255,255,0.3)", flexShrink:0,
  sign.
ically
up in
,255,0.
p> 1.65, f
55,255,
color:G
0, text
5,255,0
ntSize:
", marg
:18 }}>
}}>{r.
lor:G,
 textTr
transi
N t

 </button>
          {faqOpen===i && <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", li
        </div>
      ))}
    </section>
    {/* CTA */}
    <section style={{ background:G, padding:"80px 5%", textAlign:"center" }}>
      <h2 className="cond" style={{ fontSize:"clamp(36px,6vw,72px)", fontWeight:900,
      <p style={{ fontSize:18, color:"rgba(0,0,0,0.6)", marginBottom:40, fontWeight:
      <button onClick={()=>setView("app")} style={{ background:"#000", color:G, bord
        Open Aprovuit →
      </button>
</section>
    {/* FOOTER */}
    <footer style={{ background:BK, borderTop:`1px solid rgba(255,255,255,0.05)`, pa
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, background:G, borderRadius:4, display:"
            <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Barlow Condense
</div>
          <span className="cond" style={{ fontSize:20, fontWeight:800, letterSpacing
        </div>
        <div style={{ display:"flex", gap:32 }}>
          <button className="nav-link" onClick={()=>setView("app")}>Client App</butt
          <button className="nav-link" onClick={()=>setView("admin")}>Partner Dashbo
</div>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2026 Aprovuit.
      </div>
    </footer>
  </div>
);
// ── CLIENT APP ───────────────────────────────────────────────────
if (view === "app") {
  const HomeTab = () => (
    <div>
      <div style={{ background:`linear-gradient(145deg,${BK},#0d1f0d)`, padding:"20p
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"ce
          <div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:4
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, background:G, borderRadius:2 }}></div
              <span className="cond" style={{ fontSize:20, fontWeight:800, color:"#f
            </div>
</div>
neHeigh
 color:
300 }}>
er:"non
dding:"
space-b
flex",
d',sans
:"0.02e
on> ard</bu
All rig
x 20px nter",
}}>Good
>
ff", le

         <button onClick={()=>setSheet({type:"notifs"})} style={{ background:"rgba(
          <div style={{ position:"absolute", top:7, right:7, width:9, height:9, ba
        </button>
      </div>
<div style={{ background:"rgba(168,255,62,0.05)", border:`1px solid ${G}20`, <spanstyle={{fontSize:24}}> </span>
<div>
          <p style={{ fontSize:14, fontWeight:700, color:G, marginBottom:2 }}>No P
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
{[[`${pendingOffers}Offer${pendingOffers!==1?"s":""}`," ",()=>setAppTa <button key={l} onClick={fn} style={{ background:"rgba(168,255,62,0.1)",
))} </div>
    </div>
    <p className="sl">Active Loans</p>
    {LOANS_DATA.map(loan => (
      <button key={loan.id} onClick={()=>setSheet({type:"loan",data:loan})} style=
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom
          <div><p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBotto
          <div style={{ textAlign:"right" }}><p style={{ fontSize:11, color:"rgba(
        </div>
        <div style={{ height:5, background:"rgba(255,255,255,0.2)", borderRadius:3
          <div style={{ height:"100%", width:`${loan.progress}%`, background:"rgba
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{loan.progres
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>Due {loan.nex
        </div>
      </button>
    ))}
    <p className="sl">Quick Actions</p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, margin:"0
{[[" ","ApplyforFunding","#f0f4ff","#3b4fd8",()=>{setApplyStep(0);setAppl <button key={l} onClick={fn} style={{ background:bg, border:"none", border
          <span style={{ fontSize:26 }}>{ic}</span>
          <span style={{ fontSize:13, fontWeight:700, color:c, fontFamily:"'DM San
        </button>
))} </div>
</div> );
const ApplyTab = () => (
  <div>
   168,255
ckgroun
border
hone Ca
}>Apply
b("off
 border
{{ disp
:12 }}>
m:4 }}>
255,255
, overf
(255,25
s}% pai
tDue}</
16px 2 yDone(
Radius:
s',sans
e
f

     <div style={{ background:`linear-gradient(145deg,${BK},#0d1f0d)`, padding:"20p
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>Ap
      <p className="cond" style={{ fontSize:28, fontWeight:900, color:"#fff", lett
      <button onClick={()=>{setApplyStep(0);setApplyDone(false);setApplyForm({prod
           New Application
      </button>
    </div>
    <p className="sl">Your Applications</p>
    {apps.map(app => (
      <button key={app.id} onClick={()=>setSheet({type:"app",data:app})} style={{
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"
          <div>
            <p style={{ fontSize:12, color:"#8e8e93", marginBottom:3 }}>{app.id}</
            <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>{app.produ
            <p style={{ fontSize:13, color:"#555", marginTop:2 }}>{fmt(app.amount)
          </div>
          <div style={{ textAlign:"right" }}>
            <span className="pill" style={{ background:APP_STATUS[app.status].bg,
            {app.offer && <p style={{ fontSize:11, color:"#007aff", fontWeight:700
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", paddingTop:1
          <p style={{ fontSize:11, color:"#8e8e93" }}>Submitted {app.submitted}</p
          <p style={{ fontSize:11, color:"#8e8e93" }}>Updated {app.updated}</p>
        </div>
        {app.status === "declined" && app.reason && (
          <div style={{ marginTop:10, background:"#fef2f2", borderRadius:10, paddi
<p style={{ fontSize:12, color:"#dc2626", lineHeight:1.5 }}> {app.re </div>
        )}
        {app.status === "approved" && app.offer && (
<div style={{ marginTop:10, background:"#f0fdf4", borderRadius:10, paddi <p style={{ fontSize:12, color:"#16a34a", fontWeight:700 }}>✓ {fmt(app <p style={{ fontSize:11, color:"#16a34a" }}>Exp {app.offer.expires}</p
</div> )}
      </button>
    ))}
    <div style={{ height:20 }}></div>
  </div>
);
const OffersTab = () => (
  <div>
    <div style={{ background:`linear-gradient(145deg,#064e3b,#022c22)`, padding:"2
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:6 }}>O
      <p className="cond" style={{ fontSize:28, fontWeight:900, color:"#fff", lett
  x 20px
plicati
erSpaci
uct:"",
display
flex-st
p>
ct}</p>
} reque
color:A
, margi
0, bord >
ng:"10p
ason}<
ng:"10p
.offer.
>
0px 20p
ffers</
erSpaci
/

       <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)" }}>No calls needed —
    </div>
    {offers.filter(o=>o.status==="pending").length > 0 && <>
      <p className="sl">Pending Offers</p>
      {offers.filter(o=>o.status==="pending").map(offer => (
        <div key={offer.id} style={{ margin:"0 16px 14px", background:"#fff", bord
          <div style={{ background:"linear-gradient(135deg,#064e3b,#022c22)", padd
            <div style={{ display:"flex", justifyContent:"space-between", alignIte
              <p style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{offer.prod
              <span style={{ background:"rgba(168,255,62,0.2)", color:G, fontSize:
</div>
            <p className="cond" style={{ fontSize:36, fontWeight:900, color:"#fff"
          </div>
          <div style={{ padding:"16px 18px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, ma
              {[["Term",offer.term],["Payment",fmt(offer.payment)],["Frequency",of
                <div key={l} style={{ background:"#f9f9fb", borderRadius:10, paddi
                  <p style={{ fontSize:10, color:"#8e8e93", fontWeight:600, textTr
                  <p style={{ fontSize:13, fontWeight:700, color:"#1c1c1e" }}>{v}<
</div> ))}
            </div>
            <p style={{ fontSize:12, color:"#8e8e93", marginBottom:12, textAlign:"
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}
              <button onClick={()=>setOffers(p=>p.map(o=>o.id===offer.id?{...o,sta
              <button onClick={()=>setOffers(p=>p.map(o=>o.id===offer.id?{...o,sta
            </div>
          </div>
        </div>
))} </>}
    {offers.filter(o=>o.status!=="pending").length > 0 && <>
      <p className="sl" style={{ color:"#8e8e93", fontSize:16 }}>Previous</p>
      {offers.filter(o=>o.status!=="pending").map(offer => (
        <div key={offer.id} className="acard" style={{ padding:"14px 16px", displa
          <div><p style={{ fontSize:14, fontWeight:700, color:"#1c1c1e" }}>{offer.
          <span className="pill" style={{ background:offer.status==="accepted"?"#d
</div> ))}
</>}
    <div style={{ height:20 }}></div>
  </div>
);
const MsgsTab = () => (
  <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
<div style={{ background:"#fff", borderBottom:"0.5px solid #e5e5ea", padding:"
accept
erRadiu
ing:"16
ms:"cen
uct}</p
11, fon
, margi
rginBot
fer.fre
ng:"10p
ansform
/p>
center"
>
tus:"de
tus:"ac
y:"flex
product
cfce7":
14px 20

       <div style={{ width:40, height:40, background:"#1c1c1e", borderRadius:"50%",
      <div><p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>Tanya Willi
      <div style={{ marginLeft:"auto", background:"#fef2f2", borderRadius:20, padd
    </div>
    <div style={{ flex:1, overflow:"auto", padding:"16px", display:"flex", flexDir
      {msgs.map(m => (
        <div key={m.id} style={{ display:"flex", justifyContent:m.from==="client"?
          {m.from==="advisor" && <div style={{ width:30, height:30, background:"#1
          <div style={{ maxWidth:"75%", background:m.from==="client"?"#1c1c1e":"#f
            <p style={{ fontSize:14, color:m.from==="client"?"#fff":"#1c1c1e", lin
            <p style={{ fontSize:10, color:m.from==="client"?"rgba(255,255,255,0.4
          </div>
        </div>
))} </div>
    <div style={{ background:"#fff", borderTop:"0.5px solid #e5e5ea", padding:"10p
      <textarea value={msgTxt} onChange={e=>setMsgTxt(e.target.value)} placeholder
      <button onClick={sendMsg} style={{ width:42, height:42, background:"#1c1c1e"
    </div>
  </div>
);
const LoansTab = () => (
  <div>
    <div style={{ background:`linear-gradient(145deg,${BK},#0d1f0d)`, padding:"20p
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>Ou
      <p className="cond" style={{ fontSize:42, fontWeight:900, color:G, letterSpa
    </div>
    <p className="sl">Active Loans</p>
    {LOANS_DATA.map(loan => (
      <button key={loan.id} onClick={()=>setSheet({type:"loan",data:loan})} style=
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:44, height:44, background:loan.color+"18", borderR
            <div><p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>{loan
</div>
          <span className="pill" style={{ background:"#dcfce7", color:"#16a34a" }}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8,
          {[["Balance",fmt(loan.balance)],["Payment",fmt(loan.payment)],["Next Due
            <div key={l} style={{ background:"#f9f9fb", borderRadius:10, padding:"
              <p style={{ fontSize:9, color:"#8e8e93", fontWeight:600, textTransfo
              <p style={{ fontSize:12, fontWeight:700, color:"#1c1c1e" }}>{v}</p>
            </div>
))} </div>
        <div style={{ height:5, background:"#f2f2f7", borderRadius:3, overflow:"hi
 displa
ams</p>
ing:"5p
ection:
"flex-e
c1c1e",
ff", bo
eHeight
)":"#c7
x 14px"
="Messa
, borde
x 20px
tstandi
cing:"-
{{ disp
flex-st
adius:1
.produc
>Curren
marginB
",loan.
8px" }}
rm:"upp
dden" }

           <div style={{ height:"100%", width:`${loan.progress}%`, background:loan.
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
            <div style={{ display:"flex", justifyContent:"space-between", marginBo
              <div><p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{l.
              <button onClick={close} style={{ background:"#f2f2f7", border:"none"
            </div>
            <div style={{ background:`linear-gradient(135deg,${l.color},${l.color}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14,
                {[["Balance",fmt(l.balance)],["Original",fmt(l.original)],["Paid",
              </div>
              <div style={{ height:5, background:"rgba(255,255,255,0.2)", borderRa
                <div style={{ height:"100%", width:`${l.progress}%`, background:"r
              </div>
              <p style={{ fontSize:11, opacity:0.5, marginTop:6 }}>{l.progress}% p
            </div>
            {[["Rate",l.rate],["Frequency",l.freq],["Next Due",l.nextDue]].map(([k
              <div key={k} style={{ display:"flex", justifyContent:"space-between"
                <p style={{ fontSize:14, color:"#8e8e93" }}>{k}</p><p style={{ fon
</div> ))}
            <button onClick={close} className="abtn" style={{ background:"#f2f2f7"
          </div>;
})()}
        {sheet.type === "app" && (() => {
          const a = sheet.data;
          return <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBo
              <div><p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{a.
              <button onClick={close} style={{ background:"#f2f2f7", border:"none"
</div>
color,
ttom:20
product
, width
cc)`, b
 margin
fmt(l.p
dius:3,
gba(255
aid · {
,v]) =>
, paddi
tSize:1
, color
ttom:16
product
, width

     <span className="pill" style={{ background:APP_STATUS[a.status].bg, co
    <div style={{ marginBottom:20 }}>
      {[["Submitted",true,a.submitted],["Under Review",a.status!=="under_r
        <div key={step} style={{ display:"flex", gap:14, marginBottom:14 }
          <div style={{ display:"flex", flexDirection:"column", alignItems
            <div style={{ width:28, height:28, borderRadius:"50%", backgro
            {i<3 && <div style={{ width:2, flex:1, background:done?"#1c1c1
          </div>
          <div style={{ paddingTop:4 }}>
            <p style={{ fontSize:14, fontWeight:700, color:done?"#1c1c1e":
            <p style={{ fontSize:12, color:"#8e8e93", marginTop:1 }}>{note
          </div>
</div> ))}
    </div>
    {a.status==="declined" && a.reason && <div style={{ background:"#fef2f
    {a.status==="approved" && a.offer && <div style={{ background:"#f0fdf4
      <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", marginBott
      {[["Amount",fmt(a.offer.amount)],["Term",a.offer.term],["Payment",`$
      <button onClick={()=>{close();setAppTab("offers")}} className="abtn"
</div>}
    <button onClick={close} className="abtn" style={{ background:"#f2f2f7"
  </div>;
})()}
{sheet.type === "apply" && (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", marginBo
      <p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>{applyDo
      <button onClick={close} style={{ background:"#f2f2f7", border:"none"
    </div>
    {applyDone ? (
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ width:68, height:68, background:"#dcfce7", borderRad
        <p style={{ fontSize:17, fontWeight:700, color:"#1c1c1e", marginBo
        <p style={{ fontSize:14, color:"#8e8e93", lineHeight:1.6, marginBo
        <div className="gtag" style={{ justifyContent:"center", marginBott
        <button onClick={close} className="abtn" style={{ background:"#1c1
</div> ):(
      <div>
        <div style={{ display:"flex", gap:6, marginBottom:22 }}>
          {["Product","Amount","Confirm"].map((s,i) => <div key={s} style=
        </div>
        {applyStep===0 && <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e", margin
          <div style={{ display:"grid", gap:10 }}>
lor:APP
eview"|
}>
:"cente
und:don
e":"#f2
"#c7c7c
}</p>
2", bor
", bord
om:10 }
{fmt(a.
 style=
, color
ttom:20
ne?"Sub
, width
ius:"50
ttom:8
ttom:20
om:20 }
c1e", c
{{ flex
Bottom:

 {[["→","Term Loan","$10K–$500K"],["⟳","Line of Credit","$10K–$ <div key={name} className={`opt${applyForm.product===name?"
                <span style={{ fontSize:22, width:32, textAlign:"center" }
                <div style={{ flex:1 }}><p style={{ fontSize:15, fontWeigh
                {applyForm.product===name && <span style={{ fontWeight:800
</div> ))}
          </div>
        </div>}
        {applyStep===1 && <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e", margin
          <div style={{ background:"#f9f9fb", borderRadius:16, padding:20,
            <p style={{ fontSize:11, color:"#8e8e93", fontWeight:600, marg
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:32, fontWeight:700, color:"#1c1c1e"
              <input type="number" value={applyForm.amount} onChange={e=>s
            </div>
</div>
<div className="gtag">✓ Bank statements auto-pulled via Plaid — </div>}
        {applyStep===2 && <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#1c1c1e", margin
          <div style={{ background:"#f9f9fb", borderRadius:16, padding:16,
            {[["Product",applyForm.product||"—"],["Amount",`$${Number(appl
              <div key={k} style={{ display:"flex", justifyContent:"space-
                <p style={{ fontSize:14, color:"#8e8e93" }}>{k}</p><p styl
</div> ))}
          </div>
        </div>}
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          {applyStep>0 && <button onClick={()=>setApplyStep(s=>s-1)} class
          {applyStep<2
            ? <button onClick={()=>setApplyStep(s=>s+1)} className="abtn"
            : <button onClick={submitApp} className="abtn" style={{ backgr
          }
        </div>
      </div>
)} </div>
)}
{sheet.type === "notifs" && (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", marginBo
      <p style={{ fontSize:22, fontWeight:800, color:"#1c1c1e" }}>Notifica
      <button onClick={close} style={{ background:"#f2f2f7", border:"none"
5M"],[
sel":""
}>{ic}<
t:700,
, fontS
Bottom:
 margin
inBotto
}}>$</s
etApply
no uplo
Bottom:
 margin
yForm.a
between
e={{ fo
Name="a
style={
ound:G,
ttom:20
tions</
, width
"

 </div>
{[{ic:" ",t:"APP-2041Approved!",b:"Your$150KTermLoanapproved.Vi
              <div key={n.t} style={{ display:"flex", gap:14, padding:"14px 0", bo
                <div style={{ width:42, height:42, background:n.unread?"#1c1c1e":"
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:n.unread?700:600, color:"#1c
                  <p style={{ fontSize:13, color:"#8e8e93", marginTop:2, lineHeigh
                  <p style={{ fontSize:11, color:"#c7c7cc", marginTop:3 }}>{n.time
</div>
                {n.unread && <div style={{ width:8, height:8, background:"#007aff"
              </div>
))}
            <button onClick={close} className="abtn" style={{ background:"#f2f2f7"
          </div>
)} </div>
</div> );
};
const TABS = [
{id:"home",icon:" ",label:"Home"},
{id:"apply",icon:" ",label:"Apply",badge:apps.filter(a=>a.status==="under_r {id:"offers",icon:" ",label:"Offers",badge:pendingOffers}, {id:"messages",icon:" ",label:"Advisor",badge:1},
{id:"loans",icon:" ",label:"Loans"},
];
return (
  <div style={{ background:BK, minHeight:"100vh", display:"flex", flexDirection:"c
    <style>{CSS}</style>
    <button onClick={()=>setView("landing")} style={{ background:"none", border:"n
    <div className="phone">
      <div className="sb">
        <span style={{ fontSize:14, fontWeight:700, color:"#1c1c1e" }}>9:41</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:7, height:7, background:G, borderRadius:2 }}></div>
          <span className="cond" style={{ fontSize:13, fontWeight:800, color:"#1c1
        </div>
         <span style={{ fontSize:12, color:"#1c1c1e" }}>●●●
</div>
<div className="scr">
  {appTab==="home" && <HomeTab />}
  {appTab==="apply" && <ApplyTab />}
  {appTab==="offers" && <OffersTab />}
  {appTab==="messages" && <MsgsTab />}
  {appTab==="loans" && <LoansTab />}
</span>
ew off
rderBot
#f2f2f7
1c1e" }
t:1.4 }
}</p>
, borde
, color
eview"
olumn",
one", c
c1e", l
e
)

         </div>
        {sheet && <SheetContent />}
        <div className="tb">
          {TABS.map(t => (
            <button key={t.id} className="tbi" onClick={()=>setAppTab(t.id)}>
              {t.badge > 0 && <div className="badge">{t.badge}</div>}
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontSize:10, fontWeight:600, color:appTab===t.id?"#1c1c
              {appTab===t.id && <div style={{ width:4, height:4, borderRadius:"50%",
            </button>
          ))}
        </div>
      </div>
</div> );
}
// ── ADMIN DASHBOARD ──────────────────────────────────────────────
if (view === "admin") return (
  <div style={{ fontFamily:"'DM Sans',sans-serif", display:"flex", minHeight:"100vh"
    <style>{CSS}</style>
    <div style={{ width:230, background:BK, flexShrink:0, display:"flex", flexDirect
      <div style={{ padding:"24px 20px 20px", borderBottom:`1px solid rgba(255,255,2
        <div style={{ width:26, height:26, background:G, borderRadius:4, display:"fl
          <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Barlow Condensed'
</div>
        <span className="cond" style={{ fontSize:18, fontWeight:800, color:"#fff", l
      </div>
<div style={{ padding:"12px 0", flex:1 }}>
{[[" ","Applications",true],[" ","Analytics",false],[" ","Clients",false]
          <div key={l} onClick={()=>setAdminTab(l.toLowerCase())} style={{ padding:"
            <span>{ic}</span><span>{l}</span>
</div> ))}
      </div>
      <div style={{ padding:"16px 20px", borderTop:`1px solid rgba(255,255,255,0.06)
        <button onClick={()=>setView("app")} style={{ background:"rgba(168,255,62,0.
        <button onClick={()=>setView("landing")} style={{ background:"none", border:
      </div>
    </div>
    <div style={{ flex:1, padding:"36px 40px", overflow:"auto" }}>
      <div style={{ marginBottom:32, display:"flex", justifyContent:"space-between",
        <div>
          <h1 className="cond" style={{ fontSize:40, fontWeight:900, letterSpacing:"
          <p style={{ fontSize:14, color:"#888" }}>Track and manage all funding appl
        </div>
        <button onClick={()=>setView("app")} style={{ background:BK, color:G, border
   1e":"#8
 backgr
, backg
ion:"co
55,0.06
ex", al
,sans-s
etterSp
,["⚙", 12px 20
`, disp
08)", b
"1px so
alignI
-0.02em
ication
:`1px s
"

       + New Application
    </button>
  </div>
  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, mar
    {[["Total",adminApps.length,"#fff"],["Funded",adminApps.filter(a=>a.status==
      <div key={l} style={{ background:bg, border:"1px solid #e5e3de", padding:"
        <p style={{ fontSize:11, color:"#888", fontWeight:600, letterSpacing:"0.
        <p className="cond" style={{ fontSize:48, fontWeight:900, letterSpacing:
</div> ))}
  </div>
  <div style={{ background:"#fff", border:"1px solid #e5e3de", overflow:"hidden"
    <table style={{ width:"100%", borderCollapse:"collapse" }}>
      <thead>
        <tr style={{ borderBottom:"1px solid #e5e3de" }}>
          {["Business","Owner","Product","Amount","Revenue","Credit","Status","D
            <th key={h} style={{ padding:"14px 16px", textAlign:"left", fontSize
          ))}
        </tr>
      </thead>
      <tbody>
        {adminApps.map(app => (
          <tr key={app.id} className="tbl-row" style={{ borderBottom:"1px solid
            <td style={{ padding:"14px 16px", fontSize:14, fontWeight:700 }}>{ap
            <td style={{ padding:"14px 16px", fontSize:14, color:"#555" }}>{app.
            <td style={{ padding:"14px 16px", fontSize:13, color:"#666" }}>{app.
            <td style={{ padding:"14px 16px", fontSize:14, fontWeight:700 }}>{ap
            <td style={{ padding:"14px 16px", fontSize:13, color:"#666" }}>{app.
            <td style={{ padding:"14px 16px", fontSize:13, color:"#666" }}>{app.
            <td style={{ padding:"14px 16px" }}>
              <span style={{ fontSize:12, padding:"4px 12px", fontWeight:700, bo
            </td>
            <td style={{ padding:"14px 16px", fontSize:13, color:"#aaa" }}>{app.
            <td style={{ padding:"14px 16px" }}><button style={{ background:"non
          </tr>
))} </tbody>
    </table>
  </div>
</div>
{drawer && (
  <div style={{ position:"fixed", right:0, top:0, bottom:0, width:400, backgroun
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"fl
      <h3 className="cond" style={{ fontSize:26, fontWeight:900, textTransform:"
      <button onClick={()=>setDrawer(null)} style={{ background:"none", border:"
    </div>
    <p style={{ fontSize:14, color:"#888", marginBottom:20 }}>{drawer.owner}</p>
ginBott
="Funde
24px 28
08em",
"-0.02e
, borde
ate",""
:11, fo
#f5f4f1
p.biz}<
owner}<
product
p.amoun
rev}</t
credit}
rderRad
date}</
e", bor
d:"#fff
ex-star
upperca
none",

 