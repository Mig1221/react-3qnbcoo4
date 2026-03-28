import React, { useState } from 'react';

const G = "#a8ff3e";

// ── EmailJS config — fill in your IDs from emailjs.com ──────────
// Formspree endpoint — emails go directly to themigzgroupllc@gmail.com
const FORMSPREE_URL = "https://formspree.io/f/xbdpdnby";

async function sendApplicationEmail(data) {
  try {
    await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: "🔔 New Application — " + data.company + " | " + data.loanAmt,
        _replyto: data.email,
        "Application ID": data.id,
        "Submitted": data.submittedAt,
        "Name": data.firstName + " " + data.lastName,
        "Company": data.company,
        "Email": data.email,
        "Phone": data.phone,
        "Loan Amount": data.loanAmt,
        "Purpose": data.purpose,
        "Timeline": data.timeline,
        "Industry": data.industry,
        "Years in Business": data.years,
        "Annual Revenue": data.annualRev,
        "Credit Rating": data.creditRating,
        "Estimated Pre-Qual": data.estimatedQualify,
        "Upload Link": "https://aprovuit.com/?upload=" + data.id,
      })
    });
  } catch(e) {
    console.error("Formspree error:", e);
  }
}

async function sendClientEmail(data) {
  // Client confirmation — sends via Formspree with client email as reply-to
  try {
    await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: "✅ Application Received — " + data.company + " | Aprovuit",
        _replyto: "themigzgroupllc@gmail.com",
        "TO CLIENT": data.email,
        "Message": "Hi " + data.firstName + ", your application for " + data.company + " has been received! App ID: " + data.id + ". We will be in touch within 2-4 hours. Upload your documents here: https://aprovuit.com/?upload=" + data.id,
        "Upload Link": "https://aprovuit.com/?upload=" + data.id,
      })
    });
  } catch(e) {
    console.error("Client email error:", e);
  }
}
const BK = "#0a0a0a";
const BK2 = "#111111";
const BK3 = "#1a1a1a";

