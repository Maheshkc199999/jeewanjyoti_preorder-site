import { useEffect, useRef, useState } from "react";
import {
  motion, AnimatePresence, useReducedMotion, useScroll, useTransform,
  useSpring, useMotionValue, useMotionTemplate,
} from "framer-motion";
import {
  Activity, ArrowRight, CalendarCheck, Check, ChevronRight, Droplets,
  Heart, LineChart, Loader2, Lock, Mail, MessageSquare, Phone,
  Stethoscope, Thermometer, Users, Video, X, XCircle,
} from "lucide-react";
import jjlogo from "./assets/jjlogo.png";
import appScreenshot from "./assets/jeewanjyotiss.gif";
import qrCode from "./assets/qr.jpg";
import AppHeader from "./components/AppHeader";

const API_BASE_URL = "http://103.118.16.251:8002";

/* ─── Design tokens ─────────────────────────────────────────────────────────
   Paper-white base, one blue family, one clinical red used twice.
   Rounded lg/xl only, hairline borders, quiet shadows.                      */
const C = {
  ink: "#2F3A45",
  muted: "#7B8794",
  line: "#D7E3EE",
  paper: "#FAFBFC",
  wash: "#EAF4FF",
  blue: "#1D4ED8",
  blue2: "#3B82F6",
  pulse: "#DC2626",
};

const EASE = [0.22, 1, 0.36, 1];
const EASE_OUT = [0.16, 1, 0.3, 1];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@500;600;700&display=swap');

.jj-display { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
.jj-mono    { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
.jj-body    { font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif; }

/* ECG paper: 8mm minor grid, 40mm major grid */
.jj-ecg-paper {
  background-image:
    linear-gradient(to right, rgba(29,78,216,.10) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(29,78,216,.10) 1px, transparent 1px),
    linear-gradient(to right, rgba(29,78,216,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(29,78,216,.05) 1px, transparent 1px);
  background-size: 56px 56px, 56px 56px, 8px 8px, 8px 8px;
}
.jj-fade-down { -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%);
                mask-image: linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%); }
.jj-fade-x { -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
             mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent); }

/* Faint paper grain */
.jj-grain::after {
  content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: .5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E");
}

.jj-card { box-shadow: 0 1px 2px rgba(47,58,69,.05), 0 14px 30px -22px rgba(29,78,216,.35); }
.jj-lift { transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s cubic-bezier(.22,1,.36,1), border-color .3s ease; }
.jj-lift:hover { transform: translateY(-3px); box-shadow: 0 2px 4px rgba(47,58,69,.05), 0 22px 40px -26px rgba(29,78,216,.5); }

/* Readings marquee — pauses when you hover it */
@keyframes jj-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.jj-marquee { animation: jj-marquee 42s linear infinite; }
.jj-marquee:hover { animation-play-state: paused; }

/* Laminated sheen sweep */
@keyframes jj-sheen { 0% { transform: translateX(-130%) skewX(-12deg); } 100% { transform: translateX(230%) skewX(-12deg); } }
.jj-sheen { animation: jj-sheen 6.5s cubic-bezier(.4,0,.2,1) infinite; }

