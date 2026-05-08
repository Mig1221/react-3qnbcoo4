import React, { useState, useEffect } from 'react';

const G = "#a8ff3e";
const BK = "#0a0a0a";
const BK2 = "#111111";
const BK3 = "#161616";

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
    "Message":`Your application for ${data.company} (ID: ${data.id}) has been received! We will be in touch within 2-4 hours. No phone call required.`,
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
    .hero-grid { grid-template-columns:1fr !important; gap:48px !important; }
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
  }
  @media (max-width:480px) {
    .metrics-grid { grid-template-columns:1fr 1fr !important; }
    .hero-btns { flex-direction:column !important; align-items:flex-start !important; }
    .offer-btns { flex-direction:column !important; }
    .name-row { grid-template-columns:1fr !important; }
  }
`;

// ── TRANSLATIONS ─────────────────────────────────────────────────
const T = {
  en: {
    nav: { products:"Products", howItWorks:"How It Works", faq:"FAQ", login:"Log In", apply:"Get Started" },
    hero: { badge:"Business Funding, Reimagined.", h1:"Real Funding.", h2:"Full Transparency.", sub:"Aprovuit is a business funding broker powered by technology. Apply once, track your deal in real time, and manage everything through your dashboard — no phone chasing, no runaround.", cta1:"Get Started →", cta2:"Log In to Dashboard" },
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
        {icon:"↯",name:"Revenue-Based Advance",range:"$5K–$500K",term:"Flexible repayment",desc:"Payments tied to your daily revenue. Pay more when business is good, less when slow. Industry-leading prepayment discounts.",best:["Restaurants & retail","Seasonal businesses","Fast cash needs","Card-processing businesses"],reqs:["3+ months in business","$10K+ monthly revenue","No minimum credit score","Soft credit pull only"],how:"Receive capital fast — often same day. Payments flex with your revenue automatically. Strong discounts for early payoff.",color:"#f59e0b"},
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
      ["What is Aprovuit?","Aprovuit is a licensed commercial funding broker. We work with a network of funders and lenders to get small businesses the working capital they need — fast. We handle the process end to end and use our platform to give you full visibility into every step of your deal."],
      ["Does Aprovuit lend money directly?","No. Aprovuit is a broker, not a direct lender. We work with a network of trusted funders who provide the capital. Our job is to match you with the right funder, negotiate the best terms available, and manage the process from application to funding."],
      ["What are the minimum requirements?","Generally: 6+ months in business, $10,000+ monthly revenue, 580+ credit score. Some revenue-based options are more flexible. Submitting does not guarantee an offer."],
      ["Will this affect my credit score?","No. We use a soft credit inquiry only — zero impact to your score. A hard pull may occur only if you accept a final offer from a funding partner."],
      ["Are there prepayment penalties?","No. We offer industry-leading prepayment discounts — the earlier you pay off, the more you save. A $50K advance with $625 monthly payments could cost significantly less if paid early."],
      ["How does Aprovuit make money?","Aprovuit earns a broker fee paid by the funding partner when a deal is successfully funded — not from you. There is no cost to apply. All fees are disclosed before you sign."],
      ["How long does funding take?","Most deals are reviewed within 2–4 business hours. Many clients receive funding within 24 hours of approval."],
      ["What documents do I need?","Typically: 3–6 months of business bank statements, a government-issued ID, and a voided business check. All uploaded securely through the platform."],
    ] },
    cta: { h:"Real Funding. Full Transparency.", sub:"Apply in minutes. Our team works your deal. You track everything live.", btn:"Get Started →" },
    footer: { rights:"© 2026 Aprovuit. All rights reserved. · aprovuit.com · Aprovuit is a licensed commercial funding broker. Not a direct lender. Funding provided by third-party partners." },
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
    hero: { badge:"Financiamiento Empresarial Reinventado.", h1:"Fondos Reales.", h2:"Total Transparencia.", sub:"Aprovuit es un broker de financiamiento empresarial impulsado por tecnología. Aplica una vez, rastrea tu proceso en tiempo real y administra todo desde tu portal — sin perseguir llamadas, sin rodeos.", cta1:"Comenzar →", cta2:"Entrar al Portal" },
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
        {icon:"↯",name:"Adelanto Basado en Ingresos",range:"$5K–$500K",term:"Pago flexible",desc:"Pagos vinculados a tus ingresos diarios. Pagas más cuando el negocio va bien, menos cuando va lento.",best:["Restaurantes y retail","Negocios estacionales","Necesidades urgentes","Negocios con tarjetas"],reqs:["3+ meses en operación","$10K+ ingresos mensuales","Sin puntaje mínimo","Solo consulta suave"],how:"Capital rápido — a menudo el mismo día. Los pagos se ajustan a tus ingresos automáticamente. Descuentos por pago anticipado.",color:"#f59e0b"},
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
      ["¿Aprovuit presta dinero directamente?","No. Aprovuit es un broker, no un prestamista directo. Trabajamos con una red de fondeadores de confianza. Nuestro trabajo es conectarte con el fondeador correcto y gestionar el proceso de principio a fin."],
      ["¿Cuáles son los requisitos mínimos?","Generalmente: 6+ meses en operación, $10,000+ en ingresos mensuales, 580+ puntaje de crédito. Algunas opciones son más flexibles. Enviar una solicitud no garantiza una oferta."],
      ["¿Afectará mi puntaje de crédito?","No. Usamos una consulta suave — sin impacto en tu puntaje. Una consulta dura solo ocurre si aceptas una oferta final de un socio de financiamiento."],
      ["¿Hay penalidades por pago anticipado?","No. Ofrecemos descuentos líderes en la industria por pago anticipado. Un adelanto de $50K con pagos de $625/mes puede costar significativamente menos si se liquida antes."],
      ["¿Cómo genera dinero Aprovuit?","Aprovuit gana una comisión pagada por el socio de financiamiento cuando un trato se fondea — no de ti. No hay costo por aplicar. Todas las comisiones se divulgan antes de firmar."],
      ["¿Cuánto tarda el financiamiento?","La mayoría de tratos son revisados en 2–4 horas hábiles. Muchos clientes reciben fondos dentro de 24 horas de la aprobación."],
      ["¿Qué documentos necesito?","Típicamente: 3–6 meses de estados de cuenta bancarios, identificación oficial y cheque anulado. Todo se sube de forma segura a través de la plataforma."],
    ] },
    cta: { h:"Fondos Reales. Total Transparencia.", sub:"Aplica en minutos. Nuestro equipo trabaja tu trato. Tú rastreas todo en tiempo real.", btn:"Comenzar →" },
    footer: { rights:"© 2026 Aprovuit. Todos los derechos reservados. · aprovuit.com · Aprovuit es un broker de financiamiento comercial con licencia. No es un prestamista directo." },
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
  const labelStyle = { fontSize:11, fontWeight:600, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10, display:"block" };
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
            : "Our team reviews your application and works to get you funded — often within 24 hours."}
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
        <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>
          {lang==="es"?"¿Cuánto podría calificar?":"How much could I qualify for?"}
        </p>
        <p style={{ fontSize:64, fontWeight:700, color:G, letterSpacing:"-.04em", lineHeight:1, marginBottom:8 }}>{fmtSlider(qualAmt())}</p>
        <p style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>
          {lang==="es"?"Para fines ilustrativos. Solicitudes sujetas a revisión.":"For illustrative purposes only. Applications subject to review."}
        </p>
      </div>

      {/* Requirements */}
      <div style={{ background:"rgba(168,255,62,.04)", border:`1px solid ${G}20`, borderRadius:12, padding:"20px 24px", marginBottom:32 }}>
        <p style={{ fontSize:12, fontWeight:600, color:G, marginBottom:14, letterSpacing:"-.01em" }}>
          {lang==="es"?"Todo lo que necesitas:":"All you need to qualify:"}
        </p>
        {(lang==="es"
          ? ["6+ meses en operación","$10K+ en ingresos mensuales","580+ puntaje de crédito","Solo consulta suave — sin impacto al crédito"]
          : ["6+ months in business","$10K+ in monthly revenue","580+ credit score","Soft pull only — no credit impact"]
        ).map(r=>(
          <div key={r} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:4, height:4, background:G, borderRadius:"50%", flexShrink:0 }}></div>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.6)", letterSpacing:"-.01em" }}>{r}</span>
          </div>
        ))}
      </div>

      <button onClick={()=>setStep(1)} style={{ width:"100%", background:G, color:"#000", border:"none", padding:"16px", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer", letterSpacing:"-.01em" }}>
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

  const inp = { width:"100%", padding:"13px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,.1)", fontSize:14, fontFamily:"'Sora',sans-serif", color:"#fff", background:"rgba(255,255,255,.04)", marginBottom:12, display:"block", outline:"none", transition:"border-color .15s", letterSpacing:"-.01em" };
  const inpFocus = { ...inp, borderColor:"rgba(168,255,62,.5)" };
  const sel = { ...inp, appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", cursor:"pointer", paddingRight:40 };

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
            <button onClick={()=>setStep(0)} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
            <button onClick={()=>setStep(2)} style={{ flex:2, background:G, color:"#000", border:"none", padding:"13px", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>{t.continueBtn}</button>
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
            <button onClick={()=>setStep(1)} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
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
            <button onClick={()=>setStep(2)} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
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
                ? "Al enviar, autorizas a Aprovuit a revisar tu solicitud y presentarla a socios de financiamiento en nuestra red en tu nombre. Esto genera una consulta suave de crédito sin impacto a tu puntaje. Todas las comisiones de broker son pagadas por el fondeador, no por ti."
                : "By submitting, you authorize Aprovuit to review your application and present it to funding partners in our network on your behalf. This triggers a soft credit inquiry with no impact to your score. All broker fees are paid by the funder, not you."}
            </p>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setStep(3)} style={{ flex:1, background:"transparent", color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)", padding:"13px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t.backBtn}</button>
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
function InnerNav({ lang, onBack, onApply, onProducts, onHowItWorks, onFaq, onLogin }) {
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,.97)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.08)", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
      <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:28, height:28, background:"#a8ff3e", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#000" }}>A</div>
        <span style={{ fontSize:20, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
      </button>
      <div style={{ display:"flex", gap:28, alignItems:"center" }}>
        <button onClick={onBack} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Inicio":"Home"}</button>
        <button onClick={onProducts} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Productos":"Products"}</button>
        <button onClick={onHowItWorks} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Cómo Funciona":"How It Works"}</button>
        <button onClick={onFaq} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>FAQ</button>
        {onLogin && <button onClick={onLogin} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.55)", cursor:"pointer", background:"none", border:"none", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Entrar":"Log In"}</button>}
        <button onClick={onApply} style={{ background:"#a8ff3e", color:"#000", border:"none", padding:"9px 20px", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Comenzar →":"Get Started →"}</button>
      </div>
    </nav>
  );
}

// ── PRODUCTS PAGE ────────────────────────────────────────────────
function ProductsPage({ lang, onBack, onApply, onProducts, onHowItWorks, onFaq }) {
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
      reqs:lang==="es"?["6+ meses en operación","$10K+ ingresos mensuales","580+ puntaje de crédito","Sin llamadas telefónicas"]:["6+ months in business","$10K+ monthly revenue","580+ credit score","No phone call required"],
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
      reqs:lang==="es"?["6+ meses en operación","$15K+ ingresos mensuales","600+ puntaje de crédito","Sin llamadas telefónicas"]:["6+ months in business","$15K+ monthly revenue","600+ credit score","No phone call required"],
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
      reqs:lang==="es"?["3+ meses en operación","$10K+ ingresos mensuales","No se requiere puntaje mínimo","Sin llamadas"]:["3+ months in business","$10K+ monthly revenue","No minimum credit score required","No phone call"],
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
      <InnerNav lang={lang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} />
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
    </div>
  );
}

// ── HOW IT WORKS PAGE ─────────────────────────────────────────────
function HowItWorksPage({ lang, onBack, onApply, onProducts, onHowItWorks, onFaq }) {
  const steps = lang==="es" ? [
    { n:"01", title:"Completa tu Solicitud", time:"5 minutos", icon:"01",
      desc:"Llena nuestra solicitud inteligente en línea. Sin entrevistas telefónicas. Sin papeleo. Solo información básica sobre tu negocio y lo que necesitas.", details:["Información básica del negocio","Monto de financiamiento deseado","Propósito de los fondos","Sube 3-6 meses de estados bancarios"] },
    { n:"02", title:"Crea Tu Cuenta", time:"30 segundos", icon:"02",
      desc:"Crea tu cuenta segura de Aprovuit. Aquí rastrearás todo — tu solicitud, ofertas, documentos y mensajes con tu asesor.", details:["Correo electrónico y contraseña","Verificación de identidad por SMS","Portal personal con dashboard en tiempo real","Sin instalación de app requerida"] },
    { n:"03", title:"Revisión de Solicitud", time:"2-4 horas", icon:"03",
      desc:"Nuestro equipo revisa tu solicitud. Evaluamos ingresos, historial crediticio y la salud general de tu negocio. Sin llamadas telefónicas de nuestra parte.", details:["Consulta suave de crédito (sin impacto)","Análisis de estados bancarios","Evaluación de ingresos mensuales","Comunicación 100% por escrito"] },
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
      <InnerNav lang={lang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} />
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
function FAQPage({ lang, onBack, onApply, onProducts, onHowItWorks, onFaq }) {
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
      ["¿Cuánto tiempo necesito en operación?","Generalmente 6 meses mínimo. Algunas opciones basadas en ingresos aceptan negocios con 3+ meses en operación."],
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
      ["What is Aprovuit?","Aprovuit is a financing marketplace platform — not a lender or broker. You submit one request, independent financing partners review it and may extend offers. You compare and choose. Aprovuit does not make credit decisions."],
      ["How does Aprovuit make money?","Aprovuit earns a broker fee paid by the funding partner when a deal is successfully funded — not from you. There is no cost to apply or use the platform. All fees are fully disclosed before you sign any agreement."],
      ["Is my information secure?","Yes. All data is encrypted with 256-bit SSL. Your information may only be shared with financing partners for the purpose of evaluating your request."],
      ["Is Aprovuit available in all states?","The platform is available nationwide. Specific products may have geographic restrictions based on financing partner licensing."],
    ]},
    { cat:"Eligibility & Requirements", items:[
      ["What are the minimum requirements?","Requirements vary by partner and product. Generally: 6+ months in business, $10,000+ monthly revenue, 580+ credit score. Some revenue-based options are more flexible. Submitting does not guarantee an offer."],
      ["What types of businesses can apply?","Most legitimate businesses — retail, restaurants, construction, healthcare, transportation, professional services, technology, and more. Financing partners independently determine eligibility."],
      ["How long do I need to be in business?","Generally 6 months minimum. Some revenue-based options accept businesses with 3+ months in operation."],
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
      <InnerNav lang={lang} onBack={onBack} onApply={onApply} onProducts={onProducts} onHowItWorks={onHowItWorks} onFaq={onFaq} />
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
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{
    role:"assistant",
    content: lang==="es"
      ? "¡Hola! Soy el asistente de Aprovuit. ¿Tienes preguntas sobre financiamiento o quieres saber si calificas? "
      : "Hi! I'm the Aprovuit assistant. Have questions about funding or want to find out if you qualify? "
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = React.useRef(null);

  React.useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(p => [...p, { role:"user", content:userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are Aprovuit's friendly funding assistant. Aprovuit is a financing marketplace platform — like Kayak but for business funding. Business owners submit one application and may receive multiple financing offers from our partner network. They compare and choose entirely on their own. Aprovuit is NOT a lender or broker. We do not negotiate on anyone's behalf or make credit decisions.

Key facts:
- Products: Term Loans ($10K-$500K, 3-24mo), Lines of Credit ($10K-$5M, revolving), Revenue Advances ($5K-$500K, daily repayment), Equipment Financing ($5K-$2M, up to 60mo)
- Requirements: 6+ months in business, $10K+ monthly revenue, 580+ credit score
- Process: Apply online → get offer in dashboard → accept with one click → funded same day
- No phone calls ever. Everything in the merchant dashboard.
- Decisions in 2-4 hours. Soft credit pull only (no impact to score).
- Language: ${lang === "es" ? "Respond in Spanish" : "Respond in English"}

Be conversational, helpful, and concise. If they want to apply, encourage them to get started. Never guarantee approvals or specific rates — those come from financing partners. Never say Aprovuit lends money or acts as a broker. Keep responses under 3 sentences when possible.`,
          messages:[...msgs, { role:"user", content:userMsg }]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || (lang==="es" ? "Lo siento, intenta de nuevo." : "Sorry, please try again.");
      setMsgs(p => [...p, { role:"assistant", content:reply }]);
    } catch(e) {
      setMsgs(p => [...p, { role:"assistant", content: lang==="es" ? "Error de conexión. Intenta de nuevo." : "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position:"fixed", bottom:24, right:24, width:56, height:56, background:"#a8ff3e", border:"none", borderRadius:"50%", cursor:"pointer", boxShadow:"0 4px 20px rgba(168,255,62,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, zIndex:1000, transition:"all 0.2s" }}
      >
        {open ? "×" : ""}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{ position:"fixed", bottom:92, right:24, width:360, height:480, background:"#fff", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column", overflow:"hidden", zIndex:1000 }}>
          {/* Header */}
          <div style={{ background:"#0a0a0a", padding:"16px 20px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#a8ff3e", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#000", flexShrink:0 }}>A</div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0 }}>Aprovuit Assistant</p>
              <p style={{ fontSize:11, color:"#a8ff3e", margin:0 }}>{lang==="es"?"En línea":"Online"} · {lang==="es"?"Sin llamadas":"No phone calls"}</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:10, background:"#f9fafb" }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:m.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px", background:m.role==="user"?"#1a1a1a":"#fff", color:m.role==="user"?"#fff":"#1a1a1a", fontSize:14, lineHeight:1.5, boxShadow:"0 1px 4px rgba(0,0,0,0.08)", fontFamily:"'DM Sans',sans-serif" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", gap:4, padding:"10px 14px", background:"#fff", borderRadius:"4px 14px 14px 14px", width:"fit-content", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, background:"#ccc", borderRadius:"50%", animation:`bounce 1s ease ${i*0.15}s infinite` }}></div>)}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          {msgs.length <= 2 && (
            <div style={{ padding:"8px 12px", display:"flex", gap:6, flexWrap:"wrap", background:"#f9fafb", borderTop:"1px solid #f0f0f0" }}>
              {(lang==="es"
                ? ["¿Cuánto califico?","¿Cuáles son los requisitos?","¿Afecta mi crédito?","Quiero aplicar"]
                : ["How much do I qualify for?","What are the requirements?","Will it hurt my credit?","I want to apply"]
              ).map(q => (
                <button key={q} onClick={() => { setInput(q); }} style={{ background:"#fff", border:"1px solid #e5e8ee", borderRadius:20, padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#555", whiteSpace:"nowrap" }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:"12px 14px", borderTop:"1px solid #f0f0f0", display:"flex", gap:8, background:"#fff" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && send()}
              placeholder={lang==="es"?"Escribe tu pregunta...":"Ask me anything..."}
              style={{ flex:1, border:"1.5px solid #e5e8ee", borderRadius:10, padding:"10px 14px", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", color:"#1a1a1a" }}
            />
            <button onClick={send} disabled={loading} style={{ width:40, height:40, background:loading?"#ccc":"#a8ff3e", border:"none", borderRadius:10, cursor:loading?"not-allowed":"pointer", fontSize:18, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>↑</button>
          </div>
          <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
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

// ── LANDING PAGE ─────────────────────────────────────────────────
function Landing({ lang, onApply, onLogin, onAdmin, onProducts, onHowItWorks, onFaq }) {
  const t = T[lang];
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <div style={{ background:BK, color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", padding:"80px 5% 60px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(ellipse at 20% 60%, ${G}0f 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, ${G}07 0%, transparent 50%)`, pointerEvents:"none" }}></div>
        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }} className="hero-grid">

          {/* Left */}
          <div className="fadeup">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,255,62,.08)", border:`1px solid ${G}30`, padding:"5px 16px", borderRadius:20, marginBottom:28 }}>
              <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
              <span style={{ fontSize:11, color:G, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{lang==="es"?"Plataforma de Financiamiento · No un Corredor":"Financing Platform · Not a Broker"}</span>
            </div>
            <h1 className="cond" style={{ fontSize:"clamp(48px,6.5vw,82px)", fontWeight:900, lineHeight:0.94, marginBottom:24, letterSpacing:"-0.02em", textTransform:"uppercase" }}>
              {lang==="es" ? <>SIN LLAMADAS.<br /><span style={{color:G}}>SIN PRESIÓN.</span><br />SIMPLE.</> : <>NO HASSLE.<br /><span style={{color:G}}>NO CALLS.</span><br />SIMPLE.</>}
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,.5)", lineHeight:1.8, marginBottom:16, fontWeight:300, maxWidth:460 }}>
              {lang==="es"
                ? "Envía una solicitud, rastrea tu financiamiento y ve las ofertas disponibles — todo en un solo lugar."
                : "Submit one request, track your funding, and view available offers — all in one place."}
            </p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.3)", lineHeight:1.6, marginBottom:40, maxWidth:420, fontWeight:300 }}>
              {lang==="es"
                ? "Aprovuit es una plataforma tecnológica. No somos un prestamista ni un corredor."
                : "Aprovuit is a technology platform. We are not a lender or broker."}
            </p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }} className="hero-btns">
              <button className="btn-green" style={{ fontSize:16, padding:"15px 36px" }} onClick={onApply}>
                {lang==="es"?"Comenzar →":"Get Started →"}
              </button>
              <button className="btn-ghost" onClick={onLogin}>
                {lang==="es"?"Entrar al Portal":"Log In to Dashboard"}
              </button>
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ position:"relative", width:"100%", maxWidth:380 }}>
              <div style={{ position:"absolute", inset:-24, background:`radial-gradient(circle, ${G}15 0%, transparent 70%)`, filter:"blur(24px)", borderRadius:"50%" }}></div>
              {/* App frame */}
              <div style={{ background:"#0f0f0f", border:"1px solid rgba(255,255,255,.1)", borderRadius:24, overflow:"hidden", position:"relative", zIndex:1, boxShadow:"0 40px 80px rgba(0,0,0,.6)" }}>
                {/* App header */}
                <div style={{ background:"#0a0a0a", padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:24, height:24, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#000" }}>A</div>
                    <span style={{ fontSize:14, fontWeight:700, color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
                  </div>
                  <span style={{ fontSize:11, color:G, fontWeight:700, background:"rgba(168,255,62,.1)", padding:"3px 10px", borderRadius:20 }}>{lang==="es"?"En línea":"Live"}</span>
                </div>
                {/* App nav tabs */}
                <div style={{ display:"flex", background:"#111", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  {(lang==="es"?["Resumen","Ofertas","Documentos"]:["Overview","Offers","Documents"]).map((tab,i)=>(
                    <div key={tab} style={{ flex:1, padding:"10px 4px", textAlign:"center", fontSize:11, fontWeight:700, color:i===1?G:"rgba(255,255,255,.35)", borderBottom:i===1?`2px solid ${G}`:"2px solid transparent", cursor:"pointer" }}>{tab}</div>
                  ))}
                </div>
                {/* Content */}
                <div style={{ padding:20 }}>
                  {/* Status card */}
                  <div style={{ background:"#161616", borderRadius:12, padding:"14px 16px", marginBottom:12, border:"1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>APP-2041 · {lang==="es"?"Financiamiento a Plazo":"Term Financing"}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:G }}>{lang==="es"?"Activo":"Active"}</span>
                    </div>
                    <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", marginBottom:4 }}>$145,000</div>
                    <div style={{ height:4, background:"rgba(255,255,255,.08)", borderRadius:2, overflow:"hidden", marginBottom:4 }}>
                      <div style={{ height:"100%", width:"44%", background:G, borderRadius:2 }}></div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>44% {lang==="es"?"pagado":"paid"}</span>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>{lang==="es"?"Próximo: $6,250":"Next: $6,250"}</span>
                    </div>
                  </div>
                  {/* Offer card */}
                  <div style={{ background:"#0f1a0f", border:`1px solid ${G}20`, borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{lang==="es"?"Oferta Disponible":"Offer Available"}</span>
                      <span style={{ fontSize:10, fontWeight:600, color:G, background:"rgba(168,255,62,.1)", padding:"2px 8px", borderRadius:10 }}>{lang==="es"?"Nuevo":"New"}</span>
                    </div>
                    <div style={{ fontSize:26, fontWeight:700, color:G, letterSpacing:"-.03em", marginBottom:10 }}>$50,000</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:10 }}>
                      {[[lang==="es"?"Pago/mes":"Monthly","$625"],[lang==="es"?"Plazo":"Term","12 mo"],[lang==="es"?"Penalidad":"Penalty","None"]].map(([l,v])=>(
                        <div key={l} style={{ background:"rgba(255,255,255,.04)", borderRadius:6, padding:"6px 8px" }}>
                          <p style={{ fontSize:9, color:"rgba(255,255,255,.3)", marginBottom:2 }}>{l}</p>
                          <p style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize:10, color:"rgba(168,255,62,.6)", marginBottom:10 }}>{lang==="es"?"Descuentos por pago anticipado disponibles":"Early payoff discounts available"}</p>
                    <button onClick={onApply} style={{ width:"100%", background:G, border:"none", borderRadius:7, padding:"9px 0", fontSize:12, fontWeight:700, color:"#000", cursor:"pointer" }}>{lang==="es"?"Ver Oferta →":"View Offer →"}</button>
                  </div>
                  {/* Upload prompt */}
                  <div style={{ background:"#161616", borderRadius:12, padding:"12px 16px", border:"1px solid rgba(255,255,255,.05)", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:32, height:32, background:"rgba(168,255,62,.1)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:G }}>DOC</div>
                    <div>
                      <p style={{ fontSize:12, fontWeight:600, color:"#fff", margin:0 }}>{lang==="es"?"Sube tus documentos":"Upload your documents"}</p>
                      <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", margin:0 }}>{lang==="es"?"Estados de cuenta · ID · Cheque":"Bank statements · ID · Check"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background:G, padding:"11px 0", overflow:"hidden" }}>
        <div className="tick">
          {[...Array(2)].map((_,ti)=>(
            <span key={ti} style={{ display:"flex" }}>
              {t.ticker.map(text=>(
                <span key={text} style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"0 28px" }}>
                  <span style={{ fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#000", whiteSpace:"nowrap" }}>{text}</span>
                  <span style={{ color:"#000", opacity:.3 }}>·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section style={{ background:BK2, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div className="stats-grid" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"0 5%" }}>
          {t.stats.map(([v,l],i)=>(
            <div key={l} style={{ padding:"36px 0", textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,.06)":"none" }}>
              <div className="cond" style={{ fontSize:44, fontWeight:900, color:G, letterSpacing:"-0.02em", lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:8, fontWeight:500, letterSpacing:"0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:"88px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{t.how.badge}</p>
          <h2 className="cond" style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", cursor:"pointer" }} onClick={onHowItWorks}>{t.how.h}</h2>
        </div>
        <div className="how-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:2 }}>
          {(lang==="es"
            ? [["01","Envía tu Solicitud","Completa un formulario simple. Sin entrevistas. Sin llamadas."],["02","Socios lo Revisan","Tu información puede ser compartida con socios de financiamiento en nuestra red."],["03","Ve las Ofertas","Las ofertas disponibles aparecen en tu portal. Tú compara y decides."],["04","Tú Eliges","Selecciona lo que funciona para tu negocio. Sin presión. Sin intermediarios."]]
            : [["01","Submit Your Request","Fill out a simple form. No interviews. No phone calls."],["02","Partners Review","Your info may be shared with financing partners in our network."],["03","View Offers","Available offers appear in your dashboard. You compare and decide."],["04","You Choose","Select what works for your business. No pressure. No broker."]]
          ).map(([n,title,desc],i)=>(
            <div key={n} style={{ background:i===2?G:BK3, color:i===2?"#000":"#fff", padding:"36px 28px", border:`1px solid ${i===2?G:"rgba(255,255,255,.06)"}` }}>
              <div className="cond" style={{ fontSize:52, fontWeight:900, opacity:.12, marginBottom:16, letterSpacing:"-0.04em" }}>{n}</div>
              <h3 className="cond" style={{ fontSize:22, fontWeight:800, textTransform:"uppercase", marginBottom:10 }}>{title}</h3>
              <p style={{ fontSize:13, lineHeight:1.8, opacity:i===2?.7:.5, fontWeight:300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANIMATED DEMO ── */}
      <AnimatedDemo lang={lang} />

      {/* ── PLATFORM FEATURES ── */}
      <section style={{ background:BK2, padding:"80px 5%", borderTop:"1px solid rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:10, fontWeight:700 }}>{lang==="es"?"Funciones de la Plataforma":"Platform Features"}</p>
            <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,52px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>
              {lang==="es"?"Todo en un Solo Portal":"Everything in One Dashboard"}
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
            {(t.features?.items||[]).map(f=>(
              <div key={f.name} style={{ background:BK3, border:"1px solid rgba(255,255,255,.06)", padding:"28px 24px", borderRadius:4 }}>
                <div style={{ fontSize:28, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:8 }}>{f.name}</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.75, fontWeight:300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINANCING OPTIONS ── */}
      <section id="products" style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:10, fontWeight:700 }}>{t.products.badge}</p>
          <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", cursor:"pointer" }} onClick={onProducts}>{t.products.h}</h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", marginTop:12, maxWidth:500, margin:"12px auto 0" }}>
            {lang==="es"
              ? "Aprovuit trabaja con una red de socios de confianza para conectar tu negocio con el producto adecuado. Nosotros buscamos la mejor opción — tú eliges la mejor oferta."
              : "Aprovuit works with a network of trusted funding partners to match your business with the right product. We shop your deal — you choose the best offer."}
          </p>
        </div>
        <div className="products-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:2 }}>
          {t.products.items.map(p=>(
            <div key={p.name} className="prod-card">
              <div style={{ fontSize:22, marginBottom:12, color:G }}>{p.icon}</div>
              <h3 className="cond" style={{ fontSize:22, fontWeight:800, textTransform:"uppercase", marginBottom:8 }}>{p.name}</h3>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.75, marginBottom:16, fontWeight:300 }}>{p.desc}</p>
              <div style={{ display:"flex", gap:20 }}>
                <div><p style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{t.products.amount}</p><p style={{ fontSize:13, fontWeight:600, color:G }}>{p.range}</p></div>
                <div><p style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{t.products.term}</p><p style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{p.term}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM EXPLANATION ── */}
      <section style={{ background:BK2, padding:"64px 5%", borderTop:"1px solid rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <div style={{ width:56, height:56, background:"rgba(168,255,62,.1)", border:`1px solid ${G}30`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:16, fontWeight:800, color:G }}>A</div>
          <h2 className="cond" style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:20 }}>
            {lang==="es"?"¿Qué es Aprovuit?":"What is Aprovuit?"}
          </h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.55)", lineHeight:1.85, marginBottom:28, fontWeight:300 }}>
            {lang==="es"
              ? "Aprovuit es una plataforma tecnológica que permite a los dueños de negocios gestionar y explorar opciones de financiamiento en un solo lugar. Piensa en nosotros como el Kayak del financiamiento empresarial — no vendemos vuelos, te mostramos las opciones para que tú elijas."
              : "Aprovuit is a technology platform that allows business owners to manage and explore financing options in one place. Think of us as the Kayak of business funding — we don't sell flights, we show you the options so you can choose."}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, textAlign:"left", marginBottom:32 }}>
            {(lang==="es"
              ? [["×","Lo que NO somos","Un prestamista directo. No fondeamos tratos nosotros mismos — te conectamos con el fondeador correcto de nuestra red."],["Done","Lo que SÍ somos","Una plataforma de autoservicio donde envías una solicitud, ves las ofertas disponibles y eliges."],["—","Nuestro compromiso","Financiamiento honesto y transparente. Te decimos lo que ganamos. Sin cargos ocultos. Sin sorpresas."]]
              : [["×","What we're NOT","A direct lender. We don't fund deals ourselves — we connect you with the right funder from our network."],["Done","What we ARE","A self-service platform where you submit one request, view available offers, and choose."],["—","Our commitment","Honest, transparent funding. We tell you what we earn. No hidden fees. No bait-and-switch."]]
            ).map(([icon,title,desc])=>(
              <div key={title} style={{ background:BK3, border:"1px solid rgba(255,255,255,.06)", padding:"24px 20px" }}>
                <div style={{ fontSize:22, marginBottom:12 }}>{icon}</div>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:8 }}>{title}</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,.4)", lineHeight:1.7, fontWeight:300 }}>{desc}</p>
              </div>
            ))}
          </div>
          <button onClick={onApply} className="btn-green" style={{ fontSize:15, padding:"14px 40px" }}>
            {lang==="es"?"Comenzar Gratis →":"Get Started Free →"}
          </button>
        </div>
      </section>

      {/* ── REVIEWS (clean, no fake energy) ── */}
      <section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700, textAlign:"center" }}>{t.reviews.badge}</p>
        <h2 className="cond" style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:48 }}>{t.reviews.h}</h2>
        <div className="reviews-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {t.reviews.items.map(r=>(
            <div key={r.name} style={{ background:BK3, border:"1px solid rgba(255,255,255,.06)", padding:"28px 24px", borderRadius:4 }}>
              <div style={{ display:"flex", gap:2, marginBottom:14 }}>
                {[...Array(r.stars)].map((_,i)=><span key={i} style={{ color:G, fontSize:13 }}>★</span>)}
              </div>
              <p style={{ fontSize:14, lineHeight:1.85, color:"rgba(255,255,255,.55)", marginBottom:20, fontStyle:"italic", fontWeight:300 }}>"{r.text}"</p>
              <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", paddingTop:14 }}>
                <p style={{ fontWeight:700, fontSize:13, color:"#fff" }}>{r.name}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginTop:2 }}>{r.biz}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:"80px 5%", maxWidth:720, margin:"0 auto" }}>
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700, textAlign:"center" }}>{t.faq.badge}</p>
        <h2 className="cond" style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:44 }}>{t.faq.h}</h2>
        {t.faq.items.map(([q,a],i)=>(
          <div key={i}>
            <button className="faq-btn" onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
              <span style={{ fontSize:15, fontWeight:600 }}>{q}</span>
              <span style={{ fontSize:20, color:"rgba(255,255,255,.3)", flexShrink:0, transition:"transform .2s", transform:faqOpen===i?"rotate(45deg)":"none" }}>+</span>
            </button>
            {faqOpen===i && <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", lineHeight:1.85, paddingBottom:20, fontWeight:300, borderBottom:"1px solid rgba(255,255,255,.07)" }}>{a}</p>}
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section style={{ background:G, padding:"72px 5%", textAlign:"center" }}>
        <h2 className="cond" style={{ fontSize:"clamp(32px,5vw,64px)", fontWeight:900, color:"#000", textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:14 }}>{t.cta.h}</h2>
        <p style={{ fontSize:16, color:"rgba(0,0,0,.6)", marginBottom:32, fontWeight:300 }}>{t.cta.sub}</p>
        <button onClick={onApply} style={{ background:"#000", color:G, border:"none", padding:"16px 48px", fontSize:16, fontWeight:800, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.04em", textTransform:"uppercase", borderRadius:4 }}>
          {t.cta.btn}
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:BK, borderTop:"1px solid rgba(255,255,255,.05)", padding:"48px 5% 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20, marginBottom:24, paddingBottom:24, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
              </div>
              <span className="cond" style={{ fontSize:18, fontWeight:800, letterSpacing:"0.02em" }}>APROVUIT</span>
            </div>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              <button className="nav-link" onClick={onApply}>{lang==="es"?"Comenzar":"Get Started"}</button>
              <button className="nav-link" onClick={onLogin}>{lang==="es"?"Entrar":"Log In"}</button>
              <button className="nav-link" onClick={onProducts}>{lang==="es"?"Opciones":"Options"}</button>
              <button className="nav-link" onClick={onHowItWorks}>{lang==="es"?"Cómo Funciona":"How It Works"}</button>
              <button className="nav-link" onClick={onFaq}>FAQ</button>
            </div>
          </div>
          <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.3)", lineHeight:1.8 }}>
              {lang==="es"
                ? "Aviso Legal: Aprovuit es una plataforma de mercado tecnológico, no un prestamista ni corredor. No tomamos decisiones de crédito, negociamos términos de financiamiento, ni actuamos en nombre de ningún usuario. Las solicitudes enviadas pueden ser compartidas con socios de financiamiento terceros independientes. Aprovuit no garantiza la aprobación de financiamiento."
                : "Legal: Aprovuit is a technology marketplace platform, not a lender or broker. We do not make credit decisions, negotiate financing terms, or act on behalf of any user. Applications may be shared with independent third-party financing partners who independently determine eligibility and terms. Aprovuit does not guarantee financing approval."}
            </p>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.2)", textAlign:"center" }}>{t.footer.rights}</p>
        </div>
      </footer>

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
      howitworks: "See how Aprovuit works — from application to funded in as little as 24 hours. 100% online, no phone calls required.",
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

  if (view==="apply") return <ApplyPage lang={lang} onBack={()=>setView("landing")} onSuccess={handleApplySuccess} onUpload={handleUpload} />;

  if (view==="login") return <LoginPage lang={lang} onBack={()=>setView("landing")} onLogin={handleLogin} />;
  if (view==="products") return <><ProductsPage lang={lang} onBack={()=>setView("landing")} onApply={()=>setView("apply")} onProducts={()=>setView("products")} onHowItWorks={()=>setView("howitworks")} onFaq={()=>setView("faq")} /><Chatbot lang={lang} onApply={()=>setView("apply")} /></>;
  if (view==="howitworks") return <><HowItWorksPage lang={lang} onBack={()=>setView("landing")} onApply={()=>setView("apply")} onProducts={()=>setView("products")} onHowItWorks={()=>setView("howitworks")} onFaq={()=>setView("faq")} /><Chatbot lang={lang} onApply={()=>setView("apply")} /></>;
  if (view==="faq") return <><FAQPage lang={lang} onBack={()=>setView("landing")} onApply={()=>setView("apply")} onProducts={()=>setView("products")} onHowItWorks={()=>setView("howitworks")} onFaq={()=>setView("faq")} /><Chatbot lang={lang} onApply={()=>setView("apply")} /></>;

  if (view==="admin") return (
    <AdminGate onExit={()=>setView("landing")} />
  );

  if (view==="dashboard" && user) return (
    <div style={{ background:"#0a0a0a", minHeight:"100vh" }}>
      <style>{CSS}</style>
      <div style={{ background:"rgba(10,10,10,.97)", borderBottom:"1px solid rgba(255,255,255,.07)", padding:"0 5%", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <button onClick={()=>setView("landing")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>A</div>
          <span style={{ fontSize:18, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(168,255,62,.08)", border:`1px solid ${G}20`, padding:"5px 14px", borderRadius:20 }}>
          <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
          <span style={{ fontSize:12, color:G, fontWeight:700 }}>{user.firstName} · {user.company}</span>
        </div>
      </div>
      <Dashboard lang={lang} user={user} onSignOut={()=>{setUser(null);setView("landing");}} onUpload={handleUpload} />
      <Chatbot lang={lang} onApply={()=>setView("apply")} />
    </div>
  );

  return (
    <div>
      <style>{CSS}</style>
      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,.93)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
        <button onClick={()=>setView("landing")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:14, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
          </div>
          <span className="cond" style={{ fontSize:20, fontWeight:800, letterSpacing:"0.02em", color:"#fff" }}>APROVUIT</span>
        </button>
  <div className="nav-desktop" style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[[T[lang].nav.products,"products"],[T[lang].nav.howItWorks,"howitworks"],[T[lang].nav.faq,"faq"]].map(([l,v])=>(
            <button key={l} className="nav-link" onClick={()=>setView(v)}>{l}</button>
          ))}
          <div className="lang-pill">
            <button className="lb" onClick={()=>setLang("en")} style={{ background:lang==="en"?G:"transparent", color:lang==="en"?"#000":"rgba(255,255,255,.5)" }}>EN</button>
            <button className="lb" onClick={()=>setLang("es")} style={{ background:lang==="es"?G:"transparent", color:lang==="es"?"#000":"rgba(255,255,255,.5)" }}>ES</button>
          </div>
          <button className="nav-link" onClick={()=>setView("login")}>{T[lang].nav.login}</button>
          <button className="btn-green" style={{ padding:"9px 20px", fontSize:13 }} onClick={()=>setView("apply")}>{T[lang].nav.apply}</button>
        </div>
        <div className="nav-mobile" style={{ display:"none", gap:10, alignItems:"center" }}>
          <div className="lang-pill">
            <button className="lb" onClick={()=>setLang("en")} style={{ background:lang==="en"?G:"transparent", color:lang==="en"?"#000":"rgba(255,255,255,.5)" }}>EN</button>
            <button className="lb" onClick={()=>setLang("es")} style={{ background:lang==="es"?G:"transparent", color:lang==="es"?"#000":"rgba(255,255,255,.5)" }}>ES</button>
          </div>
          <button className="btn-green" style={{ padding:"9px 18px", fontSize:13 }} onClick={()=>setView("apply")}>{lang==="en"?"Get Started →":"Comenzar →"}</button>
        </div>
      </nav>
      <Landing lang={lang} onApply={()=>setView("apply")} onLogin={()=>setView("login")} onAdmin={()=>setView("admin")} onProducts={()=>setView("products")} onHowItWorks={()=>setView("howitworks")} onFaq={()=>setView("faq")} />
      <Chatbot lang={lang} onApply={()=>setView("apply")} />
    </div>
  );
}
