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
    _subject:`✅ Application Received — ${data.company} | Aprovuit`,
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
    _subject:`📎 Documents Uploaded — ${appId} | Aprovuit`,
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
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:#0a0a0a; color:#fff; }
  ::selection { background:#a8ff3e; color:#000; }
  input,select,textarea { font-family:'DM Sans',sans-serif; }
  input[type=range] { -webkit-appearance:none; width:100%; height:10px; background:#e5e8ee; border-radius:5px; outline:none; cursor:pointer; margin:16px 0 8px; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:30px; height:30px; background:#a8ff3e; border:4px solid #fff; border-radius:50%; box-shadow:0 2px 10px rgba(0,0,0,.25); cursor:pointer; }
  input[type=range]::-moz-range-thumb { width:30px; height:30px; background:#a8ff3e; border:4px solid #fff; border-radius:50%; cursor:pointer; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fadeup { animation:fadeUp .35s ease both; }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .tick { display:flex; animation:ticker 28s linear infinite; width:max-content; }
  .cond { font-family:'Barlow Condensed',sans-serif; }
  .nav-link { font-size:14px; font-weight:500; color:rgba(255,255,255,.55); cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color .2s; }
  .nav-link:hover { color:#fff; }
  .prod-card { background:#161616; border:1px solid rgba(255,255,255,.06); padding:28px; transition:all .2s; border-radius:10px; }
  .prod-card:hover { border-color:#a8ff3e; transform:translateY(-2px); }
  .faq-btn { width:100%; background:none; border:none; color:#fff; display:flex; justify-content:space-between; align-items:center; padding:20px 0; cursor:pointer; text-align:left; font-family:'DM Sans',sans-serif; border-bottom:1px solid rgba(255,255,255,.07); gap:16px; }
  .sb-item { display:flex; align-items:center; gap:10px; padding:11px 20px; font-size:13px; cursor:pointer; color:rgba(255,255,255,.4); transition:all .15s; border-left:2px solid transparent; }
  .sb-item:hover { color:#fff; background:rgba(255,255,255,.03); }
  .sb-item.active { color:#a8ff3e; border-left-color:#a8ff3e; background:rgba(168,255,62,.05); }
  .metric { background:#161616; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:18px; }
  .fc-inp { width:100%; padding:13px 16px; border-radius:10px; border:1.5px solid #e5e8ee; font-size:15px; font-family:'DM Sans',sans-serif; color:#1a1a1a; background:#fff; margin-bottom:14px; display:block; outline:none; transition:border-color .15s; }
  .fc-inp:focus { border-color:#1a1a1a; }
  .fc-sel { width:100%; padding:13px 16px; border-radius:10px; border:1.5px solid #e5e8ee; font-size:15px; font-family:'DM Sans',sans-serif; color:#1a1a1a; background:#fff; margin-bottom:14px; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; cursor:pointer; outline:none; }
  .fc-sel:focus { border-color:#1a1a1a; }
  .btn-green { background:#a8ff3e; color:#000; border:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:800; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; }
  .btn-green:hover { background:#c2ff52; transform:translateY(-1px); }
  .btn-dark { background:#1a1a1a; color:#fff; border:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:800; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; }
  .btn-ghost { background:rgba(255,255,255,.06); color:#fff; border:1px solid rgba(255,255,255,.12); padding:13px 28px; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; }
  .btn-ghost:hover { background:rgba(255,255,255,.1); }
  .lang-pill { display:flex; border:1px solid rgba(255,255,255,.15); border-radius:20px; overflow:hidden; }
  .lb { padding:5px 14px; font-size:12px; font-weight:700; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; transition:all .15s; }
  .pill { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  @media (max-width:768px) {
    .hero-grid { grid-template-columns:1fr !important; gap:40px !important; }
    .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
    .how-grid { grid-template-columns:1fr !important; }
    .products-grid { grid-template-columns:1fr !important; }
    .reviews-grid { grid-template-columns:1fr !important; }
    .why-grid { grid-template-columns:1fr !important; gap:40px !important; }
    .dash-wrap { flex-direction:column !important; }
    .sidebar { width:100% !important; display:flex !important; overflow-x:auto !important; padding:8px 0 !important; border-right:none !important; border-bottom:1px solid rgba(255,255,255,.06) !important; }
    .sb-item { border-left:none !important; border-bottom:2px solid transparent !important; white-space:nowrap !important; padding:8px 16px !important; font-size:12px !important; }
    .sb-item.active { border-bottom-color:#a8ff3e !important; border-left-color:transparent !important; }
    .metrics-grid { grid-template-columns:repeat(2,1fr) !important; }
    .nav-desktop { display:none !important; }
    .nav-mobile { display:flex !important; }
    .offer-grid { grid-template-columns:repeat(2,1fr) !important; }
    .admin-wrap { flex-direction:column !important; }
    .admin-side { width:100% !important; display:flex !important; overflow-x:auto !important; }
    .dash-main { padding:16px !important; }
    section { padding-left:5% !important; padding-right:5% !important; }
    .prod-card { padding:20px !important; }
    .offer-card { padding:16px !important; }
    .loan-card { padding:16px !important; }
  }
  @media (max-width:480px) {
    .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
    .metrics-grid { grid-template-columns:1fr 1fr !important; }
    .offer-grid { grid-template-columns:1fr 1fr !important; }
    .hero-btns { flex-direction:column !important; }
    .offer-btns { flex-direction:column !important; }
    .name-row { grid-template-columns:1fr !important; }
    .auth-card { padding:28px 20px !important; }
  }
  .pill.green { background:rgba(168,255,62,.12); color:#a8ff3e; }
  .pill.yellow { background:rgba(245,158,11,.12); color:#f59e0b; }
  .pill.blue { background:rgba(96,165,250,.12); color:#60a5fa; }
  .pill.red { background:rgba(239,68,68,.12); color:#ef4444; }
  .offer-card { background:linear-gradient(135deg,#0d1f0d,#111); border:1px solid rgba(168,255,62,.2); border-radius:16px; padding:22px; margin-bottom:14px; }
  .loan-card { background:#161616; border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:20px; margin-bottom:14px; }
  .progress-bar { height:6px; background:rgba(255,255,255,.08); border-radius:3px; overflow:hidden; margin:10px 0 6px; }
  .progress-fill { height:100%; border-radius:3px; }
  .msg { max-width:75%; padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.5; }
  .msg.advisor { background:#1e1e1e; color:rgba(255,255,255,.8); align-self:flex-start; border-radius:4px 12px 12px 12px; }
  .msg.client { background:#a8ff3e; color:#000; align-self:flex-end; border-radius:12px 4px 12px 12px; font-weight:600; }
  .tbl-row:hover td { background:#f9f8f5; }
  .credit-box { border:2px solid #e5e8ee; border-radius:10px; padding:12px 6px; cursor:pointer; text-align:center; transition:all .15s; }
  .credit-box.sel { border-color:#1a1a1a; background:#1a1a1a; }
  .step-tab { flex:1; height:4px; border-radius:2px; transition:background .3s; }
`;

// ── TRANSLATIONS ─────────────────────────────────────────────────
const T = {
  en: {
    nav: { products:"Products", howItWorks:"How It Works", faq:"FAQ", login:"Log In", apply:"Apply Now →" },
    hero: { badge:"No Hassle. No Calls. Simple Funding.", h1:"The Self-Service", h2:"Funding Platform.", sub:"Submit one application. Receive multiple financing offers. Compare and choose — entirely on your terms. No calls. No pressure. No broker.", cta1:"Get Started — Free →", cta2:"Log In to Dashboard" },
    ticker: ["Track Your Funding Online","Upload Documents Securely","No Phone Calls Required","Monitor Balances & Payments","Request New Financing","Get Status Notifications","Self-Service Platform","Secure & Simple","No Hassle. No Calls."],
    stats: [["10,000+","Businesses"],["$1B+","Managed"],["4.9★","App Rating"],["256-bit","Encrypted"]],
    how: { badge:"How It Works", h:"Manage Everything in One Place", steps:[["01","Create Your Account","Sign up in minutes. No credit check to create an account. Your secure dashboard is ready instantly."],["02","Submit Your Information","Submit your business information and documents through the platform. Your application may be shared with financing partners in our network."],["03","Track & Manage","Financing offers appear directly in your dashboard. Compare options, review all terms clearly, and choose what works best for you — no one chooses for you."]] },
    features: { badge:"Platform Features", h:"Everything You Need in One Dashboard",
      items:[
        {icon:"📊",name:"Balance & Payment Tracking",desc:"Monitor your current funding balances, upcoming payments, and payment history in real time."},
        {icon:"📋",name:"Application Tracking",desc:"Submit financing requests and track their status from submission to decision — no calls needed."},
        {icon:"📁",name:"Secure Document Upload",desc:"Upload bank statements, ID, and other documents directly through the platform. 256-bit encrypted."},
        {icon:"🔔",name:"Status Notifications",desc:"Get notified when your status updates, when a decision is made, or when action is needed."},
        {icon:"🔐",name:"Secure Login",desc:"Email, password, and SMS verification keep your financial information protected at all times."},
        {icon:"💬",name:"In-App Messaging",desc:"Communicate with your account team entirely within the platform. Everything in writing, always."},
      ]
    },
    products: { badge:"Financing Options", h:"Explore Financing Options", items:[{icon:"→",name:"Term Financing",range:"$10K–$500K",term:"3–24 months",desc:"Fixed payment structure for planned investments like expansion, hiring, or equipment."},{icon:"⟳",name:"Revolving Credit",range:"$10K–$5M",term:"Revolving",desc:"Access funds as needed. Draw, repay, and draw again. Only pay for what you use."},{icon:"⚡",name:"Revenue-Based Financing",range:"$5K–$500K",term:"Flexible repayment",desc:"Financing tied to your monthly revenue. Flexible repayment that adjusts with your business."},{icon:"⚙",name:"Equipment Financing",range:"$5K–$2M",term:"Up to 60 months",desc:"Finance business equipment through the platform. Equipment may serve as collateral."}], amount:"Amount", term:"Term" },
    reviews: { badge:"What Business Owners Say", h:"Trusted by Business Owners Across the US", items:[{name:"Marcus T.",biz:"Logistics, Texas",text:"I tracked everything through the dashboard from day one. No phone calls, no chasing anyone. The platform made the whole process simple.",stars:5},{name:"Priya S.",biz:"Med Spa, California",text:"I could see exactly where my request was at every step. Uploaded all my documents in minutes. Total transparency.",stars:5},{name:"Darnell R.",biz:"Construction, Georgia",text:"The self-service experience was exactly what I needed. I managed everything myself, on my own schedule, with no pressure.",stars:5}] },
    faq: { badge:"FAQ", h:"Common Questions", items:[["What is Aprovuit?","Aprovuit is a financing marketplace platform. Business owners submit one application and may receive multiple financing offers from our network of partners — all in one dashboard. Aprovuit is not a lender and does not act as a broker or negotiate on your behalf."],["Does Aprovuit lend money directly?","No. Aprovuit is a technology platform. Financing options available through the platform are provided by third-party financing partners. Aprovuit does not make credit decisions or directly provide loans."],["Is my information secure?","Yes. All data is encrypted with 256-bit SSL. Your documents and personal information are stored securely and never shared without your consent."],["Do I need to talk to anyone on the phone?","Never. Aprovuit is fully self-service. You submit your application, financing offers appear in your dashboard, you compare and choose. No calls, no broker, no one acting on your behalf."],["How do I get started?","Create a free account, fill out your business profile, and submit a financing request through the platform. You can track everything in your dashboard from day one."]] },
    cta: { h:"No Hassle. No Calls. Simple Funding.", sub:"One application. Multiple offers. You choose. No calls. No broker. No pressure.", btn:"Get Started — It's Free →" },
    footer: { rights:"© 2026 Aprovuit. All rights reserved. · aprovuit.com · Aprovuit is a financing marketplace platform. Not a lender or broker. Financing provided by independent partners." },
    apply: {
      noPhone:"No Phone Calls. No Salespeople. Ever.",
      heroH1:"Secure Your", heroH1b:"Business Funding Today",
      heroP:"One application. Multiple offers. You choose. No calls, no broker, no pressure.",
      howMuch:"How much funding do you need?",
      requestedAmt:"Requested Amount",
      getStarted:"Get Started Now →",
      secure:"100% Secure & Confidential",
      creditLabel:"Estimate your credit score",
      creditOpts:[["excellent","Excellent","750+"],["good","Good","680+"],["fair","Fair","580+"],["poor","Poor","<580"]],
      qualifyUp:"You may qualify for up to",
      qualNote:"*Estimate only. Subject to approval.",
      steps:["Funding","Business","Account","Contact"],
      continueBtn:"Continue →", backBtn:"← Back",
      purposeLabel:"What do you need funding for?",
      purposeOpts:["Select...","Working Capital","Equipment Purchase","Business Expansion","Payroll","Inventory","Marketing","Hiring Staff","Debt Refinancing","Other"],
      timelineLabel:"How soon do you need funds?",
      timelineOpts:["Select...","As soon as possible (1–3 days)","Within 1 week","Within 2 weeks","Within 30 days","Just exploring"],
      companyLabel:"Company Name", companyPH:"Your business name",
      industryLabel:"Industry",
      industryOpts:["Select...","Retail","Restaurant / Food Service","Construction","Healthcare","Transportation","Beauty / Salon","Fitness","Automotive","Professional Services","Real Estate","Technology","Manufacturing","Other"],
      yearsLabel:"Years in Business",
      yearsOpts:["Select...","Less than 6 months","6–12 months","1–2 years","2–5 years","5–10 years","10+ years"],
      annualLabel:"Annual Revenue",
      annualOpts:["Select...","Under $120K","$120K–$250K","$250K–$500K","$500K–$1M","$1M–$2.5M","$2.5M–$5M","$5M+"],
      accountH:"Create Your Account",
      accountSub:"Your dashboard to track everything.",
      emailLabel:"Email Address", emailPH:"you@yourbusiness.com",
      passwordLabel:"Create Password", passwordPH:"Min. 8 characters",
      phoneLabel:"Phone Number", phonePH:"(555) 000-0000",
      firstNameLabel:"First Name", lastNameLabel:"Last Name",
      summaryTitle:"Review & Submit",
      summarySub:"Everything look right? Submit to create your account and apply.",
      summaryKeys:["Loan Amount","Purpose","Timeline","Company","Industry","Revenue","Credit","Email","Phone"],
      disclaimer:"By submitting, you create an Aprovuit account and authorize a soft credit inquiry. No impact to your score.",
      submitBtn:"Get My Offer Now →",
      successH:"Application Received!",
      successP:"We've received your application and will be in touch within 2–4 hours. Log in to your dashboard to track everything — no phone call required.",
      loginBtn:"Go to My Dashboard →",
      uploadBtn:"Upload Documents",
      nextTitle:"What happens next:",
      nextSteps:["Application reviewed within 2–4 hours","Personalized offer sent to your email","Review terms and accept — no pressure, no calls"],
      estLabel:"Your estimated pre-qualification",
      estNote:"*Subject to full underwriting and approval",
    },
    login: { h:"Welcome Back", sub:"Log in to your Aprovuit dashboard.", email:"Email Address", password:"Password", btn:"Log In →", forgot:"Forgot password?", noAccount:"No account?", applyLink:"Apply Now", smsH:"Verify Your Identity", smsSub:"Enter the 6-digit code sent to your phone.", verify:"Verify & Continue →", resend:"Resend code" },
    dash: { greeting:"Good morning", snapshot:"Here's your funding snapshot", tabs:["Overview","Offers","Loans","Documents","Messages"], signout:"Sign Out", overview:"Overview", noOffers:"No pending offers", loansEmpty:"No active loans yet", docsTitle:"Your Documents", docsUpload:"Upload Documents", msgAdvisor:"Your Advisor", msgPlaceholder:"Message your advisor...", sendBtn:"Send" },
  },
  es: {
    nav: { products:"Productos", howItWorks:"Cómo Funciona", faq:"Preguntas", login:"Entrar", apply:"Aplicar →" },
    hero: { badge:"Sin Llamadas. Sin Presión. Simple.", h1:"La Plataforma de", h2:"Financiamiento Digital.", sub:"Envía una solicitud. Recibe múltiples ofertas de financiamiento. Compara y elige — completamente en tus términos. Sin llamadas. Sin presión. Sin intermediarios.", cta1:"Comenzar — Gratis →", cta2:"Entrar al Portal" },
    ticker: ["Rastrea tu Financiamiento","Sube Documentos Seguro","Sin Llamadas Telefónicas","Monitorea Saldos y Pagos","Solicita Nuevo Financiamiento","Recibe Notificaciones","Plataforma de Autoservicio","Seguro y Simple","Sin Llamadas. Sin Presión."],
    stats: [["10,000+","Negocios"],["$1B+","Administrado"],["4.9★","Calificación"],["256-bit","Encriptado"]],
    how: { badge:"Cómo Funciona", h:"Administra Todo en Un Solo Lugar", steps:[["01","Crea tu Cuenta","Regístrate en minutos. Sin verificación de crédito para crear la cuenta. Tu portal está listo al instante."],["02","Envía tu Información","Envía la información de tu negocio y documentos a través de la plataforma. Tu solicitud puede ser compartida con socios de financiamiento en nuestra red."],["03","Rastrea y Administra","Las ofertas de financiamiento aparecen directamente en tu portal. Compara opciones, revisa todos los términos claramente y elige lo que más te conviene — nadie elige por ti."]] },
    features: { badge:"Funciones de la Plataforma", h:"Todo lo que Necesitas en un Solo Portal",
      items:[
        {icon:"📊",name:"Seguimiento de Saldos y Pagos",desc:"Monitorea tus saldos actuales, próximos pagos e historial de pagos en tiempo real."},
        {icon:"📋",name:"Seguimiento de Solicitudes",desc:"Envía solicitudes de financiamiento y rastrea su estado desde el envío hasta la decisión."},
        {icon:"📁",name:"Carga Segura de Documentos",desc:"Sube estados de cuenta, ID y otros documentos directamente. Encriptación de 256 bits."},
        {icon:"🔔",name:"Notificaciones de Estado",desc:"Recibe notificaciones cuando tu estado cambie o cuando se requiera acción de tu parte."},
        {icon:"🔐",name:"Acceso Seguro",desc:"Correo, contraseña y verificación por SMS mantienen tu información protegida en todo momento."},
        {icon:"💬",name:"Mensajes en la App",desc:"Comunícate con tu equipo de cuenta dentro de la plataforma. Todo por escrito, siempre."},
      ]
    },
    products: { badge:"Opciones de Financiamiento", h:"Explora Opciones de Financiamiento", items:[{icon:"→",name:"Financiamiento a Plazo",range:"$10K–$500K",term:"3–24 meses",desc:"Estructura de pagos fijos, ideal para inversiones planeadas como expansión, contratación o equipo."},{icon:"⟳",name:"Crédito Revolvente",range:"$10K–$5M",term:"Revolvente",desc:"Accede a fondos cuando los necesites. Retira, paga y vuelve a retirar."},{icon:"⚡",name:"Financiamiento Basado en Ingresos",range:"$5K–$500K",term:"Pago flexible",desc:"Financiamiento vinculado a tus ingresos mensuales. Pagos flexibles que se ajustan a tu negocio."},{icon:"⚙",name:"Financiamiento de Equipo",range:"$5K–$2M",term:"Hasta 60 meses",desc:"Financia equipo empresarial a través de la plataforma. El equipo puede servir como colateral."}], amount:"Monto", term:"Plazo" },
    reviews: { badge:"Lo Que Dicen los Usuarios", h:"Confiado por Dueños de Negocios en Todo EE.UU.", items:[{name:"Marcus T.",biz:"Logística, Texas",text:"Rastreé todo desde el primer día. Sin llamadas, sin perseguir a nadie. La plataforma hizo todo el proceso simple.",stars:5},{name:"Priya S.",biz:"Med Spa, California",text:"Podía ver exactamente dónde estaba mi solicitud en cada paso. Subí mis documentos en minutos. Total transparencia.",stars:5},{name:"Darnell R.",biz:"Construcción, Georgia",text:"La experiencia de autoservicio fue exactamente lo que necesitaba. Administré todo yo mismo, a mi ritmo, sin presión.",stars:5}] },
    faq: { badge:"Preguntas Frecuentes", h:"Preguntas Comunes", items:[["¿Qué es Aprovuit?","Aprovuit es una plataforma de mercado de financiamiento. Los dueños de negocios envían una solicitud y pueden recibir múltiples ofertas de socios de financiamiento — todo en un portal. Aprovuit no es un prestamista y no actúa como corredor ni negocia en tu nombre."],["¿Aprovuit presta dinero directamente?","No. Aprovuit es una plataforma de mercado. Cuando envías una solicitud, puede ser compartida con socios de financiamiento en nuestra red. Esos socios revisan tu información de forma independiente y pueden enviar ofertas. Aprovuit no toma decisiones de crédito, negocia términos ni actúa en tu nombre."],["¿Está segura mi información?","Sí. Todos los datos están encriptados con SSL de 256 bits. Tus documentos e información personal se almacenan de forma segura."],["¿Necesito hablar con alguien por teléfono?","Nunca. Aprovuit es completamente de autoservicio. Envías tu solicitud, las ofertas de financiamiento aparecen en tu portal, comparas y eliges. Sin llamadas, sin corredor, sin que nadie actúe en tu nombre."],["¿Cómo empiezo?","Crea una cuenta gratuita, completa tu perfil empresarial y envía una solicitud de financiamiento a través de la plataforma."]] },
    cta: { h:"Sin Llamadas. Sin Presión. Simple.", sub:"Una solicitud. Múltiples ofertas. Tú decides. Sin llamadas. Sin intermediarios. Sin presión.", btn:"Comenzar — Es Gratis →" },
    footer: { rights:"© 2026 Aprovuit. Todos los derechos reservados. · aprovuit.com · Aprovuit es una plataforma de mercado. No es un prestamista ni corredor. Financiamiento provisto por socios independientes." },
    apply: {
      noPhone:"Sin Vendedores. Sin Llamadas.",
      heroH1:"Asegura el", heroH1b:"Financiamiento de tu Negocio Hoy",
      heroP:"Una solicitud. Múltiples ofertas. Tú decides. Sin llamadas, sin intermediarios, sin presión.",
      howMuch:"¿Cuánto financiamiento necesitas?",
      requestedAmt:"Monto Solicitado",
      getStarted:"Comenzar Ahora →",
      secure:"100% Seguro y Confidencial",
      creditLabel:"Estima tu puntaje de crédito",
      creditOpts:[["excellent","Excelente","750+"],["good","Bueno","680+"],["fair","Regular","580+"],["poor","Bajo","<580"]],
      qualifyUp:"Podrías calificar para hasta",
      qualNote:"*Solo estimado. Sujeto a aprobación.",
      steps:["Fondos","Negocio","Cuenta","Contacto"],
      continueBtn:"Continuar →", backBtn:"← Atrás",
      purposeLabel:"¿Para qué necesitas el dinero?",
      purposeOpts:["Selecciona...","Capital de Trabajo","Equipo","Expansión","Nómina","Inventario","Marketing","Contratar Personal","Refinanciamiento","Otro"],
      timelineLabel:"¿Cuándo necesitas los fondos?",
      timelineOpts:["Selecciona...","Lo antes posible (1–3 días)","En 1 semana","En 2 semanas","En 30 días","Solo explorando"],
      companyLabel:"Nombre de la Empresa", companyPH:"Nombre de tu negocio",
      industryLabel:"Industria",
      industryOpts:["Selecciona...","Retail","Restaurante","Construcción","Salud","Transporte","Belleza / Salón","Fitness","Automotriz","Servicios Profesionales","Bienes Raíces","Tecnología","Manufactura","Otro"],
      yearsLabel:"Años en Operación",
      yearsOpts:["Selecciona...","Menos de 6 meses","6–12 meses","1–2 años","2–5 años","5–10 años","10+ años"],
      annualLabel:"Ingresos Anuales",
      annualOpts:["Selecciona...","Menos de $120K","$120K–$250K","$250K–$500K","$500K–$1M","$1M–$2.5M","$2.5M–$5M","$5M+"],
      accountH:"Crea Tu Cuenta",
      accountSub:"Tu portal para rastrear todo.",
      emailLabel:"Correo Electrónico", emailPH:"tu@negocio.com",
      passwordLabel:"Crea tu Contraseña", passwordPH:"Mín. 8 caracteres",
      phoneLabel:"Número de Teléfono", phonePH:"(555) 000-0000",
      firstNameLabel:"Nombre", lastNameLabel:"Apellido",
      summaryTitle:"Revisar y Enviar",
      summarySub:"¿Todo bien? Envía para crear tu cuenta y aplicar.",
      summaryKeys:["Monto","Propósito","Plazo","Empresa","Industria","Ingresos","Crédito","Correo","Teléfono"],
      disclaimer:"Al enviar, creas una cuenta en Aprovuit y autorizas una consulta suave de crédito. Sin impacto en tu puntaje.",
      submitBtn:"Obtener Mi Oferta Ahora →",
      successH:"¡Solicitud Recibida!",
      successP:"Recibimos tu solicitud y estaremos en contacto en 2–4 horas. Entra a tu portal para rastrear todo — sin llamadas.",
      loginBtn:"Ir a Mi Portal →",
      uploadBtn:"Subir Documentos",
      nextTitle:"¿Qué pasa ahora?",
      nextSteps:["Solicitud revisada en 2–4 horas","Oferta personalizada enviada a tu correo","Revisas los términos y aceptas — sin presión, sin llamadas"],
      estLabel:"Tu pre-calificación estimada",
      estNote:"*Sujeto a revisión y aprobación completa",
    },
    login: { h:"Bienvenido", sub:"Entra a tu portal de Aprovuit.", email:"Correo Electrónico", password:"Contraseña", btn:"Entrar →", forgot:"¿Olvidaste tu contraseña?", noAccount:"¿No tienes cuenta?", applyLink:"Aplicar Ahora", smsH:"Verifica tu Identidad", smsSub:"Ingresa el código de 6 dígitos enviado a tu teléfono.", verify:"Verificar y Continuar →", resend:"Reenviar código" },
    dash: { greeting:"Buenos días", snapshot:"Tu resumen de financiamiento", tabs:["Resumen","Ofertas","Préstamos","Documentos","Mensajes"], signout:"Salir", overview:"Resumen", noOffers:"Sin ofertas pendientes", loansEmpty:"Sin préstamos activos aún", docsTitle:"Tus Documentos", docsUpload:"Subir Documentos", msgAdvisor:"Tu Asesor", msgPlaceholder:"Escribe a tu asesor...", sendBtn:"Enviar" },
  }
};

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
          <div><div style={{ fontSize:20, marginBottom:4 }}>✅</div><p style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>{file.name}</p></div>
        ) : (
          <div><div style={{ fontSize:24, marginBottom:6, color:"#ccc" }}>📄</div><p style={{ fontSize:12, fontWeight:700, color:"#555", marginBottom:2 }}>{label}</p><p style={{ fontSize:11, color:"#aaa" }}>{t.formats}</p></div>
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
        <div style={{ width:80, height:80, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:36 }}>✓</div>
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
          <span style={{ fontSize:12, color:G, fontWeight:700 }}>🔒 {t.secure}</span>
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
            <span style={{ fontSize:22 }}>🏦</span>
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
            <span style={{ fontSize:22 }}>📋</span>
            <div style={{ flex:1 }}><h3 style={{ fontSize:16, fontWeight:800, color:"#1a1a1a" }}>{t.voidedTitle}</h3><p style={{ fontSize:13, color:"#888" }}>{t.voidedSub}</p></div>
            <span style={{ fontSize:11, fontWeight:700, color:"#ef4444", background:"#fef2f2", padding:"3px 10px", borderRadius:20 }}>{t.required}</span>
          </div>
          <FileZone fileKey="voided" label={t.voidedTitle} sublabel="JPG/PNG/PDF" />
        </div>
        <button onClick={handleSubmit} disabled={uploading} style={{ width:"100%", background:uploading?"#ccc":G, color:"#000", border:"none", padding:18, borderRadius:12, fontSize:16, fontWeight:900, cursor:uploading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          {uploading ? t.uploading : t.uploadBtn}
        </button>
        <p style={{ textAlign:"center", fontSize:13, color:"#888", marginTop:12 }}>🔒 {t.secure}</p>
      </div>
    </div>
  );
}


function ApplyPage({ lang, onBack, onSuccess, onUpload }) {
  const t = T[lang].apply;
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loanAmt, setLoanAmt] = useState(150000);
  const [creditSel, setCreditSel] = useState("good");
  const [savedAppId, setSavedAppId] = useState(null);
  const [form, setForm] = useState({
    purpose:"", timeline:"", company:"", industry:"",
    years:"", annualRev:"", creditRating:"good",
    firstName:"", lastName:"", email:"", phone:""
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const [errors, setErrors] = useState({});

  const validateStep2 = () => {
    const e = {};
    if (!form.company.trim()) e.company = lang==="en" ? "Company name is required" : "El nombre de la empresa es requerido";
    if (Object.keys(e).length > 0) { setErrors(e); return false; }
    setErrors({});
    return true;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = lang==="en" ? "First name is required" : "El nombre es requerido";
    if (!form.lastName.trim()) e.lastName = lang==="en" ? "Last name is required" : "El apellido es requerido";
    if (!form.email.trim()) e.email = lang==="en" ? "Email is required" : "El correo es requerido";
    if (!form.phone.trim()) e.phone = lang==="en" ? "Phone number is required" : "El teléfono es requerido";
    if (Object.keys(e).length > 0) { setErrors(e); return false; }
    setErrors({});
    return true;
  };

  const qualAmt = () => {
    const base = loanAmt;
    if (creditSel==="excellent") return Math.min(Math.round(base*1.3),2000000);
    if (creditSel==="good") return Math.min(Math.round(base*1.1),1500000);
    if (creditSel==="fair") return Math.min(Math.round(base*0.85),800000);
    return Math.min(Math.round(base*0.6),400000);
  };

  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    setSending(true);
    const appData = {
      id: `APP-${Date.now()}`,
      submittedAt: new Date().toLocaleString(),
      status: "Under Review",
      loanAmt: fmtAmt(loanAmt),
      ...form,
      estimatedQualify: fmtAmt(qualAmt()),
    };
    const apps = JSON.parse(localStorage.getItem("aprovuit_apps")||"[]");
    apps.push(appData);
    localStorage.setItem("aprovuit_apps", JSON.stringify(apps));
    await sendApplicationEmail(appData);
    await sendClientEmail(appData);
    setSending(false);
    setSubmitted(true);
  };

  const APPLY_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; background:#f5f7fa; }
    input[type=range] { -webkit-appearance:none; width:100%; height:8px; background:#e5e8ee; border-radius:4px; outline:none; cursor:pointer; margin:16px 0 8px; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:28px; height:28px; background:#a8ff3e; border:3px solid #fff; border-radius:50%; box-shadow:0 2px 8px rgba(0,0,0,0.2); cursor:pointer; }
    .fc-sel { width:100%; padding:13px 16px; border-radius:10px; border:1.5px solid #e5e8ee; font-size:15px; font-family:'DM Sans',sans-serif; color:#1a1a1a; background:#fff; margin-bottom:16px; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; cursor:pointer; }
    .fc-inp { width:100%; padding:13px 16px; border-radius:10px; border:1.5px solid #e5e8ee; font-size:15px; font-family:'DM Sans',sans-serif; color:#1a1a1a; background:#fff; margin-bottom:16px; display:block; }
    .fc-sel:focus, .fc-inp:focus { outline:none; border-color:#a8ff3e; box-shadow:0 0 0 3px rgba(168,255,62,0.15); }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fadeup { animation:fadeUp 0.35s ease both; }
  `;

  const lbl = { fontSize:12, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8, display:"block" };
  const card = { background:"#fff", borderRadius:18, padding:"32px 28px", maxWidth:560, margin:"0 auto", boxShadow:"0 8px 40px rgba(0,0,0,0.18)" };
  const btnPrimary = { width:"100%", background:G, color:"#000", border:"none", padding:"18px", borderRadius:12, fontSize:17, fontWeight:900, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:4, transition:"all 0.15s" };
  const btnDark = { width:"100%", background:"#1a1a1a", color:"#fff", border:"none", padding:"16px", borderRadius:12, fontSize:16, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:4 };
  const btnBack = { background:"#f2f2f7", color:"#555", border:"none", padding:"12px 20px", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:10 };

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0a0a,#0d1a0d)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{APPLY_CSS}</style>
      <div style={{ ...card, textAlign:"center", maxWidth:520 }} className="fadeup">
        <div style={{ width:88, height:88, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:40, color:"#16a34a", fontWeight:900 }}>✓</div>
        <h2 style={{ fontSize:28, fontWeight:900, color:"#1a1a1a", marginBottom:12, fontFamily:"'Barlow Condensed',sans-serif", textTransform:"uppercase" }}>Application Received!</h2>
        <p style={{ fontSize:15, color:"#666", lineHeight:1.75, marginBottom:24 }}>Your account has been created and your application has been submitted. Financing offers may appear in your dashboard as partners review your information. No calls, no broker — you choose.</p>
        <div style={{ background:"#1a1a1a", borderRadius:14, padding:"18px 20px", textAlign:"left", marginBottom:20 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Your estimated pre-qualification</p>
          <p style={{ fontSize:40, fontWeight:900, color:G, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-0.5px" }}>{fmtAmt(qualAmt())}</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>*Subject to full underwriting and approval</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button
            onClick={()=> onSuccess && onSuccess(form.email, form.firstName, form.company, savedAppId)}
            style={{ width:"100%", background:G, color:"#000", border:"none", padding:"15px", borderRadius:12, fontSize:16, fontWeight:900, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          >
            {lang==="en"?"Go to My Dashboard →":"Ir a Mi Portal →"}
          </button>
          <button
            onClick={()=> onUpload && onUpload(savedAppId)}
            style={{ width:"100%", background:"#f2f2f7", color:"#1a1a1a", border:"none", padding:"13px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          >
            📎 {lang==="en"?"Upload Documents First":"Subir Documentos Primero"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa" }}>
      <style>{APPLY_CSS}</style>

      {/* NAV */}
      <div style={{ background:"rgba(10,10,10,0.97)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"0 5%", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:G, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:14, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
          </div>
          <span style={{ fontSize:20, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(168,255,62,0.08)", border:`1px solid ${G}30`, padding:"5px 14px", borderRadius:20 }}>
          <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
          <span style={{ fontSize:12, color:G, fontWeight:700 }}>📵 {t.noPhone}</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <div style={{ background:"linear-gradient(135deg,#0a0a0a 0%,#0d1f0d 100%)", padding:"48px 24px 64px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(168,255,62,0.1)", border:`1px solid ${G}25`, padding:"5px 16px", borderRadius:20, marginBottom:20 }}>
          <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
          <span style={{ fontSize:11, color:G, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Free · No Commitment · {t.noPhone}</span>
        </div>
        <h1 style={{ fontSize:"clamp(28px,6vw,48px)", fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:12, letterSpacing:"-0.02em" }}>
          {t.heroH1} <span style={{ color:G }}>{t.heroH1b}</span>
        </h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.7 }}>{t.heroP}</p>

        {/* MAIN FORM CARD */}
        {step===0 && (
          <div style={card} className="fadeup">
            <h2 style={{ fontSize:20, fontWeight:800, color:"#1a1a1a", marginBottom:6, textAlign:"center" }}>{t.howMuch}</h2>
            <p style={{ fontSize:13, color:"#888", textAlign:"center", marginBottom:24 }}>Use the slider below</p>

            {/* Amount display */}
            <div style={{ textAlign:"center", marginBottom:4 }}>
              <div style={{ fontSize:52, fontWeight:900, color:"#1a1a1a", letterSpacing:"-2px", lineHeight:1 }}>{fmtAmt(loanAmt)}</div>
              <div style={{ fontSize:13, color:"#888", marginTop:6 }}>{t.requestedAmt}</div>
            </div>

            <input type="range" min={10000} max={2000000} step={5000} value={loanAmt}
              onChange={e=>setLoanAmt(Number(e.target.value))} />
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28 }}>
              <span style={{ fontSize:12, color:"#aaa" }}>$10K</span>
              <span style={{ fontSize:12, color:"#aaa" }}>$2M+</span>
            </div>

            {/* Credit score */}
            <span style={lbl}>{t.creditLabel}</span>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:24 }}>
              {t.creditOpts.map(([val,label,range])=>(
                <div key={val} onClick={()=>setCreditSel(val)} style={{ border:`2px solid ${creditSel===val?"#1a1a1a":"#e5e8ee"}`, borderRadius:10, padding:"12px 4px", cursor:"pointer", textAlign:"center", background:creditSel===val?"#1a1a1a":"#fff", transition:"all 0.15s" }}>
                  <p style={{ fontSize:12, fontWeight:800, color:creditSel===val?"#fff":"#1a1a1a", marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:10, color:creditSel===val?"rgba(255,255,255,0.5)":"#aaa" }}>{range}</p>
                </div>
              ))}
            </div>

            {/* Qualify result */}
            <div style={{ background:"linear-gradient(135deg,#0a0a0a,#111)", borderRadius:14, padding:"22px 24px", marginBottom:24, textAlign:"center" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>{t.qualifyUp}</p>
              <p style={{ fontSize:44, fontWeight:900, color:G, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-1px", lineHeight:1 }}>{fmtAmt(qualAmt())}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:8 }}>{t.qualNote}</p>
            </div>

            <button onClick={()=>setStep(1)} style={btnPrimary}>{t.getStarted}</button>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:14 }}>
              <div style={{ width:14, height:14, background:"#22c55e", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:8, flexShrink:0 }}>✓</div>
              <span style={{ fontSize:13, color:"#888" }}>{t.secure}</span>
            </div>
          </div>
        )}

        {/* STEPS 1–4 */}
        {step>0 && (
          <div style={{ maxWidth:560, margin:"0 auto" }} className="fadeup">
            {/* Progress */}
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24 }}>
              {t.steps.map((s,i)=>(
                <div key={s} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{ width:36, height:4, borderRadius:2, background:i<step?G:i===step?"#fff":"rgba(255,255,255,0.2)", transition:"all 0.3s" }}></div>
                  <span style={{ fontSize:10, color:i<=step?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.25)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={card}>
              {step===1 && <>
                <h2 style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", marginBottom:4 }}>{t.steps[0]}</h2>
                <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>Tell us what you need.</p>
                <span style={lbl}>{t.purposeLabel}</span>
                <select className="fc-sel" value={form.purpose} onChange={e=>set("purpose",e.target.value)}>
                  {t.purposeOpts.map(o=><option key={o}>{o}</option>)}
                </select>
                <span style={lbl}>{t.timelineLabel}</span>
                <select className="fc-sel" value={form.timeline} onChange={e=>set("timeline",e.target.value)}>
                  {t.timelineOpts.map(o=><option key={o}>{o}</option>)}
                </select>
                <button onClick={()=>setStep(2)} style={btnDark}>{t.continueBtn}</button>
                <div><button onClick={()=>setStep(0)} style={btnBack}>{t.backBtn}</button></div>
              </>}

              {step===2 && <>
                <h2 style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", marginBottom:4 }}>{t.steps[1]}</h2>
                <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>Tell us about your business.</p>
                <span style={lbl}>{t.companyLabel} <span style={{color:"#ef4444"}}>*</span></span>
                <input className="fc-inp" placeholder={t.companyPH} value={form.company} onChange={e=>{set("company",e.target.value);setErrors(p=>({...p,company:""}));}} style={errors.company?{borderColor:"#ef4444",marginBottom:4}:{}} />
                {errors.company && <p style={{fontSize:12,color:"#ef4444",marginBottom:12}}>{errors.company}</p>}
                <span style={lbl}>{t.industryLabel}</span>
                <select className="fc-sel" value={form.industry} onChange={e=>set("industry",e.target.value)}>
                  {t.industryOpts.map(o=><option key={o}>{o}</option>)}
                </select>
                <span style={lbl}>{t.yearsLabel}</span>
                <select className="fc-sel" value={form.years} onChange={e=>set("years",e.target.value)}>
                  {t.yearsOpts.map(o=><option key={o}>{o}</option>)}
                </select>
                <span style={lbl}>{t.annualLabel}</span>
                <select className="fc-sel" value={form.annualRev} onChange={e=>set("annualRev",e.target.value)}>
                  {t.annualOpts.map(o=><option key={o}>{o}</option>)}
                </select>
                <span style={lbl}>{t.creditEstLabel}</span>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
                  {t.creditOpts.map(([val,label,range])=>(
                    <div key={val} onClick={()=>set("creditRating",val)} style={{ border:`2px solid ${form.creditRating===val?"#1a1a1a":"#e5e8ee"}`, borderRadius:10, padding:"10px 4px", cursor:"pointer", textAlign:"center", background:form.creditRating===val?"#1a1a1a":"#fff", transition:"all 0.15s" }}>
                      <p style={{ fontSize:11, fontWeight:800, color:form.creditRating===val?"#fff":"#1a1a1a", marginBottom:2 }}>{label}</p>
                      <p style={{ fontSize:10, color:form.creditRating===val?"rgba(255,255,255,0.5)":"#aaa" }}>{range}</p>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{ if(validateStep2()) setStep(3); }} style={btnDark}>{t.continueBtn}</button>
                <div><button onClick={()=>setStep(1)} style={btnBack}>{t.backBtn}</button></div>
              </>}

              {step===3 && <>
                <h2 style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", marginBottom:4 }}>{t.steps[2]}</h2>
                <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>Almost done — your offer comes here.</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,display:"block"}}>{t.firstNameLabel} <span style={{color:"#ef4444"}}>*</span></label>
                    <input className="fc-inp" placeholder={t.firstNameLabel} value={form.firstName} onChange={e=>{set("firstName",e.target.value);setErrors(p=>({...p,firstName:""}));}} style={errors.firstName?{borderColor:"#ef4444",marginBottom:4}:{}} />
                    {errors.firstName && <p style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <label style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,display:"block"}}>{t.lastNameLabel} <span style={{color:"#ef4444"}}>*</span></label>
                    <input className="fc-inp" placeholder={t.lastNameLabel} value={form.lastName} onChange={e=>{set("lastName",e.target.value);setErrors(p=>({...p,lastName:""}));}} style={errors.lastName?{borderColor:"#ef4444",marginBottom:4}:{}} />
                    {errors.lastName && <p style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errors.lastName}</p>}
                  </div>
                </div>
                <label style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,display:"block"}}>{t.emailLabel} <span style={{color:"#ef4444"}}>*</span></label>
                <input className="fc-inp" type="email" placeholder={t.emailPH} value={form.email} onChange={e=>{set("email",e.target.value);setErrors(p=>({...p,email:""}));}} style={errors.email?{borderColor:"#ef4444",marginBottom:4}:{}} />
                {errors.email && <p style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errors.email}</p>}
                <label style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,display:"block"}}>{t.phoneLabel} <span style={{color:"#ef4444"}}>*</span></label>
                <input className="fc-inp" type="tel" placeholder={t.phonePH} value={form.phone} onChange={e=>{set("phone",e.target.value);setErrors(p=>({...p,phone:""}));}} style={errors.phone?{borderColor:"#ef4444",marginBottom:4}:{}} />
                {errors.phone && <p style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errors.phone}</p>}
                <button onClick={()=>{ if(validateStep3()) setStep(4); }} style={btnDark}>{t.continueBtn}</button>
                <div><button onClick={()=>setStep(2)} style={btnBack}>{t.backBtn}</button></div>
              </>}

              {step===4 && <>
                <h2 style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", marginBottom:4 }}>{t.reviewTitle}</h2>
                <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>{t.reviewSub}</p>
                <div style={{ background:"#f9fafb", borderRadius:12, padding:"16px 18px", marginBottom:16 }}>
                  {t.summaryKeys.map((k,i)=>{
                    const vals=[fmtAmt(loanAmt),form.purpose,form.timeline,form.company,form.industry,form.annualRev,form.creditRating,(form.firstName+" "+form.lastName).trim(),form.email,form.phone];
                    return <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"0.5px solid #eee" }}><span style={{ fontSize:13, color:"#888" }}>{k}</span><span style={{ fontSize:13, fontWeight:700, color:"#1a1a1a" }}>{vals[i]||"—"}</span></div>;
                  })}
                </div>
                <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"12px 14px", marginBottom:18 }}>
                  <p style={{ fontSize:12, color:"#166534", lineHeight:1.6 }}>🔒 {t.disclaimer}</p>
                </div>
                <button onClick={handleSubmit} style={btnPrimary}>{t.submitBtn}</button>
                <div><button onClick={()=>setStep(3)} style={btnBack}>{t.backBtn}</button></div>
              </>}
            </div>
          </div>
        )}

        {/* Trust stats */}
        {step===0 && (
          <div style={{ display:"flex", justifyContent:"center", gap:32, marginTop:36, flexWrap:"wrap" }}>
            {[["$750M+","Funded"],["8,200+","Businesses Helped"],["4.9★","Google Rating"],["2 hrs","Avg Decision"]].map(([v,l],i)=>(
              <React.Fragment key={l}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#fff", letterSpacing:"-0.5px" }}>{v}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:3, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</div>
                </div>
                {i<3 && <div style={{ width:1, background:"rgba(255,255,255,0.12)", alignSelf:"stretch" }}></div>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
MAIN APP
══════════════════════════════════════════════════════════════════ */

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
            <div style={{ width:60, height:60, background:"#f0fdf4", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:24 }}>🔐</div>
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
              <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:4 }}>{t.greeting}, {user.firstName} 👋</h2>
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
                      <div style={{ width:32, height:32, borderRadius:"50%", background:i<=1?G:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:i<=1?"#000":"rgba(255,255,255,.3)" }}>{i<=1?"✓":(i+1)}</div>
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
                <div style={{ fontSize:40, marginBottom:16 }}>📭</div>
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
                  <button onClick={()=>acceptOffer(offer.id)} style={{ flex:1, background:G, color:"#000", border:"none", padding:13, borderRadius:10, fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Accept Offer ✓</button>
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
                    <span className={`pill ${offer.status==="accepted"?"green":"red"}`}>{offer.status==="accepted"?"Accepted ✓":"Declined"}</span>
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
              <div style={{ fontSize:40, marginBottom:16 }}>💳</div>
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
              {[["Bank Statements","Last 6 months","📄"],["Driver's License","Government-issued ID","🪪"],["Voided Check","Business checking account","📋"]].map(([name,desc,icon])=>(
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
            <button onClick={()=>onUpload(user.appId)} style={{ width:"100%", background:G, color:"#000", border:"none", padding:16, borderRadius:12, fontSize:15, fontWeight:900, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>📎 {t.docsUpload}</button>
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
                <p style={{ fontSize:12, color:G, fontWeight:600 }}>● Online · {t.msgAdvisor}</p>
              </div>
              <div style={{ background:"rgba(239,68,68,.1)", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:700, color:"#ef4444" }}>📵 No Calls</div>
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
            {sent && <div style={{ background:"#dcfce7", border:"1px solid #bbf7d0", borderRadius:10, padding:"12px 16px", marginBottom:20 }}><p style={{ fontSize:14, fontWeight:700, color:"#16a34a" }}>✓ Offer sent! Merchant can see it in their dashboard.</p></div>}
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
        <button onClick={onApply} style={{ background:"#a8ff3e", color:"#000", border:"none", padding:"9px 20px", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Aplicar →":"Apply Now →"}</button>
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
                <button onClick={onApply} style={{ background:p.color, color:"#000", border:"none", padding:"13px 32px", borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Aplicar Ahora →":"Apply Now →"}</button>
              </div>
              <div>
                <div style={{ marginBottom:24 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>{lang==="es"?"Mejor para":"Best For"}</p>
                  {p.best.map(b=>(
                    <div key={b} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <div style={{ width:20, height:20, background:`${p.color}20`, border:`1px solid ${p.color}50`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ fontSize:9, color:p.color, fontWeight:800 }}>✓</span>
                      </div>
                      <span style={{ fontSize:14, color:"rgba(255,255,255,.65)" }}>{b}</span>
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
    { n:"01", title:"Completa tu Solicitud", time:"5 minutos", icon:"📋",
      desc:"Llena nuestra solicitud inteligente en línea. Sin entrevistas telefónicas. Sin papeleo. Solo información básica sobre tu negocio y lo que necesitas.", details:["Información básica del negocio","Monto de financiamiento deseado","Propósito de los fondos","Sube 3-6 meses de estados bancarios"] },
    { n:"02", title:"Crea Tu Cuenta", time:"30 segundos", icon:"👤",
      desc:"Crea tu cuenta segura de Aprovuit. Aquí rastrearás todo — tu solicitud, ofertas, documentos y mensajes con tu asesor.", details:["Correo electrónico y contraseña","Verificación de identidad por SMS","Portal personal con dashboard en tiempo real","Sin instalación de app requerida"] },
    { n:"03", title:"Revisión de Solicitud", time:"2-4 horas", icon:"🔍",
      desc:"Nuestro equipo revisa tu solicitud. Evaluamos ingresos, historial crediticio y la salud general de tu negocio. Sin llamadas telefónicas de nuestra parte.", details:["Consulta suave de crédito (sin impacto)","Análisis de estados bancarios","Evaluación de ingresos mensuales","Comunicación 100% por escrito"] },
    { n:"04", title:"Recibe tu Oferta", time:"En tu dashboard", icon:"💼",
      desc:"Tu oferta personalizada aparece directamente en tu portal y en tu correo. Cada término es transparente — monto, tasa, pagos mensuales, todo claro antes de aceptar.", details:["Monto aprobado","Tasa de interés o factor","Calendario de pagos","Fecha estimada de fondeo"] },
    { n:"05", title:"Acepta y Recibe Fondos", time:"Mismo día", icon:"🚀",
      desc:"Acepta tu oferta con un clic. Sin presión. Sin llamadas. Si aceptas antes de las 3pm EST, los fondos llegan el mismo día hábil.", details:["Acepta o rechaza con un clic","Sin presión de vendedores","Fondos via transferencia ACH","Confirmación inmediata por correo"] },
    { n:"06", title:"Administra tu Financiamiento", time:"En cualquier momento", icon:"📊",
      desc:"Rastrea tu saldo, pagos y renovaciones directamente en tu portal. Cuando seas elegible para renovación, aparece en tu dashboard — sin llamadas frías.", details:["Balance en tiempo real","Historial de pagos","Elegibilidad de renovación automática","Soporte por mensaje directo"] },
  ] : [
    { n:"01", title:"Complete Your Application", time:"5 minutes", icon:"📋",
      desc:"Fill out our smart online application. No phone interviews. No paperwork. Just basic information about your business and what you need.", details:["Basic business information","Desired funding amount","Purpose of funds","Upload 3-6 months of bank statements"] },
    { n:"02", title:"Create Your Account", time:"30 seconds", icon:"👤",
      desc:"Create your secure Aprovuit account. This is where you'll track everything — your application, offers, documents, and messages with your advisor.", details:["Email and password","SMS identity verification","Personal dashboard with real-time tracking","No app download required"] },
    { n:"03", title:"Application Review", time:"2-4 hours", icon:"🔍",
      desc:"Our team reviews your application. We evaluate your revenue, credit history, and overall business health. No phone calls from our side — ever.", details:["Soft credit pull (zero impact to score)","Bank statement analysis","Monthly revenue evaluation","100% written communication"] },
    { n:"04", title:"Receive Your Offer", time:"In your dashboard", icon:"💼",
      desc:"Your personalized offer appears directly in your portal and via email. Every term is transparent — amount, rate, monthly payments, all clear before you accept.", details:["Approved amount","Interest rate or factor rate","Payment schedule","Estimated funding date"] },
    { n:"05", title:"Accept & Get Funded", time:"Same day", icon:"🚀",
      desc:"Accept your offer with one click. No pressure. No phone calls. Accept before 3pm EST and funds arrive the same business day.", details:["Accept or decline with one click","No salesperson pressure","Funds via ACH transfer","Immediate email confirmation"] },
    { n:"06", title:"Manage Your Funding", time:"Anytime", icon:"📊",
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
          <p style={{ fontSize:17, color:"rgba(255,255,255,.5)", maxWidth:520, margin:"0 auto", lineHeight:1.75 }}>{lang==="es"?"De la solicitud a los fondos — sin llamadas, sin vendedores, sin sorpresas.":"From application to funded — no calls, no salespeople, no surprises."}</p>
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
          <button onClick={onApply} style={{ background:"#000", color:G, border:"none", padding:"14px 40px", borderRadius:10, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Aplicar Ahora →":"Apply Now →"}</button>
        </div>
      </div>
    </div>
  );
}

// ── FAQ PAGE ──────────────────────────────────────────────────────
function FAQPage({ lang, onBack, onApply, onProducts, onHowItWorks, onFaq }) {
  const [open, setOpen] = useState(null);
  const categories = lang==="es" ? [
    { cat:"Elegibilidad", items:[
      ["¿Cuáles son los requisitos mínimos?","Para calificar necesitas: 6+ meses en operación, $10,000+ en ingresos mensuales, y un puntaje de crédito de 580+. Evaluamos la salud completa de tu negocio, no solo tu puntaje de crédito."],
      ["¿Mi puntaje de crédito afecta la aprobación?","El crédito es un factor, pero no el único. Evaluamos ingresos, tiempo en operación, flujo de caja y tipo de negocio. Muchos clientes con crédito de 580-620 son aprobados."],
      ["¿Qué tipos de negocios califican?","La mayoría de negocios legítimos califican — retail, restaurantes, construcción, salud, transporte, servicios profesionales, y más. Negocios que no califican incluyen casinos, negocios ilegales y algunas industrias restringidas."],
      ["¿Cuánto tiempo necesito en operación?","Generalmente 6 meses mínimo para la mayoría de productos. Algunos adelantos de ingresos requieren solo 3 meses."],
    ]},
    { cat:"Proceso y Tiempos", items:[
      ["¿Cuánto tiempo toma la aprobación?","La mayoría de decisiones llegan en 2–4 horas durante horario comercial. Casos más complejos pueden tomar hasta 24 horas."],
      ["¿Cuándo recibiré los fondos?","Si aceptas tu oferta antes de las 3pm EST en un día hábil, los fondos generalmente llegan el mismo día. Aceptaciones después de las 3pm llegan el siguiente día hábil."],
      ["¿Necesito hablar por teléfono?","Nunca. Todo el proceso ocurre en tu portal — solicitud, revisión, ofertas, mensajes y renovaciones. Sin llamadas requeridas."],
      ["¿Qué documentos necesito?","Básicamente: información del negocio, 3-6 meses de estados de cuenta bancarios, licencia de conducir y un cheque anulado. Todo se sube directamente en el portal."],
    ]},
    { cat:"Crédito y Tasas", items:[
      ["¿Aplicar afectará mi puntaje de crédito?","No. Nuestra revisión inicial usa una consulta suave — cero impacto en tu puntaje. Solo si aceptas una oferta se realiza una consulta dura."],
      ["¿Cuáles son las tasas de interés?","Las tasas varían según el producto, monto, término e historial crediticio. Verás todos los términos claramente en tu oferta antes de aceptar — sin sorpresas."],
      ["¿Hay cargos por prepago?","Depende del producto. Los préstamos a plazo generalmente no tienen penalidades por prepago. Los adelantos de ingresos y líneas de crédito tienen estructuras diferentes. Todo se especifica en tu oferta."],
    ]},
    { cat:"Tu Portal y Cuenta", items:[
      ["¿Cómo accedo a mi portal?","En aprovuit.com haz clic en 'Entrar'. Usa el correo y contraseña que creaste al aplicar. Hay verificación por SMS por seguridad."],
      ["¿Puedo rastrear mi solicitud en tiempo real?","Sí. Tu portal muestra exactamente en qué etapa está tu solicitud — Aplicado, En Revisión, Aprobado, Oferta Enviada, Fondos Recibidos."],
      ["¿Cómo me comunico con mi asesor?","Directamente en tu portal en la sección de Mensajes. Sin llamadas — todo por escrito para que tengas un registro de todo."],
      ["¿Qué pasa cuando soy elegible para renovación?","Aparece automáticamente en tu portal. Sin llamadas frías. Sin vendedores. Simplemente aparece cuando estás listo."],
    ]},
  ] : [
    { cat:"Eligibility", items:[
      ["What are the minimum requirements?","To qualify you need: 6+ months in business, $10,000+ in monthly revenue, and a 580+ credit score. We evaluate your full business health, not just your credit score."],
      ["Does my credit score affect approval?","Credit is a factor, but not the only one. We evaluate revenue, time in business, cash flow, and business type. Many clients with 580-620 credit are approved."],
      ["What types of businesses qualify?","Most legitimate businesses qualify — retail, restaurants, construction, healthcare, transportation, professional services, and more. Businesses that don't qualify include casinos, illegal businesses, and some restricted industries."],
      ["How long do I need to be in business?","Generally 6 months minimum for most products. Some revenue advances require only 3 months."],
    ]},
    { cat:"Process & Timing", items:[
      ["How long does approval take?","Most decisions come within 2–4 hours during business hours. More complex cases may take up to 24 hours."],
      ["When will I receive my funds?","If you accept your offer before 3pm EST on a business day, funds generally arrive the same day. Acceptances after 3pm arrive the next business day."],
      ["Do I need to get on the phone?","Never. The entire process happens in your portal — application, review, offers, messages, and renewals. No phone calls required."],
      ["What documents do I need?","Basically: business information, 3-6 months of bank statements, driver's license, and a voided check. Everything is uploaded directly in the portal."],
    ]},
    { cat:"Credit & Rates", items:[
      ["Will applying hurt my credit score?","No. Our initial review uses a soft pull — zero impact to your score. Only if you accept an offer is a hard pull performed."],
      ["What are the interest rates?","Rates vary by product, amount, term, and credit history. You'll see all terms clearly in your offer before accepting — no surprises."],
      ["Are there prepayment penalties?","Depends on the product. Term loans generally have no prepayment penalties. Revenue advances and lines of credit have different structures. All specified in your offer."],
    ]},
    { cat:"Your Portal & Account", items:[
      ["How do I access my portal?","At aprovuit.com click 'Log In'. Use the email and password you created when applying. SMS verification adds security."],
      ["Can I track my application in real time?","Yes. Your portal shows exactly what stage your application is at — Applied, Under Review, Approved, Offer Sent, Funded."],
      ["How do I communicate with my advisor?","Directly in your portal in the Messages section. No calls — everything in writing so you have a record of everything."],
      ["What happens when I'm eligible for renewal?","It shows up automatically in your portal. No cold calls. No salespeople. It simply appears when you're ready."],
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
          <button onClick={onApply} style={{ background:"#000", color:G, border:"none", padding:"13px 36px", borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{lang==="es"?"Aplicar Ahora →":"Apply Now →"}</button>
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
      ? "¡Hola! Soy el asistente de Aprovuit. ¿Tienes preguntas sobre financiamiento o quieres saber si calificas? 👋"
      : "Hi! I'm the Aprovuit assistant. Have questions about funding or want to find out if you qualify? 👋"
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
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{ position:"fixed", bottom:92, right:24, width:360, height:480, background:"#fff", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column", overflow:"hidden", zIndex:1000 }}>
          {/* Header */}
          <div style={{ background:"#0a0a0a", padding:"16px 20px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#a8ff3e", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#000", flexShrink:0 }}>A</div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0 }}>Aprovuit Assistant</p>
              <p style={{ fontSize:11, color:"#a8ff3e", margin:0 }}>● {lang==="es"?"En línea":"Online"} · {lang==="es"?"Sin llamadas":"No phone calls"}</p>
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

// ── LANDING PAGE ─────────────────────────────────────────────────
function Landing({ lang, onApply, onLogin, onAdmin, onProducts, onHowItWorks, onFaq }) {
  const t = T[lang];
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <div style={{ background:BK, color:"#fff" }}>
      {/* HERO */}
      <section style={{ minHeight:"92vh", display:"flex", alignItems:"center", padding:"80px 5%", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 15% 50%, ${G}12 0%, transparent 55%), radial-gradient(circle at 85% 20%, ${G}07 0%, transparent 50%)`, pointerEvents:"none" }}></div>
        <div className="hero-grid" style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div className="fadeup">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,255,62,.08)", border:`1px solid ${G}33`, padding:"6px 16px", borderRadius:20, marginBottom:28 }}>
              <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
              <span style={{ fontSize:12, color:G, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>{t.hero.badge}</span>
            </div>
            <h1 className="cond" style={{ fontSize:"clamp(48px,6vw,80px)", fontWeight:900, lineHeight:0.93, marginBottom:24, letterSpacing:"-0.02em", textTransform:"uppercase" }}>
              {t.hero.h1}<br /><span style={{ color:G }}>{t.hero.h2}</span>
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,.5)", lineHeight:1.8, marginBottom:40, fontWeight:300, maxWidth:460 }}>{t.hero.sub}</p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <button className="btn-green" style={{ fontSize:16, padding:"16px 40px" }} onClick={onApply}>{t.hero.cta1}</button>
              <button className="btn-ghost" onClick={onLogin}>{t.hero.cta2}</button>
            </div>
          </div>
          {/* Dashboard preview */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ background:BK2, border:`1px solid ${G}25`, borderRadius:20, padding:20, width:320, position:"relative" }}>
              <div style={{ position:"absolute", inset:-16, background:`radial-gradient(circle, ${G}18 0%, transparent 70%)`, filter:"blur(16px)", borderRadius:"50%" }}></div>
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <span className="cond" style={{ fontSize:15, fontWeight:800, color:G, letterSpacing:"0.05em" }}>APROVUIT</span>
                  <span className="pill green">Live Dashboard</span>
                </div>
                {[{label:"APP-2041 · Term Loan",status:"Approved ✓",sc:G,amt:"$145,000",sub:"Offer ready to accept"},{label:"APP-2038 · Line of Credit",status:"Under Review",sc:"#f59e0b",amt:"$75,000",sub:"Decision in ~2 hours"},{label:"LN-10042 · Active Loan",status:"Current",sc:"#60a5fa",amt:"$84,200",sub:"44% paid · Due Apr 1"}].map((item,i)=>(
                  <div key={i} style={{ background:BK3, borderRadius:12, padding:"13px 14px", marginBottom:8, border:"1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{item.label}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:item.sc }}>{item.status}</span>
                    </div>
                    <div style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:3, fontFamily:"'Barlow Condensed',sans-serif" }}>{item.amt}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{item.sub}</div>
                  </div>
                ))}
                <button onClick={onApply} style={{ width:"100%", background:G, border:"none", borderRadius:10, padding:"11px", textAlign:"center", fontSize:13, fontWeight:800, color:"#000", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>Apply Now — Free →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:G, padding:"12px 0", overflow:"hidden" }}>
        <div className="tick">
          {[...Array(2)].map((_,ti)=>(
            <span key={ti} style={{ display:"flex" }}>
              {t.ticker.map(text=>(
                <span key={text} style={{ display:"inline-flex", alignItems:"center", gap:14, padding:"0 28px" }}>
                  <span style={{ fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#000", whiteSpace:"nowrap" }}>{text}</span>
                  <span style={{ color:"#000", opacity:.3 }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ background:BK2, borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div className="stats-grid" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"0 5%" }}>
          {t.stats.map(([v,l],i)=>(
            <div key={l} style={{ padding:"36px 0", textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,.06)":"none" }}>
              <div className="cond" style={{ fontSize:48, fontWeight:900, color:G, letterSpacing:"-0.02em", lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:8, fontWeight:500, letterSpacing:"0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:"88px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{t.how.badge}</p>
          <h2 className="cond" style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", cursor:"pointer" }} onClick={onHowItWorks}>{t.how.h}</h2>
        </div>
        <div className="how-grid" className="reviews-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {t.how.steps.map(([n,title,desc],i)=>(
            <div key={n} style={{ background:i===1?G:BK3, color:i===1?"#000":"#fff", padding:"44px 36px", border:`1px solid ${i===1?G:"rgba(255,255,255,.06)"}`, borderRadius:i===0?"10px 0 0 10px":i===2?"0 10px 10px 0":"0" }}>
              <div className="cond" style={{ fontSize:56, fontWeight:900, opacity:.12, marginBottom:20, letterSpacing:"-0.04em" }}>{n}</div>
              <h3 className="cond" style={{ fontSize:24, fontWeight:800, textTransform:"uppercase", marginBottom:14 }}>{title}</h3>
              <p style={{ fontSize:14, lineHeight:1.8, opacity:i===1?.7:.5, fontWeight:300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="products" style={{ background:BK2, padding:"80px 5%", borderTop:"1px solid rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:10, fontWeight:700 }}>{t.features.badge}</p>
            <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,52px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>{t.features.h}</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
            {t.features.items.map(f=>(
              <div key={f.name} style={{ background:BK3, border:"1px solid rgba(255,255,255,.06)", padding:"32px 28px", borderRadius:4 }}>
                <div style={{ fontSize:32, marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:10 }}>{f.name}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.75, fontWeight:300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:48, textAlign:"center" }}>
            <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:10, fontWeight:700 }}>{t.products.badge}</p>
            <h2 className="cond" style={{ fontSize:"clamp(24px,3vw,40px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:32, cursor:"pointer" }} onClick={onProducts}>{t.products.h}</h2>
            <div className="products-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:2, textAlign:"left" }}>
              {t.products.items.map(p=>(
                <div key={p.name} className="prod-card">
                  <div style={{ fontSize:22, marginBottom:12, color:G }}>{p.icon}</div>
                  <h3 className="cond" style={{ fontSize:22, fontWeight:800, textTransform:"uppercase", marginBottom:8 }}>{p.name}</h3>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.75, marginBottom:16, fontWeight:300 }}>{p.desc}</p>
                  <div style={{ display:"flex", gap:22 }}>
                    <div><p style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{t.products.amount}</p><p style={{ fontSize:13, fontWeight:600, color:G }}>{p.range}</p></div>
                    <div><p style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{t.products.term}</p><p style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{p.term}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700, textAlign:"center" }}>{t.reviews.badge}</p>
        <h2 className="cond" style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:52 }}>{t.reviews.h}</h2>
        <div className="how-grid" className="reviews-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {t.reviews.items.map(r=>(
            <div key={r.name} style={{ background:BK3, border:"1px solid rgba(255,255,255,.06)", padding:"32px 28px", borderRadius:10 }}>
              <div style={{ display:"flex", gap:3, marginBottom:16 }}>
                {[...Array(r.stars)].map((_,i)=><span key={i} style={{ color:G, fontSize:15 }}>★</span>)}
              </div>
              <p style={{ fontSize:14, lineHeight:1.85, color:"rgba(255,255,255,.55)", marginBottom:24, fontStyle:"italic", fontWeight:300 }}>"{r.text}"</p>
              <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", paddingTop:16 }}>
                <p style={{ fontWeight:700, fontSize:14 }}>{r.name}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginTop:2 }}>{r.biz}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:"80px 5%", maxWidth:740, margin:"0 auto" }}>
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700, textAlign:"center" }}>{t.faq.badge}</p>
        <h2 className="cond" style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:44 }}>{t.faq.h}</h2>
        {t.faq.items.map(([q,a],i)=>(
          <div key={i}>
            <button className="faq-btn" onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
              <span style={{ fontSize:16, fontWeight:600 }}>{q}</span>
              <span style={{ fontSize:20, color:"rgba(255,255,255,.3)", flexShrink:0, transition:"transform .2s", transform:faqOpen===i?"rotate(45deg)":"none" }}>+</span>
            </button>
            {faqOpen===i && <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", lineHeight:1.85, paddingBottom:22, fontWeight:300, borderBottom:"1px solid rgba(255,255,255,.07)" }}>{a}</p>}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ background:G, padding:"80px 5%", textAlign:"center" }}>
        <h2 className="cond" style={{ fontSize:"clamp(36px,6vw,68px)", fontWeight:900, color:"#000", textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:16 }}>{t.cta.h}</h2>
        <p style={{ fontSize:17, color:"rgba(0,0,0,.6)", marginBottom:36, fontWeight:300 }}>{t.cta.sub}</p>
        <button onClick={onApply} style={{ background:"#000", color:G, border:"none", padding:"17px 56px", fontSize:17, fontWeight:800, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.04em", textTransform:"uppercase", borderRadius:4 }}>
          {t.cta.btn}
        </button>
      </section>

      {/* FOOTER */}
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
              <button className="nav-link" onClick={()=>setView&&setView("apply")||onApply()}>{lang==="es"?"Comenzar":"Get Started"}</button>
              <button className="nav-link" onClick={()=>setView&&setView("login")||onLogin()}>{lang==="es"?"Entrar":"Log In"}</button>
              <button className="nav-link" onClick={onProducts}>{lang==="es"?"Opciones":"Options"}</button>
              <button className="nav-link" onClick={onHowItWorks}>{lang==="es"?"Cómo Funciona":"How It Works"}</button>
              <button className="nav-link" onClick={onFaq}>FAQ</button>
            </div>
          </div>
          <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"16px 20px", marginBottom:16 }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.35)", lineHeight:1.8 }}>
              {lang==="es"
                ? "⚖️ Aviso Legal: Aprovuit es una plataforma de mercado de financiamiento, no un prestamista ni corredor. Aprovuit no toma decisiones de crédito, negocia términos de financiamiento, ni actúa en nombre de ningún usuario. Las solicitudes enviadas pueden ser compartidas con socios de financiamiento terceros independientes. Aprovuit no garantiza la aprobación de financiamiento. Todas las decisiones son tomadas por los socios de financiamiento."
                : "⚖️ Legal Disclaimer: Aprovuit is a financing marketplace platform, not a lender or broker. Aprovuit does not make credit decisions, negotiate financing terms, or act on behalf of any user. Applications submitted through the platform may be shared with independent third-party financing partners who independently determine eligibility and offer terms. Aprovuit does not guarantee financing approval. All financing decisions are made solely by the financing partners."}
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
          <button className="btn-green" style={{ padding:"9px 18px", fontSize:13 }} onClick={()=>setView("apply")}>{lang==="en"?"Apply →":"Aplicar →"}</button>
        </div>
      </nav>
      <Landing lang={lang} onApply={()=>setView("apply")} onLogin={()=>setView("login")} onAdmin={()=>setView("admin")} onProducts={()=>setView("products")} onHowItWorks={()=>setView("howitworks")} onFaq={()=>setView("faq")} />
      <Chatbot lang={lang} onApply={()=>setView("apply")} />
    </div>
  );
}
