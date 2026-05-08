import React, { useState, useEffect } from 'react';

const G = "#a8ff3e";
const BK = "#0a0a0a";
const BK2 = "#111111";
const BK3 = "#161616";

const APPLY_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Sora',sans-serif; background:#0a0a0a; -webkit-font-smoothing:antialiased; }
  input[type=range] { -webkit-appearance:none; width:100%; height:2px; background:rgba(255,255,255,.15); border-radius:2px; outline:none; cursor:pointer; margin:16px 0 8px; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; background:#a8ff3e; border:none; border-radius:50%; cursor:pointer; box-shadow:0 0 0 4px rgba(168,255,62,.12); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fadeup { animation:fadeUp .35s ease both; }
  .credit-box { border:1.5px solid rgba(255,255,255,.1); border-radius:8px; padding:12px 6px; cursor:pointer; text-align:center; transition:all .15s; background:rgba(255,255,255,.04); }
  .credit-box.sel { border-color:#a8ff3e; background:rgba(168,255,62,.06); }
  .name-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:480px) { .name-row { grid-template-columns:1fr; } }
`;

// ── SUPABASE CONFIG ──────────────────────────────────────────────
// Replace with your actual Supabase URL and anon key from supabase.com
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

// Supabase helper — lightweight fetch wrapper (no SDK needed)
const db = {
  async insert(table, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"return=representation"},
        body:JSON.stringify(data)
      });
      return await res.json();
    } catch(e) { console.error("DB insert error:", e); return null; }
  },
  async select(table, filter="") {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
        headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`}
      });
      return await res.json();
    } catch(e) { console.error("DB select error:", e); return []; }
  },
  async update(table, filter, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"return=representation"},
        body:JSON.stringify(data)
      });
      return await res.json();
    } catch(e) { console.error("DB update error:", e); return null; }
  },
  async uploadFile(bucket, path, file) {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method:"POST",
        headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":file.type},
        body:file
      });
      return await res.json();
    } catch(e) { console.error("Storage upload error:", e); return null; }
  }
};

const useDB = SUPABASE_URL !== "YOUR_SUPABASE_URL"; // true when configured

// ── EMAIL CONFIG ─────────────────────────────────────────────────
const ADMIN_EMAIL = "info@aprovuit.com"; // Make sure Formspree forms send to this email
const FORMSPREE_ADMIN  = "https://formspree.io/f/xbdpdnby";
const FORMSPREE_CLIENT = "https://formspree.io/f/xdapaqvw";

async function sendEmail(url, data) {
  try {
    const res = await fetch(url, {
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify(data),
    });
    const json = await res.json();
    return json.ok;
  } catch(e) { console.error("Email error:", e); return false; }
}

async function sendApplicationEmail(data) {
  await sendEmail(FORMSPREE_ADMIN, {
    _subject:`🔔 New Application — ${data.company} | ${data.loanAmt}`,
    _replyto:data.email,
    "App ID":data.id, "Submitted":data.submittedAt,
    "Name":`${data.firstName} ${data.lastName}`,
    "Email":data.email, "Phone":data.phone,
    "Loan Amount":data.loanAmt, "Purpose":data.purpose,
    "Timeline":data.timeline, "Estimated":data.estimatedQualify,
    "Company":data.company, "Industry":data.industry,
    "Years":data.years, "Revenue":data.annualRev,
    "Credit":data.creditRating,
    "Upload Link":`https://aprovuit.com/?upload=${data.id}`,
  });
}

async function sendClientEmail(data) {
  await sendEmail(FORMSPREE_CLIENT, {
    _subject:`Done Application Received — ${data.company} | Aprovuit`,
    _replyto:ADMIN_EMAIL,
    email:data.email,
    "Hi":`${data.firstName},`,
    "Message":`Your application for ${data.company} (ID: ${data.id}) has been received! We will be in touch within 2-4 hours. No phone calls.`,
    "Upload your documents here":`https://aprovuit.com/?upload=${data.id}`,
  });
}

async function sendOfferEmail(merchantEmail, merchantName, offer) {
  await sendEmail(FORMSPREE_CLIENT, {
    _subject:`💼 You Have a New Funding Offer — Aprovuit`,
    _replyto:ADMIN_EMAIL,
    email:merchantEmail,
    "Hi":`${merchantName},`,
    "Message":"You have a new funding offer in your Aprovuit dashboard. Log in to review all terms and accept or decline — no pressure, no calls.",
    "Product":offer.product, "Amount":offer.amount,
    "Term":offer.term, "Monthly Payment":offer.payment,
    "View Offer At":"https://aprovuit.com",
  });
}

async function sendUploadNotificationEmail(appId, files) {
  await sendEmail(FORMSPREE_ADMIN, {
    _subject:`Documents Uploaded — ${appId} | Aprovuit`,
    "App ID":appId, "Files Uploaded":files,
    "Action":"Log in to admin panel to review documents.",
  });
}

function fmtAmt(n) {
  if (!n) return "$0";
  const num = typeof n === "string" ? parseInt(n.replace(/\D/g,"")) : n;
  if (num >= 1000000) return "$" + (num/1000000).toFixed(1) + "M";
  return "$" + Math.round(num).toLocaleString();
}

