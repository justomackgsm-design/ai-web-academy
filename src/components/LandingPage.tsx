import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Smartphone,
  Check,
  Lock,
  Monitor,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  CreditCard,
  ChevronRight,
  Star,
  Zap,
  Globe,
  Shield,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Code2,
  Database,
  Rocket,
  Clock,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import type { Season } from "../types";
import academyLogoNew from "../assets/images/academy-logo-new.png";
import academyLogo1 from "../assets/images/academy_logo_icon_1784372730106.jpg";
import heroBg from "../assets/images/hero-bg.jpg";
import studentMobile from "../assets/images/student-mobile.jpg";
import trainingWorkspaceImg from "../assets/images/training_workspace_ai_1784372795228.jpg";
import trainingFullstackImg from "../assets/images/training_fullstack_flow_1784372810541.jpg";

interface LandingPageProps {
  publicPaymentAmount: number;
  publicPaymentCurrency: string;
  isPromoActive: boolean;
  originalPrice: number;
  promoPrice: number;
  presentationVideoUrl: string;
  presentationVideoPath: string;
  seasons: Season[];
  handleStartPayment: () => void;
  handleVerifyCode: (e: React.FormEvent) => void;
  inputCode: string;
  setInputCode: (v: string) => void;
  isVerifying: boolean;
  verificationError: string;
  verificationSuccess: string;
  deviceId: string;
  telegramLink: string;
  whatsappLink: string;
}

const testimonials = [
  {
    name: "Koffi Mensah",
    role: "Entrepreneur Digital, Lomé",
    avatar: "KM",
    text: "En moins de 3 semaines, j'ai lancé ma première plateforme e-commerce entièrement depuis mon téléphone. Aucune ligne de code. Résultat : 2 clients payants dès le premier mois.",
    stars: 5,
  },
  {
    name: "Amara Diallo",
    role: "Freelance Web, Dakar",
    avatar: "AD",
    text: "Je ne savais pas ce qu'était une base de données il y a 2 mois. Aujourd'hui je déploie des apps avec Neon et Vercel comme un pro. Cette formation est une révolution.",
    stars: 5,
  },
  {
    name: "Fatou Bah",
    role: "Consultante Business, Abidjan",
    avatar: "FB",
    text: "La clarté des explications est incroyable. On passe de zéro à une application en production en quelques heures. J'aurais aimé trouver ça plus tôt.",
    stars: 5,
  },
  {
    name: "Ibrahim Touré",
    role: "Étudiant en Commerce, Bamako",
    avatar: "IT",
    text: "Ce qui m'a frappé : tout est pratique. Pas de théorie inutile. Dès la première saison, j'avais déjà un projet fonctionnel en ligne.",
    stars: 5,
  },
  {
    name: "Mariama Koné",
    role: "Influenceuse & Créatrice, Ouaga",
    avatar: "MK",
    text: "Je voulais créer une boutique en ligne pour mes produits. En 4 jours avec la formation, c'était fait. Mon CA a doublé ce mois-ci.",
    stars: 5,
  },
  {
    name: "Seydou Camara",
    role: "Manager Commercial, Conakry",
    avatar: "SC",
    text: "L'approche mobile-first est la clé. J'avais peur d'avoir besoin d'un PC puissant. Rien de tout ça. Mon Samsung suffit pour tout faire.",
    stars: 5,
  },
];