const TRANSLATIONS = {
  en: {
    nav: { products: "Products", howItWorks: "How It Works", faq: "FAQ", partnerLogin: "Partner Login", applyNow: "Apply Now →" },
    hero: {
      badge: "No Phone Calls. Ever.",
      h1a: "APPROVE IT.", h1b: "FUND IT.", h1c: "TRACK IT.",
      sub: "Business funding that lives entirely online. Apply in minutes, track approvals in real time, accept offers, and manage every loan — without ever picking up the phone.",
      cta1: "Apply Now — Free →", cta2: "See How It Works",
    },
    ticker: ["Apply in Minutes","No Phone Calls Required","Track Approvals in Real Time","Accept Offers in One Click","Upload Bank Statements","See Every Term Clearly","No Spam Callers","Funded Same Day","580+ Credit Score OK"],
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
      badge: "Simple Process", h1: "Zero Phone Calls.", h2: "Total Transparency.",
      steps: [["01","Apply in Minutes","Fill out our smart application. Upload your bank statements. No phone interviews. Takes under 5 minutes."],["02","Track in Real Time","Watch your application update live. Approved, under review, or declined — you'll know instantly."],["03","Accept & Get Funded","Your offer appears with every term clearly laid out. Accept or decline with one click. Funds same day."]],
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
      heroH1: "Secure Your", heroH1b: "Business Funding Today",
      heroP: "Fast approvals. No phone calls. Funding in as little as 24 hours.",
      howMuch: "How much funding do you need?",
      requestedAmt: "Requested Amount",
      getStarted: "Get Started Now →",
      secure: "100% Secure & Confidential",
      creditLabel: "Estimate your credit score",
      creditOpts: [["excellent","Excellent","750+"],["good","Good","680+"],["fair","Fair","580+"],["poor","Poor","<580"]],
      qualifyUp: "You may qualify for up to",
      qualNote: "*Estimate only. Subject to approval.",
      steps: ["Funding","Business","Contact","Review"],
      continueBtn: "Continue →",
      backBtn: "← Back",
      purposeLabel: "What do you need funding for?",
      purposeOpts: ["Select...","Working Capital","Equipment Purchase","Business Expansion","Payroll","Inventory","Marketing & Advertising","Hiring Staff","Debt Refinancing","Other"],
      timelineLabel: "How soon do you need funds?",
      timelineOpts: ["Select...","As soon as possible (1–3 days)","Within 1 week","Within 2 weeks","Within 30 days","Just exploring options"],
      companyLabel: "Company Name", companyPH: "Your business name",
      industryLabel: "Industry",
      industryOpts: ["Select...","Retail","Restaurant / Food Service","Construction","Healthcare / Medical","Transportation / Logistics","Beauty / Salon / Spa","Fitness / Gym","Automotive","Professional Services","Real Estate","Technology","Manufacturing","Other"],
      yearsLabel: "Years in Business",
      yearsOpts: ["Select...","Less than 6 months","6–12 months","1–2 years","2–5 years","5–10 years","10+ years"],
      annualLabel: "Annual Revenue",
      annualOpts: ["Select...","Under $120K","$120K – $250K","$250K – $500K","$500K – $1M","$1M – $2.5M","$2.5M – $5M","$5M+"],
      creditEstLabel: "Estimate your credit rating",
      firstName: "First Name", lastName: "Last Name",
      emailLabel: "Email Address", emailPH: "you@yourbusiness.com",
      phoneLabel: "Phone Number", phonePH: "(555) 000-0000",
      reviewTitle: "Review Your Application",
      reviewSub: "Everything look right? Submit to get your offer.",
      summaryKeys: ["Loan Amount","Purpose","Timeline","Company","Industry","Revenue","Credit","Name","Email","Phone"],
      disclaimer: "By clicking Submit, you authorize Aprovuit to perform a soft credit inquiry. This will NOT impact your credit score.",
      submitBtn: "Get My Offer Now →",
      successH: "Application Received!",
      successP: "We're reviewing your application now. Expect a personalized offer within 2–4 hours — delivered to your email, no phone call required.",
      nextTitle: "What happens next:",
      nextSteps: ["Your application is reviewed within 2–4 hours","A personalized offer is sent to your email","You review all terms and accept — no pressure, no calls"],
      estLabel: "Your estimated pre-qualification",
      estNote: "*Subject to full underwriting and approval",
    },
  },
  es: {
    nav: { products: "Productos", howItWorks: "Cómo Funciona", faq: "Preguntas", partnerLogin: "Acceso Socios", applyNow: "Aplicar Ahora →" },
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
      badge: "Proceso Simple", h1: "Cero Llamadas.", h2: "Total Transparencia.",
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
      items: [["📵","Sin Llamadas","Aplica, rastrea, acepta y mensajea a tu asesor completamente en línea."],["🔍","Transparencia Total","Ve exactamente lo que estás aprobando antes de firmar. Sin sorpresas."],["🏦","Carga Fácil de Documentos","Sube tus estados de cuenta directamente. Simple, seguro y toma segundos."],["🔄","Renovaciones en Línea","Cuando seas elegible para renovación, aparece en tu portal. Sin llamadas frías."]],
    },
    reviews: {
      badge: "Resultados Reales", h: "Dueños de Negocio Confían en Aprovuit",
      items: [
        { name:"Marcus T.", biz:"Logística, Texas", text:"Apliqué a las 9am, aprobado al mediodía, fondos a la mañana siguiente. Cero llamadas. Así debería funcionar el préstamo.", stars:5 },
        { name:"Priya S.", biz:"Med Spa, California", text:"La plataforma me mostró exactamente dónde estaba mi solicitud en cada paso. Sin perseguir a nadie. Total transparencia.", stars:5 },
        { name:"Darnell R.", biz:"Construcción, Georgia", text:"Obtuve una línea de crédito de $200K. Vi cada término claramente antes de firmar. Sin sorpresas.", stars:5 },
      ],
    },
    faqSection: {
      badge: "Preguntas Frecuentes", h: "Preguntas Comunes",
      items: [
        ["¿Cuánto tiempo toma la aprobación?","La mayoría de las decisiones llegan en 2–4 horas durante el horario comercial. Una vez aprobado, los fondos pueden llegar el mismo día o el siguiente día hábil."],
        ["¿Aplicar afectará mi crédito?","Nuestra revisión inicial usa una consulta suave — cero impacto en tu puntaje. Una consulta dura solo ocurre si decides aceptar una oferta."],
        ["¿Qué documentos necesito?","Solo información básica del negocio y 3 meses de estados de cuenta bancarios. Cárgalos directamente — sin enviar PDFs por correo."],
        ["¿Necesito hablar por teléfono?","Nunca. Todo ocurre en línea. Aplica, rastrea, revisa ofertas, acepta o rechaza — todo sin una llamada telefónica."],
        ["¿Cuáles son los requisitos mínimos?","6+ meses en operación, $10K+ de ingresos mensuales, 580+ de puntaje de crédito."],
      ],
    },
    cta: { h: "¿Listo para Obtener Financiamiento?", sub: "Aplica en minutos. Sin llamadas. Sin compromiso.", btn: "Aplicar Ahora — Es Gratis →" },
    footer: { apply: "Aplicar Ahora", client: "Acceso Cliente", partner: "Panel de Socios", rights: "© 2026 Aprovuit. Todos los derechos reservados. · aprovuit.com" },
    apply: {
      noPhone: "Sin Llamada Telefónica",
      heroH1: "Asegura el", heroH1b: "Financiamiento de tu Negocio Hoy",
      heroP: "Aprobaciones rápidas. Sin llamadas. Fondos en tan solo 24 horas.",
      howMuch: "¿Cuánto financiamiento necesitas?",
      requestedAmt: "Monto Solicitado",
      getStarted: "Comenzar Ahora →",
      secure: "100% Seguro y Confidencial",
      creditLabel: "Estima tu puntaje de crédito",
      creditOpts: [["excellent","Excelente","750+"],["good","Bueno","680+"],["fair","Regular","580+"],["poor","Bajo","<580"]],
      qualifyUp: "Podrías calificar para hasta",
      qualNote: "*Solo estimado. Sujeto a aprobación.",
      steps: ["Fondos","Negocio","Contacto","Revisión"],
      continueBtn: "Continuar →",
      backBtn: "← Atrás",
      purposeLabel: "¿Para qué necesitas el dinero?",
      purposeOpts: ["Selecciona...","Capital de Trabajo","Compra de Equipo","Expansión del Negocio","Nómina","Inventario","Marketing y Publicidad","Contratar Personal","Refinanciamiento de Deuda","Otro"],
      timelineLabel: "¿Cuándo necesitas los fondos?",
      timelineOpts: ["Selecciona...","Lo antes posible (1–3 días)","En 1 semana","En 2 semanas","En 30 días","Solo explorando opciones"],
      companyLabel: "Nombre de la Empresa", companyPH: "Nombre de tu negocio",
      industryLabel: "Industria",
      industryOpts: ["Selecciona...","Retail / Ventas al por menor","Restaurante / Comida","Construcción","Salud / Médico","Transporte / Logística","Belleza / Salón / Spa","Fitness / Gimnasio","Automotriz","Servicios Profesionales","Bienes Raíces","Tecnología","Manufactura","Otro"],
      yearsLabel: "Años en Operación",
      yearsOpts: ["Selecciona...","Menos de 6 meses","6–12 meses","1–2 años","2–5 años","5–10 años","10+ años"],
      annualLabel: "Ingresos Anuales",
      annualOpts: ["Selecciona...","Menos de $120K","$120K – $250K","$250K – $500K","$500K – $1M","$1M – $2.5M","$2.5M – $5M","$5M+"],
      creditEstLabel: "Estima tu puntaje de crédito",
      firstName: "Nombre", lastName: "Apellido",
      emailLabel: "Correo Electrónico", emailPH: "tu@negocio.com",
      phoneLabel: "Número de Teléfono", phonePH: "(555) 000-0000",
      reviewTitle: "Revisa Tu Solicitud",
      reviewSub: "¿Todo correcto? Envía para recibir tu oferta.",
      summaryKeys: ["Monto","Propósito","Plazo","Empresa","Industria","Ingresos","Crédito","Nombre","Correo","Teléfono"],
      disclaimer: "Al hacer clic en Enviar, autorizas a Aprovuit a realizar una consulta suave de crédito. Esto NO afectará tu puntaje de crédito.",
      submitBtn: "Obtener Mi Oferta Ahora →",
      successH: "¡Solicitud Recibida!",
      successP: "Estamos revisando tu solicitud ahora. Recibirás una oferta personalizada en 2–4 horas — en tu correo, sin llamadas.",
      nextTitle: "¿Qué pasa ahora?",
      nextSteps: ["Tu solicitud es revisada en 2–4 horas","Una oferta personalizada llega a tu correo","Revisas los términos y aceptas — sin presión, sin llamadas"],
      estLabel: "Tu pre-calificación estimada",
      estNote: "*Sujeto a revisión y aprobación completa",
    },
  },
};

