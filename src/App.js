import React, { useState, useEffect } from 'react';

const G = "#a8ff3e";
const BK = "#0a0a0a";
const BK2 = "#111111";
const BK3 = "#161616";

// ── EmailJS config ───────────────────────────────────────────────
const EMAILJS_SERVICE_ID = "service_bztsybt";
const EMAILJS_PUBLIC_KEY  = "EtRChHEIGymDPfUbo";
const EMAILJS_TEMPLATE_ADMIN  = "template_vtmfame";
const EMAILJS_TEMPLATE_CLIENT = "template_8wj9zar";
const FORMSPREE_URL = "https://formspree.io/f/xbdpdnby";

function loadEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs) { window.emailjs.init(EMAILJS_PUBLIC_KEY); resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => { window.emailjs.init(EMAILJS_PUBLIC_KEY); resolve(); };
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

async function sendApplicationEmail(data) {
  try {
    await loadEmailJS();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, {
      alert_type: "NEW APPLICATION", alert_title: "Application Received",
      from_name: data.firstName + " " + data.lastName,
      company: data.company, email: data.email, phone: data.phone,
      loan_amount: data.loanAmt, purpose: data.purpose, timeline: data.timeline,
      industry: data.industry, years: data.years, annual_rev: data.annualRev,
      credit: data.creditRating, estimated: data.estimatedQualify,
      app_id: data.id, upload_link: "https://aprovuit.com/?upload=" + data.id,
      submitted_at: data.submittedAt, files_uploaded: "None yet.",
    });
  } catch(e) {
    try {
      await fetch(FORMSPREE_URL, { method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({ _subject:"New Application — "+data.company, _replyto:data.email,
          Name:data.firstName+" "+data.lastName, Company:data.company, Email:data.email,
          Phone:data.phone, "Loan Amount":data.loanAmt, Purpose:data.purpose,
          "App ID":data.id, "Upload Link":"https://aprovuit.com/?upload="+data.id }) });
    } catch(e2) { console.error(e2); }
  }
}