const seasonIcons = [Smartphone, Database, Code2, Rocket];
const seasonColors = [
  { bg: "from-violet-500 to-indigo-600", light: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
  { bg: "from-sky-500 to-blue-600", light: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  { bg: "from-orange-500 to-amber-600", light: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function getYoutubeEmbedUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed.includes("?") ? trimmed : `${trimmed}?rel=0&controls=1&modestbranding=1`;
  }
  if (trimmed.includes("youtube.com/watch")) {
    try {
      const videoId = new URL(trimmed).searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&controls=1&modestbranding=1`;
    } catch {}
  }
  if (trimmed.includes("youtu.be/")) {
    const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&controls=1&modestbranding=1`;
  }
  return trimmed;
}

export default function LandingPage({
  publicPaymentAmount,
  publicPaymentCurrency,
  isPromoActive,
  originalPrice,
  promoPrice,
  presentationVideoUrl,
  presentationVideoPath,
  seasons,
  handleStartPayment,
  handleVerifyCode,
  inputCode,
  setInputCode,
  isVerifying,
  verificationError,
  verificationSuccess,
  deviceId,
  telegramLink,
  whatsappLink,
}: LandingPageProps) {
  const [showVideo, setShowVideo] = useState(false);
  const videoEmbedUrl = getYoutubeEmbedUrl(presentationVideoUrl);

  // Une vidéo choisie dans la galerie peut être stockée soit comme URL complète
  // (Cloudinary / Vercel Blob), soit comme simple nom de fichier sur le serveur.
  // Dans le second cas il faut passer par la route de streaming publique,
  // sinon le navigateur cherche le fichier à la racine du site et la vidéo
  // ne s'affiche pas.
  const resolvedVideoSrc = useMemo(() => {
    const raw = (presentationVideoPath || "").trim();
    if (!raw) return "";
    if (/^(https?:|blob:|data:)/i.test(raw)) return raw;
    if (raw.startsWith("/api/public-video/")) return raw;
    const filename = raw.split(/[\\/]/).pop() || raw;
    return `/api/public-video/${encodeURIComponent(filename)}`;
  }, [presentationVideoPath]);

  const hasVideo = resolvedVideoSrc || videoEmbedUrl;


  const currencySymbol = publicPaymentCurrency === "USD" ? "$" : publicPaymentCurrency === "EUR" ? "€" : publicPaymentCurrency;
  const displayPrice = `${publicPaymentAmount.toLocaleString("fr-FR")} ${currencySymbol} ${publicPaymentCurrency}`;
  const displayOriginalPrice = `${originalPrice.toLocaleString("fr-FR")} ${currencySymbol}`;
  const displayPromoPrice = `${promoPrice.toLocaleString("fr-FR")} ${currencySymbol}`;

  return (
    <div className="space-y-0">

      {/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-0">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover opacity-20"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.12),transparent_60%)]" />
        </div>

        {/* Animated grid overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-[5%] w-56 h-56 rounded-full bg-violet-500/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div className="space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span>Formation IA · 100% No-Code</span>
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl xl:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Bâtissez des{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Sites Web Pros
                </span>
                <br />
                avec l'Intelligence Artificielle
              </motion.h1>

              <motion.p
                className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                La formation la plus complète pour transformer vos idées en{" "}
                <span className="text-white font-semibold">plateformes modernes et monétisables</span> — 
                directement depuis votre smartphone, sans écrire une seule ligne de code.
              </motion.p>

              {/* Mobile badge */}
              <motion.div
                className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-left"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="bg-indigo-500 p-2 rounded-xl flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">100% Smartphone — Aucun PC requis</p>
                  <p className="text-slate-400 text-xs mt-0.5">Concevez, connectez et déployez depuis votre téléphone</p>
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <button
                  onClick={handleStartPayment}
                  className="group w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>S'inscrire Maintenant</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {hasVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="group w-full sm:w-auto flex items-center justify-center space-x-2.5 border border-white/15 hover:border-white/30 text-white font-semibold px-6 py-4 rounded-2xl text-sm transition-all duration-300 hover:bg-white/5"
                  >
                    <div className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center group-hover:border-white/50 transition-colors">
                      <Play className="w-3 h-3 fill-white" />
                    </div>
                    <span>Voir la Présentation</span>
                  </button>
                )}
              </motion.div>

              {/* Accès rapide : code de suivi de formation */}
              <motion.div
                className="w-full max-w-md mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                  <div className="flex items-center space-x-2 mb-2.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                      Déjà inscrit ? Entrez votre code de suivi de formation
                    </span>
                  </div>
                  <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="IA-XXXX-XXXX"
                      className="flex-1 bg-slate-950/50 border border-white/15 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-bold px-5 py-3 rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
                    >
                      {isVerifying ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Accéder</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                  {verificationError && (
                    <p className="mt-2 flex items-start space-x-1.5 text-[11px] text-red-300">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>{verificationError}</span>
                    </p>
                  )}
                  {verificationSuccess && (
                    <p className="mt-2 flex items-start space-x-1.5 text-[11px] text-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>{verificationSuccess}</span>
                    </p>
                  )}
                  <p className="mt-2 flex items-start space-x-1.5 text-[10px] text-slate-400 leading-relaxed">
                    <Shield className="w-3 h-3 shrink-0 mt-0.5 text-indigo-300" />
                    <span>
                      Protection anti-partage : votre code se verrouille automatiquement sur le premier appareil utilisé.
                    </span>
                  </p>
                </div>
              </motion.div>

              {/* Programme de parrainage */}
              <motion.div
                className="w-full max-w-md mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                        Programme de parrainage — 5 $ par filleul
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-100/80 leading-relaxed">
                        Dès votre inscription, récupérez votre code de parrainage personnel. Chaque personne
                        inscrite grâce à votre code vous rapporte <span className="font-bold text-white">5 $</span>,
                        cumulables et retirables directement depuis votre espace étudiant.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Price preview */}
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {isPromoActive ? (
                  <>
                    <span className="text-slate-500 line-through">{displayOriginalPrice}</span>
                    <span className="text-white font-bold">{displayPromoPrice} {publicPaymentCurrency}</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">PROMO</span>
                  </>
                ) : (
                  <span className="text-slate-300">{displayPrice}</span>
                )}
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-xs">Accès à vie · 1 seul paiement</span>
              </motion.div>
            </div>

            {/* Right: Student image */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur-2xl" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={studentMobile}
                    alt="Étudiant apprenant sur mobile"
                    className="w-full aspect-[4/5] object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = trainingWorkspaceImg;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                </div>

                {/* Floating badge */}
                <motion.div
                  className="absolute -bottom-4 -left-6 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Déployé en Production</p>
                      <p className="text-[10px] text-slate-500">0 ligne de code écrite</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-4 -right-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 shadow-2xl text-white"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                >
                  <p className="text-2xl font-black">4</p>
                  <p className="text-[10px] font-semibold opacity-80">Saisons</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ STATS BAR ════════════════════════════════ */}
      <section className="bg-white border-y border-slate-200 py-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 4, suffix: "", label: "Saisons Complètes" },
            { value: 0, suffix: " ligne", label: "De Code à Écrire" },
            { value: 100, suffix: "%", label: "Pratique" },
            { value: 1, suffix: " Paiement", label: "Accès à Vie" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-1"
            >
              <p className="text-3xl font-black text-slate-900 font-display">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ VIDEO PRÉSENTATION ══════════════════════════ */}
      {hasVideo && (
        <section className="py-20 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Présentation Officielle</span>
            </motion.div>
            <motion.h2
              className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Découvrez la Formation en Vidéo
            </motion.h2>
            <motion.p
              className="text-slate-500 text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Regardez comment des centaines d'entrepreneurs créent des sites professionnels en quelques heures.
            </motion.p>
          </div>

          {/* Cinema frame */}
          <motion.div
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            {/* Crown glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-[28px] blur-lg opacity-40" />
            <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-[26px] opacity-70" />

            {/* Outer frame */}
            <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
              {/* Top chrome bar */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center space-x-2 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">AI Web Academy · Présentation</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] text-slate-400 font-medium">Formation Élite</span>
                </div>
              </div>

              {/* Video player */}
              <div className="relative aspect-video bg-slate-950">
                {resolvedVideoSrc ? (
                  <video
                    key={resolvedVideoSrc}
                    src={resolvedVideoSrc}
                    controls
                    className="w-full h-full object-contain"
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    poster={trainingWorkspaceImg}
                  />
                ) : videoEmbedUrl ? (
                  <iframe
                    src={videoEmbedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                    title="Présentation AI Web Academy"
                  />
                ) : null}
              </div>

              {/* Bottom info strip */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-t border-white/5 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={academyLogo1} alt="logo" className="w-full h-full object-cover" onError={() => {}} />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">AI Web Academy</p>
                    <p className="text-slate-500 text-[10px]">Formation officielle · Accès à vie</p>
                  </div>
                </div>
                <button
                  onClick={handleStartPayment}
                  className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Accéder</span>
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ══════════════════════════ PROGRAMME ══════════════════════════ */}
      <section className="py-20 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Programme Complet</span>
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            4 Saisons · De Zéro à Expert
          </motion.h2>
          <motion.p
            className="text-slate-500 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Un parcours structuré pour maîtriser la création web moderne, du premier prompt IA au site en production.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(seasons.length > 0 ? seasons : [
            { id: "1", title: "Saison 1 : Coder entièrement avec l'IA", description: "Comment coder entièrement avec l'intelligence artificielle et même faire des intégrations d'APIs et des services de paiement sans écrire une seule ligne de code." },
            { id: "2", title: "Saison 2 : Hébergement & Git sans code", description: "Comment pousser le code dans GitHub comme un professionnel, l'héberger et comment modifier le code par la suite sans écrire une seule ligne de code." },
            { id: "3", title: "Saison 3 : Liaison Base de Données Neon", description: "Comment lier le front-end à la base de données relationnelle Neon et comment créer et configurer des tables de données sans aucune compétence technique préalable." },
            { id: "4", title: "Saison 4 : Déploiement Vercel Ultime", description: "Comment déployer votre application finale en production sur Vercel de façon ultra-rapide et professionnelle." },
          ]).map((season, i) => {
            const Icon = seasonIcons[i % seasonIcons.length];
            const colors = seasonColors[i % seasonColors.length];
            return (
              <motion.div
                key={season.id}
                className="group relative bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`w-full h-full bg-gradient-to-br ${colors.bg} opacity-5 rounded-full translate-x-8 -translate-y-8`} />
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold text-slate-900 text-base leading-snug">{season.title}</h3>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.light} ${colors.text} border ${colors.border} uppercase tracking-wider`}>
                        S{i + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{season.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Inclus dans votre accès à vie</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════ AVANTAGES ══════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-slate-950 to-indigo-950 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Pourquoi Nous Choisir</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
                  Ce Que Vous Maîtriserez
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    En Quelques Semaines
                  </span>
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Code2, title: "Créer des Apps Complètes", desc: "Plateformes web full-stack avec interfaces modernes, APIs et paiements intégrés — sans coder." },
                  { icon: Database, title: "Connecter des Bases de Données", desc: "Liaison de votre frontend à PostgreSQL Neon comme un ingénieur senior." },
                  { icon: Globe, title: "Déployer en Production", desc: "Héberger vos sites sur Vercel avec HTTPS, domaines personnalisés et vitesse élite." },
                  { icon: TrendingUp, title: "Monétiser vos Créations", desc: "Intégrer des passerelles de paiement et générer des revenus dès les premières semaines." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start space-x-4 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <item.icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Visual showcase */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="rounded-2xl overflow-hidden border border-white/10 col-span-2 aspect-video"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <img
                    src={trainingWorkspaceImg}
                    alt="Environnement de formation"
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                </motion.div>
                <motion.div
                  className="rounded-2xl overflow-hidden border border-white/10 aspect-video"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <img
                    src={trainingFullstackImg}
                    alt="Architecture Fullstack"
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                </motion.div>
                <motion.div
                  className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 border border-white/10 aspect-video flex flex-col items-center justify-center p-4 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Award className="w-10 h-10 text-white mb-2 opacity-90" />
                  <p className="text-white font-bold text-sm">Certification</p>
                  <p className="text-white/70 text-[10px] mt-0.5">À votre rythme</p>
                </motion.div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: "Paiement Sécurisé" },
                  { icon: Clock, label: "Accès à Vie" },
                  { icon: Users, label: "Communauté Active" },
                ].map((g, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center space-y-1.5">
                    <g.icon className="w-5 h-5 text-indigo-400 mx-auto" />
                    <p className="text-[10px] text-slate-400 font-medium leading-snug">{g.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ TÉMOIGNAGES ══════════════════════════ */}
      <section className="py-20 space-y-10 overflow-hidden">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Témoignages</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
            Ce que disent nos Étudiants
          </h2>
          <p className="text-slate-500 text-sm">
            Rejoignez des centaines de professionnels qui ont propulsé leur carrière avec l'IA.
          </p>
        </div>

        {/* Marquee row 1 */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={idx}
                className="w-80 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex-shrink-0 space-y-4"
              >
                <div className="flex items-center space-x-1">
                  {Array(t.stars).fill(0).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center space-x-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PRICING ══════════════════════════ */}
      <section className="py-20 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarif d'Accès</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900">
            Un Investissement, Une Vie d'Avantages
          </h2>
        </div>

        <div className="max-w-lg mx-auto">
          <motion.div
            className="relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/15 rounded-full blur-3xl" />

            {isPromoActive && (
              <div className="absolute top-4 right-4">
                <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse shadow-lg shadow-red-500/30">
                  🔥 Offre Limitée
                </span>
              </div>
            )}

            <div className="relative z-10 space-y-8">
              {/* Logo + Title */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 shadow-lg flex-shrink-0 bg-white">
                  <img
                    src={academyLogoNew}
                    alt="AI Web Academy"
                    className="w-full h-full object-cover p-1"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = academyLogo1; }}
                  />
                </div>
                <div>
                  <p className="text-white font-display font-bold text-lg leading-tight">AI Web Academy</p>
                  <p className="text-slate-400 text-xs">Formation Ultime IA · Accès Complet</p>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                {isPromoActive ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-3">
                      <span className="text-5xl font-black text-white font-display">{displayPromoPrice}</span>
                      <span className="text-lg font-bold text-slate-400">{publicPaymentCurrency}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 text-sm line-through">{displayOriginalPrice} {publicPaymentCurrency}</span>
                      <span className="text-emerald-400 text-xs font-bold">
                        Économisez {((originalPrice - promoPrice) / originalPrice * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline space-x-3">
                    <span className="text-5xl font-black text-white font-display">{publicPaymentAmount.toLocaleString("fr-FR")} {currencySymbol}</span>
                    <span className="text-lg font-bold text-slate-400">{publicPaymentCurrency}</span>
                  </div>
                )}
                <p className="text-slate-500 text-xs">Paiement unique · Aucun abonnement · Accès permanent</p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {[
                  "Accès illimité aux 4 saisons complètes",
                  "Mises à jour gratuites à vie",
                  "Communauté privée d'étudiants",
                  "Support et assistance dédiés",
                  "Certificat de complétion",
                  "100% sur smartphone — aucun PC requis",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3 text-sm text-slate-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleStartPayment}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] flex items-center justify-center space-x-2.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Obtenir l'Accès Maintenant</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-slate-600 text-[11px]">
                Paiement sécurisé · Accès immédiat après confirmation
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════ ACCESS CODE ══════════════════════════ */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Already have code */}
          <motion.div
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-800">Déjà inscrit ?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Entrez votre code d'accès pour rejoindre immédiatement vos vidéos de formation.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Ex: IA-ABCD-1234"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase tracking-wider font-mono transition-all"
                  required
                />
                <div className="absolute right-3.5 top-3.5">
                  <Monitor className="w-4 h-4 text-indigo-400" />
                </div>
              </div>

              <AnimatePresence>
                {verificationError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-600 flex items-start space-x-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{verificationError}</span>
                  </motion.div>
                )}
                {verificationSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-700 flex items-start space-x-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{verificationSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Déverrouiller et Visionner</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-start space-x-2.5 text-[11px] text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold text-slate-500">Protection Anti-Partage :</span> Ce code sera lié à cet appareil{" "}
                (<span className="font-mono text-indigo-600">{deviceId}</span>).
              </p>
            </div>
          </motion.div>

          {/* Get access */}
          <motion.div
            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 shadow-lg text-white space-y-6 relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

            <div className="relative space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold">Nouvelle Inscription</h3>
              <p className="text-indigo-100 text-xs leading-relaxed">
                Obtenez un accès à vie à l'intégralité du cursus IA. Votre clé unique vous est remise instantanément.
              </p>
            </div>

            <ul className="relative space-y-2.5">
              {[
                "4 saisons · Contenu exclusif",
                "Accès immédiat à vie",
                "Support continu inclus",
              ].map((f, i) => (
                <li key={i} className="flex items-center space-x-2.5 text-sm">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-indigo-100">{f}</span>
                </li>
              ))}
            </ul>

            <div className="relative bg-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-indigo-300 uppercase tracking-widest font-mono">Prix d'accès unique</span>
                {isPromoActive ? (
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-2xl font-black">{displayPromoPrice}</span>
                    <span className="text-indigo-300 text-sm line-through">{displayOriginalPrice}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black mt-0.5 block">{displayPrice}</span>
                )}
              </div>
              {isPromoActive && (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">PROMO</span>
              )}
            </div>

            <button
              onClick={handleStartPayment}
              className="relative w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>S'inscrire Maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════ VIDEO MODAL ══════════════════════════ */}
      <AnimatePresence>
        {showVideo && hasVideo && (
          <motion.div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-4 -right-4 z-10 bg-white hover:bg-slate-100 text-slate-600 p-2 rounded-full shadow-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-video">
                {resolvedVideoSrc ? (
                  <video
                    src={resolvedVideoSrc}
                    controls
                    autoPlay
                    className="w-full h-full"
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : videoEmbedUrl ? (
                  <iframe
                    src={`${videoEmbedUrl}&autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                    title="Présentation"
                  />
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