:focus-visible { outline: 2px solid ${C.blue}; outline-offset: 2px; border-radius: 6px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;

/* ─── Motion helpers ──────────────────────────────────────────────────────── */

/* One reveal pattern, reused everywhere. */
function Reveal({ children, delay = 0, className = "", y = 16 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Text that slides up out of a mask, line by line. */
function MaskLine({ children, delay = 0, className = "", inView = false }) {
  const props = inView
    ? { whileInView: { y: 0 }, viewport: { once: true, margin: "-80px" } }
    : { animate: { y: 0 } };
  return (
    <span className="block overflow-hidden pb-[0.09em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "108%" }}
        {...props}
        transition={{ delay, duration: 0.9, ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* Numbers that count up the first time they scroll into view. */
function CountUp({ to, duration = 1.4, format = (v) => Math.round(v).toLocaleString(), className = "", style }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!run || reduce) return;
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / (duration * 1000), 1);
      setN(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to, duration, reduce]);

  return (
    <motion.span
      className={className}
      style={style}
      viewport={{ once: true }}
      onViewportEnter={() => setRun(true)}
    >
      {format(n)}
    </motion.span>
  );
}

function Label({ children, className = "" }) {
  return <span className={`jj-mono text-[11px] uppercase tracking-[0.18em] ${className}`}>{children}</span>;
}

/* Eyebrow with a rule that draws itself in. */
function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-3">
      <motion.span
        className="h-px w-9 origin-left"
        style={{ background: C.blue2 }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <Label className="text-[#1D4ED8]">{children}</Label>
    </span>
  );
}

/* ─── The signature element: a live ECG trace on ECG paper ────────────────── */
function ECGTrace({ height = 64, color = C.pulse, duration = 3.2, strokeWidth = 2, glow = true }) {
  const reduce = useReducedMotion();
  const d =
    "M0,40 L48,40 L58,34 L68,46 L80,40 L104,40 L112,18 L120,66 L128,8 L138,60 L148,40 L200,40 " +
    "L248,40 L258,34 L268,46 L280,40 L304,40 L312,18 L320,66 L328,8 L338,60 L348,40 L400,40";

  const draw = reduce
    ? { initial: { pathLength: 1 }, animate: { pathLength: 1 }, transition: { duration: 0 } }
    : {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration, repeat: Infinity, ease: "linear" },
      };

  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" fill="none" style={{ height, width: "100%" }}>
      {glow && (
        <motion.path
          d={d} stroke={color} strokeWidth={strokeWidth * 3.5} strokeLinecap="round" strokeLinejoin="round"
          opacity="0.18" style={{ filter: "blur(4px)" }} {...draw}
        />
      )}
      <motion.path
        d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...draw}
      />
    </svg>
  );
}