function fmtAmt(n) {
  if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M';
  return '$' + Math.round(n).toLocaleString();
}


/* ══════════════════════════════════════════════════════════════════
DOCUMENT UPLOAD PAGE
══════════════════════════════════════════════════════════════════ */
function UploadPage({ lang, appId, onBack }) {
  const [files, setFiles] = useState({ bank1:null, bank2:null, bank3:null, bank4:null, bank5:null, bank6:null, license:null, voided:null });
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  const labels = {
    en: {
      title: "Upload Your Documents",
      sub: "Securely upload your documents to complete your application.",
      appId: "Application",
      bankTitle: "6 Months of Bank Statements",
      bankSub: "Upload your last 6 months of business bank statements",
      licenseTitle: "Driver's License",
      licenseSub: "Front of your government-issued ID",
      voidedTitle: "Voided Check",
      voidedSub: "A voided check from your business checking account",
      months: ["Month 1","Month 2","Month 3","Month 4","Month 5","Month 6"],
      drop: "Drop file here or click to upload",
      formats: "PDF, JPG, PNG accepted",
      uploadBtn: "Submit Documents →",
      uploading: "Uploading...",
      successH: "Documents Received!",
      successP: "We've received your documents and will be in touch within 24 hours.",
      backBtn: "← Back to Aprovuit",
      secure: "256-bit encrypted · Your documents are safe",
      required: "Required",
    },
    es: {
      title: "Sube Tus Documentos",
      sub: "Sube tus documentos de forma segura para completar tu solicitud.",
      appId: "Solicitud",
      bankTitle: "6 Meses de Estados de Cuenta",
      bankSub: "Sube tus últimos 6 meses de estados de cuenta bancarios",
      licenseTitle: "Licencia de Conducir",
      licenseSub: "Frente de tu identificación oficial",
      voidedTitle: "Cheque Anulado",
      voidedSub: "Un cheque anulado de tu cuenta corriente empresarial",
      months: ["Mes 1","Mes 2","Mes 3","Mes 4","Mes 5","Mes 6"],
      drop: "Arrastra el archivo aquí o haz clic para subir",
      formats: "Se aceptan PDF, JPG, PNG",
      uploadBtn: "Enviar Documentos →",
      uploading: "Subiendo...",
      successH: "¡Documentos Recibidos!",
      successP: "Recibimos tus documentos y nos comunicaremos contigo en 24 horas.",
      backBtn: "← Volver a Aprovuit",
      secure: "Encriptado 256-bit · Tus documentos están seguros",
      required: "Requerido",
    }
  };
  const t = labels[lang] || labels.en;

  const handleFile = (key, file) => {
    setFiles(f => ({...f, [key]: file}));
  };

  const FileDropZone = ({ fileKey, label, sublabel }) => {
    const file = files[fileKey];
    const isDrag = dragOver === fileKey;
    return (
      <div
        onDragOver={e=>{e.preventDefault();setDragOver(fileKey);}}
        onDragLeave={()=>setDragOver(null)}
        onDrop={e=>{e.preventDefault();setDragOver(null);const f=e.dataTransfer.files[0];if(f)handleFile(fileKey,f);}}
        style={{ border:`2px dashed ${file?"#a8ff3e":isDrag?"#1a1a1a":"#e5e8ee"}`, borderRadius:12, padding:"20px 16px", textAlign:"center", background:file?"#f0fdf4":isDrag?"#f9fafb":"#fafafa", position:"relative", transition:"all 0.15s", cursor:"pointer" }}
      >
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>handleFile(fileKey,e.target.files[0])} style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%" }} />
        {file ? (
          <div>
            <div style={{ fontSize:24, marginBottom:6 }}>✅</div>
            <p style={{ fontSize:13, fontWeight:700, color:"#16a34a", marginBottom:2 }}>{file.name}</p>
            <p style={{ fontSize:11, color:"#888" }}>{(file.size/1024).toFixed(0)} KB</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:28, marginBottom:8, color:"#ccc" }}>📄</div>
            <p style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:2 }}>{label}</p>
            <p style={{ fontSize:12, color:"#aaa", marginBottom:4 }}>{sublabel}</p>
            <p style={{ fontSize:11, color:"#ccc" }}>{t.formats}</p>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    setUploading(true);
    // In production, files would upload to Google Drive via API
    // For now we save to localStorage and send notification email
    const uploadData = {
      appId,
      submittedAt: new Date().toLocaleString(),
      files: Object.entries(files).filter(([,v])=>v).map(([k,v])=>({key:k, name:v?.name})),
    };
    const uploads = JSON.parse(localStorage.getItem("aprovuit_uploads")||"[]");
    uploads.push(uploadData);
    localStorage.setItem("aprovuit_uploads", JSON.stringify(uploads));

    // Notify via Formspree
    try {
      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "📎 Documents Uploaded — " + appId + " | Aprovuit",
          "Application ID": appId,
          "Submitted": uploadData.submittedAt,
          "Files Uploaded": uploadData.files.map(f=>f.name).join(", "),
        })
      });
    } catch(e) { console.error(e); }

    setUploading(false);
    setSubmitted(true);
  };

  const UPLOAD_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; background:#f5f7fa; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fadeup { animation:fadeUp 0.35s ease both; }
  `;

  if (submitted) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0a0a,#0d1f0d)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{UPLOAD_CSS}</style>
      <div className="fadeup" style={{ background:"#fff", borderRadius:20, padding:"48px 40px", maxWidth:480, width:"100%", textAlign:"center" }}>
        <div style={{ width:88, height:88, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:40 }}>✓</div>
        <h2 style={{ fontSize:28, fontWeight:900, color:"#1a1a1a", marginBottom:12, fontFamily:"'Barlow Condensed',sans-serif", textTransform:"uppercase" }}>{t.successH}</h2>
        <p style={{ fontSize:15, color:"#666", lineHeight:1.75, marginBottom:32 }}>{t.successP}</p>
        <button onClick={onBack} style={{ background:"#0a0a0a", color:"#a8ff3e", border:"none", padding:"14px 36px", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{t.backBtn}</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f5f7fa" }}>
      <style>{UPLOAD_CSS}</style>

      {/* NAV */}
      <div style={{ background:"#0a0a0a", padding:"0 5%", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:"#a8ff3e", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:14, fontWeight:900, fontFamily:"'Barlow Condensed',sans-serif", color:"#000" }}>A</span>
          </div>
          <span style={{ fontSize:20, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:"#fff", letterSpacing:"0.03em" }}>APROVUIT</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(168,255,62,0.08)", border:"1px solid rgba(168,255,62,0.25)", padding:"5px 14px", borderRadius:20 }}>
          <div style={{ width:6, height:6, background:"#a8ff3e", borderRadius:"50%" }}></div>
          <span style={{ fontSize:12, color:"#a8ff3e", fontWeight:700 }}>🔒 {t.secure}</span>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0a0a0a,#0d1f0d)", padding:"40px 24px 48px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(168,255,62,0.1)", border:"1px solid rgba(168,255,62,0.2)", padding:"4px 14px", borderRadius:20, marginBottom:16 }}>
          <span style={{ fontSize:11, color:"#a8ff3e", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>{t.appId}: {appId || "APP-NEW"}</span>
        </div>
        <h1 style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:900, color:"#fff", marginBottom:10, letterSpacing:"-0.02em" }}>{t.title}</h1>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", maxWidth:440, margin:"0 auto" }}>{t.sub}</p>
      </div>

      {/* UPLOAD FORM */}
      <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px 80px" }}>

        {/* Bank Statements */}
        <div style={{ background:"#fff", borderRadius:18, padding:"28px", marginBottom:20, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <span style={{ fontSize:24 }}>🏦</span>
            <div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#1a1a1a" }}>{t.bankTitle}</h3>
              <p style={{ fontSize:13, color:"#888" }}>{t.bankSub}</p>
            </div>
            <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:"#ef4444", background:"#fef2f2", padding:"3px 10px", borderRadius:20 }}>{t.required}</span>
          </div>
          <div style={{ height:1, background:"#f0f0f0", margin:"16px 0" }}></div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {["bank1","bank2","bank3","bank4","bank5","bank6"].map((key,i)=>(
              <FileDropZone key={key} fileKey={key} label={t.months[i]} sublabel="PDF / IMG" />
            ))}
          </div>
        </div>

        {/* Driver's License */}
        <div style={{ background:"#fff", borderRadius:18, padding:"28px", marginBottom:20, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:24 }}>🪪</span>
            <div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#1a1a1a" }}>{t.licenseTitle}</h3>
              <p style={{ fontSize:13, color:"#888" }}>{t.licenseSub}</p>
            </div>
            <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:"#ef4444", background:"#fef2f2", padding:"3px 10px", borderRadius:20 }}>{t.required}</span>
          </div>
          <FileDropZone fileKey="license" label={t.licenseTitle} sublabel="JPG / PNG / PDF" />
        </div>

        {/* Voided Check */}
        <div style={{ background:"#fff", borderRadius:18, padding:"28px", marginBottom:28, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:24 }}>📋</span>
            <div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#1a1a1a" }}>{t.voidedTitle}</h3>
              <p style={{ fontSize:13, color:"#888" }}>{t.voidedSub}</p>
            </div>
            <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:"#ef4444", background:"#fef2f2", padding:"3px 10px", borderRadius:20 }}>{t.required}</span>
          </div>
          <FileDropZone fileKey="voided" label={t.voidedTitle} sublabel="JPG / PNG / PDF" />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          style={{ width:"100%", background: uploading?"#ccc":"#a8ff3e", color:"#000", border:"none", padding:"18px", borderRadius:12, fontSize:17, fontWeight:900, cursor:uploading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
        >
          {uploading ? t.uploading : t.uploadBtn}
        </button>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:14 }}>
          <span style={{ fontSize:13, color:"#888" }}>🔒 {t.secure}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
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

/* ══════════════════════════════════════════════════════════════════
MAIN APP
══════════════════════════════════════════════════════════════════ */
export default function Aprovuit() {
  // Check URL for ?upload=APP-xxx immediately on load
  const initialParams = new URLSearchParams(window.location.search);
  const initialUploadId = initialParams.get("upload");

  const [view, setView] = useState(initialUploadId ? "upload" : "landing");
  const [uploadAppId, setUploadAppId] = useState(initialUploadId || null);
  const [lang, setLang] = useState("en");
  const [faqOpen, setFaqOpen] = useState(null);
  const toggleLang = () => setLang(l=>l==="en"?"es":"en");
  const t = TRANSLATIONS[lang];

  // Email handled via Formspree

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

  if (view==="upload") return <UploadPage lang={lang} appId={uploadAppId} onBack={()=>setView("landing")} />;
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
          <h2 className="cond" style={{ fontSize:"clamp(36px,5vw,60px)", fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.02em" }}>{t.how.h1}<br />{t.how.h2}</h2>
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