async function sendClientEmail(data) {
  try {
    await loadEmailJS();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CLIENT, {
      to_email: data.email, first_name: data.firstName,
      company: data.company, app_id: data.id,
      upload_link: "https://aprovuit.com/?upload=" + data.id,
      loan_amount: data.loanAmt,
    });
  } catch(e) { console.error(e); }
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
    hero: { badge:"No Salespeople. No Phone Calls.", h1:"Business Funding.", h2:"Fully Self-Serve.", sub:"Apply, get offers, accept, and manage your funding — entirely online. No salespeople. No phone calls. Ever.", cta1:"Apply Now — Free →", cta2:"Log In to Dashboard" },
    ticker: ["Apply in Minutes","No Salespeople","Get Offers Instantly","Accept with One Click","Track Everything Online","No Phone Calls","Funded Same Day","580+ Credit Score OK","Full Self-Service"],
    stats: [["$750M+","Funded"],["8,200+","Businesses"],["2 hrs","Avg Decision"],["4.9★","Rating"]],
    how: { badge:"How It Works", h:"Three Steps to Funded", steps:[["01","Apply Online","Fill out our smart application in under 5 minutes. No phone interview. No paper forms."],["02","Get Your Offer","Review your personalized offer in your dashboard. Every term is clear before you accept."],["03","Get Funded","Accept your offer with one click. Funds hit your account same day. Track everything online."]] },
    products: { badge:"Funding Products", h:"Every Type of Funding", items:[{icon:"→",name:"Term Loan",range:"$10K–$500K",term:"3–24 months",desc:"Fixed payments, ideal for hiring, expansion, or equipment."},{icon:"⟳",name:"Line of Credit",range:"$10K–$5M",term:"Revolving",desc:"Draw only what you need. Your limit replenishes automatically."},{icon:"⚡",name:"Revenue Advance",range:"$5K–$500K",term:"Daily repayment",desc:"Based on monthly revenue. Fastest approval — funded today."},{icon:"⚙",name:"Equipment Financing",range:"$5K–$2M",term:"Up to 60 months",desc:"Finance equipment you need. Equipment serves as collateral."}], amount:"Amount", term:"Term" },
    reviews: { badge:"Real Results", h:"Business Owners Trust Aprovuit", items:[{name:"Marcus T.",biz:"Logistics, Texas",text:"Applied at 9am, approved by noon, funded next morning. Zero phone calls. This is how lending should work.",stars:5},{name:"Priya S.",biz:"Med Spa, California",text:"The dashboard showed me exactly where my application was at every step. No chasing anyone down.",stars:5},{name:"Darnell R.",biz:"Construction, Georgia",text:"Got a $200K line of credit. Saw every term clearly before I signed. No surprises whatsoever.",stars:5}] },
    faq: { badge:"FAQ", h:"Common Questions", items:[["How long does approval take?","Most decisions come within 2–4 hours during business hours. Funds can hit your account same day."],["Will applying hurt my credit?","Our initial review uses a soft pull — zero impact to your score."],["Do I need to get on the phone?","Never. Everything happens in your dashboard. Apply, track, accept — no phone call required."],["What are the minimum requirements?","6+ months in business, $10K+ monthly revenue, 580+ credit score."],["How do I track my application?","Log into your dashboard anytime to see real-time status updates, offers, and loan balances."]] },
    cta: { h:"Ready to Get Funded?", sub:"Apply in minutes. No phone call. No commitment.", btn:"Apply Now — It's Free →" },
    footer: { rights:"© 2026 Aprovuit. All rights reserved. · aprovuit.com" },
    apply: {
      noPhone:"No Phone Calls. No Salespeople. Ever.",
      heroH1:"Secure Your", heroH1b:"Business Funding Today",
      heroP:"Fast approvals. No phone calls. Funding in as little as 24 hours.",
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
    },
    login: { h:"Welcome Back", sub:"Log in to your Aprovuit dashboard.", email:"Email Address", password:"Password", btn:"Log In →", forgot:"Forgot password?", noAccount:"No account?", applyLink:"Apply Now", smsH:"Verify Your Identity", smsSub:"Enter the 6-digit code sent to your phone.", verify:"Verify & Continue →", resend:"Resend code" },
    dash: { greeting:"Good morning", snapshot:"Here's your funding snapshot", tabs:["Overview","Offers","Loans","Documents","Messages"], signout:"Sign Out", overview:"Overview", noOffers:"No pending offers", loansEmpty:"No active loans yet", docsTitle:"Your Documents", docsUpload:"Upload Documents", msgAdvisor:"Your Advisor", msgPlaceholder:"Message your advisor...", sendBtn:"Send" },
  },
  es: {
    nav: { products:"Productos", howItWorks:"Cómo Funciona", faq:"Preguntas", login:"Entrar", apply:"Aplicar →" },
    hero: { badge:"Sin Vendedores. Sin Llamadas.", h1:"Financiamiento.", h2:"100% Digital.", sub:"Aplica, recibe ofertas, acepta y administra tu financiamiento — todo en línea. Sin vendedores. Sin llamadas.", cta1:"Aplicar Ahora — Gratis →", cta2:"Entrar al Portal" },
    ticker: ["Aplica en Minutos","Sin Vendedores","Recibe Ofertas al Instante","Acepta con un Clic","Rastrea Todo en Línea","Sin Llamadas","Fondos el Mismo Día","580+ Puntaje OK","100% Digital"],
    stats: [["$750M+","Financiado"],["8,200+","Negocios"],["2 hrs","Decisión"],["4.9★","Rating"]],
    how: { badge:"Cómo Funciona", h:"Tres Pasos Para Obtener Fondos", steps:[["01","Aplica en Línea","Completa nuestra solicitud en menos de 5 minutos. Sin entrevista telefónica."],["02","Recibe tu Oferta","Revisa tu oferta personalizada en tu portal. Cada término es claro antes de aceptar."],["03","Recibe tus Fondos","Acepta tu oferta con un clic. Fondos el mismo día. Rastrea todo en línea."]] },
    products: { badge:"Productos de Financiamiento", h:"Todo Tipo de Financiamiento", items:[{icon:"→",name:"Préstamo a Plazo",range:"$10K–$500K",term:"3–24 meses",desc:"Pagos fijos, ideal para contratar, expandir o equipo."},{icon:"⟳",name:"Línea de Crédito",range:"$10K–$5M",term:"Revolvente",desc:"Retira solo lo que necesitas. Tu límite se repone."},{icon:"⚡",name:"Adelanto de Ingresos",range:"$5K–$500K",term:"Pago diario",desc:"Basado en ingresos mensuales. Aprobación más rápida."},{icon:"⚙",name:"Financiamiento de Equipo",range:"$5K–$2M",term:"Hasta 60 meses",desc:"Financia el equipo. El equipo sirve como colateral."}], amount:"Monto", term:"Plazo" },
    reviews: { badge:"Resultados Reales", h:"Dueños de Negocio Confían en Aprovuit", items:[{name:"Marcus T.",biz:"Logística, Texas",text:"Apliqué a las 9am, aprobado al mediodía, fondos a la mañana siguiente. Cero llamadas.",stars:5},{name:"Priya S.",biz:"Med Spa, California",text:"El portal me mostró exactamente dónde estaba mi solicitud en cada paso. Sin perseguir a nadie.",stars:5},{name:"Darnell R.",biz:"Construcción, Georgia",text:"Obtuve una línea de crédito de $200K. Vi cada término antes de firmar. Sin sorpresas.",stars:5}] },
    faq: { badge:"Preguntas Frecuentes", h:"Preguntas Comunes", items:[["¿Cuánto toma la aprobación?","La mayoría de decisiones llegan en 2–4 horas. Fondos el mismo día o siguiente día hábil."],["¿Aplicar afecta mi crédito?","Usamos consulta suave — cero impacto en tu puntaje."],["¿Necesito hablar por teléfono?","Nunca. Todo ocurre en tu portal. Sin llamadas requeridas."],["¿Cuáles son los requisitos mínimos?","6+ meses en operación, $10K+ ingresos mensuales, 580+ puntaje."],["¿Cómo rastro mi solicitud?","Entra a tu portal en cualquier momento para ver actualizaciones, ofertas y saldos."]] },
    cta: { h:"¿Listo para Obtener Fondos?", sub:"Aplica en minutos. Sin llamadas. Sin compromiso.", btn:"Aplicar Ahora — Es Gratis →" },
    footer: { rights:"© 2026 Aprovuit. Todos los derechos reservados. · aprovuit.com" },
    apply: {
      noPhone:"Sin Vendedores. Sin Llamadas.",
      heroH1:"Asegura el", heroH1b:"Financiamiento de tu Negocio Hoy",
      heroP:"Aprobaciones rápidas. Sin llamadas. Fondos en tan solo 24 horas.",
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
    try {
      await loadEmailJS();
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, {
        alert_type:"DOCUMENTS UPLOADED", alert_title:"Documents Received",
        from_name:"Client", company:"See App ID",
        email:"—", phone:"—", loan_amount:"—", purpose:"—", timeline:"—",
        industry:"—", years:"—", annual_rev:"—", credit:"—", estimated:"—",
        app_id:appId, submitted_at:uploadData.submittedAt,
        files_uploaded:uploadData.files.map(f=>f.name).join(", "),
        upload_link:"https://aprovuit.com/?upload="+appId,
      });
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

// ── APPLY PAGE ───────────────────────────────────────────────────
APPLY PAGE — iAdvance style
══════════════════════════════════════════════════════════════════ */
function ApplyPage({ lang, onBack }) {
  const t = TRANSLATIONS[lang].apply;
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loanAmt, setLoanAmt] = useState(150000);
  const [creditSel, setCreditSel] = useState("good");
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
        <h2 style={{ fontSize:28, fontWeight:900, color:"#1a1a1a", marginBottom:12, fontFamily:"'Barlow Condensed',sans-serif", textTransform:"uppercase", letterSpacing:"-0.01em" }}>{t.successH}</h2>
        <p style={{ fontSize:15, color:"#666", lineHeight:1.75, marginBottom:28 }}>{t.successP}</p>
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:14, padding:"18px 20px", marginBottom:20, textAlign:"left" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", marginBottom:12 }}>{t.nextTitle}</p>
          {t.nextSteps.map(s=>(
            <div key={s} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
              <div style={{ width:20, height:20, background:"#16a34a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, flexShrink:0 }}>✓</div>
              <span style={{ fontSize:14, color:"#166534" }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ background:"#1a1a1a", borderRadius:14, padding:"20px 24px", textAlign:"left", marginBottom:20 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{t.estLabel}</p>
          <p style={{ fontSize:40, fontWeight:900, color:G, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-0.5px" }}>{fmtAmt(qualAmt())}</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>{t.estNote}</p>
        </div>
        <div style={{ background:"#fff", border:"2px solid #a8ff3e", borderRadius:14, padding:"18px 20px", marginBottom:20 }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#1a1a1a", marginBottom:6 }}>📎 {lang==="en"?"Upload Your Documents":"Sube Tus Documentos"}</p>
          <p style={{ fontSize:13, color:"#666", marginBottom:14, lineHeight:1.5 }}>{lang==="en"?"Speed up your approval by uploading your bank statements, driver's license, and voided check now.":"Acelera tu aprobación subiendo tus estados de cuenta, licencia e cheque anulado ahora."}</p>
          <button onClick={onBack} style={{ background:"#a8ff3e", color:"#000", border:"none", padding:"12px 24px", borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            {lang==="en"?"Upload Documents Now →":"Subir Documentos Ahora →"}
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
                    <span style={lbl}>{t.firstName} <span style={{color:"#ef4444"}}>*</span></span>
                    <input className="fc-inp" placeholder={t.firstName} value={form.firstName} onChange={e=>{set("firstName",e.target.value);setErrors(p=>({...p,firstName:""}));}} style={errors.firstName?{borderColor:"#ef4444",marginBottom:4}:{}} />
                    {errors.firstName && <p style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <span style={lbl}>{t.lastName} <span style={{color:"#ef4444"}}>*</span></span>
                    <input className="fc-inp" placeholder={t.lastName} value={form.lastName} onChange={e=>{set("lastName",e.target.value);setErrors(p=>({...p,lastName:""}));}} style={errors.lastName?{borderColor:"#ef4444",marginBottom:4}:{}} />
                    {errors.lastName && <p style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errors.lastName}</p>}
                  </div>
                </div>
                <span style={lbl}>{t.emailLabel} <span style={{color:"#ef4444"}}>*</span></span>
                <input className="fc-inp" type="email" placeholder={t.emailPH} value={form.email} onChange={e=>{set("email",e.target.value);setErrors(p=>({...p,email:""}));}} style={errors.email?{borderColor:"#ef4444",marginBottom:4}:{}} />
                {errors.email && <p style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errors.email}</p>}
                <span style={lbl}>{t.phoneLabel} <span style={{color:"#ef4444"}}>*</span></span>
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
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
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
                <p style={{ fontSize:14, color:"rgba(255,255,255,.3)" }}>Your personalized offer will appear here once your application is reviewed.</p>
              </div>
            )}
            {offers.filter(o=>o.status==="pending").map(offer=>(
              <div key={offer.id} className="offer-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,.5)" }}>{offer.product} · {offer.appId}</p>
                  <span className="pill green">New Offer</span>
                </div>
                <p style={{ fontSize:42, fontWeight:900, color:G, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-1px", marginBottom:4 }}>{offer.amount}</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, margin:"16px 0" }}>
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

// ── ADMIN DASHBOARD ──────────────────────────────────────────────
function AdminDashboard({ onExit }) {
  const [tab, setTab] = useState("apps");
  const [drawer, setDrawer] = useState(null);
  const [offerForm, setOfferForm] = useState({ product:"Term Loan", amount:"", term:"", payment:"", rate:"", expires:"" });
  const [sent, setSent] = useState(false);

  const apps = JSON.parse(localStorage.getItem("aprovuit_apps")||"[]");
  const STATUS_COLORS = { "Under Review":["#fef3c7","#d97706"], "Approved":["#dcfce7","#16a34a"], "Funded":["#dbeafe","#2563eb"], "Declined":["#fee2e2","#dc2626"], "Docs Needed":["#fff7ed","#ea580c"] };

  const sendOffer = () => {
    if (!drawer || !offerForm.amount) return;
    const offer = { id:`OFF-${Date.now()}`, appId:drawer.id, product:offerForm.product, amount:offerForm.amount, term:offerForm.term, payment:offerForm.payment, rate:offerForm.rate, expires:offerForm.expires, status:"pending" };
    const existing = JSON.parse(localStorage.getItem(`offers_${drawer.id}`)||"[]");
    existing.push(offer);
    localStorage.setItem(`offers_${drawer.id}`, JSON.stringify(existing));
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

// ── LANDING PAGE ─────────────────────────────────────────────────
function Landing({ lang, onApply, onLogin, onAdmin }) {
  const t = T[lang];
  const [faqOpen, setFaqOpen] = useState(null);

  return (
    <div style={{ background:BK, color:"#fff" }}>
      {/* HERO */}
      <section style={{ minHeight:"92vh", display:"flex", alignItems:"center", padding:"80px 5%", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 15% 50%, ${G}12 0%, transparent 55%), radial-gradient(circle at 85% 20%, ${G}07 0%, transparent 50%)`, pointerEvents:"none" }}></div>
        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div className="fadeup">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,255,62,.08)", border:`1px solid ${G}33`, padding:"6px 16px", borderRadius:20, marginBottom:28 }}>
              <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
              <span style={{ fontSize:12, color:G, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>{t.hero.badge}</span>
            </div>
            <h1 className="cond" style={{ fontSize:"clamp(52px,7vw,86px)", fontWeight:900, lineHeight:0.93, marginBottom:24, letterSpacing:"-0.02em", textTransform:"uppercase" }}>
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
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"0 5%" }}>
          {t.stats.map(([v,l],i)=>(
            <div key={l} style={{ padding:"36px 0", textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,.06)":"none" }}>
              <div className="cond" style={{ fontSize:48, fontWeight:900, color:G, letterSpacing:"-0.02em", lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:8, fontWeight:500, letterSpacing:"0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"88px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700 }}>{t.how.badge}</p>
          <h2 className="cond" style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>{t.how.h}</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {t.how.steps.map(([n,title,desc],i)=>(
            <div key={n} style={{ background:i===1?G:BK3, color:i===1?"#000":"#fff", padding:"44px 36px", border:`1px solid ${i===1?G:"rgba(255,255,255,.06)"}`, borderRadius:i===0?"10px 0 0 10px":i===2?"0 10px 10px 0":"0" }}>
              <div className="cond" style={{ fontSize:56, fontWeight:900, opacity:.12, marginBottom:20, letterSpacing:"-0.04em" }}>{n}</div>
              <h3 className="cond" style={{ fontSize:24, fontWeight:800, textTransform:"uppercase", marginBottom:14 }}>{title}</h3>
              <p style={{ fontSize:14, lineHeight:1.8, opacity:i===1?.7:.5, fontWeight:300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section style={{ background:BK2, padding:"80px 5%", borderTop:"1px solid rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:44, flexWrap:"wrap", gap:16 }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:10, fontWeight:700 }}>{t.products.badge}</p>
              <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>{t.products.h}</h2>
            </div>
            <button className="btn-green" onClick={onApply}>{t.products.cta}</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:2 }}>
            {t.products.items.map(p=>(
              <div key={p.name} className="prod-card">
                <div style={{ fontSize:26, marginBottom:14, color:G }}>{p.icon}</div>
                <h3 className="cond" style={{ fontSize:24, fontWeight:800, textTransform:"uppercase", marginBottom:8 }}>{p.name}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.75, marginBottom:18, fontWeight:300 }}>{p.desc}</p>
                <div style={{ display:"flex", gap:22 }}>
                  <div><p style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{t.products.amount}</p><p style={{ fontSize:13, fontWeight:600, color:G }}>{p.range}</p></div>
                  <div><p style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>{t.products.term}</p><p style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{p.term}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding:"80px 5%", maxWidth:1100, margin:"0 auto" }}>
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:14, fontWeight:700, textAlign:"center" }}>{t.reviews.badge}</p>
        <h2 className="cond" style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:52 }}>{t.reviews.h}</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
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
      <footer style={{ background:BK, borderTop:"1px solid rgba(255,255,255,.05)", padding:"36px 5%" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
            </div>
            <span className="cond" style={{ fontSize:18, fontWeight:800, letterSpacing:"0.02em" }}>APROVUIT</span>
          </div>
          <div style={{ display:"flex", gap:28 }}>
            <button className="nav-link" onClick={onApply}>Apply</button>
            <button className="nav-link" onClick={onLogin}>Log In</button>
            <button className="nav-link" onClick={onAdmin}>Admin</button>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────
export default function Aprovuit() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialUploadId = initialParams.get("upload");

  const [view, setView] = useState(initialUploadId ? "upload" : "landing");
  const [lang, setLang] = useState("en");
  const [uploadAppId, setUploadAppId] = useState(initialUploadId || null);
  const [user, setUser] = useState(null);

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
    setUser({ email, firstName, company, appId });
    setView("dashboard");
  };

  const handleUpload = (appId) => { setUploadAppId(appId); setView("upload"); };

  if (view==="upload") return <UploadPage lang={lang} appId={uploadAppId} onBack={()=>setView(user?"dashboard":"landing")} />;

  if (view==="apply") return <ApplyPage lang={lang} onBack={()=>setView("landing")} onSuccess={handleApplySuccess} />;

  if (view==="login") return <LoginPage lang={lang} onBack={()=>setView("landing")} onLogin={handleLogin} />;

  if (view==="admin") return (
    <div style={{ background:"#f5f4f0", minHeight:"100vh" }}>
      <style>{CSS}</style>
      <div style={{ background:"#0a0a0a", padding:"0 5%", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>A</div>
          <span style={{ fontSize:18, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
          <span style={{ marginLeft:8, fontSize:11, color:"rgba(255,255,255,.4)", background:"rgba(255,255,255,.08)", padding:"3px 10px", borderRadius:20, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Admin</span>
        </div>
      </div>
      <AdminDashboard onExit={()=>setView("landing")} />
    </div>
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
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[T[lang].nav.products, T[lang].nav.howItWorks, T[lang].nav.faq].map((l,i)=>(
            <button key={l} className="nav-link" onClick={()=>document.getElementById(["products","how-it-works","faq"][i])?.scrollIntoView({behavior:"smooth"})}>{l}</button>
          ))}
          <div className="lang-pill">
            <button className="lb" onClick={()=>setLang("en")} style={{ background:lang==="en"?G:"transparent", color:lang==="en"?"#000":"rgba(255,255,255,.5)" }}>EN</button>
            <button className="lb" onClick={()=>setLang("es")} style={{ background:lang==="es"?G:"transparent", color:lang==="es"?"#000":"rgba(255,255,255,.5)" }}>ES</button>
          </div>
          <button className="nav-link" onClick={()=>setView("login")}>{T[lang].nav.login}</button>
          <button className="btn-green" style={{ padding:"9px 20px", fontSize:13 }} onClick={()=>setView("apply")}>{T[lang].nav.apply}</button>
        </div>
      </nav>
      <Landing lang={lang} onApply={()=>setView("apply")} onLogin={()=>setView("login")} onAdmin={()=>setView("admin")} />
    </div>
  );
}
