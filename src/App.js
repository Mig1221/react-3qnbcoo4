import React, { useState } from 'react';

const G = "#a8ff3e";
const BK = "#0a0a0a";
const BK2 = "#111111";
const BK3 = "#1a1a1a";

const TRANSLATIONS = {
  en: {
    nav: { products: "Products", howItWorks: "How It Works", faq: "FAQ", partnerLogin: "Partner Login", applyNow: "Apply Now →", langBtn: "ES" },
    hero: {
      badge: "No Phone Calls. Ever.",
      h1a: "APPROVE IT.", h1b: "FUND IT.", h1c: "TRACK IT.",
      sub: "Business funding that lives entirely online. Apply in minutes, track approvals in real time, accept offers, and manage every loan — without ever picking up the phone.",
      cta1: "Apply Now — Free →", cta2: "See How It Works",
    },
    ticker: ["Apply in Minutes","No Phone Calls Required","Track Approvals in Real Time","Accept Offers in One Tap","Upload Bank Statements","See Every Term Clearly","No Spam Callers","Funded Same Day","580+ Credit Score OK"],
    stats: [["$750M+","Funded"],["8,200+","Businesses"],["2 hrs","Avg Decision"],["4.9★","Rating"]],
    match: {
      badge: "Quick Qualifier", h: "Let's See If We Match",
      sub: "Apply now to see how much working capital your business may qualify for — in just a few minutes. No phone call. No commitment.",
      reqs: [["6+ months","In business"],["$10K+","Monthly revenue"],["580+","Credit score"],["📵","No phone call needed"]],
      cta: "Get Started →",
      products: [["Term Loan","$10K–$500K","3–24 months"],["Line of Credit","$10K–$5M","Revolving"],["Revenue Advance","$5K–$500K","Daily repayment"],["Equipment Financing","$5K–$2M","Up to 60 months"]],
      checkBtn: "Check My Eligibility →",
      estimate: "Estimate your amount",
    },
    how: {
      badge: "Simple Process", h: "Zero Phone Calls.\nTotal Transparency.",
      steps: [["01","Apply in Minutes","Fill out our smart application. Upload your bank statements. No phone interviews. Takes under 5 minutes."],["02","Track in Real Time","Watch your application update live. Approved, under review, or declined — you'll know instantly."],["03","Accept & Get Funded","Your offer appears with every term clearly laid out. Accept or decline with one tap. Funds same day."]],
    },
    products: {
      badge: "Funding Products", h: "Every Type of Funding", cta: "Apply Now →",
      items: [
        { icon:"→", name:"Term Loan", range:"$10K – $500K", term:"3–24 months", desc:"Fixed payments, ideal for one-time investments like hiring, expansion, or equipment." },
        { icon:"⟳", name:"Line of Credit", range:"$10K – $5M", term:"Revolving", desc:"Draw only what you need and repay as you go. Your limit replenishes automatically." },
        { icon:"⚡", name:"Revenue Advance", range:"$5K – $500K", term:"Daily repayment", desc:"Based on your monthly revenue. Fastest approval, funded as soon as today." },
        { icon:"⚙", name:"Equipment Financing", range:"$5K – $2M", term:"Up to 60 months", desc:"Finance the equipment your business needs. Equipment serves as its own collateral." },
      ],
      amountLabel: "Amount", termLabel: "Term",
    },
    why: {
      badge: "Why Aprovuit", h: "You Deserve to Know Exactly What You Signed.",
      sub: "Most clients don't understand their own loan terms because the process happens over rushed phone calls. Aprovuit puts everything in writing, on your screen, before you click Accept.",
      items: [["📵","No Phone Calls","Apply, track, accept, and message your advisor entirely online. Block the spam callers forever."],["🔍","Full Transparency","See exactly what you're approving before you sign. No surprises, no fine print buried in a phone call."],["🏦","Easy Document Upload","Upload your bank statements directly. Simple, secure, and takes seconds."],["🔄","Renewals Online","When you're eligible for renewal, it shows up in your dashboard. No advisor cold call required."]],
    },
    reviews: {
      badge: "Real Results", h: "Business Owners Trust Aprovuit",
      items: [
        { name:"Marcus T.", biz:"Logistics, Texas", text:"Applied at 9am, approved by noon, funded next morning. Zero phone calls. This is how lending should work.", stars:5 },
        { name:"Priya S.", biz:"Med Spa, California", text:"The platform showed me exactly where my application was at every step. No chasing anyone down. Total transparency.", stars:5 },
        { name:"Darnell R.", biz:"Construction, Georgia", text:"Got a $200K line of credit. Saw every term clearly before I signed. No surprises. I knew exactly what I agreed to.", stars:5 },
      ],
    },
    faqSection: {
      badge: "FAQ", h: "Common Questions",
      items: [
        ["How long does approval take?","Most decisions come within 2–4 hours during business hours. Once approved, funds can hit your account the same day or next business day."],
        ["Will applying hurt my credit?","Our initial review uses a soft pull — zero impact to your score. A hard pull only happens if you choose to accept an offer."],
        ["What documents do I need?","Just basic business info and 3 months of bank statements. Upload them directly in the application — no emailing PDFs ever."],
        ["Do I need to get on the phone?","Never. Everything happens online. Apply, track status, review offers, accept or decline — all without a phone call."],
        ["What are the minimum requirements?","6+ months in business, $10K+ monthly revenue, 580+ credit score. We evaluate your full business health, not just a number."],
      ],
    },
    cta: { h: "Ready to Get Funded?", sub: "Apply in minutes. No phone call. No commitment.", btn: "Apply Now — It's Free →" },
    footer: { apply: "Apply Now", client: "Client Login", partner: "Partner Dashboard", rights: "© 2026 Aprovuit. All rights reserved. · aprovuit.com" },
    apply: {
      noPhone: "No Phone Call Required",
      heroTag: "Free · No Commitment · No Phone Call",
      heroH: "Let's See If", heroSpan: "We Match",
      heroP: "Find out how much your business qualifies for in minutes.",
      qualH: "Estimate your amount", qualSub: "Adjust the sliders to see what you could qualify for.",
      creditLabel: "My credit score is...",
      creditOpts: [["excellent","Excellent","750+"],["good","Good","680+"],["fair","Fair","580+"],["poor","Poor","<580"]],
      revLabel: "Monthly revenue",
      qualifyLabel: "You could qualify for up to",
      qualNote: "*Estimate only. Subject to full review.",
      reqTitle: "Minimum requirements:",
      reqs: ["6+ months in business","$10K+ monthly revenue","580+ credit score","No phone call — ever 📵"],
      applyBtn: "Apply Now — Takes 2 Minutes →",
      step1H: "Funding Details", step1Sub: "Tell us what you're looking for.",
      amtLabel: "How much money do you need?",
      amtOpts: ["Select an amount...","$5,000 – $25,000","$25,000 – $50,000","$50,000 – $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"],
      purposeLabel: "What are you seeking funding for?",
      purposeOpts: ["Select a purpose...","Working Capital","Equipment Purchase","Business Expansion","Payroll","Inventory","Marketing & Advertising","Debt Refinancing","Hiring Staff","Other"],
      timelineLabel: "How soon do you need the funds?",
      timelineOpts: ["Select a timeline...","As soon as possible (1–3 days)","Within 1 week","Within 2 weeks","Within 30 days","Just exploring options"],
      step2H: "Business Information", step2Sub: "Tell us about your business.",
      companyLabel: "Company Name", companyPH: "e.g. Sunrise Trucking LLC",
      industryLabel: "Industry",
      industryOpts: ["Select industry...","Retail","Restaurant / Food Service","Construction","Healthcare / Medical","Transportation / Logistics","Beauty / Salon / Spa","Fitness / Gym","Automotive","Professional Services","Real Estate","Technology","Manufacturing","Other"],
      yearsLabel: "Years in Business",
      yearsOpts: ["Select...","Less than 6 months","6–12 months","1–2 years","2–5 years","5–10 years","10+ years"],
      annualLabel: "Annual Revenue",
      annualOpts: ["Select...","Under $120K","$120K – $250K","$250K – $500K","$500K – $1M","$1M – $2.5M","$2.5M – $5M","$5M+"],
      creditEstLabel: "Estimate your credit rating",
      step3H: "Contact Information", step3Sub: "Last step — your offer comes here. No phone call, we promise.",
      firstName: "First Name", lastName: "Last Name",
      emailLabel: "Email Address", emailPH: "you@yourbusiness.com",
      phoneLabel: "Phone Number", phonePH: "(555) 000-0000",
      summaryTitle: "Your application summary",
      summaryKeys: ["Amount","Purpose","Timeline","Company","Industry","Revenue","Credit"],
      disclaimer: "By submitting, you authorize Aprovuit to perform a soft credit check. This will not impact your credit score.",
      backBtn: "← Back", continueBtn: "Continue →", submitBtn: "Submit Application ✓",
      tabs: ["Qualify","Funding","Business","Contact"],
      successH: "Application Submitted!",
      successP: "We've received your application and will be in touch within 2–4 hours. No phone call required — we'll reach you by email.",
      nextTitle: "What happens next:",
      nextSteps: ["Application reviewed within 2–4 hours","Personalized offer sent to your email","Accept or decline — no pressure, no calls"],
      estLabel: "Your estimated pre-qualification",
      estNote: "*Subject to full review and approval",
    },
  },
  es: {
    nav: { products: "Productos", howItWorks: "Cómo Funciona", faq: "Preguntas", partnerLogin: "Acceso Socios", applyNow: "Aplicar Ahora →", langBtn: "EN" },
    hero: {
      badge: "Sin Llamadas Telefónicas. Nunca.",
      h1a: "APRUÉBALO.", h1b: "FINÁNCIALO.", h1c: "RASTRÉALO.",
      sub: "Financiamiento empresarial completamente en línea. Aplica en minutos, rastrea aprobaciones en tiempo real, acepta ofertas y administra cada préstamo — sin nunca contestar el teléfono.",
      cta1: "Aplicar Ahora — Gratis →", cta2: "Cómo Funciona",
    },
    ticker: ["Aplica en Minutos","Sin Llamadas Telefónicas","Rastrea en Tiempo Real","Acepta Ofertas con un Clic","Sube Estados de Cuenta","Ve Cada Término Claramente","Sin Llamadas No Deseadas","Fondos el Mismo Día","580+ Puntaje de Crédito OK"],
    stats: [["$750M+","Financiado"],["8,200+","Negocios"],["2 hrs","Decisión Promedio"],["4.9★","Calificación"]],
    match: {
      badge: "Calificación Rápida", h: "Veamos Si Somos un Match",
      sub: "Aplica ahora para ver cuánto capital de trabajo podría calificar tu negocio — en solo unos minutos. Sin llamadas. Sin compromiso.",
      reqs: [["6+ meses","En operación"],["$10K+","Ingresos mensuales"],["580+","Puntaje de crédito"],["📵","Sin llamadas telefónicas"]],
      cta: "Comenzar →",
      products: [["Préstamo a Plazo","$10K–$500K","3–24 meses"],["Línea de Crédito","$10K–$5M","Revolvente"],["Adelanto de Ingresos","$5K–$500K","Pago diario"],["Financiamiento de Equipo","$5K–$2M","Hasta 60 meses"]],
      checkBtn: "Verificar Mi Elegibilidad →",
      estimate: "Estima tu monto",
    },
    how: {
      badge: "Proceso Simple", h: "Cero Llamadas.\nTotal Transparencia.",
      steps: [["01","Aplica en Minutos","Completa nuestra solicitud inteligente. Sube tus estados de cuenta. Sin entrevistas telefónicas. Toma menos de 5 minutos."],["02","Rastrea en Tiempo Real","Observa tu solicitud actualizarse en vivo. Aprobado, en revisión o rechazado — lo sabrás al instante."],["03","Acepta y Recibe Fondos","Tu oferta aparece con cada término claramente. Acepta o rechaza con un clic. Fondos el mismo día."]],
    },
    products: {
      badge: "Productos de Financiamiento", h: "Todo Tipo de Financiamiento", cta: "Aplicar Ahora →",
      items: [
        { icon:"→", name:"Préstamo a Plazo", range:"$10K – $500K", term:"3–24 meses", desc:"Pagos fijos, ideal para inversiones únicas como contratación, expansión o equipo." },
        { icon:"⟳", name:"Línea de Crédito", range:"$10K – $5M", term:"Revolvente", desc:"Retira solo lo que necesitas y paga mientras avanzas. Tu límite se repone automáticamente." },
        { icon:"⚡", name:"Adelanto de Ingresos", range:"$5K – $500K", term:"Pago diario", desc:"Basado en tus ingresos mensuales. Aprobación más rápida, fondos tan pronto como hoy." },
        { icon:"⚙", name:"Financiamiento de Equipo", range:"$5K – $2M", term:"Hasta 60 meses", desc:"Financia el equipo que tu negocio necesita. El equipo sirve como su propio colateral." },
      ],
      amountLabel: "Monto", termLabel: "Plazo",
    },
    why: {
      badge: "Por Qué Aprovuit", h: "Mereces Saber Exactamente Lo Que Firmaste.",
      sub: "La mayoría de los clientes no entienden sus propios términos de préstamo porque el proceso ocurre en llamadas apresuradas. Aprovuit pone todo por escrito, en tu pantalla, antes de que hagas clic en Aceptar.",
      items: [["📵","Sin Llamadas","Aplica, rastrea, acepta y mensajea a tu asesor completamente en línea. Bloquea las llamadas no deseadas para siempre."],["🔍","Transparencia Total","Ve exactamente lo que estás aprobando antes de firmar. Sin sorpresas ni letra pequeña en una llamada."],["🏦","Carga Fácil de Documentos","Sube tus estados de cuenta directamente. Simple, seguro y toma segundos."],["🔄","Renovaciones en Línea","Cuando seas elegible para renovación, aparece en tu portal. Sin llamadas frías del asesor."]],
    },
    reviews: {
      badge: "Resultados Reales", h: "Dueños de Negocio Confían en Aprovuit",
      items: [
        { name:"Marcus T.", biz:"Logística, Texas", text:"Apliqué a las 9am, aprobado al mediodía, fondos a la mañana siguiente. Cero llamadas telefónicas. Así debería funcionar el préstamo.", stars:5 },
        { name:"Priya S.", biz:"Med Spa, California", text:"La plataforma me mostró exactamente dónde estaba mi solicitud en cada paso. Sin perseguir a nadie. Total transparencia.", stars:5 },
        { name:"Darnell R.", biz:"Construcción, Georgia", text:"Obtuve una línea de crédito de $200K. Vi cada término claramente antes de firmar. Sin sorpresas. Supe exactamente lo que acordé.", stars:5 },
      ],
    },
    faqSection: {
      badge: "Preguntas Frecuentes", h: "Preguntas Comunes",
      items: [
        ["¿Cuánto tiempo toma la aprobación?","La mayoría de las decisiones llegan en 2–4 horas durante el horario comercial. Una vez aprobado, los fondos pueden llegar a tu cuenta el mismo día o el siguiente día hábil."],
        ["¿Aplicar afectará mi crédito?","Nuestra revisión inicial usa una consulta suave — cero impacto en tu puntaje. Una consulta dura solo ocurre si decides aceptar una oferta."],
        ["¿Qué documentos necesito?","Solo información básica del negocio y 3 meses de estados de cuenta bancarios. Cárgalos directamente en la solicitud — sin enviar PDFs por correo."],
        ["¿Necesito hablar por teléfono?","Nunca. Todo ocurre en línea. Aplica, rastrea, revisa ofertas, acepta o rechaza — todo sin una llamada telefónica."],
        ["¿Cuáles son los requisitos mínimos?","6+ meses en operación, $10K+ de ingresos mensuales, 580+ de puntaje de crédito. Evaluamos la salud completa de tu negocio, no solo un número."],
      ],
    },
    cta: { h: "¿Listo para Obtener Financiamiento?", sub: "Aplica en minutos. Sin llamadas. Sin compromiso.", btn: "Aplicar Ahora — Es Gratis →" },
    footer: { apply: "Aplicar Ahora", client: "Acceso Cliente", partner: "Panel de Socios", rights: "© 2026 Aprovuit. Todos los derechos reservados. · aprovuit.com" },
    apply: {
      noPhone: "Sin Llamada Telefónica",
      heroTag: "Gratis · Sin Compromiso · Sin Llamadas",
      heroH: "Veamos Si", heroSpan: "Somos un Match",
      heroP: "Descubre cuánto califica tu negocio en minutos.",
      qualH: "Estima tu monto", qualSub: "Ajusta los controles para ver cuánto podrías calificar.",
      creditLabel: "Mi puntaje de crédito es...",
      creditOpts: [["excellent","Excelente","750+"],["good","Bueno","680+"],["fair","Regular","580+"],["poor","Bajo","<580"]],
      revLabel: "Ingresos mensuales",
      qualifyLabel: "Podrías calificar para hasta",
      qualNote: "*Solo estimado. Sujeto a revisión completa.",
      reqTitle: "Requisitos mínimos:",
      reqs: ["6+ meses en operación","$10K+ ingresos mensuales","580+ puntaje de crédito","Sin llamadas — nunca 📵"],
      applyBtn: "Aplicar Ahora — Solo 2 Minutos →",
      step1H: "Detalles de Financiamiento", step1Sub: "Cuéntanos qué estás buscando.",
      amtLabel: "¿Cuánto dinero necesitas?",
      amtOpts: ["Selecciona un monto...","$5,000 – $25,000","$25,000 – $50,000","$50,000 – $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"],
      purposeLabel: "¿Para qué necesitas el financiamiento?",
      purposeOpts: ["Selecciona un propósito...","Capital de Trabajo","Compra de Equipo","Expansión del Negocio","Nómina","Inventario","Marketing y Publicidad","Refinanciamiento de Deuda","Contratar Personal","Otro"],
      timelineLabel: "¿Cuándo necesitas los fondos?",
      timelineOpts: ["Selecciona...","Lo antes posible (1–3 días)","En 1 semana","En 2 semanas","En 30 días","Solo explorando opciones"],
      step2H: "Información del Negocio", step2Sub: "Cuéntanos sobre tu negocio.",
      companyLabel: "Nombre de la Empresa", companyPH: "ej. Transportes Jiménez LLC",
      industryLabel: "Industria",
      industryOpts: ["Selecciona industria...","Retail / Ventas al por menor","Restaurante / Comida","Construcción","Salud / Médico","Transporte / Logística","Belleza / Salón / Spa","Fitness / Gimnasio","Automotriz","Servicios Profesionales","Bienes Raíces","Tecnología","Manufactura","Otro"],
      yearsLabel: "Años en Operación",
      yearsOpts: ["Selecciona...","Menos de 6 meses","6–12 meses","1–2 años","2–5 años","5–10 años","10+ años"],
      annualLabel: "Ingresos Anuales",
      annualOpts: ["Selecciona...","Menos de $120K","$120K – $250K","$250K – $500K","$500K – $1M","$1M – $2.5M","$2.5M – $5M","$5M+"],
      creditEstLabel: "Estima tu puntaje de crédito",
      step3H: "Información de Contacto", step3Sub: "Último paso — aquí enviamos tu oferta. Sin llamadas, lo prometemos.",
      firstName: "Nombre", lastName: "Apellido",
      emailLabel: "Correo Electrónico", emailPH: "tu@negocio.com",
      phoneLabel: "Número de Teléfono", phonePH: "(555) 000-0000",
      summaryTitle: "Resumen de tu solicitud",
      summaryKeys: ["Monto","Propósito","Plazo","Empresa","Industria","Ingresos","Crédito"],
      disclaimer: "Al enviar, autorizas a Aprovuit a realizar una consulta suave de crédito. Esto no afectará tu puntaje de crédito.",
      backBtn: "← Atrás", continueBtn: "Continuar →", submitBtn: "Enviar Solicitud ✓",
      tabs: ["Calificar","Fondos","Negocio","Contacto"],
      successH: "¡Solicitud Enviada!",
      successP: "Recibimos tu solicitud y nos comunicaremos en 2–4 horas. Sin llamadas telefónicas — te contactamos por correo.",
      nextTitle: "¿Qué pasa ahora?",
      nextSteps: ["Revisión de solicitud en 2–4 horas","Oferta personalizada enviada a tu correo","Acepta o rechaza — sin presión, sin llamadas"],
      estLabel: "Tu pre-calificación estimada",
      estNote: "*Sujeto a revisión y aprobación completa",
    },
  },
};