// ── CSS ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'Sora',sans-serif; background:#0a0a0a; color:#fff; -webkit-font-smoothing:antialiased; }
  ::selection { background:#a8ff3e; color:#000; }
  input, select, textarea, button { font-family:'Sora',sans-serif; }
  .cond { font-family:'Sora',sans-serif; letter-spacing:-.03em; }
  .mono { font-family:'DM Mono',monospace; }
  .nav-link { font-size:13px; font-weight:500; color:rgba(255,255,255,.4); cursor:pointer; background:none; border:none; font-family:'Sora',sans-serif; transition:color .15s; letter-spacing:-.01em; }
  .nav-link:hover { color:#fff; }
  .btn-green { display:inline-flex; align-items:center; justify-content:center; background:#a8ff3e; color:#000; border:none; padding:11px 24px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Sora',sans-serif; transition:all .15s; letter-spacing:-.01em; }
  .btn-green:hover { background:#bfff52; }
  .btn-ghost { display:inline-flex; align-items:center; justify-content:center; background:transparent; color:rgba(255,255,255,.55); border:1px solid rgba(255,255,255,.12); padding:11px 24px; border-radius:6px; font-size:13px; font-weight:500; cursor:pointer; font-family:'Sora',sans-serif; transition:all .15s; letter-spacing:-.01em; }
  .btn-ghost:hover { border-color:rgba(255,255,255,.3); color:#fff; }
  .card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:10px; }
  .prod-card { background:#111; border:1px solid rgba(255,255,255,.07); padding:28px; transition:all .2s; border-radius:10px; }
  .prod-card:hover { border-color:rgba(168,255,62,.3); transform:translateY(-2px); }
  .sb-item { display:flex; align-items:center; gap:10px; padding:10px 20px; font-size:13px; cursor:pointer; color:rgba(255,255,255,.35); transition:all .15s; border-left:2px solid transparent; letter-spacing:-.01em; font-weight:500; }
  .sb-item:hover { color:rgba(255,255,255,.7); background:rgba(255,255,255,.02); }
  .sb-item.active { color:#fff; border-left-color:#a8ff3e; background:rgba(168,255,62,.04); }
  .fc-inp { width:100%; padding:12px 14px; border-radius:8px; border:1px solid rgba(255,255,255,.1); font-size:14px; font-family:'Sora',sans-serif; color:#fff; background:rgba(255,255,255,.04); margin-bottom:12px; display:block; outline:none; transition:border-color .15s; }
  .fc-inp:focus { border-color:rgba(168,255,62,.5); }
  .fc-inp::placeholder { color:rgba(255,255,255,.2); }
  .fc-sel { width:100%; padding:12px 14px; border-radius:8px; border:1px solid rgba(255,255,255,.1); font-size:14px; font-family:'Sora',sans-serif; color:#fff; background:rgba(255,255,255,.04); margin-bottom:12px; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; cursor:pointer; outline:none; transition:border-color .15s; }
  .fc-sel:focus { border-color:rgba(168,255,62,.5); }
  .fc-sel option { background:#1a1a1a; color:#fff; }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .tick { display:flex; animation:ticker 35s linear infinite; width:max-content; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fadeup { animation:fadeUp .4s ease both; }
  .pill { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:.02em; }
  .pill.green { background:rgba(168,255,62,.1); color:#a8ff3e; }
  .pill.yellow { background:rgba(245,158,11,.1); color:#f59e0b; }
  .pill.blue { background:rgba(96,165,250,.1); color:#60a5fa; }
  .pill.red { background:rgba(239,68,68,.1); color:#ef4444; }
  .metric { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:18px; }
  input[type=range] { -webkit-appearance:none; width:100%; height:2px; background:rgba(255,255,255,.15); border-radius:2px; outline:none; cursor:pointer; margin:16px 0 8px; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; background:#a8ff3e; border:none; border-radius:50%; cursor:pointer; box-shadow:0 0 0 4px rgba(168,255,62,.12); }
  .faq-btn { width:100%; background:none; border:none; color:#fff; display:flex; justify-content:space-between; align-items:center; padding:20px 0; cursor:pointer; text-align:left; font-family:'Sora',sans-serif; border-bottom:1px solid rgba(255,255,255,.06); gap:16px; }
  .dash-main { flex:1; padding:32px; background:#0a0a0a; overflow:auto; }
  .offer-card { background:#0f1a0f; border:1px solid rgba(168,255,62,.12); border-radius:12px; padding:24px; margin-bottom:14px; }
  .loan-card { background:#111; border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:20px; margin-bottom:12px; }
  .progress-bar { height:2px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; margin:10px 0 6px; }
  .progress-fill { height:100%; border-radius:2px; }
  .msg { max-width:75%; padding:10px 14px; border-radius:10px; font-size:13px; line-height:1.55; }
  .msg.advisor { background:#161616; color:rgba(255,255,255,.75); align-self:flex-start; }
  .msg.client { background:#a8ff3e; color:#000; align-self:flex-end; font-weight:600; }
  .lang-pill { display:flex; border:1px solid rgba(255,255,255,.1); border-radius:6px; overflow:hidden; }
  .lb { padding:5px 12px; font-size:11px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all .15s; letter-spacing:.02em; }
  .tbl-row:hover td { background:rgba(255,255,255,.02); }
  .credit-box { border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:12px 6px; cursor:pointer; text-align:center; transition:all .15s; background:rgba(255,255,255,.03); }
  .credit-box.sel { border-color:#a8ff3e; background:rgba(168,255,62,.06); }
  @media (max-width:768px) {
    .hero-grid { grid-template-columns:1fr !important; gap:40px !important; }
    .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
    .how-grid { grid-template-columns:1fr !important; }
    .products-grid { grid-template-columns:1fr !important; }
    .reviews-grid { grid-template-columns:1fr !important; }
    .dash-wrap { flex-direction:column !important; }
    .sidebar { width:100% !important; display:flex !important; overflow-x:auto !important; padding:0 !important; border-right:none !important; border-bottom:1px solid rgba(255,255,255,.06) !important; }
    .sb-item { border-left:none !important; border-bottom:2px solid transparent !important; white-space:nowrap !important; padding:12px 16px !important; }
    .sb-item.active { border-bottom-color:#a8ff3e !important; border-left-color:transparent !important; }
    .metrics-grid { grid-template-columns:repeat(2,1fr) !important; }
    .nav-desktop { display:none !important; }
    .nav-mobile { display:flex !important; }
    .offer-grid { grid-template-columns:repeat(2,1fr) !important; }
    .admin-wrap { flex-direction:column !important; }
    .admin-side { width:100% !important; display:flex !important; overflow-x:auto !important; }
    .dash-main { padding:16px !important; }
    nav { padding:0 4% !important; height:54px !important; }
    section { padding-left:5% !important; padding-right:5% !important; padding-top:64px !important; padding-bottom:64px !important; }
    .hero-mockup { display:none !important; }
    .hero-grid { padding-top:80px !important; padding-bottom:60px !important; }
    .why-grid { grid-template-columns:1fr !important; }
  }
  @media (max-width:480px) {
    .metrics-grid { grid-template-columns:1fr 1fr !important; }
    .hero-btns { flex-direction:column !important; align-items:stretch !important; gap:10px !important; }
    .hero-btns button { width:100% !important; text-align:center !important; }
    .offer-btns { flex-direction:column !important; }
    .name-row { grid-template-columns:1fr !important; }
    .apply-card { padding:24px 18px !important; border-radius:10px !important; }
    .credit-grid { grid-template-columns:repeat(2,1fr) !important; }
    .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
    .reviews-grid { grid-template-columns:1fr !important; }
    .how-grid { grid-template-columns:1fr !important; }
    .products-grid { grid-template-columns:1fr !important; }
    h1 { font-size:clamp(34px,9vw,52px) !important; line-height:1.05 !important; }
    h2 { font-size:clamp(24px,7vw,36px) !important; }
    p { font-size:14px !important; }
    .ticker-text { font-size:10px !important; }
    section { padding-left:4% !important; padding-right:4% !important; padding-top:52px !important; padding-bottom:52px !important; }
  }
`;

// ── TRANSLATIONS ─────────────────────────────────────────────────
const T = {
  en: {
    nav: { products:"Products", howItWorks:"How It Works", faq:"FAQ", login:"Log In", apply:"Get Started" },
    hero: { badge:"Business Funding, Reimagined.", h1:"Real Funding.", h2:"Full Transparency.", sub:"Fast working capital for established businesses. Apply in minutes, get an offer in hours, and track everything in real time from your dashboard.", cta1:"Get Started →", cta2:"Log In to Dashboard" },
    ticker: ["Working Capital","Revenue-Based Financing","Term Loans","Lines of Credit","Equipment Financing","Same-Day Funding","Track Your Deal Live","Upload Docs Securely","580+ Credit OK","No Hidden Fees","Real Humans. Real Funding."],
    stats: [["$500M+","Funded"],["10,000+","Businesses Served"],["24 hrs","Avg. Funding Time"],["580+","Min. Credit Score"]],
    how: { badge:"How It Works", h:"Simple. Fast. Transparent.", steps:[["01","Apply in Minutes","Complete our application online. Upload your documents securely. No phone interview. No paperwork."],["02","We Work the Deal","Our team reviews your file, shops it to our funding network, and works to get you the best terms available."],["03","Track Everything Live","Your dashboard updates in real time — offer received, documents needed, deal approved. You see every step."]] },
    features: { badge:"Platform Features", h:"Your Funding. Fully Visible.",
      items:[
        {icon:"↗",name:"Real-Time Deal Tracking",desc:"See exactly where your deal stands at every stage — submitted, under review, approved, funded. No guessing."},
        {icon:"◻",name:"Offer Management",desc:"Review every term of your offer clearly before you sign. Factor rate, payment amount, term — all in one place."},
        {icon:"↑",name:"Secure Document Upload",desc:"Upload bank statements, ID, and voided checks directly through the platform. 256-bit encrypted."},
        {icon:"◎",name:"Balance & Payment Tracking",desc:"Once funded, monitor your outstanding balance, payment schedule, and history directly in your dashboard."},
        {icon:"◈",name:"Renewal Tracking",desc:"When you're eligible for renewal, it appears in your dashboard automatically. No cold calls."},
        {icon:"◉",name:"Direct Messaging",desc:"Message your Aprovuit advisor directly through the platform. Every conversation is in writing."},
      ]
    },
    products: { badge:"Funding Products", h:"Working Capital Solutions", amount:"Amount", term:"Term",
      items:[
        {icon:"→",name:"Term Loan",range:"$10K–$500K",term:"3–24 months",desc:"Fixed daily or weekly payments. Ideal for expansion, hiring, or one-time investments. No prepayment penalties — strong discounts if paid off early.",best:["Business expansion","Hiring & payroll","Renovations","Large equipment purchases"],reqs:["6+ months in business","$10K+ monthly revenue","580+ credit score","Soft credit pull only"],how:"Receive a lump sum upfront. Fixed daily or weekly payments. Pay off early and save — we offer industry-leading prepayment discounts.",color:"#a8ff3e"},
        {icon:"↺",name:"Line of Credit",range:"$10K–$5M",term:"Revolving",desc:"Draw what you need, repay, and draw again. Only pay for what you use. Perfect for working capital.",best:["Working capital","Seasonal inventory","Unexpected expenses","Ongoing cash flow"],reqs:["6+ months in business","$15K+ monthly revenue","600+ credit score","Soft credit pull only"],how:"Approved once, draw when needed. Your limit replenishes as you repay. Only pay interest on what you use.",color:"#60a5fa"},
        {icon:"↯",name:"Revenue-Based Advance",range:"$5K–$500K",term:"Flexible repayment",desc:"Payments tied to your daily revenue. Pay more when business is good, less when slow. Industry-leading prepayment discounts.",best:["Restaurants & retail","Seasonal businesses","Fast cash needs","Card-processing businesses"],reqs:["6+ months in business","$10K+ monthly revenue","No minimum credit score","Soft credit pull only"],how:"Receive capital fast — often same day. Payments flex with your revenue automatically. Strong discounts for early payoff.",color:"#f59e0b"},
        {icon:"◈",name:"Equipment Financing",range:"$5K–$2M",term:"Up to 60 months",desc:"Finance the equipment your business needs. The equipment serves as collateral — easier approval, lower cost.",best:["Commercial vehicles","Machinery & tools","Technology & software","Medical equipment"],reqs:["6+ months in business","$8K+ monthly revenue","560+ credit score","Equipment serves as collateral"],how:"Equipment is the collateral, making approval easier. Fixed payments over the term. Own the equipment outright at the end.",color:"#c084fc"},
      ]
    },
    reviews: { badge:"What Business Owners Say", h:"Trusted by Business Owners Across the US",
      items:[
        {name:"Marcus T.",biz:"Logistics, Texas",text:"Approved in hours and funded the next morning. The dashboard showed me every step of the deal — no chasing, no surprises. Best funding experience I've had.",stars:5},
        {name:"Priya S.",biz:"Med Spa, California",text:"My advisor found me a better rate than I expected. I uploaded my documents through the platform and could see the offer the same day. Incredibly smooth.",stars:5},
        {name:"Darnell R.",biz:"Construction, Georgia",text:"I've worked with other brokers before but never had this level of visibility into the process. Got funded, saw every term clearly, knew exactly what I signed.",stars:5},
      ]
    },
    faq: { badge:"FAQ", h:"Common Questions", items:[
      ["What is Aprovuit?","Aprovuit is a business funding platform. We connect established businesses with working capital solutions — fast. Apply online, get an offer in hours, and manage everything from your dashboard. No phone calls. No runaround."],
      ["Does Aprovuit lend money directly?","Yes. Aprovuit provides funding directly from our own capital for qualifying applications. We also work with a network of trusted funding partners to offer additional products and options. In both cases, your deal is managed end to end through our platform."],
      ["What are the minimum requirements?","Generally: 6+ months in business, $10,000+ monthly revenue, 580+ credit score. All products require 6+ months in business. Submitting does not guarantee an offer."],
      ["Will this affect my credit score?","No. We use a soft credit inquiry only — zero impact to your score. A hard pull may occur only if you accept a final offer from a funding partner."],
      ["Are there prepayment penalties?","No. We offer industry-leading prepayment discounts — the earlier you pay off, the more you save. A $50K advance with $625 monthly payments could cost significantly less if paid early."],
      ["How does Aprovuit make money?","Aprovuit earns a broker fee paid by the funding partner when a deal is successfully funded — not from you. There is no cost to apply. All fees are disclosed before you sign."],
      ["How long does funding take?","Most deals are reviewed within 2–4 business hours. Many clients receive funding within 24 hours of approval."],
      ["What documents do I need?","Typically: 3–6 months of business bank statements, a government-issued ID, and a voided business check. All uploaded securely through the platform."],
    ] },
    cta: { h:"Real Funding. Full Transparency.", sub:"Apply in minutes. Our team works your deal. You track everything live.", btn:"Get Started →" },
    footer: { rights:"© 2026 Aprovuit. All rights reserved. · aprovuit.com" },
    apply: {
      howMuch:"How much do you need?",
      qualAmt:"You may qualify for up to",
      creditLabel:"My credit score is",
      revenueLabel:"My monthly revenue is",
      credits:[["excellent","Excellent","750+"],["good","Good","680+"],["fair","Fair","580+"],["poor","Poor","<580"]],
      steps:["Funding","Business","Your Account","Review"],
      continueBtn:"Continue →", backBtn:"← Back", submitBtn:"Submit Request →",
      purposeLabel:"Purpose of financing", purposeOpts:["Select...","Working Capital","Equipment Purchase","Expansion","Hiring","Inventory","Renovation","Debt Consolidation","Other"],
      timelineLabel:"When do you need funds?", timelineOpts:["Select...","ASAP","Within 1 week","Within 2 weeks","Within a month","No rush"],
      companyLabel:"Business Name", companyPH:"Your business name",
      industryLabel:"Industry", industryOpts:["Select...","Restaurant / Food Service","Retail","Construction","Healthcare / Medical","Transportation / Logistics","Professional Services","Technology","Manufacturing","Other"],
      yearsLabel:"Time in Business", yearsOpts:["Select...","3–6 months","6–12 months","1–2 years","2–5 years","5+ years"],
      annualLabel:"Annual Revenue", annualOpts:["Select...","Under $100K","$100K–$250K","$250K–$500K","$500K–$1M","$1M–$5M","$5M+"],
      firstNameLabel:"First Name", lastNameLabel:"Last Name",
      emailLabel:"Email Address", emailPH:"you@yourbusiness.com",
      passwordLabel:"Create Password", passwordPH:"Min. 8 characters",
      phoneLabel:"Phone Number", phonePH:"(555) 000-0000",
      successH:"Application Received!",
      successP:"Your application is being reviewed by our team. We'll work to get you an offer within 2–4 business hours. Track your deal status live in your dashboard.",
      nextTitle:"What happens next:",
      nextSteps:["Application reviewed within 2–4 hours","Offer delivered to your dashboard","Review terms and accept — no pressure"],
      estLabel:"Your estimated pre-qualification",
      estNote:"*For illustrative purposes. Subject to full review.",
      loginBtn:"Go to My Dashboard →", uploadBtn:"Upload Documents",
    },
    login: { h:"Welcome Back", sub:"Log in to your Aprovuit dashboard.", email:"Email Address", password:"Password", btn:"Log In →", forgot:"Forgot password?", noAccount:"No account?", applyLink:"Apply Now", smsH:"Verify Your Identity", smsSub:"Enter the 6-digit code sent to your phone.", smsPlaceholder:"000000", smsBtn:"Verify →", smsResend:"Resend code" },
    dash: { overview:"Overview", offers:"Offers", loans:"Active Funding", docs:"Documents", msgs:"Messages", settings:"Settings", signOut:"Sign Out", dealStatus:"Deal Status", noOffers:"No offers yet. Our team is reviewing your application.", noLoans:"No active funding yet.", uploadBtn:"Upload Documents", msgAdvisor:"Your Advisor", msgPlaceholder:"Message your advisor...", sendBtn:"Send" },
  },
  es: {
    nav: { products:"Productos", howItWorks:"Cómo Funciona", faq:"Preguntas", login:"Entrar", apply:"Comenzar" },
    hero: { badge:"Financiamiento Empresarial Reinventado.", h1:"Fondos Reales.", h2:"Total Transparencia.", sub:"Capital de trabajo rápido para negocios establecidos. Aplica en minutos, recibe una oferta en horas y rastrea todo en tiempo real desde tu portal.", cta1:"Comenzar →", cta2:"Entrar al Portal" },
    ticker: ["Capital de Trabajo","Financiamiento por Ingresos","Préstamos a Plazo","Líneas de Crédito","Equipo","Fondos el Mismo Día","Rastrea tu Proceso","Sube Documentos","580+ Puntaje OK","Sin Cargos Ocultos","Personas Reales. Fondos Reales."],
    stats: [["$500M+","Fondeado"],["10,000+","Negocios Atendidos"],["24 hrs","Tiempo Promedio"],["580+","Puntaje Mínimo"]],
    how: { badge:"Cómo Funciona", h:"Simple. Rápido. Transparente.", steps:[["01","Aplica en Minutos","Completa nuestra solicitud en línea. Sube tus documentos. Sin entrevistas ni papeleo."],["02","Nosotros Trabajamos el Trato","Nuestro equipo revisa tu expediente y trabaja para conseguirte los mejores términos disponibles."],["03","Rastrea Todo en Tiempo Real","Tu portal se actualiza en tiempo real — oferta recibida, documentos necesarios, trato aprobado."]] },
    features: { badge:"Funciones de la Plataforma", h:"Tu Financiamiento. Completamente Visible.",
      items:[
        {icon:"↗",name:"Seguimiento del Proceso",desc:"Ve exactamente en qué etapa está tu trato — enviado, en revisión, aprobado, fondeado."},
        {icon:"◻",name:"Gestión de Ofertas",desc:"Revisa cada término de tu oferta claramente antes de firmar. Factor rate, pago, plazo — todo visible."},
        {icon:"↑",name:"Carga Segura de Documentos",desc:"Sube estados de cuenta, ID y cheques anulados directamente. Encriptado 256 bits."},
        {icon:"◎",name:"Seguimiento de Saldo y Pagos",desc:"Monitorea tu saldo, calendario de pagos e historial directamente en tu portal."},
        {icon:"◈",name:"Seguimiento de Renovación",desc:"Cuando seas elegible para renovación, aparece en tu portal. Sin llamadas frías."},
        {icon:"◉",name:"Mensajes Directos",desc:"Escríbele a tu asesor directamente desde la plataforma. Todo queda por escrito."},
      ]
    },
    products: { badge:"Productos de Financiamiento", h:"Soluciones de Capital de Trabajo", amount:"Monto", term:"Plazo",
      items:[
        {icon:"→",name:"Préstamo a Plazo",range:"$10K–$500K",term:"3–24 meses",desc:"Pagos fijos diarios o semanales. Ideal para expansión, contratación o inversiones. Sin penalidad por pago anticipado — descuentos por pagar antes.",best:["Expansión de negocio","Contratación y nómina","Renovaciones","Compra de equipo"],reqs:["6+ meses en operación","$10K+ ingresos mensuales","580+ puntaje de crédito","Solo consulta suave"],how:"Recibe el monto completo. Pagos fijos diarios o semanales. Paga antes y ahorra — ofrecemos descuentos líderes en la industria.",color:"#a8ff3e"},
        {icon:"↺",name:"Línea de Crédito",range:"$10K–$5M",term:"Revolvente",desc:"Retira lo que necesitas, paga y vuelve a retirar. Solo pagas por lo que usas.",best:["Capital de trabajo","Inventario estacional","Gastos inesperados","Flujo de caja continuo"],reqs:["6+ meses en operación","$15K+ ingresos mensuales","600+ puntaje de crédito","Solo consulta suave"],how:"Aprobado una vez, retira cuando necesites. Tu límite se repone al pagar. Solo pagas interés sobre lo que usas.",color:"#60a5fa"},
        {icon:"↯",name:"Adelanto Basado en Ingresos",range:"$5K–$500K",term:"Pago flexible",desc:"Pagos vinculados a tus ingresos diarios. Pagas más cuando el negocio va bien, menos cuando va lento.",best:["Restaurantes y retail","Negocios estacionales","Necesidades urgentes","Negocios con tarjetas"],reqs:["6+ meses en operación","$10K+ ingresos mensuales","Sin puntaje mínimo","Solo consulta suave"],how:"Capital rápido — a menudo el mismo día. Los pagos se ajustan a tus ingresos automáticamente. Descuentos por pago anticipado.",color:"#f59e0b"},
        {icon:"◈",name:"Financiamiento de Equipo",range:"$5K–$2M",term:"Hasta 60 meses",desc:"Financia el equipo que tu negocio necesita. El equipo sirve como colateral — aprobación más fácil.",best:["Vehículos comerciales","Maquinaria y herramientas","Tecnología","Equipo médico"],reqs:["6+ meses en operación","$8K+ ingresos mensuales","560+ puntaje de crédito","Equipo como colateral"],how:"El equipo es el colateral, facilitando la aprobación. Pagos fijos durante el plazo. El equipo es tuyo al final.",color:"#c084fc"},
      ]
    },
    reviews: { badge:"Lo Que Dicen los Usuarios", h:"Confiado por Dueños de Negocios en Todo EE.UU.",
      items:[
        {name:"Marcus T.",biz:"Logística, Texas",text:"Aprobado en horas y fondeado a la mañana siguiente. El portal me mostró cada paso — sin perseguir, sin sorpresas. La mejor experiencia de financiamiento que he tenido.",stars:5},
        {name:"Priya S.",biz:"Med Spa, California",text:"Mi asesor me consiguió una mejor tasa de lo que esperaba. Subí mis documentos y pude ver la oferta el mismo día. Increíblemente fluido.",stars:5},
        {name:"Darnell R.",biz:"Construcción, Georgia",text:"He trabajado con otros brokers pero nunca tuve este nivel de visibilidad del proceso. Me fondearon, vi cada término claramente, supe exactamente lo que firmé.",stars:5},
      ]
    },
    faq: { badge:"Preguntas Frecuentes", h:"Preguntas Comunes", items:[
      ["¿Qué es Aprovuit?","Aprovuit es un broker de financiamiento comercial con licencia. Trabajamos con una red de fondeadores y prestamistas para conseguir a los pequeños negocios el capital de trabajo que necesitan — rápido."],
      ["¿Aprovuit presta dinero directamente?","Sí. Aprovuit proporciona financiamiento directamente de nuestro propio capital para solicitudes calificadas. También trabajamos con una red de socios de financiamiento de confianza para ofrecer productos y opciones adicionales. En ambos casos, tu trato se gestiona de principio a fin a través de nuestra plataforma."],
      ["¿Cuáles son los requisitos mínimos?","Generalmente: 6+ meses en operación, $10,000+ en ingresos mensuales, 580+ puntaje de crédito. Todos los productos requieren 6+ meses en operación. Enviar una solicitud no garantiza una oferta."],
      ["¿Afectará mi puntaje de crédito?","No. Usamos una consulta suave — sin impacto en tu puntaje. Una consulta dura solo ocurre si aceptas una oferta final de un socio de financiamiento."],
      ["¿Hay penalidades por pago anticipado?","No. Ofrecemos descuentos líderes en la industria por pago anticipado. Un adelanto de $50K con pagos de $625/mes puede costar significativamente menos si se liquida antes."],
      ["¿Cómo genera dinero Aprovuit?","Aprovuit gana una comisión pagada por el socio de financiamiento cuando un trato se fondea — no de ti. No hay costo por aplicar. Todas las comisiones se divulgan antes de firmar."],
      ["¿Cuánto tarda el financiamiento?","La mayoría de tratos son revisados en 2–4 horas hábiles. Muchos clientes reciben fondos dentro de 24 horas de la aprobación."],
      ["¿Qué documentos necesito?","Típicamente: 3–6 meses de estados de cuenta bancarios, identificación oficial y cheque anulado. Todo se sube de forma segura a través de la plataforma."],
    ] },
    cta: { h:"Fondos Reales. Total Transparencia.", sub:"Aplica en minutos. Nuestro equipo trabaja tu trato. Tú rastreas todo en tiempo real.", btn:"Comenzar →" },
    footer: { rights:"© 2026 Aprovuit. Todos los derechos reservados. · aprovuit.com" },
    apply: {
      howMuch:"¿Cuánto necesitas?",
      qualAmt:"Podrías calificar para hasta",
      creditLabel:"Mi puntaje de crédito es",
      revenueLabel:"Mis ingresos mensuales son",
      credits:[["excellent","Excelente","750+"],["good","Bueno","680+"],["fair","Regular","580+"],["poor","Bajo","<580"]],
      steps:["Fondos","Negocio","Tu Cuenta","Revisar"],
      continueBtn:"Continuar →", backBtn:"← Atrás", submitBtn:"Enviar Solicitud →",
      purposeLabel:"Propósito del financiamiento", purposeOpts:["Seleccionar...","Capital de Trabajo","Compra de Equipo","Expansión","Contratación","Inventario","Renovación","Consolidación de Deuda","Otro"],
      timelineLabel:"¿Cuándo necesitas los fondos?", timelineOpts:["Seleccionar...","Urgente","En 1 semana","En 2 semanas","En un mes","Sin prisa"],
      companyLabel:"Nombre del Negocio", companyPH:"Nombre de tu negocio",
      industryLabel:"Industria", industryOpts:["Seleccionar...","Restaurante / Alimentos","Retail","Construcción","Salud / Médico","Transporte / Logística","Servicios Profesionales","Tecnología","Manufactura","Otro"],
      yearsLabel:"Tiempo en Operación", yearsOpts:["Seleccionar...","3–6 meses","6–12 meses","1–2 años","2–5 años","5+ años"],
      annualLabel:"Ingresos Anuales", annualOpts:["Seleccionar...","Menos de $100K","$100K–$250K","$250K–$500K","$500K–$1M","$1M–$5M","$5M+"],
      firstNameLabel:"Nombre", lastNameLabel:"Apellido",
      emailLabel:"Correo Electrónico", emailPH:"tu@tunegocio.com",
      passwordLabel:"Crear Contraseña", passwordPH:"Mín. 8 caracteres",
      phoneLabel:"Número de Teléfono", phonePH:"(555) 000-0000",
      successH:"¡Solicitud Recibida!",
      successP:"Tu solicitud está siendo revisada por nuestro equipo. Trabajaremos para conseguirte una oferta en 2–4 horas hábiles. Rastrea el estado de tu trato en tu portal.",
      nextTitle:"¿Qué sigue?",
      nextSteps:["Solicitud revisada en 2–4 horas","Oferta entregada a tu portal","Revisa los términos y acepta — sin presión"],
      estLabel:"Tu pre-calificación estimada",
      estNote:"*Para fines ilustrativos. Sujeto a revisión completa.",
      loginBtn:"Ir a Mi Portal →", uploadBtn:"Subir Documentos",
    },
    login: { h:"Bienvenido de Nuevo", sub:"Entra a tu portal de Aprovuit.", email:"Correo Electrónico", password:"Contraseña", btn:"Entrar →", forgot:"¿Olvidaste tu contraseña?", noAccount:"¿Sin cuenta?", applyLink:"Aplicar Ahora", smsH:"Verifica Tu Identidad", smsSub:"Ingresa el código de 6 dígitos enviado a tu teléfono.", smsPlaceholder:"000000", smsBtn:"Verificar →", smsResend:"Reenviar código" },
    dash: { overview:"Resumen", offers:"Ofertas", loans:"Financiamiento Activo", docs:"Documentos", msgs:"Mensajes", settings:"Ajustes", signOut:"Cerrar Sesión", dealStatus:"Estado del Trato", noOffers:"Sin ofertas aún. Nuestro equipo está revisando tu solicitud.", noLoans:"Sin financiamiento activo aún.", uploadBtn:"Subir Documentos", msgAdvisor:"Tu Asesor", msgPlaceholder:"Escribe a tu asesor...", sendBtn:"Enviar" },
  },
};

//
// ── UPLOAD PAGE ──────────────────────────────────────────────────
function UploadPage({ lang, appId, onBack }) {
  const [files, setFiles] = useState({bank1:null,bank2:null,bank3:null,bank4:null,bank5:null,bank6:null,license:null,voided:null});
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const t = lang === "es" ? {
    title:"Sube Tus Documentos", sub:"Sube tus documentos para completar tu solicitud.",
    appId:"Solicitud", bankTitle:"6 Meses de Estados de Cuenta",
    bankSub:"Sube tus últimos 6 meses de estados bancarios",
    licenseTitle:"Licencia de Conducir", licenseSub:"Frente de tu identificación oficial",
    voidedTitle:"Cheque Anulado", voidedSub:"Cheque anulado de tu cuenta empresarial",
    months:["Mes 1","Mes 2","Mes 3","Mes 4","Mes 5","Mes 6"],
    drop:"Arrastra aquí o clic para subir", formats:"PDF, JPG, PNG",
    uploadBtn:"Enviar Documentos →", uploading:"Subiendo...",
    successH:"¡Documentos Recibidos!", successP:"Recibimos tus documentos y nos comunicaremos en 24 horas.",
    secure:"Encriptado · Tus documentos están seguros", required:"Requerido",
  } : {
    title:"Upload Your Documents", sub:"Securely upload your documents to complete your application.",
    appId:"Application", bankTitle:"6 Months of Bank Statements",
    bankSub:"Upload your last 6 months of business bank statements",
    licenseTitle:"Driver's License", licenseSub:"Front of your government-issued ID",
    voidedTitle:"Voided Check", voidedSub:"A voided check from your business checking account",
    months:["Month 1","Month 2","Month 3","Month 4","Month 5","Month 6"],
    drop:"Drop file here or click to upload", formats:"PDF, JPG, PNG accepted",
    uploadBtn:"Submit Documents →", uploading:"Uploading...",
    successH:"Documents Received!", successP:"We've received your documents and will be in touch within 24 hours.",
    secure:"256-bit encrypted · Your documents are safe", required:"Required",
  };

  const handleFile = (key, file) => setFiles(f => ({...f,[key]:file}));

  const FileZone = ({ fileKey, label, sublabel }) => {
    const file = files[fileKey];
    return (
      <div style={{ border:`2px dashed ${file?"#a8ff3e":"#e5e8ee"}`, borderRadius:12, padding:"18px 14px", textAlign:"center", background:file?"#f0fdf4":"#fafafa", position:"relative", cursor:"pointer", transition:"all .15s" }}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>handleFile(fileKey,e.target.files[0])} style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%" }} />
        {file ? (
          <div><div style={{ fontSize:20, marginBottom:4 }}>Done</div><p style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>{file.name}</p></div>
        ) : (
          <div><div style={{ fontSize:24, marginBottom:6, color:"#ccc" }}></div><p style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:2 }}>{label}</p><p style={{ fontSize:11, color:"#aaa" }}>{t.formats}</p></div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    setUploading(true);
    const uploadData = { appId, submittedAt:new Date().toLocaleString(), files:Object.entries(files).filter(([,v])=>v).map(([k,v])=>({key:k,name:v?.name})) };
    const uploads = JSON.parse(localStorage.getItem("aprovuit_uploads")||"[]");
    uploads.push(uploadData);
    localStorage.setItem("aprovuit_uploads", JSON.stringify(uploads));
    // Upload actual files to Supabase Storage if configured
    if (useDB) {
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          await db.uploadFile("documents", `${appId}/${key}-${file.name}`, file);
        }
      }
      await db.update("applications", `id=eq.${appId}`, { documents_uploaded:true, updated_at:new Date().toISOString() });
    }
    try {
      await loadEmailJS();
      await sendUploadNotificationEmail(appId, uploadData.files.map(f=>f.name).join(", "))
    } catch(e) { console.error(e); }
    setUploading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0a0a,#0d1f0d)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="fadeup" style={{ background:"#fff", borderRadius:20, padding:"48px 40px", maxWidth:480, width:"100%", textAlign:"center" }}>
        <div style={{ width:80, height:80, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:36 }}>Done</div>
        <h2 style={{ fontSize:26, fontWeight:900, color:"#1a1a1a", marginBottom:10 }}>{t.successH}</h2>
        <p style={{ fontSize:15, color:"#666", lineHeight:1.7, marginBottom:28 }}>{t.successP}</p>
        <button onClick={onBack} className="btn-dark" style={{ width:"100%", padding:14 }}>← Back to Aprovuit</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa" }}>
      <div style={{ background:"#0a0a0a", padding:"0 5%", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:G, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#000" }}>A</div>
          <span style={{ fontSize:20, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(168,255,62,0.08)", border:`1px solid ${G}30`, padding:"5px 14px", borderRadius:20 }}>
          <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
          <span style={{ fontSize:12, color:G, fontWeight:700 }}>{t.secure}</span>
        </div>
      </div>
      <div style={{ background:"linear-gradient(135deg,#0a0a0a,#0d1f0d)", padding:"40px 24px 48px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(168,255,62,.1)", border:`1px solid ${G}25`, padding:"4px 14px", borderRadius:20, marginBottom:14 }}>
          <span style={{ fontSize:11, color:G, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>{t.appId}: {appId||"APP-NEW"}</span>
        </div>
        <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:900, color:"#fff", marginBottom:8, letterSpacing:"-0.02em" }}>{t.title}</h1>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", maxWidth:420, margin:"0 auto" }}>{t.sub}</p>
      </div>
      <div style={{ maxWidth:640, margin:"0 auto", padding:"28px 24px 80px" }}>
        <div style={{ background:"#fff", borderRadius:18, padding:28, marginBottom:16, boxShadow:"0 4px 20px rgba(0,0,0,.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:13, fontWeight:700, color:G }}>BANK</span>
            <div style={{ flex:1 }}><h3 style={{ fontSize:16, fontWeight:800, color:"#1a1a1a" }}>{t.bankTitle}</h3><p style={{ fontSize:13, color:"#888" }}>{t.bankSub}</p></div>
            <span style={{ fontSize:11, fontWeight:700, color:"#ef4444", background:"#fef2f2", padding:"3px 10px", borderRadius:20 }}>{t.required}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {["bank1","bank2","bank3","bank4","bank5","bank6"].map((k,i)=><FileZone key={k} fileKey={k} label={t.months[i]} sublabel="PDF/IMG" />)}
          </div>
        </div>
        <div style={{ background:"#fff", borderRadius:18, padding:28, marginBottom:16, boxShadow:"0 4px 20px rgba(0,0,0,.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:22 }}>🪪</span>
            <div style={{ flex:1 }}><h3 style={{ fontSize:16, fontWeight:800, color:"#1a1a1a" }}>{t.licenseTitle}</h3><p style={{ fontSize:13, color:"#888" }}>{t.licenseSub}</p></div>
            <span style={{ fontSize:11, fontWeight:700, color:"#ef4444", background:"#fef2f2", padding:"3px 10px", borderRadius:20 }}>{t.required}</span>
          </div>
          <FileZone fileKey="license" label={t.licenseTitle} sublabel="JPG/PNG/PDF" />
        </div>
        <div style={{ background:"#fff", borderRadius:18, padding:28, marginBottom:28, boxShadow:"0 4px 20px rgba(0,0,0,.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:13, fontWeight:700, color:G }}>CHECK</span>
            <div style={{ flex:1 }}><h3 style={{ fontSize:16, fontWeight:800, color:"#1a1a1a" }}>{t.voidedTitle}</h3><p style={{ fontSize:13, color:"#888" }}>{t.voidedSub}</p></div>
            <span style={{ fontSize:11, fontWeight:700, color:"#ef4444", background:"#fef2f2", padding:"3px 10px", borderRadius:20 }}>{t.required}</span>
          </div>
          <FileZone fileKey="voided" label={t.voidedTitle} sublabel="JPG/PNG/PDF" />
        </div>
        <button onClick={handleSubmit} disabled={uploading} style={{ width:"100%", background:uploading?"#ccc":G, color:"#000", border:"none", padding:18, borderRadius:12, fontSize:16, fontWeight:900, cursor:uploading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          {uploading ? t.uploading : t.uploadBtn}
        </button>
        <p style={{ textAlign:"center", fontSize:13, color:"#888", marginTop:12 }}>{t.secure}</p>
      </div>
    </div>
  );
}


function ApplyPage({ lang, onBack, onSuccess, onUpload }) {
  const t = T[lang].apply;
  const [step, setStep] = useState(0); // 0=qualify, 1=funding, 2=business, 3=account, 4=review
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [sending, setSending] = useState(false);
  const [loanAmt, setLoanAmt] = useState(150000);
  const [creditSel, setCreditSel] = useState("good");
  const [savedAppId, setSavedAppId] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    purpose:"", timeline:"", company:"", industry:"", years:"", annualRev:"",
    creditRating:"good", firstName:"", lastName:"", email:"", password:"", phone:""
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const qualAmt = () => {
    const base = loanAmt;
    if (creditSel==="excellent") return Math.min(Math.round(base*1.35),2000000);
    if (creditSel==="good")      return Math.min(Math.round(base*1.15),1500000);
    if (creditSel==="fair")      return Math.min(Math.round(base*0.85),800000);
    return Math.min(Math.round(base*0.6),400000);
  };

  const fmtSlider = (n) => {
    if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + Math.round(n/1000) + 'K';
    return '$' + n;
  };

  const formatPhone = (v) => {
    const d = v.replace(/\D/g,'').slice(0,10);
    if (d.length<=3) return d;
    if (d.length<=6) return '('+d.slice(0,3)+') '+d.slice(3);
    return '('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);
  };

  const validate = () => {
    const e = {};
    if (step===2 && !form.company.trim()) e.company = lang==="es"?"Requerido":"Required";
    if (step===3) {
      if (!form.firstName.trim()) e.firstName = lang==="es"?"Requerido":"Required";
      if (!form.lastName.trim()) e.lastName = lang==="es"?"Requerido":"Required";
      if (!form.email.trim()) e.email = lang==="es"?"Requerido":"Required";
      if (!form.password || form.password.length < 8) e.password = lang==="es"?"Mín. 8 caracteres":"Min. 8 characters";
      if (!form.phone.trim()) e.phone = lang==="es"?"Requerido":"Required";
    }
    if (Object.keys(e).length > 0) { setErrors(e); return false; }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    const newAppId = `APP-${Date.now()}`;
    setSavedAppId(newAppId);
    const appData = {
      id:newAppId, submittedAt:new Date().toLocaleString(), status:"Under Review",
      loanAmt:fmtSlider(loanAmt), ...form, estimatedQualify:fmtSlider(qualAmt())
    };
    const apps = JSON.parse(localStorage.getItem("aprovuit_apps")||"[]");
    apps.push(appData);
    localStorage.setItem("aprovuit_apps", JSON.stringify(apps));
    const accounts = JSON.parse(localStorage.getItem("aprovuit_accounts")||"[]");
    accounts.push({ email:form.email, password:form.password, firstName:form.firstName, lastName:form.lastName, company:form.company, phone:form.phone, appId:newAppId });
    localStorage.setItem("aprovuit_accounts", JSON.stringify(accounts));
    if (useDB) {
      await db.insert("applications", { id:newAppId, status:"Under Review", loan_amt:fmtSlider(loanAmt), purpose:form.purpose, timeline:form.timeline, company:form.company, industry:form.industry, years:form.years, annual_rev:form.annualRev, credit_rating:form.creditRating, first_name:form.firstName, last_name:form.lastName, email:form.email, phone:form.phone, estimated_qualify:fmtSlider(qualAmt()), submitted_at:new Date().toISOString() });
    }
    await sendApplicationEmail(appData);
    await sendClientEmail(appData);
    setSending(false);
    setSubmitted(true);
  };

  const G = "#a8ff3e";

  // ── STYLES ──────────────────────────────────────────────────────
  const pageStyle = { minHeight:"100vh", background:"#0a0a0a", fontFamily:"'Sora',sans-serif", color:"#fff" };
  const navStyle = { background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 5%", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 };
  const labelStyle = { fontSize:11, fontWeight:700, color:"rgba(255,255,255,.7)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, display:"block" };
  const errStyle = { fontSize:12, color:"#ef4444", marginTop:-8, marginBottom:10 };

  // ── SUCCESS SCREEN ───────────────────────────────────────────────
  if (submitted) return (
    <div style={pageStyle}>
      <style>{APPLY_CSS}</style>
      <div style={navStyle}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#000" }}>A</div>
          <span style={{ fontSize:15, fontWeight:700, color:"#fff", letterSpacing:"-.02em" }}>APROVUIT</span>
        </button>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 58px)", padding:24 }}>
        <div className="fadeup" style={{ maxWidth:520, width:"100%", textAlign:"center" }}>
          <div style={{ width:72, height:72, background:"rgba(168,255,62,.1)", border:`1px solid ${G}30`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 32px", fontSize:28, color:G }}>—</div>
          <h2 style={{ fontSize:32, fontWeight:700, color:"#fff", marginBottom:12, letterSpacing:"-.03em" }}>
            {lang==="es"?"Solicitud Enviada":"Request Submitted"}
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.75, marginBottom:40 }}>
            {lang==="es"
              ? "Tu solicitud está siendo revisada por nuestro equipo. Trabajaremos para conseguirte una oferta en 2–4 horas hábiles. Rastrea el estado de tu trato en tiempo real en tu portal."
              : "Your application is being reviewed by our team. We'll work to get you an offer within 2–4 business hours. Track your deal status live in your dashboard."}
          </p>
          <div style={{ background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"24px", marginBottom:24, textAlign:"left" }}>
            <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
              {lang==="es"?"Pre-calificación estimada":"Estimated pre-qualification"}
            </p>
            <p style={{ fontSize:48, fontWeight:700, color:G, letterSpacing:"-.04em", lineHeight:1 }}>{fmtSlider(qualAmt())}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.25)", marginTop:8 }}>
              {lang==="es"?"Para fines ilustrativos. Sujeto a revisión.":"For illustrative purposes. Subject to review."}
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={()=>onSuccess&&onSuccess(form.email, form.firstName, form.company, savedAppId)} style={{ width:"100%", background:G, color:"#000", border:"none", padding:"14px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", letterSpacing:"-.01em" }}>
              {lang==="es"?"Ir a Mi Portal →":"Go to My Dashboard →"}
            </button>
            <button onClick={()=>onUpload&&onUpload(savedAppId)} style={{ width:"100%", background:"transparent", color:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer", letterSpacing:"-.01em" }}>
              {lang==="es"?"Subir Documentos":"Upload Documents"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP 0: QUALIFY ─────────────────────────────────────────────
  const renderStep0 = () => (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"60px 24px 80px" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:56 }}>
        <p style={{ fontSize:11, fontWeight:600, color:G, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16 }}>
          {lang==="es"?"Aprobaciones Rápidas · Asesores Reales · Sin Cargos Ocultos":"Fast Approvals · Real Advisors · No Hidden Fees"}
        </p>
        <h1 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"#fff", letterSpacing:"-.03em", lineHeight:1.1, marginBottom:16 }}>
          {lang==="es" ? <>Solicita<br /><span style={{color:G}}>Capital de Trabajo</span></> : <>Apply for<br /><span style={{color:G}}>Working Capital</span></>}
        </h1>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", lineHeight:1.7 }}>
          {lang==="es"
            ? "Nuestro equipo revisa tu solicitud y trabaja para conseguirte fondos — a menudo en 24 horas."
            : "Our team reviews your application for direct funding and partner options. Decisions often within 24 hours. No phone interview required."}
        </p>
      </div>

      {/* Credit selector */}
      <div style={{ marginBottom:40 }}>
        <p style={labelStyle}>{lang==="es"?"Mi crédito es...":"My credit is..."}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {(lang==="es"
            ? [["excellent","Excelente","750+"],["good","Bueno","680+"],["fair","Regular","580+"],["poor","Bajo","<580"]]
            : [["excellent","Excellent","750+"],["good","Good","680+"],["fair","Fair","580+"],["poor","Poor","<580"]]
          ).map(([val,label,range])=>(
            <button key={val} onClick={()=>setCreditSel(val)} style={{ background:creditSel===val?"#fff":"rgba(255,255,255,.04)", border:`1px solid ${creditSel===val?"#fff":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"16px 8px", cursor:"pointer", textAlign:"center", transition:"all .15s" }}>
              <p style={{ fontSize:14, fontWeight:600, color:creditSel===val?"#0a0a0a":"#fff", marginBottom:4, letterSpacing:"-.01em" }}>{label}</p>
              <p style={{ fontSize:11, color:creditSel===val?"rgba(0,0,0,.5)":"rgba(255,255,255,.3)", fontWeight:500 }}>{range}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Revenue slider */}
      <div style={{ marginBottom:40 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <p style={labelStyle}>{lang==="es"?"Mis ventas mensuales son...":"My monthly sales volume is..."}</p>
          <span style={{ fontSize:20, fontWeight:700, color:G, letterSpacing:"-.02em" }}>{fmtSlider(loanAmt)}</span>
        </div>
        <input type="range" min={10000} max={2000000} step={5000} value={loanAmt} onChange={e=>setLoanAmt(Number(e.target.value))} style={{ width:"100%" }} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,.25)" }}>$10K</span>
          <span style={{ fontSize:11, color:"rgba(255,255,255,.25)" }}>$2M+</span>
        </div>
      </div>

      {/* Qualification result */}
      <div style={{ background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"32px", marginBottom:32, textAlign:"center" }}>
        <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>
          {lang==="es"?"¿Cuánto podría calificar?":"How much could I qualify for?"}
        </p>
        <p style={{ fontSize:64, fontWeight:700, color:G, letterSpacing:"-.04em", lineHeight:1, marginBottom:8 }}>{fmtSlider(qualAmt())}</p>
        <p style={{ fontSize:12, color:"rgba(255,255,255,.45)" }}>
          {lang==="es"?"Para fines ilustrativos. Solicitudes sujetas a revisión.":"For illustrative purposes only. Applications subject to review."}
        </p>
      </div>

      {/* Requirements */}
      <div style={{ background:"rgba(168,255,62,.07)", border:`1px solid ${G}30`, borderRadius:12, padding:"24px 28px", marginBottom:32 }}>
        <p style={{ fontSize:13, fontWeight:700, color:G, marginBottom:16, letterSpacing:"-.01em" }}>
          {lang==="es"?"Todo lo que necesitas:":"All you need to qualify:"}
        </p>
        {(lang==="es"
          ? ["6+ meses en operación","$10K+ en ingresos mensuales","580+ puntaje de crédito","Solo consulta suave — sin impacto al crédito"]
          : ["6+ months in business","$10K+ in monthly revenue","580+ credit score","Soft pull only — no credit impact"]
        ).map(r=>(
          <div key={r} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:6, height:6, background:G, borderRadius:"50%", flexShrink:0 }}></div>
            <span style={{ fontSize:14, color:"rgba(255,255,255,.85)", letterSpacing:"-.01em", fontWeight:500 }}>{r}</span>
          </div>
        ))}
      </div>

      <button onClick={()=>{setStep(1);window.scrollTo(0,0);}} style={{ width:"100%", background:G, color:"#000", border:"none", padding:"16px", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer", letterSpacing:"-.01em" }}>
        {lang==="es"?"Comenzar Mi Solicitud →":"Start My Request →"}
      </button>
      <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,.25)", marginTop:14 }}>
        {lang==="es"?"Sin impacto a tu crédito · Gratis · Sin presión":"No credit impact · Free · No pressure"}
      </p>
    </div>
  );

  // ── STEPS 1–4 ───────────────────────────────────────────────────
  const stepTitles = lang==="es"
    ? ["Fondos","Negocio","Tu Cuenta","Revisar"]
    : ["Funding","Business","Your Account","Review"];

  const inp = { width:"100%", padding:"13px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,.18)", fontSize:14, fontFamily:"'Sora',sans-serif", color:"#fff", background:"rgba(255,255,255,.08)", marginBottom:12, display:"block", outline:"none", transition:"border-color .15s", letterSpacing:"-.01em" };
  const inpFocus = { ...inp, borderColor:"rgba(168,255,62,.5)" };
  const sel = { ...inp, appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", cursor:"pointer", paddingRight:40 };

  const renderSteps = () => (
    <div style={{ maxWidth:580, margin:"0 auto", padding:"48px 24px 80px" }}>
      {/* Progress */}
      <div style={{ marginBottom:40 }}>
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          {stepTitles.map((s,i)=>(
            <div key={s} style={{ flex:1, height:2, borderRadius:2, background:i<step?G:i===step?"rgba(255,255,255,.4)":"rgba(255,255,255,.1)", transition:"background .3s" }}></div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          {stepTitles.map((s,i)=>(
            <span key={s} style={{ fontSize:10, fontWeight:600, color:i<=step?"rgba(255,255,255,.5)":"rgba(255,255,255,.2)", letterSpacing:"0.08em", textTransform:"uppercase" }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:"36px 32px" }} className="fadeup">

        {/* Step 1 — Funding */}
        {step===1 && <>
          <h2 style={{ fontSize:24, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-.03em" }}>
            {lang==="es"?"¿Para qué necesitas los fondos?":"What are you looking for?"}
          </h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:28, letterSpacing:"-.01em" }}>
            {lang==="es"?"Cuéntanos sobre tu solicitud.":"Tell us about your request."}
          </p>

          {/* Loan amount display */}
          <div style={{ background:"rgba(168,255,62,.04)", border:`1px solid ${G}20`, borderRadius:10, padding:"20px 24px", marginBottom:24, textAlign:"center" }}>
            <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
              {lang==="es"?"Monto estimado":"Estimated amount"}
            </p>
            <p style={{ fontSize:44, fontWeight:700, color:G, letterSpacing:"-.04em", lineHeight:1 }}>{fmtSlider(qualAmt())}</p>
          </div>

          <span style={labelStyle}>{lang==="es"?"Propósito del financiamiento":"Purpose of financing"}</span>
          <select style={sel} value={form.purpose} onChange={e=>set("purpose",e.target.value)}>
            {t.purposeOpts.map(o=><option key={o} style={{background:"#1a1a1a"}}>{o}</option>)}
          </select>

          <span style={labelStyle}>{lang==="es"?"¿Cuándo necesitas los fondos?":"When do you need funds?"}</span>
          <select style={sel} value={form.timeline} onChange={e=>set("timeline",e.target.value)}>
            {t.timelineOpts.map(o=><option key={o} style={{background:"#1a1a1a"}}>{o}</option>)}
          </select>

          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={()=>{setStep(0);window.scrollTo(0,0);}} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
            <button onClick={()=>{setStep(2);window.scrollTo(0,0);}} style={{ flex:2, background:G, color:"#000", border:"none", padding:"13px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>{t.continueBtn}</button>
          </div>
        </>}

        {/* Step 2 — Business */}
        {step===2 && <>
          <h2 style={{ fontSize:24, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-.03em" }}>
            {lang==="es"?"Tu Negocio":"Your Business"}
          </h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:28, letterSpacing:"-.01em" }}>
            {lang==="es"?"Cuéntanos sobre tu negocio.":"Tell us about your business."}
          </p>

          <span style={labelStyle}>{t.companyLabel} <span style={{color:"#ef4444"}}>*</span></span>
          <input style={errors.company?{...inp,borderColor:"#ef4444"}:inp} placeholder={t.companyPH} value={form.company} onChange={e=>{set("company",e.target.value);setErrors(p=>({...p,company:""}));}} />
          {errors.company && <p style={errStyle}>{errors.company}</p>}

          <span style={labelStyle}>{t.industryLabel}</span>
          <select style={sel} value={form.industry} onChange={e=>set("industry",e.target.value)}>
            {t.industryOpts.map(o=><option key={o} style={{background:"#1a1a1a"}}>{o}</option>)}
          </select>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="name-row">
            <div>
              <span style={labelStyle}>{t.yearsLabel}</span>
              <select style={sel} value={form.years} onChange={e=>set("years",e.target.value)}>
                {t.yearsOpts.map(o=><option key={o} style={{background:"#1a1a1a"}}>{o}</option>)}
              </select>
            </div>
            <div>
              <span style={labelStyle}>{t.annualLabel}</span>
              <select style={sel} value={form.annualRev} onChange={e=>set("annualRev",e.target.value)}>
                {t.annualOpts.map(o=><option key={o} style={{background:"#1a1a1a"}}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={()=>{setStep(1);window.scrollTo(0,0);}} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
            <button onClick={()=>{if(validate())setStep(3);}} style={{ flex:2, background:G, color:"#000", border:"none", padding:"13px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>{t.continueBtn}</button>
          </div>
        </>}

        {/* Step 3 — Account */}
        {step===3 && <>
          <h2 style={{ fontSize:24, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-.03em" }}>
            {lang==="es"?"Crea Tu Cuenta":"Create Your Account"}
          </h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:28, letterSpacing:"-.01em" }}>
            {lang==="es"?"Tu portal para rastrear todo.":"Your dashboard to track everything."}
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="name-row">
            <div>
              <label style={labelStyle}>{t.firstNameLabel} <span style={{color:"#ef4444"}}>*</span></label>
              <input style={errors.firstName?{...inp,borderColor:"#ef4444"}:inp} placeholder={t.firstNameLabel} value={form.firstName} onChange={e=>{set("firstName",e.target.value);setErrors(p=>({...p,firstName:""}));}} />
              {errors.firstName && <p style={errStyle}>{errors.firstName}</p>}
            </div>
            <div>
              <label style={labelStyle}>{t.lastNameLabel} <span style={{color:"#ef4444"}}>*</span></label>
              <input style={errors.lastName?{...inp,borderColor:"#ef4444"}:inp} placeholder={t.lastNameLabel} value={form.lastName} onChange={e=>{set("lastName",e.target.value);setErrors(p=>({...p,lastName:""}));}} />
              {errors.lastName && <p style={errStyle}>{errors.lastName}</p>}
            </div>
          </div>

          <label style={labelStyle}>{t.emailLabel} <span style={{color:"#ef4444"}}>*</span></label>
          <input style={errors.email?{...inp,borderColor:"#ef4444"}:inp} type="email" placeholder={t.emailPH} value={form.email} onChange={e=>{set("email",e.target.value);setErrors(p=>({...p,email:""}));}} />
          {errors.email && <p style={errStyle}>{errors.email}</p>}

          <label style={labelStyle}>{t.passwordLabel} <span style={{color:"#ef4444"}}>*</span></label>
          <input style={errors.password?{...inp,borderColor:"#ef4444"}:inp} type="password" placeholder={t.passwordPH} value={form.password} onChange={e=>{set("password",e.target.value);setErrors(p=>({...p,password:""}));}} />
          {errors.password && <p style={errStyle}>{errors.password}</p>}

          <label style={labelStyle}>{t.phoneLabel} <span style={{color:"#ef4444"}}>*</span></label>
          <input style={errors.phone?{...inp,borderColor:"#ef4444"}:inp} type="tel" placeholder={t.phonePH} value={form.phone} onChange={e=>{set("phone",formatPhone(e.target.value));setErrors(p=>({...p,phone:""}));}} />
          {errors.phone && <p style={errStyle}>{errors.phone}</p>}

          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={()=>{setStep(2);window.scrollTo(0,0);}} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
            <button onClick={()=>{if(validate())setStep(4);}} style={{ flex:2, background:G, color:"#000", border:"none", padding:"13px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>{t.continueBtn}</button>
          </div>
        </>}

        {/* Step 4 — Review */}
        {step===4 && <>
          <h2 style={{ fontSize:24, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-.03em" }}>
            {lang==="es"?"Revisa tu Solicitud":"Review Your Request"}
          </h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:28, letterSpacing:"-.01em" }}>
            {lang==="es"?"¿Todo correcto? Envía para continuar.":"Everything look right? Submit to continue."}
          </p>

          <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, padding:"20px", marginBottom:20 }}>
            {[
              [lang==="es"?"Monto estimado":"Est. Amount", fmtSlider(qualAmt())],
              [lang==="es"?"Propósito":"Purpose", form.purpose||"—"],
              [lang==="es"?"Plazo":"Timeline", form.timeline||"—"],
              [lang==="es"?"Empresa":"Company", form.company||"—"],
              [lang==="es"?"Industria":"Industry", form.industry||"—"],
              [lang==="es"?"Ingresos":"Revenue", form.annualRev||"—"],
              [lang==="es"?"Nombre":"Name", `${form.firstName} ${form.lastName}`.trim()||"—"],
              ["Email", form.email||"—"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,.35)", letterSpacing:"-.01em" }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#fff", letterSpacing:"-.01em", textAlign:"right", maxWidth:"60%" }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(168,255,62,.04)", border:`1px solid ${G}20`, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
            <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", lineHeight:1.7, letterSpacing:"-.01em" }}>
              {lang==="es"
                ? "Al enviar, autorizas a Aprovuit a revisar tu solicitud para financiamiento directo y, cuando aplique, presentarla a socios de financiamiento en nuestra red. Esto genera una consulta suave de crédito sin impacto a tu puntaje. Todos los términos y cargos se divulgan antes de firmar."
                : "By submitting, you authorize Aprovuit to review your application for direct funding and, where applicable, to present it to funding partners in our network. This triggers a soft credit inquiry with no impact to your score. All terms and fees are disclosed before you sign."}
            </p>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>{setStep(3);window.scrollTo(0,0);}} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
            <button onClick={handleSubmit} disabled={sending} style={{ flex:2, background:sending?"rgba(168,255,62,.4)":G, color:"#000", border:"none", padding:"13px", borderRadius:8, fontSize:14, fontWeight:600, cursor:sending?"not-allowed":"pointer" }}>
              {sending?(lang==="es"?"Enviando...":"Submitting..."):(lang==="es"?"Enviar Solicitud →":"Submit Request →")}
            </button>
          </div>
        </>}

      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <style>{APPLY_CSS}</style>
      {/* Nav */}
      <div style={navStyle}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#000" }}>A</div>
          <span style={{ fontSize:15, fontWeight:700, color:"#fff", letterSpacing:"-.02em" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(168,255,62,.06)", border:`1px solid ${G}20`, padding:"5px 14px", borderRadius:20 }}>
          <div style={{ width:5, height:5, background:G, borderRadius:"50%" }}></div>
          <span style={{ fontSize:11, color:G, fontWeight:600, letterSpacing:"0.05em" }}>
            {lang==="es"?"Sin Cargos Ocultos · Asesores Reales":"No Hidden Fees · Real Advisors"}
          </span>
        </div>
      </div>

      {step===0 ? renderStep0() : renderSteps()}
    </div>
  );
}



// ── LOGIN PAGE ───────────────────────────────────────────────────
function LoginPage({ lang, onBack, onLogin }) {
  const t = T[lang].login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSMS, setShowSMS] = useState(false);
  const [smsCode, setSmsCode] = useState(["","","","","",""]);
  const [error, setError] = useState("");

  const handleLogin = () => {
    const accounts = JSON.parse(localStorage.getItem("aprovuit_accounts")||"[]");
    const account = accounts.find(a => a.email === email && a.password === password);
    if (account) {
      setShowSMS(true);
    } else {
      // Demo login
      if (email && password) setShowSMS(true);
      else setError(lang==="es"?"Correo o contraseña incorrectos":"Invalid email or password");
    }
  };

  const handleVerify = () => {
    const accounts = JSON.parse(localStorage.getItem("aprovuit_accounts")||"[]");
    const account = accounts.find(a => a.email === email) || { email, firstName:"Demo", company:"My Business", appId:"APP-DEMO" };
    onLogin(account.email, account.firstName, account.company, account.appId);
  };

  const inp = { width:"100%", padding:"13px 16px", borderRadius:10, border:"1.5px solid #e5e8ee", fontSize:15, fontFamily:"'DM Sans',sans-serif", color:"#1a1a1a", background:"#fff", marginBottom:14, display:"block", outline:"none" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0a0a,#0d1f0d)", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"rgba(10,10,10,.97)", padding:"0 5%", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:G, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#000" }}>A</div>
          <span style={{ fontSize:20, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </button>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        {!showSMS ? (
          <div className="fadeup" style={{ background:"#fff", borderRadius:20, padding:"40px 36px", maxWidth:420, width:"100%" }}>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#1a1a1a", marginBottom:6 }}>{t.h}</h2>
            <p style={{ fontSize:14, color:"#888", marginBottom:28 }}>{t.sub}</p>
            {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", marginBottom:16 }}><p style={{ fontSize:13, color:"#dc2626" }}>{error}</p></div>}
            <label style={{ fontSize:12, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7, display:"block" }}>{t.email}</label>
            <input style={inp} type="email" placeholder="you@yourbusiness.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <label style={{ fontSize:12, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7, display:"block" }}>{t.password}</label>
            <input style={inp} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
            <p style={{ fontSize:13, color:"#888", textAlign:"right", marginBottom:20, cursor:"pointer" }}>{t.forgot}</p>
            <button onClick={handleLogin} style={{ width:"100%", background:"#1a1a1a", color:"#fff", border:"none", padding:15, borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.btn}</button>
            <p style={{ fontSize:13, color:"#888", textAlign:"center", marginTop:16 }}>{t.noAccount} <span style={{ color:"#1a1a1a", fontWeight:700, cursor:"pointer" }} onClick={onBack}>{t.applyLink}</span></p>
          </div>
        ) : (
          <div className="fadeup" style={{ background:"#fff", borderRadius:20, padding:"40px 36px", maxWidth:420, width:"100%", textAlign:"center" }}>
            <div style={{ width:60, height:60, background:"#f0fdf4", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:16, fontWeight:800, color:"#fff" }}>—</div>
            <h2 style={{ fontSize:22, fontWeight:900, color:"#1a1a1a", marginBottom:6 }}>{t.smsH}</h2>
            <p style={{ fontSize:14, color:"#888", marginBottom:24 }}>{t.smsSub}</p>
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24 }}>
              {[0,1,2,3,4,5].map(i=>(
                <input key={i} maxLength={1} value={smsCode[i]} onChange={e=>{const c=[...smsCode];c[i]=e.target.value;setSmsCode(c);if(e.target.value&&e.target.nextSibling)e.target.nextSibling.focus();}} style={{ width:44, height:52, border:`2px solid ${smsCode[i]?"#1a1a1a":"#e5e5ea"}`, borderRadius:10, textAlign:"center", fontSize:22, fontWeight:900, color:"#1a1a1a", outline:"none", fontFamily:"'DM Sans',sans-serif", background:"#fff" }} />
              ))}
            </div>
            <button onClick={handleVerify} style={{ width:"100%", background:"#1a1a1a", color:"#fff", border:"none", padding:15, borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:12 }}>{t.verify}</button>
            <p style={{ fontSize:13, color:"#888", cursor:"pointer" }}>{t.resend}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MERCHANT DASHBOARD ───────────────────────────────────────────
function Dashboard({ lang, user, onSignOut, onUpload }) {
  const t = T[lang].dash;
  const [tab, setTab] = useState("overview");
  const [msgs, setMsgs] = useState([
    { from:"advisor", text:"Hi! Your application has been received and is under review. We'll update you within 2–4 hours.", time:"2h ago" },
    { from:"advisor", text:"No phone call needed — track everything right here in your dashboard.", time:"2h ago" },
  ]);
  const [msgTxt, setMsgTxt] = useState("");
  const [offers, setOffers] = useState(JSON.parse(localStorage.getItem(`offers_${user.appId}`)||"[]"));

  // Check for new offers
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`offers_${user.appId}`)||"[]");
    setOffers(stored);
  }, [tab]);

  const sendMsg = () => {
    if (!msgTxt.trim()) return;
    setMsgs(p=>[...p,{from:"client",text:msgTxt,time:"Just now"}]);
    setMsgTxt("");
    setTimeout(()=>setMsgs(p=>[...p,{from:"advisor",text:"Got it! I'll look into that right away and get back to you here.",time:"Just now"}]),1500);
  };

  const acceptOffer = (offerId) => {
    const updated = offers.map(o=>o.id===offerId?{...o,status:"accepted"}:o);
    setOffers(updated);
    localStorage.setItem(`offers_${user.appId}`, JSON.stringify(updated));
  };

  const declineOffer = (offerId) => {
    const updated = offers.map(o=>o.id===offerId?{...o,status:"declined"}:o);
    setOffers(updated);
    localStorage.setItem(`offers_${user.appId}`, JSON.stringify(updated));
  };

  const pendingOffers = offers.filter(o=>o.status==="pending");
  const apps = JSON.parse(localStorage.getItem("aprovuit_apps")||"[]");
  const myApp = apps.find(a=>a.id===user.appId) || apps[apps.length-1];

  const TABS = [
    { id:"overview", icon:"⊞", label:t.tabs[0] },
    { id:"offers", icon:"◈", label:t.tabs[1], badge:pendingOffers.length },
    { id:"loans", icon:"◎", label:t.tabs[2] },
    { id:"docs", icon:"◻", label:t.tabs[3] },
    { id:"messages", icon:"◉", label:t.tabs[4] },
  ];

  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 56px)" }}>
      {/* Sidebar */}
      <div style={{ width:200, background:"#111", borderRight:"1px solid rgba(255,255,255,.06)", flexShrink:0 }}>
        <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>Logged in as</p>
          <p style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{user.firstName}</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:2 }}>{user.company}</p>
        </div>
        <div style={{ padding:"8px 0" }}>
          {TABS.map(tb=>(
            <div key={tb.id} className={`sb-item${tab===tb.id?" active":""}`} onClick={()=>setTab(tb.id)} style={{ position:"relative" }}>
              <span style={{ fontSize:15, width:20, textAlign:"center" }}>{tb.icon}</span>
              {tb.label}
              {tb.badge>0 && <div style={{ position:"absolute", right:12, width:18, height:18, background:"#ef4444", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff" }}>{tb.badge}</div>}
            </div>
          ))}
        </div>
        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,.06)", marginTop:"auto" }}>
          <button onClick={onSignOut} style={{ background:"none", border:"none", color:"rgba(255,255,255,.35)", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← {t.signout}</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, padding:28, background:"#0d0d0d", overflowY:"auto" }}>

        {tab==="overview" && (
          <div className="fadeup">
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:4 }}>{t.greeting}, {user.firstName} </h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>{t.snapshot}</p>
            </div>
            <div className="metrics-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              {[["Active Credit","$0","No active loans yet",""],["Pending Offers",pendingOffers.length.toString(),"Awaiting review",""],["Application",myApp?"Under Review":"—","Submitted",""],["Next Payment","—","No payments yet",""]].map(([l,v,s])=>(
                <div key={l} className="metric">
                  <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>{l}</p>
                  <p style={{ fontSize:22, fontWeight:900, color:l==="Active Credit"?G:"#fff", letterSpacing:"-0.5px" }}>{v}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:4 }}>{s}</p>
                </div>
              ))}
            </div>

            {/* Application status timeline */}
            <div style={{ background:"#161616", border:"1px solid rgba(255,255,255,.06)", borderRadius:14, padding:"22px" }}>
              <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:20 }}>Application Status</p>
              <div style={{ display:"flex", alignItems:"center" }}>
                {["Applied","Under Review","Decision","Offer Sent","Funded"].map((step,i)=>(
                  <React.Fragment key={step}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:i<=1?G:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:i<=1?"#000":"rgba(255,255,255,.3)" }}>{i<=1?"Done":(i+1)}</div>
                      <p style={{ fontSize:10, color:i<=1?G:"rgba(255,255,255,.3)", textAlign:"center", fontWeight:700, whiteSpace:"nowrap" }}>{step}</p>
                    </div>
                    {i<4 && <div style={{ flex:1, height:2, background:i<1?G:"rgba(255,255,255,.06)", margin:"0 4px 16px" }}></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="offers" && (
          <div className="fadeup">
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:4 }}>{t.tabs[1]}</h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>Review and accept your funding offers</p>
            </div>
            {pendingOffers.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 24px", background:"#161616", border:"1px solid rgba(255,255,255,.06)", borderRadius:14 }}>
                <div style={{ fontSize:40, marginBottom:16 }}></div>
                <p style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,.5)", marginBottom:8 }}>{t.noOffers}</p>
                <p style={{ fontSize:14, color:"rgba(255,255,255,.3)" }}>Financing offers from our partner network will appear here as partners review your application. You compare and choose — no one decides for you.</p>
              </div>
            )}
            {offers.filter(o=>o.status==="pending").map(offer=>(
              <div key={offer.id} className="offer-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,.5)" }}>{offer.product} · {offer.appId}</p>
                  <span className="pill green">New Offer</span>
                </div>
                <p style={{ fontSize:42, fontWeight:900, color:G, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-1px", marginBottom:4 }}>{offer.amount}</p>
                <div className="offer-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, margin:"16px 0" }}>
                  {[["Term",offer.term],["Payment",offer.payment],["Rate",offer.rate],["Funding","Same Day"]].map(([k,v])=>(
                    <div key={k} style={{ background:"rgba(255,255,255,.04)", borderRadius:8, padding:10 }}>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 }}>{k}</p>
                      <p style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>acceptOffer(offer.id)} style={{ flex:1, background:G, color:"#000", border:"none", padding:13, borderRadius:10, fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Accept Offer Done</button>
                  <button onClick={()=>declineOffer(offer.id)} style={{ flex:1, background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.5)", border:"1px solid rgba(255,255,255,.1)", padding:13, borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Decline</button>
                </div>
                {offer.expires && <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", textAlign:"center", marginTop:8 }}>Expires {offer.expires}</p>}
              </div>
            ))}
            {offers.filter(o=>o.status!=="pending").length > 0 && (
              <div style={{ marginTop:24 }}>
                <p style={{ fontSize:13, color:"rgba(255,255,255,.4)", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700 }}>Previous Offers</p>
                {offers.filter(o=>o.status!=="pending").map(offer=>(
                  <div key={offer.id} style={{ background:"#161616", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:"14px 18px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{offer.product} · {offer.amount}</p>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:2 }}>{offer.term} · {offer.rate}</p>
                    </div>
                    <span className={`pill ${offer.status==="accepted"?"green":"red"}`}>{offer.status==="accepted"?"Accepted Done":"Declined"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="loans" && (
          <div className="fadeup">
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:4 }}>{t.tabs[2]}</h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>Track your balances and payment schedule</p>
            </div>
            <div style={{ textAlign:"center", padding:"60px 24px", background:"#161616", border:"1px solid rgba(255,255,255,.06)", borderRadius:14 }}>
              <div style={{ fontSize:40, marginBottom:16 }}></div>
              <p style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,.5)", marginBottom:8 }}>{t.loansEmpty}</p>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.3)" }}>Once your offer is accepted and funded, your loan details will appear here.</p>
            </div>
          </div>
        )}

        {tab==="docs" && (
          <div className="fadeup">
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:4 }}>{t.docsTitle}</h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>Upload and manage your documents</p>
            </div>
            <div style={{ background:"#161616", border:"1px solid rgba(255,255,255,.06)", borderRadius:14, padding:22, marginBottom:16 }}>
              <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16 }}>Required Documents</p>
              {[["Bank Statements","Last 6 months",""],["Driver's License","Government-issued ID","🪪"],["Voided Check","Business checking account","C"]].map(([name,desc,icon])=>(
                <div key={name} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ width:36, height:36, background:"rgba(255,255,255,.06)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{name}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,.4)" }}>{desc}</p>
                  </div>
                  <span className="pill yellow">Pending</span>
                </div>
              ))}
            </div>
            <button onClick={()=>onUpload(user.appId)} style={{ width:"100%", background:G, color:"#000", border:"none", padding:16, borderRadius:12, fontSize:15, fontWeight:900, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.docsUpload}</button>
          </div>
        )}

        {tab==="messages" && (
          <div className="fadeup" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 160px)" }}>
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:4 }}>{t.tabs[4]}</h2>
            </div>
            <div style={{ background:"#161616", border:"1px solid rgba(255,255,255,.06)", borderRadius:14, padding:"14px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:40, height:40, background:"#1a1a1a", border:"2px solid #a8ff3e", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:G, flexShrink:0 }}>TW</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Tanya Williams</p>
                <p style={{ fontSize:12, color:G, fontWeight:600 }}>Online · {t.msgAdvisor}</p>
              </div>
              <div style={{ background:"rgba(239,68,68,.1)", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:700, color:"#ef4444" }}>No Calls</div>
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, paddingBottom:16 }}>
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.from==="client"?"flex-end":"flex-start" }}>
                  {m.from==="advisor" && (
                    <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                      <div style={{ width:28, height:28, background:"#1a1a1a", border:"1px solid #a8ff3e", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:G, flexShrink:0 }}>TW</div>
                      <div className="msg advisor">{m.text}</div>
                    </div>
                  )}
                  {m.from==="client" && <div className="msg client">{m.text}</div>}
                  <p style={{ fontSize:10, color:"rgba(255,255,255,.25)", marginTop:3, paddingLeft:m.from==="advisor"?36:0 }}>{m.time}</p>
                </div>
              ))}
            </div>
            <div style={{ background:"#1a1a1a", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:"10px 14px", display:"flex", gap:10, alignItems:"center" }}>
              <input value={msgTxt} onChange={e=>setMsgTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder={t.msgPlaceholder} style={{ flex:1, background:"none", border:"none", color:"#fff", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" }} />
              <button onClick={sendMsg} style={{ width:36, height:36, background:G, border:"none", borderRadius:10, cursor:"pointer", fontSize:16, fontWeight:900, color:"#000", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


// ── ADMIN GATE ───────────────────────────────────────────────────
const ADMIN_PASSWORD = "Miguel12211221!";

function AdminGate({ onExit }) {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password.");
      setPw("");
    }
  };

  if (authed) return (
    <div style={{ background:"#f5f4f0", minHeight:"100vh" }}>
      <style>{CSS}</style>
      <div style={{ background:"#0a0a0a", padding:"0 5%", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>A</div>
          <span style={{ fontSize:18, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
          <span style={{ marginLeft:8, fontSize:11, color:"rgba(255,255,255,.4)", background:"rgba(255,255,255,.08)", padding:"3px 10px", borderRadius:20, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Admin</span>
        </div>
        <button onClick={onExit} style={{ background:"none", border:"none", color:"rgba(255,255,255,.4)", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Exit</button>
      </div>
      <AdminDashboard onExit={onExit} />
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0a0a,#0d1f0d)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{CSS}</style>
      <div style={{ background:"#fff", borderRadius:20, padding:"48px 40px", maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ width:64, height:64, background:"#0a0a0a", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
          <span style={{ fontSize:28, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:G }}>A</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:900, color:"#1a1a1a", marginBottom:6 }}>Admin Access</h2>
        <p style={{ fontSize:14, color:"#888", marginBottom:28 }}>Enter your admin password to continue.</p>
        {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", marginBottom:16 }}><p style={{ fontSize:13, color:"#dc2626" }}>{error}</p></div>}
        <div style={{ position:"relative", marginBottom:20 }}>
          <input
            type={showPw?"text":"password"}
            placeholder="Admin password"
            value={pw}
            onChange={e=>setPw(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            style={{ width:"100%", padding:"13px 44px 13px 16px", border:"1.5px solid #e5e8ee", borderRadius:10, fontSize:15, fontFamily:"'DM Sans',sans-serif", color:"#1a1a1a", outline:"none", display:"block" }}
          />
          <button onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#aaa", fontSize:14 }}>{showPw?"Hide":"Show"}</button>
        </div>
        <button onClick={handleLogin} style={{ width:"100%", background:"#1a1a1a", color:"#fff", border:"none", padding:14, borderRadius:10, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>Enter Admin Panel →</button>
        <button onClick={onExit} style={{ background:"none", border:"none", color:"#888", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Back to site</button>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ──────────────────────────────────────────────
function AdminDashboard({ onExit }) {
  const [tab, setTab] = useState("apps");
  const [drawer, setDrawer] = useState(null);
  const [offerForm, setOfferForm] = useState({ product:"Term Loan", amount:"", term:"", payment:"", rate:"", expires:"" });
  const [sent, setSent] = useState(false);

  const apps = JSON.parse(localStorage.getItem("aprovuit_apps")||"[]");
  const STATUS_COLORS = { "Under Review":["#fef3c7","#d97706"], "Approved":["#dcfce7","#16a34a"], "Funded":["#dbeafe","#2563eb"], "Declined":["#fee2e2","#dc2626"], "Docs Needed":["#fff7ed","#ea580c"] };

  const sendOffer = async () => {
    if (!drawer || !offerForm.amount) return;
    const offer = { id:`OFF-${Date.now()}`, appId:drawer.id, product:offerForm.product, amount:offerForm.amount, term:offerForm.term, payment:offerForm.payment, rate:offerForm.rate, expires:offerForm.expires, status:"pending" };
    const existing = JSON.parse(localStorage.getItem(`offers_${drawer.id}`)||"[]");
    existing.push(offer);
    localStorage.setItem(`offers_${drawer.id}`, JSON.stringify(existing));
    if (drawer.email) await sendOfferEmail(drawer.email, drawer.firstName||drawer.company||"Merchant", offer);
    setSent(true);
    setTimeout(()=>setSent(false), 3000);
  };

  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 56px)", background:"#f5f4f0" }}>
      <div style={{ width:200, background:"#0a0a0a", flexShrink:0, display:"flex", flexDirection:"column" }}>
        {[["◻","apps","Applications"],["◈","offer","Send Offer"],["◉","merchants","Merchants"]].map(([icon,id,label])=>(
          <div key={id} className={`sb-item${tab===id?" active":""}`} onClick={()=>setTab(id)}>
            <span style={{ fontSize:15, width:20, textAlign:"center" }}>{icon}</span>{label}
          </div>
        ))}
        <div style={{ marginTop:"auto", padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
          <button onClick={onExit} style={{ background:"none", border:"none", color:"rgba(255,255,255,.35)", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Exit Admin</button>
        </div>
      </div>

      <div style={{ flex:1, padding:"28px 32px", overflow:"auto" }}>
        {tab==="apps" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div><h2 style={{ fontSize:24, fontWeight:900, color:"#1a1a1a", letterSpacing:"-0.02em" }}>Applications</h2><p style={{ fontSize:13, color:"#888" }}>{apps.length} total</p></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
              {[["Total",apps.length],["Under Review",apps.filter(a=>a.status==="Under Review").length],["Approved",apps.filter(a=>a.status==="Approved").length],["Funded",apps.filter(a=>a.status==="Funded").length]].map(([l,v])=>(
                <div key={l} style={{ background:"#fff", border:"1px solid #e5e3de", borderRadius:10, padding:"18px 20px" }}>
                  <p style={{ fontSize:11, color:"#888", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>{l}</p>
                  <p style={{ fontSize:36, fontWeight:900, color:"#1a1a1a", letterSpacing:"-1px" }}>{v}</p>
                </div>
              ))}
            </div>
            {apps.length === 0 ? (
              <div style={{ background:"#fff", border:"1px solid #e5e3de", borderRadius:10, padding:"48px", textAlign:"center" }}>
                <p style={{ fontSize:16, color:"#888" }}>No applications yet. They'll appear here when clients apply.</p>
              </div>
            ) : (
              <div style={{ background:"#fff", border:"1px solid #e5e3de", borderRadius:10, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #e5e3de" }}>
                      {["Company","Name","Amount","Purpose","Credit","Status",""].map(h=>(
                        <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.1em", textTransform:"uppercase", background:"#fafaf8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app,i)=>{
                      const s = STATUS_COLORS[app.status]||["#f5f5f5","#888"];
                      return (
                        <tr key={i} className="tbl-row" style={{ borderBottom:"1px solid #f5f4f0", cursor:"pointer" }} onClick={()=>setDrawer(app)}>
                          <td style={{ padding:"13px 16px", fontSize:14, fontWeight:700 }}>{app.company||"—"}</td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:"#555" }}>{app.firstName} {app.lastName}</td>
                          <td style={{ padding:"13px 16px", fontSize:14, fontWeight:700 }}>{app.loanAmt||app.loan_amount||"—"}</td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:"#666" }}>{app.purpose||"—"}</td>
                          <td style={{ padding:"13px 16px", fontSize:13, color:"#666", textTransform:"capitalize" }}>{app.creditRating||"—"}</td>
                          <td style={{ padding:"13px 16px" }}><span style={{ fontSize:11, padding:"4px 12px", fontWeight:700, borderRadius:20, background:s[0], color:s[1] }}>{app.status||"Under Review"}</span></td>
                          <td style={{ padding:"13px 16px" }}><button style={{ background:"none", border:"none", fontSize:13, color:"#a8ff3e", cursor:"pointer", fontWeight:700 }} onClick={e=>{e.stopPropagation();setDrawer(app);setTab("offer");}}>Send Offer →</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab==="offer" && (
          <div>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#1a1a1a", marginBottom:4, letterSpacing:"-0.02em" }}>Send Offer</h2>
            <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>Create and send a funding offer to a merchant.</p>
            {sent && <div style={{ background:"#dcfce7", border:"1px solid #bbf7d0", borderRadius:10, padding:"12px 16px", marginBottom:20 }}><p style={{ fontSize:14, fontWeight:700, color:"#16a34a" }}>Offer sent! Merchant can see it in their dashboard.</p></div>}
            <div style={{ background:"#fff", border:"1px solid #e5e3de", borderRadius:12, padding:28, maxWidth:560 }}>
              {drawer && (
                <div style={{ background:"#f9fafb", borderRadius:10, padding:"14px 16px", marginBottom:22 }}>
                  <p style={{ fontSize:11, color:"#888", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Sending to</p>
                  <p style={{ fontSize:15, fontWeight:800, color:"#1a1a1a" }}>{drawer.company}</p>
                  <p style={{ fontSize:13, color:"#888" }}>{drawer.firstName} {drawer.lastName} · {drawer.id}</p>
                </div>
              )}
              {!drawer && (
                <div style={{ background:"#fef9f0", border:"1px solid #fed7aa", borderRadius:10, padding:"12px 16px", marginBottom:22 }}>
                  <p style={{ fontSize:13, color:"#ea580c" }}>Select an application from the Applications tab first, or enter an App ID below.</p>
                  <input placeholder="App ID (e.g. APP-123456)" style={{ marginTop:10, width:"100%", padding:"10px 14px", border:"1.5px solid #e5e5ea", borderRadius:8, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" }} onChange={e=>{const app=apps.find(a=>a.id===e.target.value);if(app)setDrawer(app);}} />
                </div>
              )}
              {[["Product",["Term Loan","Line of Credit","Revenue Advance","Equipment Financing"],"product"],["Approved Amount","e.g. $145,000","amount"],["Term","e.g. 18 months","term"],["Monthly Payment","e.g. $8,055","payment"],["Factor Rate","e.g. 1.22 factor","rate"],["Offer Expires","e.g. Apr 30, 2026","expires"]].map(([label,opts,key])=>(
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7, display:"block" }}>{label}</label>
                  {Array.isArray(opts) ? (
                    <select value={offerForm[key]} onChange={e=>setOfferForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #e5e8ee", borderRadius:10, fontSize:15, fontFamily:"'DM Sans',sans-serif", color:"#1a1a1a", appearance:"none", cursor:"pointer", outline:"none" }}>
                      {opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input placeholder={opts} value={offerForm[key]} onChange={e=>setOfferForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #e5e8ee", borderRadius:10, fontSize:15, fontFamily:"'DM Sans',sans-serif", color:"#1a1a1a", outline:"none", display:"block" }} />
                  )}
                </div>
              ))}
              <button onClick={sendOffer} style={{ width:"100%", background:"#1a1a1a", color:G, border:"none", padding:15, borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:8 }}>
                Send Offer to Merchant →
              </button>
              <p style={{ fontSize:12, color:"#888", textAlign:"center", marginTop:10 }}>Offer appears in merchant dashboard + email instantly</p>
            </div>
          </div>
        )}

        {tab==="merchants" && (
          <div>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#1a1a1a", marginBottom:24, letterSpacing:"-0.02em" }}>Merchants</h2>
            <div style={{ background:"#fff", border:"1px solid #e5e3de", borderRadius:10, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #e5e3de" }}>
                    {["Company","Owner","Email","Phone","App ID","Submitted"].map(h=>(
                      <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.1em", textTransform:"uppercase", background:"#fafaf8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apps.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", color:"#888", fontSize:14 }}>No merchants yet.</td></tr>
                  ) : apps.map((app,i)=>(
                    <tr key={i} className="tbl-row" style={{ borderBottom:"1px solid #f5f4f0" }}>
                      <td style={{ padding:"13px 16px", fontSize:14, fontWeight:700 }}>{app.company||"—"}</td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:"#555" }}>{app.firstName} {app.lastName}</td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:"#3b82f6" }}>{app.email||"—"}</td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:"#666" }}>{app.phone||"—"}</td>
                      <td style={{ padding:"13px 16px", fontSize:12, color:"#888", fontFamily:"monospace" }}>{app.id}</td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:"#888" }}>{app.submittedAt||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawer && tab==="apps" && (
        <div style={{ position:"fixed", right:0, top:0, bottom:0, width:380, background:"#fff", borderLeft:"1px solid #e5e3de", padding:28, overflow:"auto", boxShadow:"-8px 0 32px rgba(0,0,0,.08)", zIndex:200 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
            <h3 style={{ fontSize:20, fontWeight:900, color:"#1a1a1a" }}>{drawer.company||"Applicant"}</h3>
            <button onClick={()=>setDrawer(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#ccc" }}>×</button>
          </div>
          {[["App ID",drawer.id],["Name",`${drawer.firstName||""} ${drawer.lastName||""}`],["Email",drawer.email||"—"],["Phone",drawer.phone||"—"],["Loan Amount",drawer.loanAmt||drawer.loan_amount||"—"],["Purpose",drawer.purpose||"—"],["Timeline",drawer.timeline||"—"],["Industry",drawer.industry||"—"],["Years",drawer.years||"—"],["Annual Revenue",drawer.annualRev||"—"],["Credit",drawer.creditRating||"—"],["Submitted",drawer.submittedAt||"—"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f5f4f0", fontSize:13 }}>
              <span style={{ color:"#888" }}>{k}</span><span style={{ fontWeight:700, color:"#1a1a1a", textAlign:"right", maxWidth:"60%", wordBreak:"break-word" }}>{v}</span>
            </div>
          ))}
          <button onClick={()=>{setTab("offer");setDrawer(drawer);}} style={{ width:"100%", background:"#1a1a1a", color:G, border:"none", padding:14, borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:20 }}>Send Offer →</button>
          <button onClick={()=>setDrawer(null)} style={{ width:"100%", background:"#f5f4f0", color:"#1a1a1a", border:"none", padding:13, borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:10 }}>Close</button>
        </div>
      )}
    </div>
  );
}



// ── INNER PAGE NAV ───────────────────────────────────────────────
function InnerNav({ lang, setLang, onBack, onApply, onProducts, onHowItWorks, onFaq, onLogin, onAbout, onContact }) {
  const go = (fn) => { fn && fn(); window.scrollTo(0,0); };
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,.97)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.08)", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
      <button onClick={()=>go(onBack)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="6" fill="#a8ff3e"/>
          <path d="M8 20L14 8L20 20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="10.5" y1="16" x2="17.5" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize:15, fontWeight:800, color:"#fff", letterSpacing:"-.03em", fontFamily:"'Sora',sans-serif" }}>APROVUIT</span>
      </button>
      <div style={{ display:"flex", gap:28, alignItems:"center" }}>
        <button onClick={()=>go(onBack)} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Inicio":"Home"}</button>
        <button onClick={()=>go(onProducts)} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Productos":"Products"}</button>
        <button onClick={()=>go(onHowItWorks)} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Cómo Funciona":"How It Works"}</button>
        <button onClick={()=>go(onFaq)} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>FAQ</button>
        {onAbout && <button onClick={()=>go(onAbout)} className="nav-link">{lang==="es"?"Nosotros":"About"}</button>}
        {onContact && <button onClick={()=>go(onContact)} className="nav-link">{lang==="es"?"Contacto":"Contact"}</button>}
        {onLogin && <button onClick={()=>go(onLogin)} className="nav-link">{lang==="es"?"Entrar":"Log In"}</button>}
        {setLang && <div className="lang-pill">
          <button className="lb" onClick={()=>setLang("en")} style={{ background:lang==="en"?"#a8ff3e":"transparent", color:lang==="en"?"#000":"rgba(255,255,255,.4)" }}>EN</button>
          <button className="lb" onClick={()=>setLang("es")} style={{ background:lang==="es"?"#a8ff3e":"transparent", color:lang==="es"?"#000":"rgba(255,255,255,.4)" }}>ES</button>
        </div>}
        <button onClick={()=>go(onApply)} className="btn-green" style={{ padding:"9px 20px", fontSize:13 }}>{lang==="es"?"Comenzar →":"Get Started →"}</button>
      </div>
    </nav>
  );
}


// ── DONT SEE SECTION ─────────────────────────────────────────────
function DontSeeSection({ lang, onApply }) {
  const G = "#a8ff3e";
  return (
    <section style={{ background:BK2, padding:"64px 5%", borderTop:"1px solid rgba(255,255,255,.05)" }}>
      <div style={{ maxWidth:820, margin:"0 auto", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(22px,3vw,38px)", fontWeight:700, color:"#fff", letterSpacing:"-.03em", marginBottom:14 }}>
          {lang==="es" ? "No ves tu industria?" : "Don't See Your Industry?"}
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.45)", maxWidth:520, margin:"0 auto 28px", lineHeight:1.8, fontWeight:300 }}>
          {lang==="es"
            ? "Fondeamos negocios en prácticamente cualquier industria. Si tu negocio lleva 6+ meses en operación y genera ingresos, queremos conocer tu historia."
            : "We fund businesses across virtually any industry. If your business has been operating for 6+ months and generates revenue, we want to hear your story."}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, maxWidth:640, margin:"0 auto 28px" }} className="how-grid">
          {(lang==="es"
            ? [["Servicios Profesionales","Abogados, contadores y otros profesionales."],["Tecnologia","Software, IT y negocios digitales."],["Y Mucho Mas","Hospitalidad, belleza, fitness, educacion y mas."]]
            : [["Professional Services","Lawyers, accountants, and service professionals."],["Technology","Software companies, IT services, digital businesses."],["And Many More","Hospitality, beauty, fitness, education, and more."]]
          ).map(([t,d])=>(
            <div key={t} style={{ background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, padding:"20px 16px" }}>
              <div style={{ width:28, height:28, background:"rgba(168,255,62,.08)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                <div style={{ width:7, height:7, background:G, borderRadius:"50%" }}></div>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:5 }}>{t}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", lineHeight:1.6, fontWeight:300 }}>{d}</p>
            </div>
          ))}
        </div>
        <button onClick={onApply} className="btn-green" style={{ fontSize:14, padding:"11px 32px" }}>
          {lang==="es" ? "Ver Si Califico" : "See If I Qualify"}
        </button>
        <p style={{ fontSize:11, color:"rgba(255,255,255,.25)", marginTop:10 }}>
          {lang==="es" ? "6+ meses en operacion, sin impacto al credito" : "6+ months in business, no credit impact, no phone calls"}
        </p>
      </div>
    </section>
  );
}

// ── PRODUCTS PAGE ────────────────────────────────────────────────

      


function ProductsPage({ lang, setLang, onBack, onApply, onProducts, onHowItWorks, onFaq, onAbout, onContact }) {
  const products = [
    {
      icon:"→", name:lang==="es"?"Préstamo a Plazo":"Term Loan",
      range:"$10K – $500K", term:lang==="es"?"3–24 meses":"3–24 months",
      color:"#a8ff3e",
      tagline:lang==="es"?"Capital fijo para grandes movimientos.":"Fixed capital for big moves.",
      desc:lang==="es"
        ?"Un préstamo a plazo te da una suma fija de dinero que pagas en cuotas mensuales fijas durante un período establecido. Ideal para inversiones únicas como expansión de ubicación, contratación de personal, renovaciones o compras de equipo grande."
        :"A term loan gives you a fixed lump sum of money that you repay in fixed monthly installments over a set period. Ideal for one-time investments like location expansion, hiring staff, renovations, or large equipment purchases.",
      best:lang==="es"?["Expansión de negocio","Renovaciones","Contratación","Compra de equipo grande"]:["Business expansion","Renovations","Hiring staff","Large equipment purchases"],
      reqs:lang==="es"?["6+ meses en operación","$10K+ ingresos mensuales","580+ puntaje de crédito","Sin llamadas"]:["6+ months in business","$10K+ monthly revenue","580+ credit score","No phone calls"],
      how:lang==="es"?"Recibes el monto completo de una vez. Los pagos son fijos cada mes, lo que facilita la planificación. Las tasas dependen de tu historial crediticio e ingresos.":"You receive the full amount upfront. Payments are fixed each month, making planning easy. Rates depend on your credit history and revenue.",
    },
    {
      icon:"⟳", name:lang==="es"?"Línea de Crédito":"Line of Credit",
      range:"$10K – $5M", term:lang==="es"?"Revolvente":"Revolving",
      color:"#60a5fa",
      tagline:lang==="es"?"Accede a fondos cuando los necesites.":"Access funds exactly when you need them.",
      desc:lang==="es"
        ?"Una línea de crédito revolvente te da acceso a un límite de crédito que puedes usar, pagar y usar de nuevo. Solo pagas intereses sobre lo que usas. Perfecta para negocios con flujo de caja variable o necesidades de capital de trabajo continuas."
        :"A revolving line of credit gives you access to a credit limit you can draw from, repay, and draw again. You only pay interest on what you use. Perfect for businesses with variable cash flow or ongoing working capital needs.",
      best:lang==="es"?["Capital de trabajo","Inventario estacional","Gastos inesperados","Nómina"]:["Working capital","Seasonal inventory","Unexpected expenses","Payroll"],
      reqs:lang==="es"?["6+ meses en operación","$15K+ ingresos mensuales","600+ puntaje de crédito","Sin llamadas"]:["6+ months in business","$15K+ monthly revenue","600+ credit score","No phone calls"],
      how:lang==="es"?"Aprobado una vez, accedes a tu límite cuando lo necesitas. El límite se repone automáticamente al pagar. Sin restricciones sobre cómo usar los fondos.":"Approved once, draw when needed. Limit replenishes automatically as you repay. No restrictions on how you use the funds.",
    },
    {
      icon:"⚡", name:lang==="es"?"Adelanto de Ingresos":"Revenue-Based Advance",
      range:"$5K – $500K", term:lang==="es"?"Pago diario/semanal":"Daily/weekly repayment",
      color:"#f59e0b",
      tagline:lang==="es"?"Fondos rápidos basados en tus ingresos.":"Fast funding based on your revenue.",
      desc:lang==="es"
        ?"Un adelanto de ingresos te da capital rápido a cambio de un porcentaje de tus ventas futuras. Los pagos son automáticos y se ajustan con tus ingresos — pagas más cuando ganas más, menos cuando ganas menos."
        :"A revenue-based advance gives you fast capital in exchange for a percentage of your future sales. Payments are automatic and flex with your revenue — you pay more when you earn more, less when you earn less.",
      best:lang==="es"?["Negocios con ventas con tarjeta","Restaurantes","Retail","Necesidades urgentes de capital"]:["Card-processing businesses","Restaurants","Retail","Urgent capital needs"],
      reqs:lang==="es"?["6+ meses en operación","$10K+ ingresos mensuales","No se requiere puntaje mínimo","Sin llamadas"]:["6+ months in business","$10K+ monthly revenue","No minimum credit score required","No phone call"],
      how:lang==="es"?"Aprobación en horas. Los pagos se toman automáticamente de tus ventas diarias o semanales. Sin pagos fijos — se ajusta a tu flujo de caja.":"Approved in hours. Payments are taken automatically from your daily or weekly sales. No fixed payments — adjusts to your cash flow.",
    },
    {
      icon:"⚙", name:lang==="es"?"Financiamiento de Equipo":"Equipment Financing",
      range:"$5K – $2M", term:lang==="es"?"Hasta 60 meses":"Up to 60 months",
      color:"#c084fc",
      tagline:lang==="es"?"Financia el equipo que hace crecer tu negocio.":"Finance the equipment that grows your business.",
      desc:lang==="es"
        ?"El financiamiento de equipo te permite adquirir la maquinaria, vehículos o tecnología que necesitas sin agotar tu capital de trabajo. El equipo mismo sirve como colateral, lo que significa tasas más bajas y aprobación más fácil."
        :"Equipment financing lets you acquire the machinery, vehicles, or technology you need without draining your working capital. The equipment itself serves as collateral, meaning lower rates and easier approval.",
      best:lang==="es"?["Vehículos comerciales","Maquinaria","Tecnología y software","Equipo médico"]:["Commercial vehicles","Machinery","Technology & software","Medical equipment"],
      reqs:lang==="es"?["6+ meses en operación","$8K+ ingresos mensuales","560+ puntaje de crédito","Sin llamadas"]:["6+ months in business","$8K+ monthly revenue","560+ credit score","No phone call"],
      how:lang==="es"?"El equipo es el colateral, lo que facilita la aprobación incluso con crédito limitado. Pagas a plazos fijos. Al final del término, el equipo es tuyo.":"The equipment is the collateral, making approval easier even with limited credit. You pay fixed installments. At term end, the equipment is yours.",
    },
  ];

  return (
    <div style={{ minHeight:"100vh", background:BK, color:"#fff" }}>
      <style>{CSS}</style>
      <InnerNav lang={lang} setLang={setLang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} onAbout={onAbout} onContact={onContact} />
      <div style={{ padding:"64px 5% 80px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{lang==="es"?"Productos de Financiamiento":"Funding Products"}</p>
          <h1 className="cond" style={{ fontSize:"clamp(48px,8vw,88px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.03em", marginBottom:16, lineHeight:0.9 }}>{lang==="es"?"Todo Tipo de Financiamiento":"Every Type of Funding"}</h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.5)", maxWidth:560, margin:"0 auto", lineHeight:1.75 }}>{lang==="es"?"Encuentra el producto correcto para tu negocio. Sin vendedores. Sin llamadas.":"Find the right product for your business. No salespeople. No phone calls."}</p>
        </div>

        {products.map((p,i)=>(
          <div key={p.name} style={{ background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"40px 44px", marginBottom:20, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, width:4, bottom:0, background:p.color, borderRadius:"16px 0 0 16px" }}></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                  <div style={{ width:48, height:48, background:`${p.color}15`, border:`1px solid ${p.color}40`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:p.color }}>{p.icon}</div>
                  <div>
                    <h2 className="cond" style={{ fontSize:28, fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.01em" }}>{p.name}</h2>
                    <p style={{ fontSize:13, color:p.color, fontWeight:700 }}>{p.tagline}</p>
                  </div>
                </div>
                <p style={{ fontSize:15, color:"rgba(255,255,255,.55)", lineHeight:1.85, marginBottom:24, fontWeight:300 }}>{p.desc}</p>
                <div style={{ display:"flex", gap:20, marginBottom:24 }}>
                  <div style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"14px 18px", flex:1 }}>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{lang==="es"?"Monto":"Amount"}</p>
                    <p style={{ fontSize:18, fontWeight:800, color:p.color }}>{p.range}</p>
                  </div>
                  <div style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"14px 18px", flex:1 }}>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{lang==="es"?"Plazo":"Term"}</p>
                    <p style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{p.term}</p>
                  </div>
                </div>
                <button onClick={onApply} style={{ background:p.color, color:"#000", border:"none", padding:"13px 32px", borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Comenzar →":"Get Started →"}</button>
              </div>
              <div>
                <div style={{ marginBottom:24 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>{lang==="es"?"Ideal para":"Best For"}</p>
                  {p.best.map(b=>(
                    <div key={b} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                      <div style={{ width:4, height:4, background:p.color, borderRadius:"50%", flexShrink:0 }}></div>
                      <span style={{ fontSize:13, color:"rgba(255,255,255,.6)", fontWeight:400, letterSpacing:"-.01em" }}>{b}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{lang==="es"?"Cómo Funciona":"How It Works"}</p>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", lineHeight:1.7, fontWeight:300 }}>{p.how}</p>
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>{lang==="es"?"Requisitos":"Requirements"}</p>
                  {p.reqs.map(r=>(
                    <div key={r} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <div style={{ width:6, height:6, background:G, borderRadius:"50%", flexShrink:0 }}></div>
                      <span style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <DontSeeSection lang={lang} onApply={onApply} />
    </div>
  );
}


// ── HOW IT WORKS PAGE ─────────────────────────────────────────────
function HowItWorksPage({ lang, setLang, onBack, onApply, onProducts, onHowItWorks, onFaq, onAbout, onContact }) {
  const steps = lang==="es" ? [
    { n:"01", title:"Completa tu Solicitud", time:"5 minutos", icon:"01",
      desc:"Llena nuestra solicitud inteligente en línea. Sin entrevistas telefónicas. Sin papeleo. Solo información básica sobre tu negocio y lo que necesitas.", details:["Información básica del negocio","Monto de financiamiento deseado","Propósito de los fondos","Sube 3-6 meses de estados bancarios"] },
    { n:"02", title:"Crea Tu Cuenta", time:"30 segundos", icon:"02",
      desc:"Crea tu cuenta segura de Aprovuit. Aquí rastrearás todo — tu solicitud, ofertas, documentos y mensajes con tu asesor.", details:["Correo electrónico y contraseña","Verificación de identidad por SMS","Portal personal con dashboard en tiempo real","Sin instalación de app requerida"] },
    { n:"03", title:"Revisión de Solicitud", time:"2-4 horas", icon:"03",
      desc:"Nuestro equipo revisa tu solicitud. Evaluamos ingresos, historial crediticio y la salud general de tu negocio. Sin llamadas de nuestra parte.", details:["Consulta suave de crédito (sin impacto)","Análisis de estados bancarios","Evaluación de ingresos mensuales","Comunicación 100% por escrito"] },
    { n:"04", title:"Recibe tu Oferta", time:"En tu dashboard", icon:"04",
      desc:"Tu oferta personalizada aparece directamente en tu portal y en tu correo. Cada término es transparente — monto, tasa, pagos mensuales, todo claro antes de aceptar.", details:["Monto aprobado","Tasa de interés o factor","Calendario de pagos","Fecha estimada de fondeo"] },
    { n:"05", title:"Acepta y Recibe Fondos", time:"Mismo día", icon:"05",
      desc:"Acepta tu oferta con un clic. Sin presión. Sin llamadas. Si aceptas antes de las 3pm EST, los fondos llegan el mismo día hábil.", details:["Acepta o rechaza con un clic","Sin presión de vendedores","Fondos via transferencia ACH","Confirmación inmediata por correo"] },
    { n:"06", title:"Administra tu Financiamiento", time:"En cualquier momento", icon:"06",
      desc:"Rastrea tu saldo, pagos y renovaciones directamente en tu portal. Cuando seas elegible para renovación, aparece en tu dashboard — sin llamadas frías.", details:["Balance en tiempo real","Historial de pagos","Elegibilidad de renovación automática","Soporte por mensaje directo"] },
  ] : [
    { n:"01", title:"Complete Your Application", time:"5 minutes", icon:"01",
      desc:"Fill out our smart online application. No phone interviews. No paperwork. Just basic information about your business and what you need.", details:["Basic business information","Desired funding amount","Purpose of funds","Upload 3-6 months of bank statements"] },
    { n:"02", title:"Create Your Account", time:"30 seconds", icon:"02",
      desc:"Create your secure Aprovuit account. This is where you'll track everything — your application, offers, documents, and messages with your advisor.", details:["Email and password","SMS identity verification","Personal dashboard with real-time tracking","No app download required"] },
    { n:"03", title:"Application Review", time:"2-4 hours", icon:"03",
      desc:"Our team reviews your application. We evaluate your revenue, credit history, and overall business health. No phone calls from our side — ever.", details:["Soft credit pull (zero impact to score)","Bank statement analysis","Monthly revenue evaluation","100% written communication"] },
    { n:"04", title:"Receive Your Offer", time:"In your dashboard", icon:"04",
      desc:"Your personalized offer appears directly in your portal and via email. Every term is transparent — amount, rate, monthly payments, all clear before you accept.", details:["Approved amount","Interest rate or factor rate","Payment schedule","Estimated funding date"] },
    { n:"05", title:"Accept & Get Funded", time:"Same day", icon:"05",
      desc:"Accept your offer with one click. No pressure. No phone calls. Accept before 3pm EST and funds arrive the same business day.", details:["Accept or decline with one click","No salesperson pressure","Funds via ACH transfer","Immediate email confirmation"] },
    { n:"06", title:"Manage Your Funding", time:"Anytime", icon:"06",
      desc:"Track your balance, payments, and renewal eligibility directly in your portal. When you're eligible for renewal, it shows up in your dashboard — no cold calls.", details:["Real-time balance tracking","Payment history","Automatic renewal eligibility","Direct message support"] },
  ];

  return (
    <div style={{ minHeight:"100vh", background:BK, color:"#fff" }}>
      <style>{CSS}</style>
      <InnerNav lang={lang} setLang={setLang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} onAbout={onAbout} onContact={onContact} />
      <div style={{ padding:"64px 5% 80px", maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:72 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{lang==="es"?"Proceso Simple":"Simple Process"}</p>
          <h1 className="cond" style={{ fontSize:"clamp(48px,8vw,88px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.03em", marginBottom:16, lineHeight:0.9 }}>{lang==="es"?"Cómo Funciona":"How It Works"}</h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.5)", maxWidth:520, margin:"0 auto", lineHeight:1.75 }}>{lang==="es"?"De la solicitud a los fondos — sin llamadas, sin vendedores, sin sorpresas.":"From application to funded — our team works the deal, you track every step."}</p>
        </div>
        {steps.map((s,i)=>(
          <div key={s.n} style={{ display:"flex", gap:32, marginBottom:40, position:"relative" }}>
            {i < steps.length-1 && <div style={{ position:"absolute", left:23, top:56, bottom:-40, width:2, background:"rgba(255,255,255,.06)" }}></div>}
            <div style={{ flexShrink:0 }}>
              <div style={{ width:48, height:48, background:i===0||i===4?G:"#1a1a1a", border:`2px solid ${i===0||i===4?G:"rgba(255,255,255,.1)"}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{s.icon}</div>
            </div>
            <div style={{ flex:1, background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"28px 32px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                <div>
                  <span className="cond" style={{ fontSize:13, color:"rgba(255,255,255,.3)", letterSpacing:"0.1em" }}>{s.n}</span>
                  <h3 className="cond" style={{ fontSize:24, fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.01em" }}>{s.title}</h3>
                </div>
                <span style={{ background:"rgba(168,255,62,.1)", border:"1px solid rgba(168,255,62,.2)", color:G, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, whiteSpace:"nowrap" }}>⏱ {s.time}</span>
              </div>
              <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.8, marginBottom:20, fontWeight:300 }}>{s.desc}</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                {s.details.map(d=>(
                  <div key={d} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:6, height:6, background:G, borderRadius:"50%", flexShrink:0 }}></div>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,.45)" }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {/* Animated Demo */}
        <div style={{ marginTop:48 }}>
          <AnimatedDemo lang={lang} />
        </div>
        {/* Dashboard Slider */}
        <div style={{ marginTop:0 }}>
          <DashboardSlider lang={lang} />
        </div>

        <div style={{ background:G, borderRadius:16, padding:"40px 48px", textAlign:"center", marginTop:24 }}>
          <h2 className="cond" style={{ fontSize:36, fontWeight:900, color:"#000", textTransform:"uppercase", marginBottom:12 }}>{lang==="es"?"¿Listo para Comenzar?":"Ready to Get Started?"}</h2>
          <p style={{ fontSize:16, color:"rgba(0,0,0,.6)", marginBottom:24 }}>{lang==="es"?"Aplica en 5 minutos. Sin llamadas. Sin compromiso.":"Apply in 5 minutes. No calls. No commitment."}</p>
          <button onClick={onApply} style={{ background:"#000", color:G, border:"none", padding:"14px 40px", borderRadius:10, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Comenzar →":"Get Started →"}</button>
        </div>
      </div>
    </div>
  );
}

// ── FAQ PAGE ──────────────────────────────────────────────────────
function FAQPage({ lang, setLang, onBack, onApply, onProducts, onHowItWorks, onFaq, onAbout, onContact }) {
  const [open, setOpen] = useState(null);
  const categories = lang==="es" ? [
    { cat:"La Plataforma", items:[
      ["¿Qué es Aprovuit?","Aprovuit es una plataforma de mercado de financiamiento — no un prestamista ni corredor. Envías una solicitud, socios de financiamiento independientes la revisan y pueden extender ofertas. Tú compara y eliges. Aprovuit no toma decisiones de crédito."],
      ["¿Cómo genera dinero Aprovuit?","Aprovuit gana una comisión de broker pagada por el socio de financiamiento cuando un trato se fondea exitosamente — no de ti. No hay costo por aplicar o usar la plataforma. Todas las comisiones se divulgan completamente antes de que firmes cualquier acuerdo."],
      ["¿Mi información está segura?","Sí. Todos los datos están encriptados con SSL de 256 bits. Tu información solo puede ser compartida con socios de financiamiento para evaluar tu solicitud."],
      ["¿Está disponible en todos los estados?","La plataforma está disponible a nivel nacional. Productos específicos pueden tener restricciones geográficas según la licencia del socio de financiamiento."],
    ]},
    { cat:"Elegibilidad y Requisitos", items:[
      ["¿Cuáles son los requisitos mínimos?","Los requisitos varían por socio y producto. En general: 6+ meses en operación, $10,000+ en ingresos mensuales, 580+ puntaje de crédito. Algunas opciones basadas en ingresos son más flexibles. Enviar una solicitud no garantiza una oferta."],
      ["¿Qué tipos de negocios pueden aplicar?","La mayoría de negocios legítimos — retail, restaurantes, construcción, salud, transporte, servicios profesionales, tecnología, y más. Los socios determinan elegibilidad de forma independiente."],
      ["¿Cuánto tiempo necesito en operación?","Generalmente 6 meses mínimo. Algunas opciones basadas en ingresos aceptan negocios con 6+ meses en operación."],
      ["¿Qué pasa si no califico?","No toda solicitud resulta en una oferta. Si no se extiende ninguna, tu portal lo reflejará. Puedes actualizar tu perfil y reenviar a medida que tu negocio crece."],
    ]},
    { cat:"Proceso y Tiempos", items:[
      ["¿Cuánto tiempo toma el proceso?","La mayoría de socios revisan solicitudes en 2–4 horas hábiles. Los plazos de financiamiento dependen del socio — muchos pueden financiar en 1–2 días hábiles tras la aceptación."],
      ["¿Necesito hablar por teléfono?","Nunca. Aprovuit es completamente de autoservicio. Envías tu solicitud, las ofertas aparecen en tu portal, comparas y eliges. Sin llamadas."],
      ["¿Qué documentos necesito?","Típicamente: 3–6 meses de estados de cuenta bancarios, identificación oficial y cheque anulado. Todo se sube de forma segura a través de la plataforma."],
    ]},
    { cat:"Crédito y Financiamiento", items:[
      ["¿Afectará mi puntaje de crédito enviar una solicitud?","Enviar una solicitud genera una consulta suave — sin impacto en tu puntaje. Una consulta dura solo puede ocurrir si aceptas una oferta de un socio."],["¿Hay penalidades por pago anticipado?","No. Ofrecemos descuentos líderes en la industria por pago anticipado — entre más rápido pagues, más ahorras. Por ejemplo, un adelanto de $50K con pagos mensuales de $625 puede costar significativamente menos si se liquida antes. Creemos que debes ser recompensado por pagar anticipado, no penalizado."],
      ["¿Qué tipos de financiamiento están disponibles?","A través de nuestra red: financiamiento a plazo ($10K–$500K), líneas de crédito ($10K–$5M), financiamiento basado en ingresos ($5K–$500K) y financiamiento de equipo ($5K–$2M). Disponibilidad varía."],
      ["¿Puedo ver los términos antes de aceptar?","Sí. Todas las ofertas en tu portal muestran el monto, tasa, pago y plazo claramente antes de que tomes ninguna decisión."],
    ]},
    { cat:"Tu Portal", items:[
      ["¿Cómo accedo a mi portal?","En aprovuit.com haz clic en 'Entrar'. Usa el correo y contraseña que creaste. Hay verificación por SMS para mayor seguridad."],
      ["¿Puedo rastrear mi solicitud en tiempo real?","Sí. Tu portal muestra el estado exacto — Enviado, En Revisión, Oferta Disponible, Aceptado."],
      ["¿Puedo administrar financiamiento existente desde el portal?","Sí. Una vez activo, tu portal muestra saldos, pagos próximos e historial. Puedes subir documentos y enviar mensajes a tu equipo directamente."],
      ["¿Cómo me comunico con el equipo de Aprovuit?","Directamente en tu portal en la sección de Mensajes. Todo por escrito para que tengas registro de cada conversación."],
    ]},
  ] : [
    { cat:"The Platform", items:[
      ["What is Aprovuit?","Aprovuit is a business funding platform built for established businesses. Apply once, get matched with the right funding solution, and track your deal in real time — all in one place."],
      ["How does Aprovuit make money?","Aprovuit earns a broker fee paid by the funding partner when a deal is successfully funded — not from you. There is no cost to apply or use the platform. All fees are fully disclosed before you sign any agreement."],
      ["Is my information secure?","Yes. All data is encrypted with 256-bit SSL. Your information may only be shared with financing partners for the purpose of evaluating your request."],
      ["Is Aprovuit available in all states?","The platform is available nationwide. Specific products may have geographic restrictions based on financing partner licensing."],
    ]},
    { cat:"Eligibility & Requirements", items:[
      ["What are the minimum requirements?","Requirements vary by partner and product. Generally: 6+ months in business, $10,000+ monthly revenue, 580+ credit score. All products require 6+ months in business. Submitting does not guarantee an offer."],
      ["What types of businesses can apply?","Most legitimate businesses — retail, restaurants, construction, healthcare, transportation, professional services, technology, and more. Financing partners independently determine eligibility."],
      ["How long do I need to be in business?","Generally 6 months minimum. All products require a minimum of 6 months in business."],
      ["What if I don't qualify?","Not every request results in an offer. If none is extended, your dashboard will reflect that. You can update your profile and resubmit as your business grows."],
    ]},
    { cat:"Process & Timing", items:[
      ["How long does the process take?","Most partners review requests within 2–4 business hours. Funding timelines depend on the partner — many can fund within 1–2 business days of acceptance."],
      ["Do I need to get on the phone?","Never. Aprovuit is fully self-service. You submit your request, offers appear in your dashboard, you compare and choose. No phone calls."],
      ["What documents do I need?","Typically: 3–6 months of business bank statements, a government-issued ID, and a voided business check. All uploaded securely through the platform."],
    ]},
    { cat:"Credit & Financing", items:[
      ["Will submitting a request affect my credit score?","Submitting a request triggers a soft credit inquiry — zero impact to your score. A hard inquiry may only occur if you choose to accept an offer from a financing partner."],["Are there prepayment penalties?","No. We offer industry-leading prepayment discounts — the earlier you pay off, the more you save. For example, a $50K advance with $625 monthly payments could cost significantly less if paid off ahead of schedule. We believe you should be rewarded for paying early, not penalized."],
      ["What financing options are available?","Through our network: term financing ($10K–$500K), revolving credit ($10K–$5M), revenue-based financing ($5K–$500K), and equipment financing ($5K–$2M). Availability varies by profile."],
      ["Can I see all terms before accepting?","Yes. Every offer in your dashboard shows the amount, rate, payment, and term clearly before you make any decision."],
    ]},
    { cat:"Your Dashboard", items:[
      ["How do I access my dashboard?","Go to aprovuit.com and click 'Log In'. Use the email and password you created when submitting your request. SMS verification adds security."],
      ["Can I track my request in real time?","Yes. Your dashboard shows the exact status — Submitted, Under Review, Offer Available, Accepted."],
      ["Can I manage existing financing from the dashboard?","Yes. Once active, your dashboard shows balances, upcoming payments, and payment history. Upload documents and message your account team directly."],
      ["How do I contact the Aprovuit team?","Directly in your dashboard in the Messages section. Everything is in writing so you have a record of every conversation."],
    ]},
  ];

  return (
    <div style={{ minHeight:"100vh", background:BK, color:"#fff" }}>
      <style>{CSS}</style>
      <InnerNav lang={lang} setLang={setLang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} onAbout={onAbout} onContact={onContact} />
      <div style={{ padding:"64px 5% 80px", maxWidth:860, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{lang==="es"?"Preguntas Frecuentes":"FAQ"}</p>
          <h1 className="cond" style={{ fontSize:"clamp(48px,8vw,88px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.03em", marginBottom:16, lineHeight:0.9 }}>{lang==="es"?"Preguntas Comunes":"Common Questions"}</h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.5)", maxWidth:480, margin:"0 auto", lineHeight:1.75 }}>{lang==="es"?"Todo lo que necesitas saber sobre financiamiento con Aprovuit.":"Everything you need to know about funding with Aprovuit."}</p>
        </div>
        {categories.map((cat,ci)=>(
          <div key={cat.cat} style={{ marginBottom:40 }}>
            <h2 className="cond" style={{ fontSize:22, fontWeight:800, textTransform:"uppercase", color:G, marginBottom:16, letterSpacing:"0.02em" }}>{cat.cat}</h2>
            {cat.items.map(([q,a],i)=>{
              const key = `${ci}-${i}`;
              return (
                <div key={key} style={{ borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                  <button onClick={()=>setOpen(open===key?null:key)} style={{ width:"100%", background:"none", border:"none", color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 0", cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif", gap:16 }}>
                    <span style={{ fontSize:16, fontWeight:600, lineHeight:1.4 }}>{q}</span>
                    <span style={{ fontSize:20, color:"rgba(255,255,255,.3)", flexShrink:0, transition:"transform .2s", transform:open===key?"rotate(45deg)":"none" }}>+</span>
                  </button>
                  {open===key && <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.85, paddingBottom:20, fontWeight:300 }}>{a}</p>}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ background:G, borderRadius:16, padding:"36px 48px", textAlign:"center", marginTop:16 }}>
          <h2 className="cond" style={{ fontSize:32, fontWeight:900, color:"#000", textTransform:"uppercase", marginBottom:10 }}>{lang==="es"?"¿Tienes más preguntas?":"Still have questions?"}</h2>
          <p style={{ fontSize:15, color:"rgba(0,0,0,.6)", marginBottom:20 }}>{lang==="es"?"Aplica y tu asesor responderá todo en tu portal.":"Apply and your advisor will answer everything in your portal."}</p>
          <button onClick={onApply} style={{ background:"#000", color:G, border:"none", padding:"13px 36px", borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Comenzar →":"Get Started →"}</button>
        </div>
      </div>
    </div>
  );
}


// ── CHATBOT ──────────────────────────────────────────────────────
function Chatbot({ lang, onApply }) {
  const G = "#a8ff3e";
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{
    role:"assistant",
    content: lang==="es"
      ? "¡Hola! Soy el asistente de Aprovuit. ¿En qué puedo ayudarte hoy?"
      : "Hi! I'm the Aprovuit assistant. How can I help you today?"
  }]);
  const [input, setInput] = useState("");
  const endRef = React.useRef(null);

  React.useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, open]);

  const rules = lang === "es" ? [
    { keys:["cuánto","calific","monto","cantidad"], reply:"Basado en tu industria e ingresos, podrías calificar desde $10,000 hasta $500,000. El mejor camino es completar una solicitud — es gratuito y no afecta tu crédito." },
    { keys:["requisito","necesito","calificar","elegible"], reply:"Generalmente necesitas: 6+ meses en operación, $10,000+ en ingresos mensuales y un puntaje de crédito de 580+. Sin garantías personales en la mayoría de productos." },
    { keys:["crédito","puntaje","credit score","impacto"], reply:"Solo hacemos una consulta suave — cero impacto a tu puntaje de crédito. Solo si aceptas una oferta puede ocurrir una consulta dura." },
    { keys:["tiempo","cuándo","rápido","demora","fondos"], reply:"La mayoría de decisiones se dan en 2–4 horas hábiles. Una vez aprobado, los fondos generalmente llegan en 24 horas." },
    { keys:["pago anticip","descuento","penalidad","pagar antes"], reply:"No hay penalidades por pago anticipado. Ofrecemos descuentos del 18% (3 meses), 12% (6 meses) y 6% (9 meses) si pagas antes." },
    { keys:["costo","tasa","caro","interés","cargo"], reply:"Las tasas varían según tu perfil e industria. Todos los términos se muestran claramente en tu portal antes de firmar. Sin cargos ocultos." },
    { keys:["producto","préstamo","línea","adelanto","equipo"], reply:"Ofrecemos Préstamos a Plazo ($10K–$500K), Líneas de Crédito ($10K–$5M), Adelantos por Ingresos ($5K–$500K) y Financiamiento de Equipo ($5K–$2M)." },
    { keys:["llamada","teléfono","hablar","contacto"], reply:"Sin llamadas de ventas no solicitadas — jamás. Pero si prefieres hablar con un asesor, solo dilo y alguien te contactará. Todo también está disponible en tu portal." },
    { keys:["aplicar","comenzar","solicitud","aplicación"], reply:"¡Perfecto! Completa tu solicitud en minutos — es gratuita y no afecta tu crédito.", action:"apply" },
    { keys:["gracias","ok","bien","entiendo"], reply:"¡Con gusto! Si tienes más preguntas o estás listo para aplicar, aquí estaré." },
  ] : [
    { keys:["how much","qualify","amount","how many"], reply:"Based on your industry and revenue, you could qualify for $10,000 to $500,000+. Best way to find out is to apply — it's free and won't affect your credit." },
    { keys:["require","need","eligible","minimum"], reply:"Generally: 6+ months in business, $10,000+ monthly revenue, and a 580+ credit score. No personal collateral required for most products." },
    { keys:["credit","score","impact","hurt"], reply:"We only do a soft credit pull — zero impact to your score. A hard inquiry only happens if you choose to accept a final offer." },
    { keys:["time","fast","long","when","fund"], reply:"Most decisions come back in 2–4 business hours. Once approved, funds typically arrive within 24 hours." },
    { keys:["early","prepay","penalty","discount","pay off"], reply:"No prepayment penalties — ever. We offer discounts of 18% (3 months), 12% (6 months), and 6% (9 months) early payoff." },
    { keys:["cost","rate","fee","interest","expensive"], reply:"Rates vary based on your profile and industry. All terms are shown clearly in your dashboard before you sign. No hidden fees." },
    { keys:["product","loan","line","advance","equipment"], reply:"We offer Term Loans ($10K–$500K), Lines of Credit ($10K–$5M), Revenue Advances ($5K–$500K), and Equipment Financing ($5K–$2M)." },
    { keys:["phone","call","talk","contact"], reply:"No unsolicited sales calls — ever. But if you'd like to speak with a funding advisor, just ask and we'll have someone reach out to you. Everything is also available in your dashboard." },
    { keys:["apply","start","begin","get started"], reply:"Great! You can complete your application in minutes — free, no credit impact.", action:"apply" },
    { keys:["thank","ok","great","got it","understand"], reply:"Happy to help! If you have more questions or are ready to apply, I'm here." },
  ];

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    const newMsgs = [...msgs, { role:"user", content:userMsg }];

    const lower = userMsg.toLowerCase();
    const match = rules.find(r => r.keys.some(k => lower.includes(k)));
    const reply = match
      ? match.reply
      : (lang==="es"
          ? "Esa es una buena pregunta. Para obtener información específica sobre tu situación, lo mejor es completar una solicitud gratuita — sin impacto al crédito."
          : "That's a great question. For information specific to your situation, the best step is to complete a free application — no credit impact.");

    setMsgs([...newMsgs, { role:"assistant", content:reply }]);

    if (match?.action === "apply") {
      setTimeout(() => onApply(), 1200);
    }
  };

  const quickReplies = lang==="es"
    ? ["¿Cuánto califico?","¿Cuáles son los requisitos?","¿Afecta mi crédito?","Quiero aplicar"]
    : ["How much do I qualify for?","What are the requirements?","Will it hurt my credit?","I want to apply"];

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position:"fixed", bottom:24, right:24, width:56, height:56, background:G, border:"none", borderRadius:"50%", cursor:"pointer", boxShadow:"0 4px 20px rgba(168,255,62,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, transition:"all 0.2s" }}
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>

      {/* Chat window */}
      {open && (
        <div style={{ position:"fixed", bottom:92, right:24, width:340, height:460, background:"#fff", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column", overflow:"hidden", zIndex:1000 }}>
          {/* Header */}
          <div style={{ background:"#0a0a0a", padding:"14px 18px", display:"flex", alignItems:"center", gap:10 }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#a8ff3e"/>
              <path d="M8 20L14 8L20 20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="10.5" y1="16" x2="17.5" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#fff", margin:0 }}>Aprovuit Assistant</p>
              <p style={{ fontSize:10, color:G, margin:0 }}>● {lang==="es"?"En línea · Sin llamadas":"Online · No phone calls"}</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px", display:"flex", flexDirection:"column", gap:10, background:"#f9fafb" }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"82%", padding:"9px 13px", borderRadius:m.role==="user"?"12px 4px 12px 12px":"4px 12px 12px 12px", background:m.role==="user"?"#1a1a1a":"#fff", color:m.role==="user"?"#fff":"#1a1a1a", fontSize:13, lineHeight:1.55, boxShadow:"0 1px 4px rgba(0,0,0,0.08)", fontFamily:"'Sora',sans-serif" }}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          {msgs.length <= 2 && (
            <div style={{ padding:"8px 10px", display:"flex", gap:5, flexWrap:"wrap", background:"#f9fafb", borderTop:"1px solid #eee" }}>
              {quickReplies.map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(()=>{ setInput(""); const lower=q.toLowerCase(); const match=rules.find(r=>r.keys.some(k=>lower.includes(k))); const reply=match?match.reply:(lang==="es"?"Para obtener información específica, completa una solicitud gratuita.":"For specific info, complete a free application."); setMsgs(p=>[...p,{role:"user",content:q},{role:"assistant",content:reply}]); if(match?.action==="apply") setTimeout(()=>onApply(),1200); },100); }} style={{ background:"#fff", border:"1px solid #e5e8ee", borderRadius:20, padding:"5px 11px", fontSize:11, cursor:"pointer", fontFamily:"'Sora',sans-serif", color:"#555", whiteSpace:"nowrap" }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:"1px solid #eee", display:"flex", gap:8, background:"#fff" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && send()}
              placeholder={lang==="es"?"Escribe tu pregunta...":"Ask me anything..."}
              style={{ flex:1, border:"1.5px solid #e5e8ee", borderRadius:10, padding:"9px 13px", fontSize:13, fontFamily:"'Sora',sans-serif", outline:"none", color:"#1a1a1a" }}
            />
            <button onClick={send} style={{ width:38, height:38, background:G, border:"none", borderRadius:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}




// ── ANIMATED DEMO COMPONENT ──────────────────────────────────────
function AnimatedDemo({ lang }) {
  const [activeStep, setActiveStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const steps = lang === "es"
    ? ["Aplica","Revisión","Oferta","Fondeado"]
    : ["Apply","Review","Offer","Funded"];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveStep(s => (s + 1) % 4);
        setAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const G = "#a8ff3e";

  const screens = [
    // Step 0: Apply form
    <div key="apply" style={{ opacity: animating ? 0 : 1, transition: "opacity .3s" }}>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginBottom: 8, letterSpacing: ".06em", textTransform: "uppercase" }}>{lang==="es"?"Puntaje de crédito":"Credit score"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {(lang==="es"?["Excelente","Bueno","Regular","Bajo"]:["Excellent","Good","Fair","Poor"]).map((l,i) => (
            <div key={l} style={{ background: i===1 ? "#fff" : "rgba(255,255,255,.06)", border: `1px solid ${i===1?"#fff":"rgba(255,255,255,.1)"}`, borderRadius: 6, padding: "8px 4px", textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: i===1 ? "#000" : "rgba(255,255,255,.4)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: ".06em", textTransform: "uppercase" }}>{lang==="es"?"Ingresos mensuales":"Monthly revenue"}</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: G }}>$85,000</p>
        </div>
        <div style={{ height: 2, background: "rgba(255,255,255,.1)", borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: "55%", height: "100%", background: G, borderRadius: 2 }}></div>
          <div style={{ position: "absolute", left: "55%", top: "50%", transform: "translate(-50%,-50%)", width: 14, height: 14, background: G, borderRadius: "50%", boxShadow: `0 0 0 3px rgba(168,255,62,.2)` }}></div>
        </div>
      </div>
      <div style={{ background: "rgba(168,255,62,.06)", border: `1px solid ${G}20`, borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{lang==="es"?"Podrías calificar para":"You may qualify for"}</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: G, letterSpacing: "-.03em" }}>$127,500</p>
      </div>
    </div>,

    // Step 1: Under review
    <div key="review" style={{ opacity: animating ? 0 : 1, transition: "opacity .3s" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 20 }}>
          <div style={{ width: 20, height: 20, border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{lang==="es"?"En Revisión":"Under Review"}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{lang==="es"?"Nuestro equipo está trabajando en tu trato":"Our team is working your deal"}</p>
      </div>
      {[
        [lang==="es"?"Solicitud recibida":"Application received", true],
        [lang==="es"?"Revisión del equipo":"Team review", true],
        [lang==="es"?"Buscando fondeador":"Sourcing funder", false],
        [lang==="es"?"Oferta preparada":"Offer prepared", false],
      ].map(([label, done]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? G : "rgba(255,255,255,.08)", border: done ? "none" : "1px solid rgba(255,255,255,.15)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {done && <div style={{ width: 6, height: 6, background: "#000", borderRadius: "50%" }}></div>}
          </div>
          <p style={{ fontSize: 12, color: done ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.25)", fontWeight: done ? 500 : 400 }}>{label}</p>
        </div>
      ))}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>,

    // Step 2: Offer received
    <div key="offer" style={{ opacity: animating ? 0 : 1, transition: "opacity .3s" }}>
      <div style={{ background: "#0f1a0f", border: `1px solid ${G}25`, borderRadius: 10, padding: "16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>{lang==="es"?"Tu Oferta":"Your Offer"}</p>
          <span style={{ fontSize: 10, fontWeight: 600, color: G, background: "rgba(168,255,62,.1)", padding: "2px 8px", borderRadius: 10 }}>{lang==="es"?"Revisar":"Review"}</span>
        </div>
        <p style={{ fontSize: 34, fontWeight: 700, color: G, letterSpacing: "-.03em", marginBottom: 12 }}>$50,000</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
          {[[lang==="es"?"Pago/mes":"Monthly","$625"],[lang==="es"?"Plazo":"Term","12 mo"],[lang==="es"?"Penalidad":"Penalty","None"]].map(([l,v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,.04)", borderRadius: 6, padding: "7px 8px" }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginBottom: 3 }}>{l}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{v}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: `${G}90`, marginBottom: 10 }}>{lang==="es"?"Sin penalidad por pago anticipado":"No prepayment penalty — early payoff discounts available"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <div style={{ background: G, borderRadius: 6, padding: "9px", textAlign: "center", cursor: "pointer" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{lang==="es"?"Aceptar":"Accept"}</p>
          </div>
          <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "9px", textAlign: "center", cursor: "pointer" }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.4)" }}>{lang==="es"?"Declinar":"Decline"}</p>
          </div>
        </div>
      </div>
    </div>,

    // Step 3: Funded
    <div key="funded" style={{ opacity: animating ? 0 : 1, transition: "opacity .3s", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, background: "rgba(168,255,62,.1)", border: `1px solid ${G}30`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <div style={{ width: 20, height: 20, background: G, borderRadius: "50%" }}></div>
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-.02em" }}>{lang==="es"?"¡Fondeado!":"Funded!"}</p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>{lang==="es"?"Fondos depositados en tu cuenta":"Funds deposited to your account"}</p>
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: "16px", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>APP-2041 · Term Loan</p>
          <span style={{ fontSize: 10, fontWeight: 600, color: G }}>Active</span>
        </div>
        <p style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-.03em", marginBottom: 8 }}>$50,000</p>
        <div style={{ height: 2, background: "rgba(255,255,255,.08)", borderRadius: 2, marginBottom: 6 }}>
          <div style={{ width: "8%", height: "100%", background: G, borderRadius: 2 }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>8% {lang==="es"?"pagado":"paid"}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{lang==="es"?"Próximo pago: $625":"Next: $625"}</p>
        </div>
      </div>
    </div>,
  ];

  return (
    <section style={{ background: "#111", padding: "80px 5%", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="hero-grid">

        {/* Left — copy */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: G, marginBottom: 14, fontWeight: 600 }}>
            {lang==="es"?"Así Funciona":"See How It Works"}
          </p>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1.1, marginBottom: 20, color: "#fff" }}>
            {lang==="es" ? <>De la solicitud<br />a los fondos.<br /><span style={{color:G}}>En 24 horas.</span></> : <>From application<br />to funded.<br /><span style={{color:G}}>In 24 hours.</span></>}
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.45)", lineHeight: 1.75, marginBottom: 32, fontWeight: 300 }}>
            {lang==="es"
              ? "Aplica en minutos. Nuestro equipo trabaja tu trato. Ves cada paso en tiempo real en tu portal. Sin llamadas. Sin perseguir a nadie."
              : "Apply in minutes. Our team works your deal. You watch every step in real time in your dashboard. No calls. No chasing anyone."}
          </p>
          {/* Step indicators */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {steps.map((s, i) => (
              <button key={s} onClick={() => setActiveStep(i)} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1px solid ${activeStep===i?G:"rgba(255,255,255,.1)"}`, background: activeStep===i?"rgba(168,255,62,.08)":"transparent", cursor: "pointer", transition: "all .2s" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: activeStep===i?G:"rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>0{i+1}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: activeStep===i?"#fff":"rgba(255,255,255,.3)" }}>{s}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right — animated phone mockup */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 280, background: "#0a0a0a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.6)", position: "relative" }}>
            {/* Phone header */}
            <div style={{ background: "#0f0f0f", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 20, height: 20, background: G, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#000" }}>A</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "-.01em" }}>APROVUIT</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: G }}></div>
                <p style={{ fontSize: 9, color: G, fontWeight: 600 }}>{lang==="es"?"En vivo":"Live"}</p>
              </div>
            </div>
            {/* Step label */}
            <div style={{ background: "rgba(168,255,62,.06)", padding: "8px 18px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: G, letterSpacing: ".06em", textTransform: "uppercase" }}>
                {lang==="es"?"Paso":"Step"} {activeStep + 1} — {steps[activeStep]}
              </p>
            </div>
            {/* Screen content */}
            <div style={{ padding: "20px 18px", minHeight: 280 }}>
              {screens[activeStep]}
            </div>
            {/* Progress dots */}
            <div style={{ padding: "12px 18px", display: "flex", justifyContent: "center", gap: 6, borderTop: "1px solid rgba(255,255,255,.04)" }}>
              {[0,1,2,3].map(i => (
                <div key={i} onClick={() => setActiveStep(i)} style={{ width: i===activeStep?20:6, height: 6, background: i===activeStep?G:"rgba(255,255,255,.15)", borderRadius: 3, transition: "all .3s", cursor: "pointer" }}></div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


// ── DASHBOARD SLIDER ─────────────────────────────────────────────
function DashboardSlider({ lang }) {
  const [slide, setSlide] = useState(0);
  const G = "#a8ff3e";

  const slideData = lang === "es" ? [
    { tab:"Resumen", label:"Tu Portal. En Tiempo Real.", desc:"Ve exactamente dónde está tu trato en todo momento. Sin llamadas. Sin esperar respuestas." },
    { tab:"Mi Financiamiento", label:"Rastrea Tu Saldo.", desc:"Monitorea tu saldo pendiente, próximos pagos e historial completo de pagos." },
    { tab:"Mis Documentos", label:"Todo Organizado.", desc:"Sube y accede a todos tus documentos de forma segura. Sin correos. Sin fax." },
    { tab:"Mensajes", label:"Tu Asesor. Siempre Disponible.", desc:"Comunícate directamente con tu asesor dentro de la plataforma. Todo queda por escrito." },
  ] : [
    { tab:"Overview", label:"Your Portal. In Real Time.", desc:"See exactly where your deal stands at every moment. No calls. No waiting for answers." },
    { tab:"My Funding", label:"Track Your Balance.", desc:"Monitor your outstanding balance, upcoming payments, and full payment history." },
    { tab:"Documents", label:"Everything Organized.", desc:"Upload and access all your documents securely. No email. No fax." },
    { tab:"Messages", label:"Your Advisor. Always On.", desc:"Communicate directly with your advisor inside the platform. Everything in writing." },
  ];

  const screens = [
    // ── OVERVIEW ──
    <div key="overview">
      <div style={{background:"rgba(168,255,62,.06)",border:`1px solid ${G}20`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <p style={{fontSize:9,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>
              {lang==="es"?"Bienvenido de vuelta":"Welcome back"}
            </p>
            <p style={{fontSize:16,fontWeight:700,color:"#fff",letterSpacing:"-.02em"}}>Marcus T.</p>
          </div>
          <span style={{fontSize:9,fontWeight:700,color:G,background:"rgba(168,255,62,.1)",padding:"3px 10px",borderRadius:20,border:`1px solid ${G}30`}}>
            {lang==="es"?"ACTIVO":"ACTIVE"}
          </span>
        </div>
        <div style={{height:3,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:6}}>
          <div style={{width:"9%",height:"100%",background:G,borderRadius:2}}></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <p style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>9% {lang==="es"?"completado":"complete"}</p>
          <p style={{fontSize:10,color:G,fontWeight:600}}>$4,375 {lang==="es"?"pagado":"paid"}</p>
        </div>
      </div>
      {/* Deal timeline */}
      <div style={{background:"#161616",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"14px 16px",marginBottom:10}}>
        <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
          {lang==="es"?"Estado del Trato":"Deal Status"}
        </p>
        {[
          [lang==="es"?"Solicitud enviada":"Application submitted","Apr 1","done"],
          [lang==="es"?"En revisión":"Under review","Apr 1","done"],
          [lang==="es"?"Oferta enviada":"Offer sent","Apr 1","done"],
          [lang==="es"?"Fondeado":"Funded","Apr 2","done"],
          [lang==="es"?"Activo — en pagos":"Active — in repayment","Ongoing","active"],
        ].map(([label,date,status])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:status==="done"?G:status==="active"?"rgba(168,255,62,.2)":"rgba(255,255,255,.06)",border:status==="active"?`2px solid ${G}`:"none",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {status==="done"&&<div style={{width:6,height:6,background:"#000",borderRadius:"50%"}}></div>}
              {status==="active"&&<div style={{width:5,height:5,background:G,borderRadius:"50%"}}></div>}
            </div>
            <p style={{flex:1,fontSize:11,color:status==="done"?"rgba(255,255,255,.75)":status==="active"?"#fff":"rgba(255,255,255,.25)",fontWeight:status==="active"?600:400}}>{label}</p>
            <p style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>{date}</p>
          </div>
        ))}
      </div>
      {/* Next payment */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div style={{background:"#161616",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"12px"}}>
          <p style={{fontSize:9,color:"rgba(255,255,255,.35)",marginBottom:4}}>{lang==="es"?"Próximo pago":"Next Payment"}</p>
          <p style={{fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-.02em"}}>$625</p>
          <p style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>May 15</p>
        </div>
        <div style={{background:"#161616",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"12px"}}>
          <p style={{fontSize:9,color:"rgba(255,255,255,.35)",marginBottom:4}}>{lang==="es"?"Saldo restante":"Balance"}</p>
          <p style={{fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-.02em"}}>$45,625</p>
          <p style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>{lang==="es"?"de $50,000":"of $50,000"}</p>
        </div>
      </div>
    </div>,

    // ── MY FUNDING ──
    <div key="funding">
      <div style={{background:"#0f1a0f",border:`1px solid ${G}20`,borderRadius:10,padding:"16px",marginBottom:10}}>
        <p style={{fontSize:9,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>APP-2041 · {lang==="es"?"Préstamo a Plazo":"Term Loan"}</p>
        <p style={{fontSize:32,fontWeight:700,color:G,letterSpacing:"-.03em",marginBottom:4}}>$45,625</p>
        <p style={{fontSize:10,color:"rgba(255,255,255,.35)",marginBottom:12}}>{lang==="es"?"saldo pendiente":"outstanding balance"}</p>
        <div style={{height:3,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:8}}>
          <div style={{width:"9%",height:"100%",background:G,borderRadius:2}}></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {[[lang==="es"?"Original":"Original","$50,000"],[lang==="es"?"Pagado":"Paid","$4,375"],[lang==="es"?"Plazo":"Term","12 mo"]].map(([l,v])=>(
            <div key={l} style={{background:"rgba(255,255,255,.04)",borderRadius:6,padding:"8px"}}>
              <p style={{fontSize:8,color:"rgba(255,255,255,.3)",marginBottom:3}}>{l}</p>
              <p style={{fontSize:12,fontWeight:700,color:"#fff"}}>{v}</p>
            </div>
          ))}
        </div>
      </div>
      <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{lang==="es"?"Historial de Pagos":"Payment History"}</p>
      {[
        ["May 7","$625","$45,625"],
        ["Apr 30","$625","$46,250"],
        ["Apr 23","$625","$46,875"],
        ["Apr 16","$625","$47,500"],
        ["Apr 9","$625","$48,125"],
      ].map(([date,amt,bal])=>(
        <div key={date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:G,flexShrink:0}}></div>
            <p style={{fontSize:11,color:"rgba(255,255,255,.75)",fontWeight:500}}>{amt}</p>
          </div>
          <p style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{date}</p>
          <p style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{bal}</p>
        </div>
      ))}
    </div>,

    // ── DOCUMENTS ──
    <div key="docs">
      <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>{lang==="es"?"Mis Documentos":"My Documents"}</p>
      {[
        [lang==="es"?"Contrato de Financiamiento":"Funding Agreement","Signed · Apr 1, 2026","PDF",true],
        [lang==="es"?"Estados de Cuenta (Mar)":"Bank Statements (Mar)","Apr 1, 2026","PDF",true],
        [lang==="es"?"Estados de Cuenta (Feb)":"Bank Statements (Feb)","Apr 1, 2026","PDF",true],
        [lang==="es"?"Licencia de Conducir":"Driver's License","Verified","IMG",true],
        [lang==="es"?"Cheque Anulado":"Voided Check","Verified","IMG",true],
      ].map(([name,status,type,verified])=>(
        <div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{width:34,height:34,background:"rgba(168,255,62,.06)",border:`1px solid ${G}15`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <p style={{fontSize:8,fontWeight:800,color:G}}>{type}</p>
          </div>
          <div style={{flex:1}}>
            <p style={{fontSize:12,fontWeight:500,color:"#fff",marginBottom:2,letterSpacing:"-.01em"}}>{name}</p>
            <p style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{status}</p>
          </div>
          {verified&&<div style={{width:7,height:7,borderRadius:"50%",background:G}}></div>}
        </div>
      ))}
      <button style={{width:"100%",marginTop:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,padding:"10px",cursor:"pointer"}}>
        <p style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.5)"}}>+ {lang==="es"?"Subir Documento":"Upload Document"}</p>
      </button>
    </div>,

    // ── MESSAGES ──
    <div key="msgs" style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"#161616",borderRadius:10,marginBottom:4,border:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{width:30,height:30,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <p style={{fontSize:11,fontWeight:800,color:"#000"}}>A</p>
        </div>
        <div>
          <p style={{fontSize:11,fontWeight:700,color:"#fff"}}>Aprovuit Advisor</p>
          <p style={{fontSize:9,color:G}}>● {lang==="es"?"En línea":"Online"}</p>
        </div>
      </div>
      <div style={{alignSelf:"flex-start",maxWidth:"85%"}}>
        <div style={{background:"#1c1c1c",borderRadius:"4px 12px 12px 12px",padding:"10px 13px"}}>
          <p style={{fontSize:11,color:"rgba(255,255,255,.75)",lineHeight:1.55}}>{lang==="es"?"¡Hola Marcus! Tu financiamiento de $50,000 ha sido depositado. Tu primer pago de $625 vence el 15 de mayo.":"Hi Marcus! Your $50,000 has been deposited. First payment of $625 is due May 15. Questions? I'm here."}</p>
        </div>
        <p style={{fontSize:8,color:"rgba(255,255,255,.2)",marginTop:3}}>Apr 1 · 9:14 AM</p>
      </div>
      <div style={{alignSelf:"flex-end",maxWidth:"85%"}}>
        <div style={{background:G,borderRadius:"12px 4px 12px 12px",padding:"10px 13px"}}>
          <p style={{fontSize:11,color:"#000",fontWeight:500,lineHeight:1.55}}>{lang==="es"?"Perfecto, gracias. ¿Qué descuento tengo si pago en 6 meses?":"Perfect, thanks. What discount do I get if I pay off in 6 months?"}</p>
        </div>
        <p style={{fontSize:8,color:"rgba(255,255,255,.2)",marginTop:3,textAlign:"right"}}>Apr 1 · 9:22 AM</p>
      </div>
      <div style={{alignSelf:"flex-start",maxWidth:"85%"}}>
        <div style={{background:"#1c1c1c",borderRadius:"4px 12px 12px 12px",padding:"10px 13px"}}>
          <p style={{fontSize:11,color:"rgba(255,255,255,.75)",lineHeight:1.55}}>{lang==="es"?"Con 6 meses obtienes un 12% de descuento — ahorras $900. Puedes calcular tu ahorro en la sección de Mi Financiamiento en cualquier momento.":"At 6 months you get a 12% prepayment discount — saving $900. Check the early payoff section in My Funding anytime."}</p>
        </div>
        <p style={{fontSize:8,color:"rgba(255,255,255,.2)",marginTop:3}}>Apr 1 · 9:25 AM</p>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",background:"#161616",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"8px 12px",marginTop:4}}>
        <input readOnly placeholder={lang==="es"?"Escribe un mensaje...":"Type a message..."} style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:"'Sora',sans-serif"}} />
        <div style={{width:26,height:26,background:G,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
          <p style={{fontSize:12,color:"#000",fontWeight:700}}>↑</p>
        </div>
      </div>
    </div>,
  ];

  return (
    <section style={{background:"#0d0d0d", padding:"88px 5%", borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{maxWidth:1100, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:64}}>
          <p style={{fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:600}}>
            {lang==="es"?"Portal del Cliente":"Client Dashboard"}
          </p>
          <h2 style={{fontSize:"clamp(28px,4vw,52px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", lineHeight:1.1, marginBottom:16}}>
            {lang==="es"
              ? <>Tu dinero. Tu trato.<br /><span style={{color:G}}>Total visibilidad.</span></>
              : <>Your money. Your deal.<br /><span style={{color:G}}>Total visibility.</span></>}
          </h2>
          <p style={{fontSize:15, color:"rgba(255,255,255,.4)", maxWidth:500, margin:"0 auto", lineHeight:1.8, fontWeight:300}}>
            {lang==="es"
              ? "Una vez fondeado, gestiona todo desde un solo portal. Sin llamadas. Sin correos. Sin esperar."
              : "Once funded, manage everything from one place. No calls. No emails. No waiting."}
          </p>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"start"}} className="hero-grid">

          {/* Left — slide nav */}
          <div style={{display:"flex", flexDirection:"column", gap:3}}>
            {slideData.map((s,i)=>(
              <button key={s.tab} onClick={()=>setSlide(i)} style={{display:"flex", alignItems:"flex-start", gap:16, padding:"16px 18px", borderRadius:10, border:`1px solid ${slide===i?G+"35":"rgba(255,255,255,.05)"}`, background:slide===i?"rgba(168,255,62,.04)":"transparent", cursor:"pointer", textAlign:"left", transition:"all .2s"}}>
                <div style={{width:30, height:30, borderRadius:7, background:slide===i?"rgba(168,255,62,.12)":"rgba(255,255,255,.04)", border:`1px solid ${slide===i?G+"30":"rgba(255,255,255,.07)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1}}>
                  <p style={{fontSize:10, fontWeight:700, color:slide===i?G:"rgba(255,255,255,.25)"}}>0{i+1}</p>
                </div>
                <div>
                  <p style={{fontSize:14, fontWeight:600, color:slide===i?"#fff":"rgba(255,255,255,.35)", marginBottom:4, letterSpacing:"-.02em", transition:"color .2s"}}>{s.label}</p>
                  <p style={{fontSize:12, color:"rgba(255,255,255,.25)", lineHeight:1.6, fontWeight:300}}>{s.desc}</p>
                </div>
              </button>
            ))}


          </div>

          {/* Right — dashboard mockup */}
          <div style={{position:"sticky", top:80}}>
            <div style={{background:"#0a0a0a", border:"1px solid rgba(255,255,255,.09)", borderRadius:20, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,.7)"}}>
              {/* App top bar */}
              <div style={{background:"#0f0f0f", padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <div style={{display:"flex", alignItems:"center", gap:7}}>
                  <div style={{width:22, height:22, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#000"}}>A</div>
                  <span style={{fontSize:12, fontWeight:700, color:"#fff", letterSpacing:"-.01em"}}>APROVUIT</span>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:4}}>
                  <div style={{width:6, height:6, background:G, borderRadius:"50%"}}></div>
                  <p style={{fontSize:9, color:G, fontWeight:600}}>{lang==="es"?"En vivo":"Live"}</p>
                </div>
              </div>
              {/* Tab bar */}
              <div style={{display:"flex", borderBottom:"1px solid rgba(255,255,255,.05)", background:"#0f0f0f", overflowX:"auto"}}>
                {slideData.map((s,i)=>(
                  <button key={s.tab} onClick={()=>setSlide(i)} style={{padding:"10px 14px", fontSize:10, fontWeight:600, color:slide===i?G:"rgba(255,255,255,.25)", background:"none", border:"none", cursor:"pointer", borderBottom:`2px solid ${slide===i?G:"transparent"}`, whiteSpace:"nowrap", fontFamily:"'Sora',sans-serif", transition:"all .15s", flexShrink:0}}>
                    {s.tab}
                  </button>
                ))}
              </div>
              {/* Screen content */}
              <div style={{padding:"18px 18px 22px", minHeight:360}}>
                {screens[slide]}
              </div>
            </div>
            {/* Slide dots */}
            <div style={{display:"flex", justifyContent:"center", gap:6, marginTop:14}}>
              {slideData.map((_,i)=>(
                <div key={i} onClick={()=>setSlide(i)} style={{width:i===slide?18:6, height:6, background:i===slide?G:"rgba(255,255,255,.12)", borderRadius:3, transition:"all .25s", cursor:"pointer"}}></div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}



// ── WHY APROVUIT SECTION ─────────────────────────────────────────
function WhyAprovuit({ lang, onApply }) {
  const G = "#a8ff3e";
  const cards = lang === "es" ? [
    {
      n:"01", title:"Fondeado en 24 Horas",
      desc:"Envía tu solicitud hoy y recibe fondos mañana. Nos movemos rápido porque tu negocio no se detiene. Decisiones en horas, no semanas — sin idas y venidas interminables.",
      highlight:"La mayoría de clientes recibe fondos dentro de un día hábil de la aprobación.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <p style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>APP-2041 · Préstamo a Plazo</p>
            <span style={{fontSize:9,fontWeight:700,color:G,background:"rgba(168,255,62,.1)",padding:"2px 8px",borderRadius:10}}>Aprobado</span>
          </div>
          <p style={{fontSize:26,fontWeight:700,color:"#fff",letterSpacing:"-.03em",marginBottom:8}}>$50,000</p>
          <div style={{height:2,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:6}}>
            <div style={{width:"100%",height:"100%",background:G,borderRadius:2}}></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <p style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Fondeado: 2 de Abril</p>
            <p style={{fontSize:10,color:G,fontWeight:600}}>Mismo día</p>
          </div>
        </div>
      )
    },
    {
      n:"02", title:"Paga Antes. Quédate Con Más.",
      desc:"A diferencia de la mayoría de fondeadores, te recompensamos por pagar anticipado. Sin penalidades — nunca. Cuanto más rápido pagas, más ahorras. Es tu dinero y queremos que te quedes con la mayor cantidad posible.",
      highlight:"Hasta 18% de descuento por pago anticipado. Un adelanto de $50K puede ahorrarte $1,350+.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          <p style={{fontSize:9,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Descuentos Disponibles</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
            {[["3 meses","18%"],["6 meses","12%"],["9 meses","6%"],["12 meses","0%"]].map(([t,d])=>(
              <div key={t} style={{background:"rgba(255,255,255,.04)",borderRadius:6,padding:"8px 4px",textAlign:"center"}}>
                <p style={{fontSize:9,color:"rgba(255,255,255,.3)",marginBottom:3}}>{t}</p>
                <p style={{fontSize:14,fontWeight:700,color:d==="0%"?"rgba(255,255,255,.25)":G}}>{d}</p>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(168,255,62,.06)",border:"1px solid rgba(168,255,62,.15)",borderRadius:8,padding:"10px 12px"}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Paga en 3 meses → <span style={{color:G,fontWeight:700}}>ahorras $1,350</span></p>
          </div>
        </div>
      )
    },
    {
      n:"03", title:"Apoyo Personalizado",
      desc:"Tu asesor dedicado conoce tu industria y trabaja para conseguirte los mejores términos. No eres un número — somos socios en el crecimiento de tu negocio.",
      highlight:"Comunicación directa. Todo por escrito. Sin llamadas.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          {[["¡Hola! Una pregunta rápida — ¿cuál es la razón principal por la que necesitas fondos ahora?","","Tu Asesor · 9:14 AM"],["Abrir una segunda ubicación.","Tu · 9:18 AM",""],["Entendido. Basado en tu perfil tengo algunas opciones fuertes. Tendré ofertas en tu portal en menos de una hora.","","Tu Asesor · 9:22 AM"]].map(([msg,reply,time],i)=>(
            <div key={i} style={{marginBottom:8}}>
              {reply&&<div style={{background:"rgba(168,255,62,.08)",border:"1px solid rgba(168,255,62,.15)",borderRadius:"4px 10px 10px 10px",padding:"8px 12px",marginBottom:4}}>
                <p style={{fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.5}}>{reply||msg}</p>
              </div>}
              {!reply&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:"10px 10px 10px 4px",padding:"8px 12px",marginBottom:4}}>
                <p style={{fontSize:11,color:"rgba(255,255,255,.5)",lineHeight:1.5}}>{msg}</p>
              </div>}
              <p style={{fontSize:8,color:"rgba(255,255,255,.2)"}}>{time}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      n:"04", title:"Miramos el Panorama Completo",
      desc:"No solo corremos tu puntaje de crédito y seguimos. Miramos tus ingresos, tu industria, tu flujo de caja y para qué realmente necesitas el dinero. Mejor contexto significa mejores ofertas.",
      highlight:"580+ puntaje OK. Solo consulta suave. Sin impacto a tu puntaje.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Tu Perfil de Negocio</p>
          {[["Industria","Restaurante / Alimentos"],["Tiempo en Operación","2–5 años"],["Ingresos Mensuales","$85,000"],["Puntaje de Crédito","680 (Bueno)"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <p style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{l}</p>
              <p style={{fontSize:11,fontWeight:600,color:"#fff"}}>{v}</p>
            </div>
          ))}
          <div style={{marginTop:10,display:"flex",gap:6}}>
            {["Coincide","Optimizado","Recomendado"].map(s=>(
              <div key={s} style={{flex:1,background:"rgba(168,255,62,.06)",border:"1px solid rgba(168,255,62,.15)",borderRadius:6,padding:"5px 4px",textAlign:"center"}}>
                <p style={{fontSize:9,color:G,fontWeight:600}}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
  ] : [
    {
      n:"01", title:"Funded in 24 Hours",
      desc:"Submit your application today and get funded tomorrow. We move fast because your business doesn't stop. Decisions in hours, not weeks — no endless back-and-forth.",
      highlight:"Most clients receive funds within one business day of approval.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <p style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>APP-2041 · Term Loan</p>
            <span style={{fontSize:9,fontWeight:700,color:G,background:"rgba(168,255,62,.1)",padding:"2px 8px",borderRadius:10}}>Approved</span>
          </div>
          <p style={{fontSize:26,fontWeight:700,color:"#fff",letterSpacing:"-.03em",marginBottom:8}}>$50,000</p>
          <div style={{height:2,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:6}}>
            <div style={{width:"100%",height:"100%",background:G,borderRadius:2}}></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <p style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Funded: April 2</p>
            <p style={{fontSize:10,color:G,fontWeight:600}}>Same day</p>
          </div>
        </div>
      )
    },
    {
      n:"02", title:"Pay Early. Keep More.",
      desc:"Unlike most funders, we reward you for paying early. No penalties — ever. The faster you pay off, the more you save. It's your money, and we want you to keep as much of it as possible.",
      highlight:"Up to 18% discount for early payoff. A $50K advance can save you $1,350+.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          <p style={{fontSize:9,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Discount Schedule</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
            {[["3 months","18%"],["6 months","12%"],["9 months","6%"],["12 months","0%"]].map(([t,d])=>(
              <div key={t} style={{background:"rgba(255,255,255,.04)",borderRadius:6,padding:"8px 4px",textAlign:"center"}}>
                <p style={{fontSize:9,color:"rgba(255,255,255,.3)",marginBottom:3}}>{t}</p>
                <p style={{fontSize:14,fontWeight:700,color:d==="0%"?"rgba(255,255,255,.25)":G}}>{d}</p>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(168,255,62,.06)",border:"1px solid rgba(168,255,62,.15)",borderRadius:8,padding:"10px 12px"}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Pay off in 3 months → <span style={{color:G,fontWeight:700}}>save $1,350</span></p>
          </div>
        </div>
      )
    },
    {
      n:"03", title:"A Real Person on Your Deal",
      desc:"Every application is reviewed by a real person on our team — not just an algorithm. Your advisor learns your business, finds the right fit, and keeps you updated every step of the way.",
      highlight:"Direct messaging with your advisor. Everything in writing. No hold music.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          {[["Hi! Quick question — what's the main reason you need funding right now?",false],["Opening a second location.",true],["Got it. Based on your profile I have a few strong options for you. I'll have offers in your dashboard within the hour.",false]].map(([msg,isUser],i)=>(
            <div key={i} style={{marginBottom:8,display:"flex",justifyContent:isUser?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"85%",background:isUser?G:"rgba(255,255,255,.06)",borderRadius:isUser?"10px 4px 10px 10px":"4px 10px 10px 10px",padding:"8px 12px"}}>
                <p style={{fontSize:11,color:isUser?"#000":"rgba(255,255,255,.65)",lineHeight:1.5,fontWeight:isUser?500:400}}>{msg}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      n:"04", title:"We Look at the Full Picture",
      desc:"We don't just run your credit score and move on. We look at your revenue, your industry, your cash flow, and what you actually need the money for. Better context means better offers.",
      highlight:"580+ credit score OK. Soft pull only. No impact to your score.",
      ui:(
        <div style={{background:"#1a1a1a",borderRadius:10,padding:"14px 16px",marginTop:14}}>
          <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Your Business Profile</p>
          {[["Industry","Restaurant & Food"],["Time in Business","2–5 years"],["Monthly Revenue","$85,000"],["Credit Score","680 (Good)"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <p style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{l}</p>
              <p style={{fontSize:11,fontWeight:600,color:"#fff"}}>{v}</p>
            </div>
          ))}
          <div style={{marginTop:10,display:"flex",gap:6}}>
            {["Matched","Optimized","Recommended"].map(s=>(
              <div key={s} style={{flex:1,background:"rgba(168,255,62,.06)",border:"1px solid rgba(168,255,62,.15)",borderRadius:6,padding:"5px 4px",textAlign:"center"}}>
                <p style={{fontSize:9,color:G,fontWeight:600}}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
  ];

  return (
    <section style={{background:"#0d0d0d", padding:"88px 5%", borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{maxWidth:1100, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:64}}>
          <p style={{fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:600}}>
            {lang==="es"?"Por qué Aprovuit":"Why Aprovuit"}
          </p>
          <h2 style={{fontSize:"clamp(28px,4vw,52px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", lineHeight:1.1, marginBottom:16}}>
            {lang==="es"
              ? <>¿Por qué elegir<br /><span style={{color:G}}>Aprovuit?</span></>
              : <>Why Choose<br /><span style={{color:G}}>Aprovuit?</span></>}
          </h2>
          <p style={{fontSize:15, color:"rgba(255,255,255,.4)", maxWidth:500, margin:"0 auto", lineHeight:1.8, fontWeight:300}}>
            {lang==="es"
              ? "Cuatro razones por las que los dueños de negocios eligen Aprovuit sobre cualquier otra opción."
              : "Four reasons business owners choose Aprovuit over every other option."}
          </p>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16}} className="products-grid">
          {cards.map((c)=>(
            <div key={c.n} style={{background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"28px 28px 24px"}}>
              <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:14}}>
                <div style={{width:32, height:32, background:"rgba(168,255,62,.1)", border:"1px solid rgba(168,255,62,.2)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <p style={{fontSize:11, fontWeight:800, color:G}}>{c.n}</p>
                </div>
                <h3 style={{fontSize:17, fontWeight:700, color:"#fff", letterSpacing:"-.02em"}}>{c.title}</h3>
              </div>
              <p style={{fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.8, marginBottom:10, fontWeight:300}}>{c.desc}</p>
              <p style={{fontSize:12, color:G, fontWeight:500, letterSpacing:"-.01em"}}>{c.highlight}</p>
              {c.ui}
            </div>
          ))}
        </div>

        <div style={{textAlign:"center", marginTop:48}}>
          <button onClick={onApply} className="btn-green" style={{fontSize:15, padding:"14px 44px"}}>
            {lang==="es"?"Comenzar Ahora →":"Get Started Now →"}
          </button>
          <p style={{fontSize:12, color:"rgba(255,255,255,.25)", marginTop:12}}>
            {lang==="es"?"Sin impacto al crédito · Sin cargos ocultos · Sin llamadas":"No credit impact · No hidden fees · No phone calls"}
          </p>
        </div>
      </div>
    </section>
  );
}


// ── INDUSTRIES SECTION ───────────────────────────────────────────
function IndustriesSection({ lang, onApply }) {
  const G = "#a8ff3e";
  const industries = lang === "es" ? [
    { name:"Restaurantes", icon:"→", desc:"Capital de trabajo para cubrir nómina, inventario y gastos operativos durante temporadas lentas.", tag:"Más solicitado" },
    { name:"Salud y Médico", icon:"→", desc:"Soluciones para consultorios médicos y dentales que esperan pagos de seguros.", tag:"" },
    { name:"Construcción", icon:"→", desc:"Financiamiento por proyecto para cubrir materiales, equipo y mano de obra.", tag:"" },
    { name:"Transporte", icon:"→", desc:"Capital para fletes, camiones, combustible y operaciones de logística.", tag:"" },
    { name:"Retail y Comercio", icon:"→", desc:"Fondos para inventario, expansión de tienda y gastos de temporada.", tag:"" },
    { name:"Manufactura", icon:"→", desc:"Financiamiento de equipo e inventario para mantener la producción en marcha.", tag:"" },
    { name:"Auto y Servicios", icon:"→", desc:"Capital para talleres de reparación, herramientas, inventario y gastos diarios.", tag:"" },
    { name:"Servicios Profesionales", icon:"→", desc:"Soluciones de flujo de caja para despachos legales, contables y consultorías.", tag:"" },
  ] : [
    { name:"Restaurants & Food", icon:"→", desc:"Working capital to cover payroll, inventory, and operating costs through seasonal shifts.", tag:"Most common" },
    { name:"Healthcare & Medical", icon:"→", desc:"Cash flow solutions for medical and dental practices waiting on insurance payments.", tag:"" },
    { name:"Construction", icon:"→", desc:"Project-based financing to cover materials, equipment, and labor costs.", tag:"" },
    { name:"Transportation & Logistics", icon:"→", desc:"Capital for freight, trucks, fuel, and logistics operations of any size.", tag:"" },
    { name:"Retail & Commerce", icon:"→", desc:"Funding for inventory, store expansion, and seasonal demand spikes.", tag:"" },
    { name:"Manufacturing", icon:"→", desc:"Equipment and inventory financing to keep production lines running.", tag:"" },
    { name:"Auto & Services", icon:"→", desc:"Capital for repair shops, tools, parts inventory, and day-to-day expenses.", tag:"" },
    { name:"Professional Services", icon:"→", desc:"Cash flow solutions for law firms, accountants, and consulting businesses.", tag:"" },
  ];

  return (
    <section style={{background:BK, padding:"88px 5%", borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{maxWidth:1100, margin:"0 auto"}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start", marginBottom:56}} className="hero-grid">
          <div>
            <p style={{fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:600}}>
              {lang==="es"?"Industrias":"Industries We Serve"}
            </p>
            <h2 style={{fontSize:"clamp(28px,4vw,48px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", lineHeight:1.1, marginBottom:20}}>
              {lang==="es"
                ? <>Tu industria.<br /><span style={{color:G}}>Nuestra especialidad.</span></>
                : <>Your industry.<br /><span style={{color:G}}>Our specialty.</span></>}
            </h2>
            <p style={{fontSize:15, color:"rgba(255,255,255,.4)", lineHeight:1.8, fontWeight:300, marginBottom:28}}>
              {lang==="es"
                ? "Hemos fondeado negocios en docenas de industrias. Cada sector tiene sus propias necesidades de flujo de caja — y nosotros las entendemos."
                : "We've funded businesses across dozens of industries. Every sector has its own cash flow needs — and we understand yours."}
            </p>
            <button onClick={onApply} className="btn-green" style={{fontSize:14, padding:"12px 32px"}}>
              {lang==="es"?"Ver Si Califico →":"See If I Qualify →"}
            </button>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            {industries.map(ind=>(
              <div key={ind.name} style={{background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"18px 16px", position:"relative", transition:"border-color .2s", cursor:"default"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(168,255,62,.3)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}>
                {ind.tag && <span style={{position:"absolute", top:12, right:12, fontSize:8, fontWeight:700, color:G, background:"rgba(168,255,62,.1)", padding:"2px 7px", borderRadius:10, letterSpacing:".04em"}}>{ind.tag}</span>}
                <p style={{fontSize:13, fontWeight:700, color:"#fff", marginBottom:6, letterSpacing:"-.01em"}}>{ind.name}</p>
                <p style={{fontSize:11, color:"rgba(255,255,255,.35)", lineHeight:1.6, fontWeight:300}}>{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── TRUST BAR ────────────────────────────────────────────────────
function TrustBar({ lang }) {
  const G = "#a8ff3e";
  const items = lang==="es" ? [
    ["4.9★","Calificación Trustpilot","400+ reseñas verificadas"],
    ["$500M+","Fondeado","A negocios en todo EE.UU."],
    ["24 hrs","Tiempo Promedio","De solicitud a fondos"],
    ["10,000+","Negocios Atendidos","Y contando"],
    ["580+","Puntaje Mínimo","Consulta suave únicamente"],
  ] : [
    ["4.9★","Trustpilot Rating","400+ verified reviews"],
    ["$500M+","Funded","To businesses nationwide"],
    ["24 hrs","Avg. Time to Fund","From application to cash"],
    ["10,000+","Businesses Served","And counting"],
    ["580+","Min. Credit Score","Soft pull only"],
  ];
  return (
    <div style={{background:"#111", borderTop:"1px solid rgba(255,255,255,.06)", borderBottom:"1px solid rgba(255,255,255,.06)"}}>
      <div style={{maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(5,1fr)"}} className="stats-grid">
        {items.map(([v,l,sub],i)=>(
          <div key={l} style={{padding:"28px 0", textAlign:"center", borderRight:i<4?"1px solid rgba(255,255,255,.05)":"none"}}>
            <p style={{fontSize:28, fontWeight:700, color:G, letterSpacing:"-.03em", lineHeight:1, marginBottom:4}}>{v}</p>
            <p style={{fontSize:12, fontWeight:600, color:"#fff", marginBottom:2}}>{l}</p>
            <p style={{fontSize:10, color:"rgba(255,255,255,.3)"}}>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ABOUT / MISSION SECTION ───────────────────────────────────────
function AboutSection({ lang, onApply }) {
  const G = "#a8ff3e";
  return (
    <section style={{background:BK2, padding:"88px 5%", borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center"}} className="hero-grid">
        <div>
          <p style={{fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:600}}>
            {lang==="es"?"Nuestra Misión":"Our Mission"}
          </p>
          <h2 style={{fontSize:"clamp(28px,4vw,48px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", lineHeight:1.1, marginBottom:24}}>
            {lang==="es"
              ? <>Pequeños negocios<br />son la columna vertebral<br /><span style={{color:G}}>de la economía.</span></>
              : <>Small businesses are the<br />backbone of the economy.<br /><span style={{color:G}}>We're here for them.</span></>}
          </h2>
          <p style={{fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.85, marginBottom:20, fontWeight:300}}>
            {lang==="es"
              ? "Aprovuit nació de una idea simple: los dueños de negocios merecen acceso rápido y transparente al capital que necesitan para crecer — sin los obstáculos del sistema bancario tradicional."
              : "Aprovuit was built on a simple idea: business owners deserve fast, transparent access to the capital they need to grow — without the barriers of the traditional banking system."}
          </p>
          <p style={{fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.85, marginBottom:32, fontWeight:300}}>
            {lang==="es"
              ? "Somos un equipo de profesionales financieros y tecnólogos que creen que el financiamiento empresarial puede ser más rápido, más honesto y más humano. Por eso construimos Aprovuit."
              : "We're a team of finance professionals and technologists who believe business funding can be faster, more honest, and more human. That's why we built Aprovuit."}
          </p>
          <div style={{display:"flex", gap:32, flexWrap:"wrap"}}>
            {(lang==="es"
              ? [["Honestidad","Términos claros. Sin sorpresas. Siempre."],["Velocidad","De solicitud a fondos en 24 horas."],["Personas Reales","Tu asesor conoce tu negocio."]]
              : [["Honesty","Clear terms. No surprises. Ever."],["Speed","Application to funding in 24 hours."],["Real People","Your advisor knows your business."]]
            ).map(([title,desc])=>(
              <div key={title}>
                <p style={{fontSize:12, fontWeight:700, color:G, marginBottom:4, letterSpacing:"-.01em"}}>{title}</p>
                <p style={{fontSize:12, color:"rgba(255,255,255,.35)", fontWeight:300, maxWidth:160, lineHeight:1.5}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Right — visual */}
        <div>
          <div style={{background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"32px 28px"}}>
            <p style={{fontSize:11, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:24}}>
              {lang==="es"?"Nuestros Principios":"Our Principles"}
            </p>
            {(lang==="es"
              ? [
                  ["Sin cargos ocultos","Todo fee se divulga antes de que firmes. Sin sorpresas al final."],
                  ["Sin penalidades por pago anticipado","Paga antes y ahorra. Siempre."],
                  ["Sin llamadas de ventas","Sin presión de vendedores. Jamás."],
                  ["Consulta suave únicamente","Aplicar no afecta tu crédito."],
                  ["Decisiones en horas","No semanas. No meses. Horas."],
                  ["Términos claros","Ves todo antes de decidir."],
                ]
              : [
                  ["No hidden fees","Every fee is disclosed before you sign. No surprises at the end."],
                  ["No prepayment penalties","Pay off early and save. Always."],
                  ["No sales calls","No salesperson pressure. Ever."],
                  ["Soft pull only","Applying does not impact your credit score."],
                  ["Decisions in hours","Not weeks. Not months. Hours."],
                  ["Clear terms upfront","You see everything before you decide."],
                ]
            ).map(([title,desc])=>(
              <div key={title} style={{display:"flex", gap:14, marginBottom:18, paddingBottom:18, borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                <div style={{width:20, height:20, background:"rgba(168,255,62,.1)", border:"1px solid rgba(168,255,62,.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1}}>
                  <div style={{width:6, height:6, background:G, borderRadius:"50%"}}></div>
                </div>
                <div>
                  <p style={{fontSize:13, fontWeight:600, color:"#fff", marginBottom:3, letterSpacing:"-.01em"}}>{title}</p>
                  <p style={{fontSize:12, color:"rgba(255,255,255,.35)", lineHeight:1.55, fontWeight:300}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


// ── ABOUT PAGE ───────────────────────────────────────────────────
function AboutPage({ lang, setLang, onBack, onApply, onProducts, onHowItWorks, onFaq, onAbout, onContact }) {
  const G = "#a8ff3e";
  return (
    <div style={{ minHeight:"100vh", background:BK, color:"#fff" }}>
      <style>{CSS}</style>
      <InnerNav lang={lang} setLang={setLang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} onAbout={onAbout} onContact={onContact} />

      {/* HERO */}
      <section style={{ padding:"88px 5% 72px", maxWidth:900, margin:"0 auto", textAlign:"center" }}>
        <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700 }}>
          {lang==="es"?"Sobre Nosotros":"About Aprovuit"}
        </p>
        <h1 style={{ fontSize:"clamp(36px,6vw,72px)", fontWeight:700, letterSpacing:"-.03em", lineHeight:1.0, marginBottom:24, color:"#fff" }}>
          {lang==="es"
            ? <>{`Construido para los`}<br /><span style={{color:G}}>{`pequeños negocios.`}</span></>
            : <>Built for the<br /><span style={{color:G}}>small business owner.</span></>}
        </h1>
        <p style={{ fontSize:18, color:"rgba(255,255,255,.45)", lineHeight:1.85, maxWidth:680, margin:"0 auto", fontWeight:300 }}>
          {lang==="es"
            ? "Aprovuit nació de una idea simple: los dueños de negocios merecen acceso rápido y transparente al capital — sin los obstáculos de la banca tradicional. Somos un prestamista directo y broker de financiamiento, potenciados por tecnología."
            : "Aprovuit was built on a simple idea: business owners deserve fast, transparent access to capital — without the barriers of traditional banking. We built the technology to make that happen."}
        </p>
      </section>

      {/* MISSION STATS */}
      <div style={{ background:"#111", borderTop:"1px solid rgba(255,255,255,.06)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"0 5%" }} className="stats-grid">
          {(lang==="es"
            ? [["$500M+","Fondeado"],["10,000+","Negocios"],["24 hrs","Tiempo Promedio"],["580+","Puntaje Mínimo"]]
            : [["$500M+","Funded"],["10,000+","Businesses Served"],["24 hrs","Avg. Time to Fund"],["580+","Min. Credit Score"]]
          ).map(([v,l],i)=>(
            <div key={l} style={{ padding:"32px 0", textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,.06)":"none" }}>
              <div style={{ fontSize:36, fontWeight:700, color:G, letterSpacing:"-.03em" }}>{v}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STORY */}
      <section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start" }} className="hero-grid">
          <div>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:700, letterSpacing:"-.03em", marginBottom:24, color:"#fff" }}>
              {lang==="es"?"¿Por qué existe Aprovuit?":"Why does Aprovuit exist?"}
            </h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.9, marginBottom:20, fontWeight:300 }}>
              {lang==="es"
                ? "Los dueños de pequeños negocios son la columna vertebral de la economía — pero el sistema financiero tradicional los trata como ciudadanos de segunda clase. Proceso interminable, semanas de espera, respuestas vagas."
                : "Small business owners are the backbone of the economy — but the traditional financial system treats them like second-class citizens. Endless paperwork, weeks of waiting, vague answers."}
            </p>
            <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.9, marginBottom:20, fontWeight:300 }}>
              {lang==="es"
                ? "Nosotros lo arreglamos. Aprovuit combina el expertise de un broker con la velocidad y transparencia de la tecnología. Presentamos tu expediente a nuestra red de fondeadores, negociamos en tu nombre y te mantenemos informado en cada paso — a través de tu portal, no por teléfono."
                : "We fixed that. Aprovuit combines the expertise of a seasoned broker with the speed and transparency of technology. We present your file to our network of funders, work the deal on your behalf, and keep you informed at every step — through your dashboard, not over the phone."}
            </p>
            <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", lineHeight:1.9, fontWeight:300 }}>
              {lang==="es"
                ? "El resultado: más opciones, mejores términos y total visibilidad. Sin sorpresas. Sin llamadas de ventas. Sin papeleo interminable."
                : "The result: more options, better terms, and total visibility. No surprises. No sales calls. No endless paperwork."}
            </p>
          </div>
          <div>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:700, letterSpacing:"-.03em", marginBottom:24, color:"#fff" }}>
              {lang==="es"?"Nuestros Principios":"Our Principles"}
            </h2>
            {(lang==="es"
              ? [
                  ["Sin cargos ocultos","Cada fee se divulga antes de firmar. Sin sorpresas."],
                  ["Sin penalidades por pago anticipado","Paga antes y ahorra. Siempre recompensamos el pago anticipado."],
                  ["Sin llamadas de ventas","Sin presión de vendedores. Sin llamadas no deseadas. Jamás."],
                  ["Consulta suave únicamente","Aplicar no afecta tu puntaje de crédito."],
                  ["Decisiones en horas","No semanas. No meses. La mayoría de decisiones en 2–4 horas."],
                  ["Términos claros antes de firmar","Ves todo — monto, tasa, pagos — antes de tomar ninguna decisión."],
                  ["Comunicación 100% escrita","Todo en tu portal. Registro completo de cada conversación."],
                ]
              : [
                  ["No hidden fees","Every fee is disclosed before you sign. No surprises at the end."],
                  ["No prepayment penalties","Pay off early and save. We always reward early payoff."],
                  ["No sales calls","No salesperson pressure. No unsolicited calls. Ever."],
                  ["Soft pull only","Applying does not impact your credit score."],
                  ["Decisions in hours","Not weeks. Not months. Most decisions within 2–4 hours."],
                  ["Clear terms before you sign","You see everything — amount, rate, payments — before any decision."],
                  ["100% written communication","Everything in your portal. Full record of every conversation."],
                ]
            ).map(([title,desc])=>(
              <div key={title} style={{ display:"flex", gap:14, marginBottom:16, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                <div style={{ width:18, height:18, background:"rgba(168,255,62,.1)", border:"1px solid rgba(168,255,62,.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                  <div style={{ width:5, height:5, background:G, borderRadius:"50%" }}></div>
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:3 }}>{title}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", lineHeight:1.6, fontWeight:300 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section style={{ background:BK2, padding:"72px 5%", borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>
              {lang==="es"?"Industrias":"Industries We Serve"}
            </p>
            <h2 style={{ fontSize:"clamp(24px,4vw,44px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", marginBottom:12 }}>
              {lang==="es"?"Tu industria. Nuestra especialidad.":"Your industry. Our specialty."}
            </h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", maxWidth:520, margin:"0 auto", lineHeight:1.75, fontWeight:300 }}>
              {lang==="es"
                ? "Hemos fondeado negocios en docenas de industrias. Cada sector tiene necesidades únicas de capital — y nosotros las entendemos."
                : "We've funded businesses across dozens of industries. Every sector has unique capital needs — and we understand yours."}
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }} className="how-grid">
            {(lang==="es"
              ? [["Restaurantes y Alimentos","Capital de trabajo para nómina, inventario y gastos durante temporadas lentas."],["Salud y Médico","Soluciones de flujo de caja mientras esperan pagos de seguros."],["Construcción","Financiamiento por proyecto para materiales, equipo y mano de obra."],["Transporte","Capital para fletes, camiones, combustible y logística."],["Retail y Comercio","Fondos para inventario, expansión y demanda estacional."],["Manufactura","Financiamiento de equipo e inventario para producción continua."],["Auto y Servicios","Capital para talleres, herramientas, refacciones y gastos diarios."],["Servicios Profesionales","Flujo de caja para firmas legales, contables y consultoría."]]
              : [["Restaurants & Food","Working capital for payroll, inventory, and costs through slow seasons."],["Healthcare & Medical","Cash flow solutions while waiting on insurance reimbursements."],["Construction","Project-based financing for materials, equipment, and labor."],["Transportation","Capital for freight, trucks, fuel, and logistics operations."],["Retail & Commerce","Funding for inventory, expansion, and seasonal demand."],["Manufacturing","Equipment and inventory financing to keep production running."],["Auto & Services","Capital for repair shops, tools, parts, and daily expenses."],["Professional Services","Cash flow for law firms, accountants, and consulting businesses."]]
            ).map(([name,desc])=>(
              <div key={name} style={{ background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"22px 20px", transition:"border-color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(168,255,62,.3)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}>
                <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:"-.01em" }}>{name}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.4)", lineHeight:1.65, fontWeight:300 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      
      <DontSeeSection lang={lang} onApply={onApply} />

      {/* CTA */}
      <section style={{ background:G, padding:"72px 5%", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(28px,4vw,52px)", fontWeight:700, color:"#000", letterSpacing:"-.03em", marginBottom:14 }}>
          {lang==="es"?"¿Listo para Comenzar?":"Ready to Get Started?"}
        </h2>
        <p style={{ fontSize:16, color:"rgba(0,0,0,.55)", marginBottom:28, fontWeight:300 }}>
          {lang==="es"?"Aplica en minutos. Sin impacto al crédito.":"Apply in minutes. No impact to your credit score."}
        </p>
        <button onClick={onApply} style={{ background:"#000", color:G, border:"none", padding:"15px 44px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", borderRadius:6 }}>
          {lang==="es"?"Comenzar →":"Get Started →"}
        </button>
      </section>
    </div>
  );
}


// ── CONTACT PAGE ─────────────────────────────────────────────────
function ContactPage({ lang, setLang, onBack, onApply, onProducts, onHowItWorks, onFaq, onAbout }) {
  const G = "#a8ff3e";
  const [form, setForm] = useState({ name:"", email:"", phone:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await fetch("https://formspree.io/f/xbdpdnby", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ ...form, _subject:"Aprovuit Contact Form — " + form.subject })
      });
      setSent(true);
    } catch(e) {}
    setSending(false);
  };

  const inp = { width:"100%", padding:"13px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,.12)", fontSize:14, fontFamily:"'Sora',sans-serif", color:"#fff", background:"rgba(255,255,255,.06)", marginBottom:14, display:"block", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", background:BK, color:"#fff" }}>
      <style>{CSS}</style>
      <InnerNav lang={lang} setLang={setLang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} onAbout={onAbout} onContact={onContact} />

      {/* HERO */}
      <section style={{ padding:"72px 5% 56px", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <p style={{ fontSize:11, letterSpacing:".14em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>
          {lang==="es"?"Contáctanos":"Contact Us"}
        </p>
        <h1 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", marginBottom:16 }}>
          {lang==="es"?"Estamos aquí para ayudarte.":"We're here to help."}
        </h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,.45)", maxWidth:520, margin:"0 auto", lineHeight:1.8, fontWeight:300 }}>
          {lang==="es"
            ? "¿Tienes preguntas sobre financiamiento, tu solicitud o tu cuenta? Escríbenos y te respondemos en menos de 24 horas."
            : "Have questions about funding, your application, or your account? Send us a message and we'll get back to you within 24 hours."}
        </p>
      </section>

      <section style={{ padding:"64px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"start" }} className="hero-grid">

          {/* LEFT — contact info */}
          <div>
            <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", marginBottom:16 }}>
              {lang==="es"?"¿En qué podemos ayudarte?":"What can we help you with?"}
            </h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,.45)", lineHeight:1.85, marginBottom:32, fontWeight:300 }}>
              {lang==="es"
                ? "Usa el formulario para enviarnos un mensaje sobre financiamiento, tu solicitud o cualquier pregunta. Te respondemos en menos de 24 horas."
                : "Use the form to send us a message about funding, your application, or any questions you have. We'll get back to you within 24 hours."}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {(lang==="es"
                ? [["Preguntas sobre financiamiento","¿Cuánto califico? ¿Qué productos tengo disponibles?"],["Estado de tu solicitud","Seguimiento de tu trato o documentos pendientes."],["Preguntas sobre tu cuenta","Acceso, pagos, saldo y más."],["Asociaciones y referidos","¿Quieres enviar clientes y ganar comisiones?"]]
                : [["Funding questions","How much do I qualify for? What products are available?"],["Application status","Following up on your deal or pending documents."],["Account questions","Access, payments, balance, and more."],["Partnerships & referrals","Want to refer clients and earn commissions?"]]
              ).map(([title,desc])=>(
                <div key={title} style={{ display:"flex", gap:12, padding:"16px 18px", background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:10 }}>
                  <div style={{ width:8, height:8, background:G, borderRadius:"50%", flexShrink:0, marginTop:5 }}></div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:3 }}>{title}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", fontWeight:300 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — contact form */}
          <div style={{ background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"36px 32px" }}>
            {sent ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ width:56, height:56, background:"rgba(168,255,62,.1)", border:`1px solid ${G}30`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize:22, fontWeight:700, color:"#fff", marginBottom:10, letterSpacing:"-.02em" }}>
                  {lang==="es"?"¡Mensaje Enviado!":"Message Sent!"}
                </h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.7, fontWeight:300 }}>
                  {lang==="es"
                    ? "Gracias por escribirnos. Te responderemos en menos de 24 horas."
                    : "Thanks for reaching out. We'll get back to you within 24 hours."}
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:24, letterSpacing:"-.02em" }}>
                  {lang==="es"?"Envíanos un Mensaje":"Send Us a Message"}
                </h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:0 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:7 }}>
                      {lang==="es"?"Nombre":"Name"} *
                    </label>
                    <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder={lang==="es"?"Tu nombre":"Your name"} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:7 }}>
                      {lang==="es"?"Correo":"Email"} *
                    </label>
                    <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@business.com" style={inp} type="email" />
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:7 }}>
                      {lang==="es"?"Teléfono":"Phone"}
                    </label>
                    <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="(555) 000-0000" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:7 }}>
                      {lang==="es"?"Asunto":"Subject"}
                    </label>
                    <select value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={{...inp, appearance:"none", cursor:"pointer"}}>
                      <option value="">{lang==="es"?"Seleccionar...":"Select..."}</option>
                      <option>{lang==="es"?"Pregunta sobre financiamiento":"Funding question"}</option>
                      <option>{lang==="es"?"Estado de mi solicitud":"Application status"}</option>
                      <option>{lang==="es"?"Pregunta sobre mi cuenta":"Account question"}</option>
                      <option>{lang==="es"?"Asociación o referidos":"Partnership or referrals"}</option>
                      <option>{lang==="es"?"Otro":"Other"}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:7 }}>
                    {lang==="es"?"Mensaje":"Message"} *
                  </label>
                  <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder={lang==="es"?"¿En qué podemos ayudarte?":"How can we help you?"} rows={5} style={{...inp, resize:"vertical", lineHeight:1.6}} />
                </div>
                <button onClick={submit} disabled={sending || !form.name || !form.email || !form.message} className="btn-green" style={{ width:"100%", fontSize:14, padding:"13px", opacity:(sending||!form.name||!form.email||!form.message)?0.5:1, cursor:(sending||!form.name||!form.email||!form.message)?"not-allowed":"pointer" }}>
                  {sending ? (lang==="es"?"Enviando...":"Sending...") : (lang==="es"?"Enviar Mensaje →":"Send Message →")}
                </button>
                <p style={{ fontSize:11, color:"rgba(255,255,255,.25)", textAlign:"center", marginTop:12 }}>
                  {lang==="es"?"Te respondemos en menos de 24 horas":"We typically respond within 24 hours"}
                </p>
              </>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}

// ── LANDING PAGE ─────────────────────────────────────────────────
function Landing({ lang, setLang, onApply, onLogin, onProducts, onHowItWorks, onFaq, onAbout, onContact }) {
  const t = T[lang];
  const G = "#a8ff3e";

  return (
    <div style={{ background:BK, color:"#fff", fontFamily:"'Sora',sans-serif" }}>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#a8ff3e"/>
            <path d="M8 20L14 8L20 20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10.5" y1="16" x2="17.5" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize:15, fontWeight:800, color:"#fff", letterSpacing:"-.03em" }}>APROVUIT</span>
        </div>
        <div className="nav-desktop" style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[[t.nav.products,"products"],[t.nav.howItWorks,"howitworks"],[t.nav.faq,"faq"],["About","about"]].map(([l,v])=>(
            <button key={v} className="nav-link" onClick={()=>{ ({products:onProducts,howitworks:onHowItWorks,faq:onFaq,about:onAbout})[v]?.(); window.scrollTo(0,0); }}>{l}</button>
          ))}
          <div className="lang-pill">
            <button className="lb" onClick={()=>setLang("en")} style={{ background:lang==="en"?G:"transparent", color:lang==="en"?"#000":"rgba(255,255,255,.4)" }}>EN</button>
            <button className="lb" onClick={()=>setLang("es")} style={{ background:lang==="es"?G:"transparent", color:lang==="es"?"#000":"rgba(255,255,255,.4)" }}>ES</button>
          </div>
          <button className="nav-link" onClick={()=>{onLogin();window.scrollTo(0,0);}}>{t.nav.login}</button>
          <button className="btn-green" style={{ padding:"9px 20px", fontSize:13 }} onClick={()=>{onApply();window.scrollTo(0,0);}}>{t.nav.apply}</button>
        </div>
        <div className="nav-mobile" style={{ display:"none", gap:10, alignItems:"center" }}>
          <button className="btn-green" style={{ padding:"9px 18px", fontSize:13 }} onClick={()=>{onApply();window.scrollTo(0,0);}}>{lang==="es"?"Aplicar →":"Apply →"}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"93vh", display:"flex", alignItems:"center", padding:"0 5%", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(ellipse at 12% 55%, ${G}0d 0%, transparent 50%), radial-gradient(ellipse at 88% 15%, ${G}07 0%, transparent 50%)`, pointerEvents:"none" }}></div>
        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }} className="hero-grid">

          {/* LEFT — funding first, platform second */}
          <div className="fadeup">
            <h1 style={{ fontSize:"clamp(40px,5.5vw,70px)", fontWeight:700, lineHeight:1.0, marginBottom:20, letterSpacing:"-.03em", color:"#fff" }}>
              {lang==="es"
                ? <>{`Tu negocio ya`}<br />{`está listo.`}<br /><span style={{color:G}}>{`Los fondos también.`}</span></>
                : <>{`Your business`}<br />{`is ready.`}<br /><span style={{color:G}}>{`The funding should be too.`}</span></>}
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,.5)", lineHeight:1.8, marginBottom:32, fontWeight:300, maxWidth:460 }}>
              {lang==="es"
                ? "Capital de trabajo rápido para negocios establecidos. Aplica en minutos, recibe una oferta en horas y rastrea todo en tiempo real desde tu portal."
                : "Fast working capital for established businesses. Apply in minutes, get an offer in hours, and track everything in real time from your dashboard."}
            </p>

            {/* Qualify checklist — Capital Gurus style */}
            <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"20px 24px", marginBottom:28 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:14 }}>
                {lang==="es"?"Todo lo que necesitas para calificar:":"All you need to qualify:"}
              </p>
              {(lang==="es"
                ? ["6+ meses en operación","$10,000+ en ingresos mensuales","580+ puntaje de crédito","Solo consulta suave — sin impacto"]
                : ["6+ months in business","$10,000+ in monthly revenue","580+ credit score","Soft pull only — no credit impact"]
              ).map(item => (
                <div key={item} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                  <div style={{ width:18, height:18, background:"rgba(168,255,62,.12)", border:`1px solid ${G}35`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#a8ff3e" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize:14, color:"rgba(255,255,255,.7)", fontWeight:400 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }} className="hero-btns">
              <button className="btn-green" style={{ fontSize:15, padding:"14px 36px" }} onClick={()=>{onApply();window.scrollTo(0,0);}}>
                {lang==="es"?"Ver Cuánto Califico →":"See How Much I Qualify For →"}
              </button>
              <button className="btn-ghost" onClick={()=>{onLogin();window.scrollTo(0,0);}}>
                {lang==="es"?"Entrar al Portal":"Log In"}
              </button>
            </div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.2)", marginTop:14 }}>
              {lang==="es"?"Gratis · Sin impacto al crédito · Decisión en horas":"Free · No credit impact · Decision in hours"}
            </p>
          </div>

          {/* RIGHT — live dashboard mockup */}
          <div style={{ display:"flex", justifyContent:"center" }} className="hero-mockup">
            <div style={{ width:"100%", maxWidth:390, position:"relative" }}>
              <div style={{ position:"absolute", inset:-40, background:`radial-gradient(circle, ${G}10 0%, transparent 70%)`, filter:"blur(30px)", pointerEvents:"none" }}></div>
              <div style={{ background:"#0d0d0d", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, overflow:"hidden", position:"relative", zIndex:1, boxShadow:"0 48px 96px rgba(0,0,0,.7)" }}>
                <div style={{ background:"#0a0a0a", padding:"13px 18px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#a8ff3e"/><path d="M8 20L14 8L20 20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="10.5" y1="16" x2="17.5" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/></svg>
                    <span style={{ fontSize:13, fontWeight:800, color:"#fff", letterSpacing:"-.02em" }}>APROVUIT</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
                    <span style={{ fontSize:10, color:G, fontWeight:600 }}>{lang==="es"?"En vivo":"Live"}</span>
                  </div>
                </div>
                <div style={{ display:"flex", background:"#111", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                  {(lang==="es"?["Resumen","Ofertas","Docs"]:["Overview","Offers","Docs"]).map((tab,i)=>(
                    <div key={tab} style={{ flex:1, padding:"10px 4px", textAlign:"center", fontSize:11, fontWeight:600, color:i===1?G:"rgba(255,255,255,.3)", borderBottom:i===1?`2px solid ${G}`:"2px solid transparent" }}>{tab}</div>
                  ))}
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ background:"linear-gradient(135deg,#0f1f0f,#111)", border:`1px solid ${G}20`, borderRadius:12, padding:"16px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{lang==="es"?"Nueva Oferta":"New Offer"}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:G, background:"rgba(168,255,62,.1)", padding:"2px 8px", borderRadius:10 }}>{lang==="es"?"Revisar":"Review"}</span>
                    </div>
                    <p style={{ fontSize:32, fontWeight:700, color:G, letterSpacing:"-.03em", marginBottom:12 }}>$50,000</p>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:12 }}>
                      {(lang==="es"?[["Pago/mes","$625"],["Plazo","12 meses"],["Penalidad","Ninguna"]]:
                        [["Monthly","$625"],["Term","12 mo"],["Penalty","None"]]).map(([l,v])=>(
                        <div key={l} style={{ background:"rgba(255,255,255,.05)", borderRadius:6, padding:"7px 8px" }}>
                          <p style={{ fontSize:9, color:"rgba(255,255,255,.3)", marginBottom:3 }}>{l}</p>
                          <p style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>{onApply();window.scrollTo(0,0);}} style={{ width:"100%", background:G, border:"none", borderRadius:8, padding:"10px", fontSize:13, fontWeight:700, color:"#000", cursor:"pointer" }}>
                      {lang==="es"?"Ver y Aceptar Oferta →":"View & Accept Offer →"}
                    </button>
                  </div>
                  <div style={{ background:"#161616", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:"14px 16px" }}>
                    <p style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>{lang==="es"?"Estado del Trato":"Deal Status"}</p>
                    {(lang==="es"
                      ?[["Solicitud enviada","1 Abr",true],["En revisión","1 Abr",true],["Oferta enviada","1 Abr",true],["Fondeado","2 Abr",false]]
                      :[["Application submitted","Apr 1",true],["Under review","Apr 1",true],["Offer sent","Apr 1",true],["Funded","Apr 2",false]]
                    ).map(([s,d,done])=>(
                      <div key={s} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                        <div style={{ width:14, height:14, borderRadius:"50%", background:done?G:"rgba(255,255,255,.06)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {done&&<div style={{ width:5, height:5, background:"#000", borderRadius:"50%" }}></div>}
                        </div>
                        <p style={{ flex:1, fontSize:11, color:done?"rgba(255,255,255,.7)":"rgba(255,255,255,.25)" }}>{s}</p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,.25)" }}>{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:G, padding:"11px 0", overflow:"hidden" }}>
        <div className="tick">
          {[...Array(2)].map((_,ti)=>(
            <span key={ti} style={{ display:"flex" }}>
              {t.ticker.map(text=>(
                <span key={text} style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"0 28px" }}>
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#000", whiteSpace:"nowrap" }}>{text}</span>
                  <span style={{ color:"rgba(0,0,0,.3)", fontSize:10 }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ background:BK2, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div className="stats-grid" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"0 5%" }}>
          {t.stats.map(([v,l],i)=>(
            <div key={l} style={{ padding:"32px 0", textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,.05)":"none" }}>
              <div style={{ fontSize:38, fontWeight:700, color:G, letterSpacing:"-.03em", lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:6, fontWeight:500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS — show what we offer prominently */}
      <section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>
            {lang==="es"?"Nuestros Productos":"Funding Products"}
          </p>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff", marginBottom:12 }}>
            {lang==="es"?"Capital para cada necesidad.":"Capital for every need."}
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", fontWeight:300 }}>
            {lang==="es"?"Desde $10K hasta $5M. Decisión en horas, no semanas.":"From $10K to $5M. Decision in hours, not weeks."}
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }} className="how-grid">
          {(lang==="es"
            ?[["→","Préstamo a Plazo","$10K – $500K","3–24 meses","Pagos fijos. Ideal para expansión, equipo o inversiones puntuales.","#a8ff3e"],["↺","Línea de Crédito","$10K – $5M","Revolvente","Retira lo que necesitas. Solo pagas por lo que usas.","#60a5fa"],["↯","Adelanto por Ingresos","$5K – $500K","Pago flexible","Pagos que se ajustan a tus ingresos diarios. Rápido y flexible.","#f59e0b"],["◈","Equipo","$5K – $2M","Hasta 60 meses","El equipo como garantía. Aprobación más fácil, menor costo.","#c084fc"]]
            :[["→","Term Loan","$10K – $500K","3–24 months","Fixed payments. Ideal for expansion, hiring, or one-time investments.","#a8ff3e"],["↺","Line of Credit","$10K – $5M","Revolving","Draw what you need. Only pay for what you use.","#60a5fa"],["↯","Revenue Advance","$5K – $500K","Flexible repayment","Payments that flex with your daily revenue. Fast and simple.","#f59e0b"],["◈","Equipment","$5K – $2M","Up to 60 months","Equipment as collateral. Easier approval, lower cost.","#c084fc"]]
          ).map(([icon,name,range,term,desc,color])=>(
            <div key={name} onClick={()=>{onProducts();window.scrollTo(0,0);}} style={{ background:"#111", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"24px 20px", cursor:"pointer", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"60";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{ fontSize:22, marginBottom:12, color }}>{icon}</div>
              <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:4, letterSpacing:"-.01em" }}>{name}</p>
              <p style={{ fontSize:13, fontWeight:700, color, marginBottom:4 }}>{range}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginBottom:10 }}>{term}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.45)", lineHeight:1.6, fontWeight:300 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:28 }}>
          <button onClick={()=>{onProducts();window.scrollTo(0,0);}} style={{ background:"none", border:"1px solid rgba(255,255,255,.12)", color:"rgba(255,255,255,.5)", padding:"10px 28px", borderRadius:8, fontSize:13, cursor:"pointer", fontFamily:"'Sora',sans-serif", transition:"all .2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.3)";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.12)";e.currentTarget.style.color="rgba(255,255,255,.5)";}}>
            {lang==="es"?"Ver todos los productos →":"View all products →"}
          </button>
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps */}
      <section style={{ background:BK2, padding:"80px 5%", borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{t.how.badge}</p>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff" }}>{t.how.h}</h2>
          </div>
          <div className="how-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
            {t.how.steps.map(([n,title,desc],i)=>(
              <div key={n} style={{ background:i===1?G:BK3, color:i===1?"#000":"#fff", padding:"36px 28px", border:`1px solid ${i===1?G:"rgba(255,255,255,.06)"}` }}>
                <div style={{ fontSize:44, fontWeight:700, opacity:.1, marginBottom:14, letterSpacing:"-.04em" }}>{n}</div>
                <h3 style={{ fontSize:19, fontWeight:700, marginBottom:10, letterSpacing:"-.02em" }}>{title}</h3>
                <p style={{ fontSize:13, lineHeight:1.8, opacity:i===1?.6:.4, fontWeight:300 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:28 }}>
            <button onClick={()=>{onHowItWorks();window.scrollTo(0,0);}} style={{ background:"none", border:"none", color:"rgba(255,255,255,.35)", fontSize:13, cursor:"pointer", textDecoration:"underline", fontFamily:"'Sora',sans-serif" }}>
              {lang==="es"?"Ver proceso completo →":"See the full process →"}
            </button>
          </div>
        </div>
      </section>

      {/* PLATFORM DEMO — fintech side */}
      <AnimatedDemo lang={lang} />

      {/* DASHBOARD SLIDER */}
      <DashboardSlider lang={lang} />

      {/* REVIEWS */}
      <section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{t.reviews.badge}</p>
          <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:700, letterSpacing:"-.03em", color:"#fff" }}>{t.reviews.h}</h2>
        </div>
        <div className="reviews-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {t.reviews.items.map(r=>(
            <div key={r.name} style={{ background:BK3, border:"1px solid rgba(255,255,255,.06)", padding:"24px 22px", borderRadius:4 }}>
              <div style={{ display:"flex", gap:2, marginBottom:12 }}>
                {[...Array(r.stars)].map((_,i)=><span key={i} style={{ color:G, fontSize:13 }}>★</span>)}
              </div>
              <p style={{ fontSize:14, lineHeight:1.85, color:"rgba(255,255,255,.5)", marginBottom:18, fontStyle:"italic", fontWeight:300 }}>"{r.text}"</p>
              <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:12 }}>
                <p style={{ fontWeight:700, fontSize:13, color:"#fff" }}>{r.name}</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:2 }}>{r.biz}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:G, padding:"80px 5%", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(28px,5vw,56px)", fontWeight:700, color:"#000", letterSpacing:"-.03em", marginBottom:12 }}>
          {lang==="es"?"¿Listo para ver cuánto calificas?":"Ready to see how much you qualify for?"}
        </h2>
        <p style={{ fontSize:16, color:"rgba(0,0,0,.55)", marginBottom:28, fontWeight:300 }}>
          {lang==="es"?"Gratis. Sin impacto al crédito. Decisión en horas.":"Free. No credit impact. Decision in hours."}
        </p>
        <button onClick={()=>{onApply();window.scrollTo(0,0);}} style={{ background:"#000", color:G, border:"none", padding:"15px 44px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", borderRadius:6, letterSpacing:"-.01em" }}>
          {lang==="es"?"Comenzar Ahora →":"Get Started Now →"}
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background:BK, borderTop:"1px solid rgba(255,255,255,.05)", padding:"40px 5% 28px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20, marginBottom:20, paddingBottom:20, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#a8ff3e"/><path d="M8 20L14 8L20 20" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="10.5" y1="16" x2="17.5" y2="16" stroke="#000" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize:15, fontWeight:800, letterSpacing:"-.03em", color:"#fff" }}>APROVUIT</span>
            </div>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              {[[t.nav.products,onProducts],[t.nav.howItWorks,onHowItWorks],["About",onAbout],[t.nav.faq,onFaq],[lang==="es"?"Contacto":"Contact",onContact],[t.nav.login,onLogin]].map(([l,fn])=>(
                <button key={l} className="nav-link" onClick={()=>{fn?.();window.scrollTo(0,0);}}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.05)", borderRadius:8, padding:"12px 16px", marginBottom:16 }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.25)", lineHeight:1.7 }}>
              {lang==="es"
                ? "Aprovuit actúa como guía de confianza en tu camino hacia el financiamiento empresarial. Nuestra plataforma está diseñada para conectarte con opciones de capital adaptadas a las necesidades únicas de tu negocio. Si bien nos esforzamos por ofrecer información precisa y actualizada, no podemos garantizar su exactitud debido a la naturaleza dinámica de la industria financiera. Te recomendamos realizar tu propia diligencia debida y buscar asesoría financiera o legal independiente antes de tomar decisiones financieras. Al usar nuestros servicios, aceptas nuestros términos y reconoces que cualquier decisión basada en la información de nuestro sitio es tu propia responsabilidad."
                : "Aprovuit serves as a trusted guide on your journey toward business financing. Our platform is designed to connect you with capital options tailored to your unique business needs. While we strive to provide accurate and up-to-date information, we cannot guarantee its completeness due to the dynamic nature of the financial industry. We strongly encourage all users to conduct their own due diligence and seek independent financial or legal advice before making any financial decisions. By using our services, you agree to our terms and acknowledge that any decisions based on information found on our platform are your own responsibility."}
            </p>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.2)", textAlign:"center" }}>{t.footer.rights}</p>
        </div>
      </footer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}


// ── MAIN APP ─────────────────────────────────────────────────────
export default function Aprovuit() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialUploadId = initialParams.get("upload");
  const initialAdmin = initialParams.get("admin") === "true";

  const [view, setView] = useState(initialAdmin ? "admin" : initialUploadId ? "upload" : "landing");
  const [prevView, setPrevView] = useState("landing");
  const navTo = (v) => { setPrevView(view); setView(v); window.scrollTo(0,0); };
  const [lang, setLang] = useState("en");
  const [uploadAppId, setUploadAppId] = useState(initialUploadId || null);

  useEffect(() => {
    document.title = "Aprovuit — Business Funding Platform | Direct Lender & Broker";
    const m = (k, v, n) => {
      let t = document.querySelector('meta[' + (n?'name':'property') + '="' + k + '"]');
      if (!t) { t = document.createElement('meta'); t.setAttribute(n?'name':'property', k); document.head.appendChild(t); }
      t.setAttribute('content', v);
    };
    m('description','Aprovuit is a direct lender and licensed funding broker powered by technology. Apply in minutes, track your deal live, and get funded in 24 hours. No phone calls. No hidden fees.',true);
    m('og:title','Aprovuit — Business Funding Platform');
    m('og:description','Apply in minutes. Track your deal live. Funded in 24 hours. Direct lender + licensed broker.');
    m('og:url','https://aprovuit.com');
    m('og:type','website');
    m('og:image','https://aprovuit.com/og-preview.png');
    m('og:site_name','Aprovuit');
    m('twitter:card','summary_large_image',true);
    m('twitter:title','Aprovuit — Business Funding Platform',true);
    m('twitter:description','Apply in minutes. Get funded in 24 hours. No phone calls.',true);
  }, []);
  const [user, setUser] = useState(null);

  // SEO - update title and meta based on view
  useEffect(() => {
    const titles = {
      landing: "Aprovuit — Business Funding, No Phone Calls",
      apply: "Apply for Business Funding — Aprovuit",
      products: "Business Loan Products — Aprovuit",
      howitworks: "How It Works — Aprovuit Business Funding",
      faq: "FAQ — Aprovuit Business Funding",
      login: "Log In — Aprovuit",
      dashboard: "My Dashboard — Aprovuit",
      admin: "Admin — Aprovuit",
    };
    document.title = titles[view] || "Aprovuit — Business Funding";
    // Update meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = "description"; document.head.appendChild(meta); }
    const descs = {
      landing: "Business funding that lives entirely online. Apply in minutes, get offers, accept, and manage your funding — no phone calls, no salespeople. 580+ credit score OK.",
      products: "Explore term loans, lines of credit, revenue advances, and equipment financing from $5K to $5M. No phone calls. Decisions in hours.",
      howitworks: "See how Aprovuit works — from application to funded in as little as 24 hours. 100% online, no phone calls.",
      faq: "Answers to common questions about business funding with Aprovuit. Requirements, process, timing, and more.",
    };
    meta.content = descs[view] || descs.landing;

    // OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property','og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = document.title;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property','og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = meta.content;
  }, [view]);

  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const uploadId = params.get("upload");
      if (uploadId) { setUploadAppId(uploadId); setView("upload"); }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const handleLogin = (email, firstName, company, appId) => {
    setUser({ email, firstName, company, appId });
    setView("dashboard");
  };

  const handleApplySuccess = (email, firstName, company, appId, goUpload) => {
    if (goUpload) { setUploadAppId(appId); setView("upload"); return; }
    const u = { email, firstName, company: company||"My Business", appId };
    setUser(u);
    setView("dashboard");
    window.scrollTo(0,0);
  };

  const handleUpload = (appId) => { setUploadAppId(appId); setView("upload"); };

  if (view==="upload") return <UploadPage lang={lang} appId={uploadAppId} onBack={()=>setView(user?"dashboard":"landing")} />;

  if (view==="apply") return <ApplyPage lang={lang} onBack={()=>{setView("landing");window.scrollTo(0,0);}} onSuccess={handleApplySuccess} onUpload={handleUpload} />;

  if (view==="login") return <LoginPage lang={lang} onBack={()=>{setView("landing");window.scrollTo(0,0);}} onLogin={handleLogin} />;
  if (view==="products") return <><ProductsPage lang={lang} setLang={setLang} onBack={()=>{setView("landing");window.scrollTo(0,0);}} onApply={()=>{setView("apply");window.scrollTo(0,0);}} onProducts={()=>{setView("products");window.scrollTo(0,0);}} onHowItWorks={()=>{setView("howitworks");window.scrollTo(0,0);}} onFaq={()=>{setView("faq");window.scrollTo(0,0);}} onAbout={()=>{setView("about");window.scrollTo(0,0);}} onContact={()=>{setView("contact");window.scrollTo(0,0);}} /><Chatbot lang={lang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} /></>;
  if (view==="howitworks") return <><HowItWorksPage lang={lang} setLang={setLang} onBack={()=>{setView("landing");window.scrollTo(0,0);}} onApply={()=>{setView("apply");window.scrollTo(0,0);}} onProducts={()=>{setView("products");window.scrollTo(0,0);}} onHowItWorks={()=>{setView("howitworks");window.scrollTo(0,0);}} onFaq={()=>{setView("faq");window.scrollTo(0,0);}} onAbout={()=>{setView("about");window.scrollTo(0,0);}} onContact={()=>{setView("contact");window.scrollTo(0,0);}} /><Chatbot lang={lang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} /></>;
  if (view==="contact") return <><ContactPage lang={lang} setLang={setLang} onBack={()=>{setView("landing");window.scrollTo(0,0);}} onApply={()=>{setView("apply");window.scrollTo(0,0);}} onProducts={()=>{setView("products");window.scrollTo(0,0);}} onHowItWorks={()=>{setView("howitworks");window.scrollTo(0,0);}} onFaq={()=>{setView("faq");window.scrollTo(0,0);}} onAbout={()=>{setView("about");window.scrollTo(0,0);}} onContact={()=>{setView("contact");window.scrollTo(0,0);}} /><Chatbot lang={lang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} /></>;
  if (view==="about") return <><AboutPage lang={lang} setLang={setLang} onBack={()=>{setView("landing");window.scrollTo(0,0);}} onApply={()=>{setView("apply");window.scrollTo(0,0);}} onProducts={()=>{setView("products");window.scrollTo(0,0);}} onHowItWorks={()=>{setView("howitworks");window.scrollTo(0,0);}} onFaq={()=>{setView("faq");window.scrollTo(0,0);}} onAbout={()=>{setView("about");window.scrollTo(0,0);}} onContact={()=>{setView("contact");window.scrollTo(0,0);}} /><Chatbot lang={lang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} /></>;
  if (view==="faq") return <><FAQPage lang={lang} setLang={setLang} onBack={()=>{setView("landing");window.scrollTo(0,0);}} onApply={()=>{setView("apply");window.scrollTo(0,0);}} onProducts={()=>{setView("products");window.scrollTo(0,0);}} onHowItWorks={()=>{setView("howitworks");window.scrollTo(0,0);}} onFaq={()=>{setView("faq");window.scrollTo(0,0);}} onAbout={()=>{setView("about");window.scrollTo(0,0);}} onContact={()=>{setView("contact");window.scrollTo(0,0);}} /><Chatbot lang={lang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} /></>;

  if (view==="admin") return (
    <AdminGate onExit={()=>{setView("landing");window.scrollTo(0,0);}} />
  );

  if (view==="dashboard" && user) return (
    <div style={{ background:"#0a0a0a", minHeight:"100vh" }}>
      <style>{CSS}</style>
      <div style={{ background:"rgba(10,10,10,.97)", borderBottom:"1px solid rgba(255,255,255,.07)", padding:"0 5%", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <button onClick={()=>{setView("landing");window.scrollTo(0,0);}} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>A</div>
          <span style={{ fontSize:18, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(168,255,62,.08)", border:`1px solid ${G}20`, padding:"5px 14px", borderRadius:20 }}>
          <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
          <span style={{ fontSize:12, color:G, fontWeight:700 }}>{user.firstName} · {user.company}</span>
        </div>
      </div>
      <Dashboard lang={lang} user={user} onSignOut={()=>{setUser(null);setView("landing");}} onUpload={handleUpload} />
      <Chatbot lang={lang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} />
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <Landing lang={lang} setLang={setLang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} onLogin={()=>{setView("login");window.scrollTo(0,0);}} onAdmin={()=>setView("admin")} onProducts={()=>{setView("products");window.scrollTo(0,0);}} onHowItWorks={()=>{setView("howitworks");window.scrollTo(0,0);}} onFaq={()=>{setView("faq");window.scrollTo(0,0);}} onAbout={()=>{setView("about");window.scrollTo(0,0);}} onContact={()=>{setView("contact");window.scrollTo(0,0);}} />
      <Chatbot lang={lang} onApply={()=>{setView("apply");window.scrollTo(0,0);}} />
    </>
  );
}