/* ─── Hero monitor card — tilts and catches the light on hover ────────────── */
function MonitorCard() {
  const reduce = useReducedMotion();
  const [bpm, setBpm] = useState(72);
  const [beat, setBeat] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 160, damping: 20 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 160, damping: 20 });
  const px = useTransform(mx, (v) => `${(v + 0.5) * 100}%`);
  const py = useTransform(my, (v) => `${(v + 0.5) * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(260px circle at ${px} ${py}, rgba(29,78,216,0.10), transparent 65%)`;

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setBpm((p) => Math.max(66, Math.min(82, p + (Math.random() > 0.5 ? 1 : -1))));
      setBeat(true);
      setTimeout(() => setBeat(false), 160);
    }, 950);
    return () => clearInterval(id);
  }, [reduce]);

  const move = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => { mx.set(0); my.set(0); };

  const readouts = [
    { icon: Droplets, to: 98, decimals: 0, unit: "% SpO₂", format: (v) => Math.round(v).toString() },
    { icon: Thermometer, to: 36.6, unit: "°C", format: (v) => v.toFixed(1) },
    { icon: Activity, to: 8420, unit: "steps", format: (v) => Math.round(v).toLocaleString() },
  ];

  return (
    <div style={{ perspective: 1100 }} onMouseMove={move} onMouseLeave={leave}>
      <motion.div
        initial={{ opacity: 0, y: 26, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", borderColor: C.line }}
        className="jj-card relative w-full max-w-[380px] overflow-hidden rounded-xl border bg-white p-5"
      >
        {/* pointer sheen */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} />

        <div className="relative flex items-center justify-between">
          <Label className="text-[#7B8794]">Band connected</Label>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              {!reduce && (
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full"
                  style={{ background: C.blue2 }}
                  animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
                  transition={{ duration: 0.95, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: C.blue }} />
            </span>
            <Label className="text-[#1D4ED8]">Live</Label>
          </span>
        </div>

        <div className="relative mt-4 flex items-end gap-2">
          <motion.span animate={{ scale: beat ? 1.28 : 1 }} transition={{ duration: 0.16 }}>
            <Heart className="h-5 w-5" style={{ color: C.pulse, fill: C.pulse }} />
          </motion.span>
          <span className="jj-mono relative h-[48px] w-[86px] overflow-hidden text-5xl font-semibold leading-none" style={{ color: C.ink }}>
            <AnimatePresence initial={false}>
              <motion.span
                key={bpm}
                className="absolute inset-0"
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                {bpm}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="jj-mono pb-1 text-sm" style={{ color: C.muted }}>bpm</span>
          <span className="ml-auto pb-1"><Label className="text-[#7B8794]">Sinus rhythm</Label></span>
        </div>

        <div className="jj-ecg-paper relative mt-3 overflow-hidden rounded-lg border" style={{ borderColor: C.line, background: "#fff" }}>
          <ECGTrace height={72} />
          {!reduce && (
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-16"
              style={{ background: "linear-gradient(90deg, transparent, rgba(220,38,38,.10), transparent)" }}
              animate={{ x: ["-4rem", "24rem"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border" style={{ borderColor: C.line, background: C.line }}>
          {readouts.map((r, i) => (
            <motion.div
              key={r.unit}
              className="bg-white px-2 py-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
            >
              <r.icon className="mx-auto mb-1.5 h-3.5 w-3.5" style={{ color: C.blue2 }} />
              <div className="jj-mono text-base font-semibold" style={{ color: C.ink }}>
                <CountUp to={r.to} format={r.format} duration={1.6} />
              </div>
              <div className="jj-mono text-[10px]" style={{ color: C.muted }}>{r.unit}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative mt-4 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5"
          style={{ background: C.wash }}
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" style={{ color: C.blue }} />
            <span className="text-sm font-medium" style={{ color: C.ink }}>Dr. Sharma is available</span>
          </div>
          <ChevronRight className="h-4 w-4" style={{ color: C.blue }} />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── Readings strip ──────────────────────────────────────────────────────── */
function ReadingsStrip() {
  const items = [
    ["Heart rate", "72 bpm"],
    ["Blood oxygen", "98 %"],
    ["Temperature", "36.6 °C"],
    ["Respiration", "16 /min"],
    ["Steps", "8,420"],
    ["Sleep", "7 h 12 m"],
  ];
  const row = [...items, ...items, ...items, ...items];

  return (
    <div className="jj-fade-x overflow-hidden border-y py-3" style={{ borderColor: C.line, background: "#fff" }}>
      <div className="jj-marquee flex w-max gap-10 whitespace-nowrap">
        {[...row, ...row].map(([label, value], i) => (
          <span key={i} className="flex items-center gap-2.5">
            <Label className="text-[#7B8794]">{label}</Label>
            <span className="jj-mono text-sm font-semibold" style={{ color: C.ink }}>{value}</span>
            <span style={{ color: C.line }}>/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Buttons ─────────────────────────────────────────────────────────────── */
function PrimaryButton({ children, onClick, className = "", light = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`group relative flex items-center gap-2 overflow-hidden rounded-lg px-6 py-3.5 text-[15px] font-semibold ${className}`}
      style={
        light
          ? { background: "#fff", color: C.blue }
          : { background: C.blue, color: "#fff", boxShadow: "0 12px 26px -14px rgba(29,78,216,.85)" }
      }
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-[900ms] ease-out group-hover:translate-x-full"
        style={{
          background: light
            ? "linear-gradient(90deg, transparent, rgba(29,78,216,.10), transparent)"
            : "linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)",
        }}
      />
      <span className="relative flex items-center gap-2">
        {children}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
}

/* ─── Preorder dialog ─────────────────────────────────────────────────────── */
function PreorderDialog({ open, onClose }) {
  const empty = { name: "", email: "", phone: "", feedback: "" };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (status === "error") { setStatus(null); setError(""); }
  };

  const close = () => {
    if (loading) return;
    setForm(empty); setStatus(null); setError(""); onClose();
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus(null); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/preorder/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let data;
        try { data = await res.json(); } catch { data = { message: `Server returned ${res.status}` }; }
        let msg = "The preorder didn't go through.";
        if (data.detail) msg = Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(", ") : data.detail;
        else if (data.message) msg = data.message;
        throw new Error(msg);
      }
      setStatus("success");
      setTimeout(close, 2200);
    } catch (err) {
      setStatus("error");
      setError(err.message || "No connection to the server. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-[#A6B0BC] focus:border-[#3B82F6] focus:ring-4 focus:ring-[#EAF4FF] disabled:opacity-50";

  const fields = [
    { name: "name", label: "Full name", placeholder: "Your name", type: "text", half: true },
    { name: "phone", label: "Phone", placeholder: "+977 98XXXXXXXX", type: "tel", half: true },
    { name: "email", label: "Email", placeholder: "you@example.com", type: "email" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-[#2F3A45]/35 backdrop-blur-[3px]"
          />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Preorder Jeewan Jyoti"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.99 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="jj-body fixed inset-x-3 top-[4%] bottom-3 z-50 overflow-hidden rounded-xl border bg-white md:inset-x-auto md:left-1/2 md:bottom-auto md:max-h-[92vh] md:w-[760px] md:-translate-x-1/2"
            style={{ borderColor: C.line, color: C.ink }}
          >
            <div className="flex h-full flex-col md:max-h-[92vh]">
              <div className="relative flex items-start justify-between overflow-hidden border-b px-6 py-5" style={{ borderColor: C.line }}>
                <div className="jj-ecg-paper pointer-events-none absolute inset-0 opacity-60" />
                <div className="relative">
                  <Label className="text-[#1D4ED8]">Preorder</Label>
                  <h2 className="jj-display mt-1.5 text-2xl font-semibold">Reserve your spot</h2>
                  <p className="mt-1 text-sm" style={{ color: C.muted }}>
                    No payment today. We'll message you when the app opens in Nepal.
                  </p>
                </div>
                <motion.button
                  onClick={close} disabled={loading} aria-label="Close"
                  whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="relative rounded-lg border p-2 transition-colors hover:bg-[#EAF4FF] disabled:opacity-50"
                  style={{ borderColor: C.line }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              <div className="grid flex-1 gap-8 overflow-y-auto p-6 md:grid-cols-[1fr_190px]">
                <div>
                  <AnimatePresence mode="wait">
                    {status === "success" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mb-5 flex items-center gap-2.5 overflow-hidden rounded-lg border px-4 py-3 text-sm"
                        style={{ borderColor: "#BFDBFE", background: C.wash, color: C.blue }}
                      >
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 350, damping: 15 }}>
                          <Check className="h-4 w-4 shrink-0" />
                        </motion.span>
                        Preorder received. We'll be in touch.
                      </motion.div>
                    )}
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {fields.filter((f) => f.half).map((f, i) => (
                        <motion.div key={f.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}>
                          <Label className="mb-1.5 block text-[#7B8794]">{f.label}</Label>
                          <input
                            type={f.type} name={f.name} value={form[f.name]} onChange={change} required disabled={loading}
                            className={field} style={{ borderColor: C.line }} placeholder={f.placeholder}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {fields.filter((f) => !f.half).map((f) => (
                      <motion.div key={f.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                        <Label className="mb-1.5 block text-[#7B8794]">{f.label}</Label>
                        <input
                          type={f.type} name={f.name} value={form[f.name]} onChange={change} required disabled={loading}
                          className={field} style={{ borderColor: C.line }} placeholder={f.placeholder}
                        />
                      </motion.div>
                    ))}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Label className="mb-1.5 block text-[#7B8794]">Anything you want in the app?</Label>
                      <textarea
                        name="feedback" rows={3} value={form.feedback} onChange={change} disabled={loading}
                        className={field} style={{ borderColor: C.line }} placeholder="Optional"
                      />
                    </motion.div>
                    <motion.button
                      type="submit" disabled={loading}
                      whileHover={!loading ? { y: -2 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                      className="flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-[15px] font-semibold text-white transition disabled:opacity-60"
                      style={{ background: C.blue, boxShadow: "0 12px 26px -16px rgba(29,78,216,.9)" }}
                    >
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <>Send preorder <ArrowRight className="h-4 w-4" /></>}
                    </motion.button>
                  </form>

                  <ul className="mt-5 grid grid-cols-2 gap-2 text-sm" style={{ color: C.muted }}>
                    {["Early access", "Launch price locked", "Priority support", "Beta builds"].map((p, i) => (
                      <motion.li
                        key={p} className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                      >
                        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: C.blue2 }} /> {p}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <motion.div
                  className="flex flex-col items-center justify-start"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.24 }}
                >
                  <div className="relative overflow-hidden rounded-xl border p-3" style={{ borderColor: C.line, background: C.paper }}>
                    <img src={qrCode} alt="QR code to install the app" className="h-40 w-40 rounded-lg object-cover" />
                    <span className="jj-sheen pointer-events-none absolute inset-y-0 w-1/3" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent)" }} />
                  </div>
                  <p className="mt-3 text-center text-sm font-medium">Scan to install</p>
                  <p className="mt-1 text-center text-xs" style={{ color: C.muted }}>Point your camera at the code</p>
                </motion.div>
              </div>

              <div className="border-t px-6 py-3 text-center" style={{ borderColor: C.line }}>
                <Label className="text-[#7B8794]">Your details stay encrypted · Support 24/7</Label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Feature grid with a pointer-following wash ──────────────────────────── */
function FeatureGrid({ features }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const spot = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgba(29,78,216,0.07), transparent 70%)`;

  const move = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <div
      onMouseMove={move}
      onMouseLeave={() => { mx.set(-500); my.set(-500); }}
      className="relative mt-12 grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-3"
      style={{ borderColor: C.line, background: C.line }}
    >
      <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ background: spot }} />
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          className="group relative h-full overflow-hidden bg-white p-7"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: EASE }}
        >
          <span
            className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
            style={{ background: C.blue }}
          />
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 group-hover:-translate-y-0.5"
            style={{ borderColor: C.line, background: C.paper }}
          >
            <f.icon className="transition-transform duration-300 group-hover:scale-110" style={{ color: C.blue, width: 18, height: 18 }} />
          </div>
          <h3 className="jj-display mt-5 text-lg font-semibold">{f.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Steps with a line that fills as you scroll ──────────────────────────── */
function Steps({ steps }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative mt-10 pl-10">
      <div className="absolute bottom-4 left-[7px] top-4 w-px" style={{ background: C.line }} />
      <motion.div
        className="absolute bottom-4 left-[7px] top-4 w-px origin-top"
        style={{ background: C.blue, scaleY: fill }}
      />
      {steps.map((s, i) => (
        <motion.div
          key={s.n}
          className="relative py-5"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <motion.span
            className="absolute -left-10 top-[26px] h-[15px] w-[15px] rounded-full border-[3px] bg-white"
            style={{ borderColor: C.line }}
            whileInView={{ borderColor: C.blue, scale: [1, 1.35, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: EASE }}
          />
          <div className="flex gap-5">
            <span className="jj-mono pt-1 text-sm font-semibold" style={{ color: C.blue2 }}>{s.n}</span>
            <div>
              <h3 className="jj-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function JeewanJyotiLanding() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const heroRef = useRef(null);
  const { scrollYProgress: pageProgress } = useScroll();
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "12%"]);
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, 0]);

  const features = [
    { icon: Activity, title: "Vitals as they happen", desc: "Heart rate, oxygen and temperature stream in from your band." },
    { icon: Users, title: "Your whole family", desc: "Follow a parent's or child's readings from your own account." },
    { icon: CalendarCheck, title: "Appointments", desc: "Book a licensed doctor in a few taps. No phone queue." },
    { icon: Video, title: "Video consultations", desc: "Talk to a doctor over an encrypted call from home." },
    { icon: Lock, title: "Private by default", desc: "Your records are encrypted. You choose who else can see them." },
    { icon: LineChart, title: "Trends worth reading", desc: "Plain-language summaries instead of a wall of numbers." },
  ];

  const steps = [
    { n: "01", title: "Connect your band", desc: "Pair a fitness band or watch once. Readings sync on their own after that." },
    { n: "02", title: "Watch the numbers", desc: "Heart rate, oxygen, temperature and sleep collected in one timeline." },
    { n: "03", title: "Add your family", desc: "Invite a parent or child and switch between their records and yours." },
    { n: "04", title: "See a doctor", desc: "Book a consultation and share the readings that matter, already attached." },
  ];

  return (
    <div className="jj-body min-h-screen overflow-x-hidden" style={{ background: C.paper, color: C.ink }}>
      <style>{STYLES}</style>

      {/* reading progress */}
      <motion.div
        className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left"
        style={{ scaleX: progress, background: C.blue }}
      />

      <AppHeader />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="jj-grain relative overflow-hidden px-6 pb-20 pt-28 md:pt-32">
        <div className="jj-ecg-paper jj-fade-down pointer-events-none absolute inset-0" />
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-[45vw]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(29,78,216,.055), transparent)" }}
            animate={{ x: ["-45vw", "145vw"] }}
            transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          />
        )}

        <motion.div
          style={{ y: heroY, opacity: heroFade }}
          className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_auto]"
        >
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5" style={{ borderColor: C.line }}>
                <span className="relative flex h-1.5 w-1.5">
                  {!reduce && (
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full"
                      style={{ background: C.blue2 }}
                      animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: C.blue }} />
                </span>
                <Label className="text-[#1D4ED8]">Preorder open · Nepal</Label>
              </span>
            </motion.div>

            <h1 className="jj-display mt-6 text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl">
              <MaskLine delay={0.12}>Your vitals, your family,</MaskLine>
              <MaskLine delay={0.22}>
                <span style={{ color: C.blue }}>your doctor.</span> One app.
              </MaskLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.7 }}
              className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: C.muted }}
            >
              Jeewan Jyoti reads your fitness band, keeps the numbers in one record you can
              actually understand, and puts a licensed doctor a tap away when they matter.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.54, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <PrimaryButton onClick={() => setOpen(true)}>Preorder now</PrimaryButton>
              <motion.button
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-lg border bg-white px-6 py-3.5 text-[15px] font-semibold transition-colors hover:bg-[#EAF4FF]"
                style={{ borderColor: C.line }}
              >
                How it works
              </motion.button>
            </motion.div>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t pt-6" style={{ borderColor: C.line }}>
              {[["Built in", "Nepal"], ["Launching", "2026"], ["Payment today", "None"]].map(([k, v], i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.72 + i * 0.09, duration: 0.5 }}
                >
                  <dt><Label className="text-[#7B8794]">{k}</Label></dt>
                  <dd className="jj-display mt-1 text-lg font-semibold">{v}</dd>
                </motion.div>
              ))}
            </dl>
          </div>

          <div className="flex justify-center lg:justify-end">
            <MonitorCard />
          </div>
        </motion.div>

        {/* scroll cue */}
        {!reduce && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            className="absolute bottom-6 left-1/2 hidden h-10 w-px -translate-x-1/2 overflow-hidden md:block"
            style={{ background: C.line }}
          >
            <motion.span
              className="absolute left-0 h-3 w-px"
              style={{ background: C.blue }}
              animate={{ y: [-12, 40] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </section>

      <ReadingsStrip />

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-xl">
            <Eyebrow>What's inside</Eyebrow>
            <h2 className="jj-display mt-4 text-4xl font-semibold leading-tight">
              Six things you need from a health app.
            </h2>
            <p className="mt-3 text-lg" style={{ color: C.muted }}>Nothing you don't.</p>
          </Reveal>

          <FeatureGrid features={features} />
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how" className="border-y px-6 py-24" style={{ borderColor: C.line, background: "#fff" }}>
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="jj-display mt-4 max-w-lg text-4xl font-semibold leading-tight">
                From your wrist to a doctor, without repeating yourself.
              </h2>
            </Reveal>
            <Steps steps={steps} />
          </div>

          <Reveal delay={0.1}>
            <motion.div
              className="relative mx-auto w-[268px]"
              animate={reduce ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute -inset-6 rounded-xl" style={{ background: C.wash }} />
              <div className="jj-card relative overflow-hidden rounded-xl border bg-white" style={{ borderColor: C.line }}>
                <div className="flex h-7 items-center justify-center border-b" style={{ borderColor: C.line }}>
                  <div className="h-1 w-14 rounded-full" style={{ background: C.line }} />
                </div>
                <img src={appScreenshot} alt="Jeewan Jyoti app" className="w-full" />
                {/* laminated sheen */}
                <span
                  className="jj-sheen pointer-events-none absolute inset-y-0 w-1/3"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)" }}
                />
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <section id="about" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <Eyebrow>About</Eyebrow>
            <h2 className="jj-display mt-4 text-4xl font-semibold leading-tight">
              Built here, for how people actually use healthcare.
            </h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: C.muted }}>
              Booking a visit and keeping your own readings usually means separate apps, phone
              calls and paper reports that never talk to each other. We're putting all of it
              in one place.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { t: "Licensed doctors only", d: "Every doctor is verified before they can take a booking." },
              { t: "Bands sold in Nepal", d: "Works with the wearables you can actually buy here." },
              { t: "Price locked at launch", d: "Preorder pricing stays the same when we open." },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 0.08}>
                <div className="jj-lift h-full rounded-xl border bg-white p-6 hover:border-[#3B82F6]" style={{ borderColor: C.line }}>
                  <h3 className="jj-display text-base font-semibold">{v.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.muted }}>{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preorder band ──────────────────────────────────────────────────── */}
      <section id="preorder" className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-xl px-8 py-16 text-center" style={{ background: C.blue }}>
              {!reduce && (
                <motion.div
                  className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
                  style={{ background: "radial-gradient(closest-side, rgba(255,255,255,.20), transparent)" }}
                  animate={{ x: [-160, 160, -160], y: [0, 40, 0] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-30">
                <ECGTrace height={120} color="#ffffff" duration={4.5} strokeWidth={1.5} glow={false} />
              </div>
              <div className="relative">
                <Label className="text-white/70">Early access</Label>
                <h2 className="jj-display mx-auto mt-3 max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  <MaskLine inView delay={0}>Get the app before</MaskLine>
                  <MaskLine inView delay={0.08}>everyone else.</MaskLine>
                </h2>
                <p className="mx-auto mt-4 max-w-md text-lg text-white/80">
                  Takes under a minute. No payment today.
                </p>
                <div className="mt-8 flex justify-center">
                  <PrimaryButton light onClick={() => setOpen(true)}>Preorder now</PrimaryButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer id="contact" className="border-t px-6 py-14" style={{ borderColor: C.line, background: "#fff" }}>
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <Reveal>
            <div className="flex items-center gap-2.5">
              <img src={jjlogo} alt="" className="h-7 w-7 rounded-lg object-contain" />
              <span className="jj-display text-base font-semibold">Jeewan Jyoti</span>
              <span className="text-sm" style={{ color: C.muted }}>जीवन ज्योति</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: C.muted }}>
              Digital care for Nepali families, from daily readings to the doctor's room.
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <Label className="text-[#7B8794]">Pages</Label>
            <div className="mt-4 space-y-2">
              {[["Features", "#features"], ["How it works", "#how"], ["About", "#about"], ["Preorder", "#preorder"]].map(([l, h]) => (
                <a key={l} href={h} className="group flex items-center gap-1.5 text-sm transition-colors hover:text-[#1D4ED8]">
                  <span className="h-px w-0 transition-all duration-300 group-hover:w-3" style={{ background: C.blue }} />
                  {l}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <Label className="text-[#7B8794]">Contact</Label>
            <div className="mt-4 space-y-2.5 text-sm" style={{ color: C.muted }}>
              <a href="mailto:support@digitalcare.com" className="flex items-center gap-2 transition-colors hover:text-[#1D4ED8]">
                <Mail className="h-4 w-4" style={{ color: C.blue2 }} /> support@digitalcare.com
              </a>
              <a href="tel:+97798000000" className="flex items-center gap-2 transition-colors hover:text-[#1D4ED8]">
                <Phone className="h-4 w-4" style={{ color: C.blue2 }} /> +977 98XXXXXXXX
              </a>
              <p className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" style={{ color: C.blue2 }} /> Support 24/7
              </p>
            </div>
          </Reveal>
        </div>

        <div
          className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: C.line, color: C.muted }}
        >
          <span>© {new Date().getFullYear()} Jeewan Jyoti Digital Care</span>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-[#1D4ED8]">Privacy</a>
            <a href="#" className="transition-colors hover:text-[#1D4ED8]">Terms</a>
          </div>
        </div>
      </footer>

      <PreorderDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}