/* ── APPLY PAGE ─────────────────────────────────────────────────── */
function ApplyPage({ lang, onBack }) {
  const t = TRANSLATIONS[lang].apply;
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [creditScore, setCreditScore] = useState("good");
  const [monthlyRev, setMonthlyRev] = useState(50000);
  const [form, setForm] = useState({ amount:"", purpose:"", timeline:"", company:"", industry:"", years:"", annualRev:"", creditRating:"good", firstName:"", lastName:"", email:"", phone:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const qualAmt = () => {
    const base = monthlyRev * 1.5;
    if (creditScore==="excellent") return Math.min(Math.round(base*1.3),500000);
    if (creditScore==="good") return Math.min(Math.round(base*1.1),350000);
    if (creditScore==="fair") return Math.min(Math.round(base*0.8),150000);
    return Math.min(Math.round(base*0.5),75000);
  };

  const handleSubmit = () => {
    const apps = JSON.parse(localStorage.getItem("aprovuit_apps")||"[]");
    apps.push({ id:`APP-${Date.now()}`, submittedAt:new Date().toLocaleString(), status:"Under Review", ...form, estimatedQualify:qualAmt() });
    localStorage.setItem("aprovuit_apps", JSON.stringify(apps));
    setSubmitted(true);
  };

  const inp = { width:"100%", padding:"13px 16px", borderRadius:10, border:"1.5px solid #e5e5ea", fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:"none", color:"#1c1c1e", background:"#fff", marginBottom:16, display:"block" };
  const lbl = { fontSize:12, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:7, display:"block" };

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:BK, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"56px 48px", maxWidth:520, width:"100%", textAlign:"center" }}>
        <div style={{ width:80, height:80, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:36 }}>✓</div>
        <h2 style={{ fontSize:28, fontWeight:800, color:"#1c1c1e", marginBottom:12 }}>{t.successH}</h2>
        <p style={{ fontSize:15, color:"#888", lineHeight:1.7, marginBottom:28 }}>{t.successP}</p>
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:14, padding:"18px 20px", marginBottom:24, textAlign:"left" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", marginBottom:10 }}>{t.nextTitle}</p>
          {t.nextSteps.map(s=><div key={s} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}><div style={{ width:18, height:18, background:"#16a34a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:9, flexShrink:0 }}>✓</div><span style={{ fontSize:13, color:"#166534" }}>{s}</span></div>)}
        </div>
        <div style={{ background:"#1c1c1e", borderRadius:14, padding:"20px 24px", textAlign:"left", marginBottom:24 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{t.estLabel}</p>
          <p style={{ fontSize:40, fontWeight:900, color:G, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-0.5px" }}>${qualAmt().toLocaleString()}</p>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>{t.estNote}</p>
        </div>
        <button onClick={onBack} style={{ background:BK, color:G, padding:"14px 40px", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← {lang==="en"?"Back to Aprovuit":"Volver a Aprovuit"}</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:BK }}>
      <div style={{ background:"rgba(10,10,10,0.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"0 5%", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:G, borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:16, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
          </div>
          <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(168,255,62,0.08)", border:`1px solid ${G}30`, padding:"6px 14px", borderRadius:20 }}>
          <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
          <span style={{ fontSize:12, color:G, fontWeight:600 }}>📵 {t.noPhone}</span>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"48px 24px 80px" }}>
        {step===0 && (
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,255,62,0.08)", border:`1px solid ${G}25`, padding:"6px 18px", borderRadius:20, marginBottom:20 }}>
              <span style={{ fontSize:11, color:G, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>{t.heroTag}</span>
            </div>
            <h1 style={{ fontSize:"clamp(40px,7vw,72px)", fontWeight:900, color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", textTransform:"uppercase", letterSpacing:"-0.02em", lineHeight:0.92, marginBottom:16 }}>
              {t.heroH}<br /><span style={{ color:G }}>{t.heroSpan}</span>
            </h1>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:420, margin:"0 auto", fontWeight:300 }}>{t.heroP}</p>
          </div>
        )}

        {step>0 && (
          <div style={{ marginBottom:28 }}>
            <div style={{ display:"flex", gap:6, marginBottom:16 }}>
              {t.tabs.map((tab,i)=>(
                <div key={tab} onClick={()=>i<step&&setStep(i)} style={{ flex:1, padding:"8px 4px", textAlign:"center", fontSize:11, fontWeight:700, borderRadius:8, cursor:i<step?"pointer":"default", background:i<step?"#1a1a1a":i===step?G:"#1a1a1a", color:i<step?G:i===step?"#000":"rgba(255,255,255,0.3)", border:`1px solid ${i<step?G+"33":i===step?"transparent":"transparent"}` }}>
                  {i<step?"✓ ":""}{tab}
                </div>
              ))}
            </div>
            <div style={{ height:3, background:"rgba(255,255,255,0.1)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(step/3)*100}%`, background:G, borderRadius:2, transition:"width 0.4s" }}></div>
            </div>
          </div>
        )}

        <div style={{ background:"#fff", borderRadius:20, padding:"36px 32px", boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>
          {step===0 && <>
            <h2 style={{ fontSize:20, fontWeight:800, color:"#1c1c1e", marginBottom:6 }}>{t.qualH}</h2>
            <p style={{ fontSize:13, color:"#888", marginBottom:28 }}>{t.qualSub}</p>
            <span style={lbl}>{t.creditLabel}</span>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:28 }}>
              {t.creditOpts.map(([val,label,range])=>(
                <div key={val} onClick={()=>setCreditScore(val)} style={{ border:`2px solid ${creditScore===val?"#1c1c1e":"#e5e5ea"}`, borderRadius:12, padding:"12px 6px", cursor:"pointer", textAlign:"center", background:creditScore===val?"#1c1c1e":"#fff", transition:"all 0.15s" }}>
                  <p style={{ fontSize:12, fontWeight:800, color:creditScore===val?"#fff":"#1c1c1e", marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:10, color:creditScore===val?"rgba(255,255,255,0.5)":"#aaa" }}>{range}</p>
                </div>
              ))}
            </div>
            <span style={lbl}>{t.revLabel} <span style={{ background:"#1c1c1e", color:G, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, marginLeft:6 }}>${monthlyRev.toLocaleString()}</span></span>
            <input type="range" min={10000} max={500000} step={5000} value={monthlyRev} onChange={e=>setMonthlyRev(Number(e.target.value))} style={{ width:"100%", marginBottom:6, accentColor:"#1c1c1e" }} />
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:28 }}>
              <span style={{ fontSize:11, color:"#aaa" }}>$10K</span><span style={{ fontSize:11, color:"#aaa" }}>$500K+</span>
            </div>
            <div style={{ background:"linear-gradient(135deg,#0a0a0a,#111)", borderRadius:16, padding:"28px", marginBottom:28, textAlign:"center" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>{t.qualifyLabel}</p>
              <p style={{ fontSize:52, fontWeight:900, color:G, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"-1px", lineHeight:1 }}>${qualAmt().toLocaleString()}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:8 }}>{t.qualNote}</p>
            </div>
            <div style={{ background:"#f9f9fb", borderRadius:12, padding:"16px 18px", marginBottom:24 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#1c1c1e", marginBottom:10 }}>{t.reqTitle}</p>
              {t.reqs.map(r=><div key={r} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}><div style={{ width:18, height:18, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#16a34a", flexShrink:0 }}>✓</div><span style={{ fontSize:13, color:"#555" }}>{r}</span></div>)}
            </div>
            <button onClick={()=>setStep(1)} style={{ width:"100%", background:"#1c1c1e", color:"#fff", border:"none", padding:"16px", borderRadius:13, fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.applyBtn}</button>
          </>}

          {step===1 && <>
            <h2 style={{ fontSize:20, fontWeight:800, color:"#1c1c1e", marginBottom:4 }}>{t.step1H}</h2>
            <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>{t.step1Sub}</p>
            <span style={lbl}>{t.amtLabel}</span>
            <select style={inp} value={form.amount} onChange={e=>set("amount",e.target.value)}>{t.amtOpts.map(o=><option key={o}>{o}</option>)}</select>
            <span style={lbl}>{t.purposeLabel}</span>
            <select style={inp} value={form.purpose} onChange={e=>set("purpose",e.target.value)}>{t.purposeOpts.map(o=><option key={o}>{o}</option>)}</select>
            <span style={lbl}>{t.timelineLabel}</span>
            <select style={inp} value={form.timeline} onChange={e=>set("timeline",e.target.value)}>{t.timelineOpts.map(o=><option key={o}>{o}</option>)}</select>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button onClick={()=>setStep(0)} style={{ flex:1, background:"#f2f2f7", color:"#1c1c1e", border:"none", padding:"14px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.backBtn}</button>
              <button onClick={()=>setStep(2)} style={{ flex:2, background:"#1c1c1e", color:"#fff", border:"none", padding:"14px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.continueBtn}</button>
            </div>
          </>}

          {step===2 && <>
            <h2 style={{ fontSize:20, fontWeight:800, color:"#1c1c1e", marginBottom:4 }}>{t.step2H}</h2>
            <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>{t.step2Sub}</p>
            <span style={lbl}>{t.companyLabel}</span>
            <input style={inp} placeholder={t.companyPH} value={form.company} onChange={e=>set("company",e.target.value)} />
            <span style={lbl}>{t.industryLabel}</span>
            <select style={inp} value={form.industry} onChange={e=>set("industry",e.target.value)}>{t.industryOpts.map(o=><option key={o}>{o}</option>)}</select>
            <span style={lbl}>{t.yearsLabel}</span>
            <select style={inp} value={form.years} onChange={e=>set("years",e.target.value)}>{t.yearsOpts.map(o=><option key={o}>{o}</option>)}</select>
            <span style={lbl}>{t.annualLabel}</span>
            <select style={inp} value={form.annualRev} onChange={e=>set("annualRev",e.target.value)}>{t.annualOpts.map(o=><option key={o}>{o}</option>)}</select>
            <span style={lbl}>{t.creditEstLabel}</span>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
              {t.creditOpts.map(([val,label,range])=>(
                <div key={val} onClick={()=>set("creditRating",val)} style={{ border:`2px solid ${form.creditRating===val?"#1c1c1e":"#e5e5ea"}`, borderRadius:12, padding:"10px 4px", cursor:"pointer", textAlign:"center", background:form.creditRating===val?"#1c1c1e":"#fff", transition:"all 0.15s" }}>
                  <p style={{ fontSize:11, fontWeight:800, color:form.creditRating===val?"#fff":"#1c1c1e", marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:10, color:form.creditRating===val?"rgba(255,255,255,0.5)":"#aaa" }}>{range}</p>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setStep(1)} style={{ flex:1, background:"#f2f2f7", color:"#1c1c1e", border:"none", padding:"14px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.backBtn}</button>
              <button onClick={()=>setStep(3)} style={{ flex:2, background:"#1c1c1e", color:"#fff", border:"none", padding:"14px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.continueBtn}</button>
            </div>
          </>}

          {step===3 && <>
            <h2 style={{ fontSize:20, fontWeight:800, color:"#1c1c1e", marginBottom:4 }}>{t.step3H}</h2>
            <p style={{ fontSize:13, color:"#888", marginBottom:24 }}>{t.step3Sub}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><span style={lbl}>{t.firstName}</span><input style={inp} placeholder={t.firstName} value={form.firstName} onChange={e=>set("firstName",e.target.value)} /></div>
              <div><span style={lbl}>{t.lastName}</span><input style={inp} placeholder={t.lastName} value={form.lastName} onChange={e=>set("lastName",e.target.value)} /></div>
            </div>
            <span style={lbl}>{t.emailLabel}</span>
            <input style={inp} type="email" placeholder={t.emailPH} value={form.email} onChange={e=>set("email",e.target.value)} />
            <span style={lbl}>{t.phoneLabel}</span>
            <input style={inp} type="tel" placeholder={t.phonePH} value={form.phone} onChange={e=>set("phone",e.target.value)} />
            <div style={{ background:"#f9f9fb", borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>{t.summaryTitle}</p>
              {t.summaryKeys.map((k,i)=>{
                const vals=[form.amount,form.purpose,form.timeline,form.company,form.industry,form.annualRev,form.creditRating];
                return <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"0.5px solid #f2f2f7" }}><span style={{ fontSize:13, color:"#888" }}>{k}</span><span style={{ fontSize:13, fontWeight:600, color:"#1c1c1e" }}>{vals[i]||"—"}</span></div>;
              })}
            </div>
            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 14px", marginBottom:20 }}>
              <p style={{ fontSize:12, color:"#166534", lineHeight:1.6 }}>🔒 {t.disclaimer}</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setStep(2)} style={{ flex:1, background:"#f2f2f7", color:"#1c1c1e", border:"none", padding:"14px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.backBtn}</button>
              <button onClick={handleSubmit} style={{ flex:2, background:G, color:"#000", border:"none", padding:"14px", borderRadius:12, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.submitBtn}</button>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

/* ── MAIN APP ───────────────────────────────────────────────────── */
export default function Aprovuit() {
  const [view, setView] = useState("landing");
  const [lang, setLang] = useState("en");
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleLang = () => setLang(l => l==="en"?"es":"en");
  const t = TRANSLATIONS[lang];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html { scroll-behavior:smooth; }
    body { background:#0a0a0a; color:#fff; font-family:'DM Sans',sans-serif; }
    ::selection { background:#a8ff3e; color:#000; }
    .cond { font-family:'Barlow Condensed',sans-serif; }
    .nav-link { font-size:14px; font-weight:500; color:rgba(255,255,255,0.6); cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color 0.2s; }
    .nav-link:hover { color:#fff; }
    .btn-g { display:inline-flex; align-items:center; gap:8px; background:#a8ff3e; color:#000; border:none; padding:14px 32px; font-size:15px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.18s; border-radius:3px; }
    .btn-g:hover { background:#c2ff52; transform:translateY(-1px); }
    .btn-dk { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); color:#fff; border:1px solid rgba(255,255,255,0.12); padding:13px 28px; font-size:15px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.18s; border-radius:3px; }
    .btn-dk:hover { background:rgba(255,255,255,0.1); }
    .prod-card { background:#1a1a1a; border:1px solid rgba(255,255,255,0.06); padding:32px; transition:all 0.2s; border-radius:4px; }
    .prod-card:hover { border-color:#a8ff3e; transform:translateY(-2px); }
    .faq-btn { width:100%; background:none; border:none; color:#fff; display:flex; justify-content:space-between; align-items:center; padding:22px 0; cursor:pointer; text-align:left; font-family:'DM Sans',sans-serif; border-bottom:1px solid rgba(255,255,255,0.07); gap:16px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    .fu { animation:fadeUp 0.5s ease both; }
    .fu2 { animation-delay:0.2s; }
    @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    .tick { display:flex; animation:ticker 30s linear infinite; width:max-content; }
    .lang-pill { display:flex; border:1px solid rgba(255,255,255,0.15); border-radius:20px; overflow:hidden; }
    .lang-btn { padding:5px 14px; font-size:12px; font-weight:700; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
  `;

  if (view==="apply") return <ApplyPage lang={lang} onBack={()=>setView("landing")} />;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:BK, color:"#fff", minHeight:"100vh" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(10,10,10,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 5%", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
        <button onClick={()=>setView("landing")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:15, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
          </div>
          <span className="cond" style={{ fontSize:22, fontWeight:800, letterSpacing:"0.02em", color:"#fff" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", gap:28, alignItems:"center" }}>
          {[t.nav.products, t.nav.howItWorks, t.nav.faq].map((l,i)=>(
            <button key={l} className="nav-link" onClick={()=>document.getElementById(["products","how-it-works","faq"][i])?.scrollIntoView({behavior:"smooth"})}>{l}</button>
          ))}
          <div className="lang-pill">
            <button className="lang-btn" onClick={toggleLang} style={{ background:lang==="en"?G:"transparent", color:lang==="en"?"#000":"rgba(255,255,255,0.5)" }}>EN</button>
            <button className="lang-btn" onClick={toggleLang} style={{ background:lang==="es"?G:"transparent", color:lang==="es"?"#000":"rgba(255,255,255,0.5)" }}>ES</button>
          </div>
          <button className="btn-g" style={{ padding:"10px 22px", fontSize:14 }} onClick={()=>setView("apply")}>{t.nav.applyNow}</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:BK, minHeight:"90vh", display:"flex", alignItems:"center", padding:"80px 5%", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 20% 50%, ${G}14 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${G}08 0%, transparent 50%)`, pointerEvents:"none" }}></div>
        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div className="fu">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,255,62,0.08)", border:`1px solid ${G}33`, padding:"6px 16px", borderRadius:20, marginBottom:28 }}>
              <div style={{ width:6, height:6, background:G, borderRadius:"50%" }}></div>
              <span style={{ fontSize:12, color:G, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>{t.hero.badge}</span>
            </div>
            <h1 className="cond" style={{ fontSize:"clamp(52px,7vw,88px)", fontWeight:900, lineHeight:0.92, marginBottom:28, letterSpacing:"-0.02em", textTransform:"uppercase" }}>
              {t.hero.h1a}<br /><span style={{ color:G }}>{t.hero.h1b}</span><br />{t.hero.h1c}
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,0.55)", lineHeight:1.8, marginBottom:40, fontWeight:300, maxWidth:480 }}>{t.hero.sub}</p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <button className="btn-g" style={{ fontSize:16, padding:"16px 40px" }} onClick={()=>setView("apply")}>{t.hero.cta1}</button>
              <button className="btn-dk" onClick={()=>document.getElementById("how-it-works")?.scrollIntoView({behavior:"smooth"})}>{t.hero.cta2}</button>
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
                {[{label:"APP-2041 · Term Loan",status:"Approved ✓",sc:G,amt:"$150,000",sub:"Offer ready"},{label:"APP-2038 · Line of Credit",status:"Under Review",sc:"#f59e0b",amt:"$75,000",sub:"Decision in ~24 hours"},{label:"LN-10042 · Active Loan",status:"Current",sc:"#60a5fa",amt:"$84,200 left",sub:"44% paid off"}].map((item,i)=>(
                  <div key={i} style={{ background:BK3, borderRadius:12, padding:"14px 16px", marginBottom:10, border:"1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{item.label}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:item.sc }}>{item.status}</span>
                    </div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#fff", marginBottom:4, fontFamily:"'Barlow Condensed',sans-serif" }}>{item.amt}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{item.sub}</div>
                  </div>
                ))}
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <div style={{ flex:1, background:G, borderRadius:10, padding:"11px 0", textAlign:"center", fontSize:13, fontWeight:800, color:"#000" }}>Accept ✓</div>
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
          {[...Array(2)].map((_,ti)=>(
            <span key={ti} style={{ display:"flex" }}>
              {t.ticker.map(text=>(
                <span key={text} style={{ display:"inline-flex", alignItems:"center", gap:14, padding:"0 32px" }}>
                  <span style={{ fontSize:13, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#000", whiteSpace:"nowrap" }}>{text}</span>
                  <span style={{ color:"#000", opacity:0.3 }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ background:BK2, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", padding:"0 5%" }}>
          {t.stats.map(([v,l],i)=>(
            <div key={l} style={{ padding:"40px 0", textAlign:"center", borderRight:i<3?"1px solid rgba(255,255,255,0.06)":"none" }}>
              <div className="cond" style={{ fontSize:52, fontWeight:900, color:G, letterSpacing:"-0.02em", lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:8, fontWeight:500, letterSpacing:"0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LET'S SEE IF WE MATCH */}
      <section style={{ background:`linear-gradient(135deg,${BK3},${BK2})`, padding:"80px 5%", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div>
            <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700 }}>{t.match.badge}</p>
            <h2 className="cond" style={{ fontSize:"clamp(36px,5vw,56px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:20 }}>{t.match.h}</h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.85, fontWeight:300, marginBottom:32 }}>{t.match.sub}</p>
            <div style={{ display:"grid", gap:12, marginBottom:40 }}>
              {t.match.reqs.map(([v,l])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ width:44, height:44, background:"rgba(168,255,62,0.1)", border:`1px solid ${G}30`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span className="cond" style={{ fontSize:14, fontWeight:800, color:G }}>{v}</span>
                  </div>
                  <span style={{ fontSize:15, color:"rgba(255,255,255,0.6)" }}>{l}</span>
                </div>
              ))}
            </div>
            <button className="btn-g" style={{ fontSize:16, padding:"16px 48px" }} onClick={()=>setView("apply")}>{t.match.cta}</button>
          </div>
          <div style={{ background:BK, border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:40 }}>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:20, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{t.match.estimate}</p>
            {t.match.products.map(([name,range,term])=>(
              <div key={name} onClick={()=>setView("apply")} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", cursor:"pointer" }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:2 }}>{name}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{term}</p>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:G }}>{range}</span>
              </div>
            ))}
            <button className="btn-g" style={{ width:"100%", justifyContent:"center", marginTop:24, padding:"14px" }} onClick={()=>setView("apply")}>{t.match.checkBtn}</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:"96px 5%", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700 }}>{t.how.badge}</p>
          <h2 className="cond" style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>{t.how.h.split("\n").map((line,i)=><span key={i}>{line}{i===0&&<br/>}</span>)}</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {t.how.steps.map(([n,title,desc],i)=>(
            <div key={n} style={{ background:i===1?G:BK3, color:i===1?"#000":"#fff", padding:"48px 40px", border:`1px solid ${i===1?G:"rgba(255,255,255,0.06)"}` }}>
              <div className="cond" style={{ fontSize:64, fontWeight:900, opacity:0.12, marginBottom:24, letterSpacing:"-0.04em" }}>{n}</div>
              <h3 className="cond" style={{ fontSize:26, fontWeight:800, textTransform:"uppercase", marginBottom:16 }}>{title}</h3>
              <p style={{ fontSize:15, lineHeight:1.8, opacity:i===1?0.7:0.5, fontWeight:300 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" style={{ background:BK2, padding:"80px 5%", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:16 }}>
            <div>
              <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:12, fontWeight:700 }}>{t.products.badge}</p>
              <h2 className="cond" style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>{t.products.h}</h2>
            </div>
            <button className="btn-g" onClick={()=>setView("apply")}>{t.products.cta}</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:2 }}>
            {t.products.items.map(p=>(
              <div key={p.name} className="prod-card">
                <div style={{ fontSize:28, marginBottom:16, color:G }}>{p.icon}</div>
                <h3 className="cond" style={{ fontSize:26, fontWeight:800, textTransform:"uppercase", marginBottom:10 }}>{p.name}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.75, marginBottom:20, fontWeight:300 }}>{p.desc}</p>
                <div style={{ display:"flex", gap:24 }}>
                  <div><p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>{t.products.amountLabel}</p><p style={{ fontSize:14, fontWeight:600, color:G }}>{p.range}</p></div>
                  <div><p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>{t.products.termLabel}</p><p style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{p.term}</p></div>
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
            <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700 }}>{t.why.badge}</p>
            <h2 className="cond" style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:28 }}>{t.why.h}</h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.85, fontWeight:300 }}>{t.why.sub}</p>
          </div>
          <div style={{ display:"grid", gap:2 }}>
            {t.why.items.map(([ic,title,desc])=>(
              <div key={title} style={{ background:BK3, border:"1px solid rgba(255,255,255,0.06)", padding:"20px 24px", display:"flex", gap:16, alignItems:"flex-start" }}>
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
      <section style={{ background:BK2, padding:"80px 5%", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700, textAlign:"center" }}>{t.reviews.badge}</p>
          <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:56 }}>{t.reviews.h}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
            {t.reviews.items.map(r=>(
              <div key={r.name} style={{ background:BK3, border:"1px solid rgba(255,255,255,0.06)", padding:"36px 32px" }}>
                <div style={{ display:"flex", gap:3, marginBottom:20 }}>
                  {[...Array(r.stars)].map((_,i)=><span key={i} style={{ color:G, fontSize:16 }}>★</span>)}
                </div>
                <p style={{ fontSize:15, lineHeight:1.85, color:"rgba(255,255,255,0.6)", marginBottom:28, fontStyle:"italic", fontWeight:300 }}>"{r.text}"</p>
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:18 }}>
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
        <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:G, marginBottom:16, fontWeight:700, textAlign:"center" }}>{t.faqSection.badge}</p>
        <h2 className="cond" style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em", textAlign:"center", marginBottom:48 }}>{t.faqSection.h}</h2>
        {t.faqSection.items.map(([q,a],i)=>(
          <div key={i}>
            <button className="faq-btn" onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
              <span style={{ fontSize:17, fontWeight:600, fontFamily:"'Barlow',sans-serif" }}>{q}</span>
              <span style={{ fontSize:22, color:"rgba(255,255,255,0.3)", flexShrink:0, transition:"transform 0.2s", transform:faqOpen===i?"rotate(45deg)":"none" }}>+</span>
            </button>
            {faqOpen===i && <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.85, paddingBottom:24, fontWeight:300, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>{a}</p>}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ background:G, padding:"80px 5%", textAlign:"center" }}>
        <h2 className="cond" style={{ fontSize:"clamp(36px,6vw,72px)", fontWeight:900, color:"#000", textTransform:"uppercase", letterSpacing:"-0.02em", marginBottom:20 }}>{t.cta.h}</h2>
        <p style={{ fontSize:18, color:"rgba(0,0,0,0.6)", marginBottom:40, fontWeight:300 }}>{t.cta.sub}</p>
        <button onClick={()=>setView("apply")} style={{ background:"#000", color:G, border:"none", padding:"18px 56px", fontSize:18, fontWeight:800, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.04em", textTransform:"uppercase", borderRadius:3 }}>
          {t.cta.btn}
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background:BK, borderTop:"1px solid rgba(255,255,255,0.05)", padding:"48px 5% 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, background:G, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
            </div>
            <span className="cond" style={{ fontSize:20, fontWeight:800, letterSpacing:"0.02em" }}>APROVUIT</span>
          </div>
          <div style={{ display:"flex", gap:32 }}>
            <button className="nav-link" onClick={()=>setView("apply")}>{t.footer.apply}</button>
            <button className="nav-link" onClick={()=>setView("apply")}>{t.footer.client}</button>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
