import React, { useState, useEffect, useRef } from "react";
import {
  Key,
  Tv,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Laptop,
  Video,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Copy,
  PlusCircle,
  CreditCard,
  BookOpen,
  ArrowRight,
  Clock,
  User,
  Check,
  Settings,
  ChevronRight,
  Send,
  MessageSquare,
  Monitor,
  Eye,
  Menu,
  X,
  Smartphone,
  Wallet,
  DollarSign,
  ArrowLeft,
  Users,
  Save,
  Mail,
  HelpCircle,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Season, Episode, AccessCode, AppState, UserProfile } from "./types";
import EncryptionBackground from "./components/EncryptionBackground";
import academyLogo1 from "./assets/images/academy_logo_icon_1784372730106.jpg";
import academyLogo2 from "./assets/images/academy_logo_icon_1784370675461.jpg";
import trainingWorkspaceImg from "./assets/images/training_workspace_ai_1784372795228.jpg";
import trainingFullstackImg from "./assets/images/training_fullstack_flow_1784372810541.jpg";

const getYoutubeEmbedUrl = (url: string): string => {
  if (!url) return "https://www.youtube.com/embed/8m9g_b95Eto";
  const trimmed = url.trim();
  
  if (trimmed.includes("youtube.com/embed/")) {
    if (!trimmed.includes("?")) {
      return `${trimmed}?rel=0&controls=1&modestbranding=1`;
    }
    return trimmed;
  }
  
  if (trimmed.includes("youtube.com/watch")) {
    try {
      const urlObj = new URL(trimmed);
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&controls=1&modestbranding=1`;
      }
    } catch (e) {}
  }
  
  if (trimmed.includes("youtu.be/")) {
    try {
      const parts = trimmed.split("youtu.be/");
      if (parts.length > 1) {
        const videoId = parts[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}?rel=0&controls=1&modestbranding=1`;
      }
    } catch (e) {}
  }

  if (trimmed.length > 0 && !trimmed.includes("/") && !trimmed.includes(".")) {
    return `https://www.youtube.com/embed/${trimmed}?rel=0&controls=1&modestbranding=1`;
  }

  return trimmed;
};

// Generates a robust and stable hardware-linked device fingerprint
const getDeviceFingerprint = (): string => {
  try {
    const parts = [
      navigator.userAgent || "",
      Math.min(screen.width || 0, screen.height || 0) + "x" + Math.max(screen.width || 0, screen.height || 0),
      screen.colorDepth || 0,
      navigator.language || "",
      navigator.hardwareConcurrency || "unknown",
      new Date().getTimezoneOffset(),
      (navigator as any).deviceMemory || "unknown",
      (navigator as any).platform || "unknown"
    ];
    
    const rawString = parts.join("|");
    
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    
    const positiveHash = Math.abs(hash).toString(36).toUpperCase();
    
    let category = "PC";
    const ua = (navigator.userAgent || "").toLowerCase();
    if (/mobi|android|iphone|ipad|touch/i.test(ua)) {
      category = /ipad|tablet/i.test(ua) ? "TAB" : "MOB";
    }
    
    return `DEV-${category}-${positiveHash}`;
  } catch (e) {
    return `DEV-MOB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
};

const testimonials = [
  {
    name: "Koffi Mensah",
    role: "Entrepreneur Digital (Smartphone)",
    avatar: "KM",
    text: "Je n'avais pas d'ordinateur sous la main au début. J'ai suivi toute la formation et créé mes premiers sites pro directement depuis mon simple smartphone Android. C'est magique !"
  },
  {
    name: "Marc-Antoine Dubois",
    role: "Développeur Freelance",
    avatar: "MD",
    text: "Cette formation a littéralement transformé ma manière de travailler. En 2 semaines, j'ai livré un projet complexe à un client en utilisant l'IA, me faisant économiser des dizaines d'heures."
  },
  {
    name: "Aline Traoré",
    role: "Chef de Produit Tech",
    avatar: "AT",
    text: "N'ayant pas de background technique solide, je pensais que le développement web était hors de portée. L'approche intuitive de l'Académie m'a permis de bâtir mon premier MVP fonctionnel seule !"
  },
  {
    name: "Amadou Diallo",
    role: "Créateur Web sur Mobile",
    avatar: "AD",
    text: "Gérer GitHub, structurer Neon et déployer sur Vercel à l'aide de mon smartphone sans écrire de code était impensable avant. Cette formation d'élite l'a fait. Recommandée à 100%."
  },
  {
    name: "Thomas Laroche",
    role: "Lead Tech & Formateur",
    avatar: "TL",
    text: "Le système de verrouillage d'appareil et d'hébergement privé est un chef-d'œuvre de sécurité. Les cours sur l'orchestration des APIs d'IA sont d'une clarté et d'une précision inégalées."
  },
  {
    name: "Sarah Benali",
    role: "Consultante Digital",
    avatar: "SB",
    text: "La saison sur la monétisation et l'automatisation pro est une mine d'or. L'interface de visionnage est fluide, sans coupures, et le code d'accès sécurisé est d'une simplicité enfantine."
  },
  {
    name: "Jean-Roch Gauthier",
    role: "Fondateur de Startup",
    avatar: "JG",
    text: "Grâce à l'intégration de Gemini, j'ai automatisé toute ma génération de contenu. Cette formation est le meilleur investissement que j'ai fait cette année pour ma productivité."
  }
];

const videoChapters = [
  {
    id: 0,
    title: "1. Introduction & Bienvenue",
    startTime: 0,
    description: "Présentation générale du parcours et de la philosophie de l'Académie."
  },
  {
    id: 1,
    title: "2. Les Bases du Développement",
    startTime: 62,
    description: "Pourquoi maîtriser les fondations du web est indispensable aujourd'hui."
  },
  {
    id: 2,
    title: "3. Se Spécialiser avec Succès",
    startTime: 185,
    description: "Choisir les bons outils et les technologies clés pour créer de la valeur."
  },
  {
    id: 3,
    title: "4. Pratiquer par les Projets",
    startTime: 320,
    description: "Comment construire des applications réelles pour devenir un expert autonome."
  },
  {
    id: 4,
    title: "5. Dompter l'IA et le Futur",
    startTime: 480,
    description: "Multiplier sa productivité par 10 en orchestrant l'intelligence artificielle."
  }
];

export default function App() {
  // Device Identification
  const [deviceId, setDeviceId] = useState<string>("");
  const [accessCode, setAccessCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>("");
  const [verificationSuccess, setVerificationSuccess] = useState<string>("");

  // Training Data State
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string>("1");
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);

  // Admin Panel State
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(window.location.pathname === "/administration");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>("");
  const [adminTab, setAdminTab] = useState<"seasons" | "episodes" | "codes" | "withdrawals" | "settings" | "stats">("codes");
  const [allCodes, setAllCodes] = useState<AccessCode[]>([]);
  const [adminSeasons, setAdminSeasons] = useState<Season[]>([]);
  const [adminEpisodes, setAdminEpisodes] = useState<Episode[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  // Manual code generation states
  const [newCodeFirstName, setNewCodeFirstName] = useState<string>("");
  const [newCodeLastName, setNewCodeLastName] = useState<string>("");
  const [newCodeEmail, setNewCodeEmail] = useState<string>("");

  // Moneroo Gateway State
  const [monerooSecretKey, setMonerooSecretKey] = useState<string>("");
  const [monerooPublicKey, setMonerooPublicKey] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(50);
  const [paymentCurrency, setPaymentCurrency] = useState<string>("USD");
  const [publicPaymentAmount, setPublicPaymentAmount] = useState<number>(50);
  const [publicPaymentCurrency, setPublicPaymentCurrency] = useState<string>("USD");
  const [telegramLink, setTelegramLink] = useState<string>("");
  const [whatsappLink, setWhatsappLink] = useState<string>("");
  const [presentationVideoUrl, setPresentationVideoUrl] = useState<string>("");
  const [presentationVideoPath, setPresentationVideoPath] = useState<string>("");
  const [monerooSaveSuccess, setMonerooSaveSuccess] = useState<string>("");
  const [monerooSaveError, setMonerooSaveError] = useState<string>("");
  const [isSavingMoneroo, setIsSavingMoneroo] = useState<boolean>(false);

  // Selected student code for detail page
  const [selectedAdminCode, setSelectedAdminCode] = useState<AccessCode | null>(null);
  
  // Admin Profile Edit Form state
  const [editFirstName, setEditFirstName] = useState<string>("");
  const [editLastName, setEditLastName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editReferralCode, setEditReferralCode] = useState<string>("");
  const [editReferralBalance, setEditReferralBalance] = useState<number>(0);
  const [editUsdtAddress, setEditUsdtAddress] = useState<string>("");
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string>("");
  const [updateErrorMsg, setUpdateErrorMsg] = useState<string>("");

  // Admin Forms State
  const [newSeasonTitle, setNewSeasonTitle] = useState<string>("");
  const [newSeasonDesc, setNewSeasonDesc] = useState<string>("");
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);

  const [newEpisodeTitle, setNewEpisodeTitle] = useState<string>("");
  const [newEpisodeDesc, setNewEpisodeDesc] = useState<string>("");
  const [newEpisodeSeasonId, setNewEpisodeSeasonId] = useState<string>("1");
  const [newEpisodeDuration, setNewEpisodeDuration] = useState<string>("10:00");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Custom Presentation Video State
  const [selectedPresentationFile, setSelectedPresentationFile] = useState<File | null>(null);
  const [isUploadingPresentation, setIsUploadingPresentation] = useState<boolean>(false);
  const [presentationUploadProgress, setPresentationUploadProgress] = useState<number>(0);

  // Payment Sim State
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<"intro" | "card" | "success">("intro");
  const [paymentFirstName, setPaymentFirstName] = useState<string>("");
  const [paymentLastName, setPaymentLastName] = useState<string>("");
  const [paymentEmail, setPaymentEmail] = useState<string>("");
  const [referralCodeUsed, setReferralCodeUsed] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Student Profile & Referral/Parrainage System States
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);
  const [showHelpMenu, setShowHelpMenu] = useState<boolean>(false);
  const [withdrawalUsdtAddress, setWithdrawalUsdtAddress] = useState<string>("");
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [withdrawalError, setWithdrawalError] = useState<string>("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string>("");
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState<boolean>(false);
  
  // Custom states for single USDT address configuration
  const [isSavingUsdtAddress, setIsSavingUsdtAddress] = useState<boolean>(false);
  const [usdtAddressSuccess, setUsdtAddressSuccess] = useState<string>("");
  const [usdtAddressError, setUsdtAddressError] = useState<string>("");
  const [editingUsdtAddress, setEditingUsdtAddress] = useState<boolean>(false);

  // Custom Alert and Dialog States
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Layout Controls
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Interactive Presentation Video Player State (Real YouTube Embedded Player)
  const [introVideoPlaying, setIntroVideoPlaying] = useState<boolean>(false);

  // Episode training video player ref
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Initial Setup
  useEffect(() => {
    // Generate or fetch Device ID
    let storedDeviceId = localStorage.getItem("ai_web_academy_device_id");
    
    // Auto-upgrade any old fragile randomly generated IDs to our secure fingerprint format
    const isOldFormat = storedDeviceId && !storedDeviceId.includes("-MOB-") && !storedDeviceId.includes("-PC-") && !storedDeviceId.includes("-TAB-");
    
    if (!storedDeviceId || isOldFormat) {
      storedDeviceId = getDeviceFingerprint();
      localStorage.setItem("ai_web_academy_device_id", storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // Fetch stored access code
    const storedCode = localStorage.getItem("ai_web_academy_access_code");
    if (storedCode) {
      setAccessCode(storedCode);
      verifyAccessCodeOnLoad(storedCode, storedDeviceId);
    }

    // Check if redirected back from Moneroo payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment_status");
    const paymentId = urlParams.get("payment_id");

    if (paymentStatus === "success" && paymentId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      verifyMonerooPayment(paymentId, storedDeviceId);
    } else if (["cancel", "cancelled", "failed"].includes(paymentStatus || "")) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setCustomAlert({
        title: "Paiement non finalisé",
        message: "Votre paiement a été annulé ou n'a pas été finalisé chez Moneroo. Vous avez été réorienté vers l'Académie. Vous pouvez réessayer à tout moment."
      });
    }

    // Load public state (Seasons & Episode information)
    fetchPublicState();

    // Handle administration URL routing
    if (window.location.pathname === "/administration") {
      setShowAdminLogin(true);
    } else {
      setShowAdminLogin(false);
    }

    // Check stored Admin session
    const storedAdminPass = localStorage.getItem("ai_web_academy_admin_pass");
    if (storedAdminPass) {
      fetchAdminData(storedAdminPass);
    }
  }, []);

  // Fetch Public State
  const fetchPublicState = async () => {
    try {
      const res = await fetch("/api/public-state");
      if (res.ok) {
        const data = await res.json();
        setSeasons(data.seasons || []);
        setEpisodes(data.episodes || []);
        if (data.telegramLink) setTelegramLink(data.telegramLink);
        if (data.whatsappLink) setWhatsappLink(data.whatsappLink);
        if (data.presentationVideoUrl) setPresentationVideoUrl(data.presentationVideoUrl);
        if (data.presentationVideoPath !== undefined) setPresentationVideoPath(data.presentationVideoPath);
        if (data.paymentAmount !== undefined) setPublicPaymentAmount(data.paymentAmount);
        if (data.paymentCurrency) setPublicPaymentCurrency(data.paymentCurrency);
        if (data.seasons && data.seasons.length > 0) {
          setActiveSeasonId(data.seasons[0].id);
        }
      }
    } catch (e) {
      console.error("Error fetching public catalog:", e);
    }
  };

  // Verify access code on mount
  const verifyAccessCodeOnLoad = async (code: string, currentDeviceId: string) => {
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, deviceId: currentDeviceId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setUserProfile(data.profile);
        }
      } else {
        // Stored code is no longer valid or device mismatch
        localStorage.removeItem("ai_web_academy_access_code");
        setAccessCode("");
      }
    } catch (e) {
      console.error("Error verifying access code:", e);
    }
  };

  // Verify Moneroo payment status and generate elite code on success
  const verifyMonerooPayment = async (paymentId: string, currentDeviceId: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });
      const data = await res.json();
      if (res.ok && data.success && data.code) {
        localStorage.setItem("ai_web_academy_access_code", data.code);
        setAccessCode(data.code);
        if (data.profile) {
          setUserProfile(data.profile);
        }
        setIsPaymentOpen(true);
        setPaymentStep("success");
        setGeneratedCode(data.code);
      } else {
        setCustomAlert({
          title: "Vérification de Paiement",
          message: data.error || "Le paiement n'a pas pu être validé automatiquement. Si vous avez été débité, veuillez contacter l'administrateur."
        });
      }
    } catch (err) {
      setCustomAlert({
        title: "Erreur Réseau",
        message: "Une erreur réseau est survenue lors de la vérification de votre paiement."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Save Moneroo settings from the admin settings tab
  const handleSaveMonerooSettings = async () => {
    setIsSavingMoneroo(true);
    setMonerooSaveSuccess("");
    setMonerooSaveError("");
    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          monerooSecretKey,
          monerooPublicKey,
          telegramLink,
          whatsappLink,
          presentationVideoUrl,
          presentationVideoPath,
          paymentAmount,
          paymentCurrency
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMonerooSaveSuccess(data.message || "Configuration enregistrée avec succès !");
        fetchAdminData(password);
      } else {
        setMonerooSaveError(data.error || "Erreur lors de l'enregistrement de la configuration.");
      }
    } catch (e) {
      setMonerooSaveError("Erreur de connexion au serveur.");
    } finally {
      setIsSavingMoneroo(false);
    }
  };

  // Helper to refresh live profile data
  const refreshProfile = async () => {
    const storedCode = localStorage.getItem("ai_web_academy_access_code") || accessCode;
    if (!storedCode) return;
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, deviceId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setUserProfile(data.profile);
        }
      }
    } catch (e) {
      console.error("Failed to refresh profile:", e);
    }
  };

  // Handle Form Access Code Validation
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsVerifying(true);
    setVerificationError("");
    setVerificationSuccess("");

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode.trim(), deviceId })
      });

      const data = await res.json();

      if (res.ok) {
        setVerificationSuccess(data.message);
        localStorage.setItem("ai_web_academy_access_code", inputCode.trim().toUpperCase());
        if (data.profile) {
          setUserProfile(data.profile);
        }
        setTimeout(() => {
          setAccessCode(inputCode.trim().toUpperCase());
          fetchPublicState();
        }, 1200);
      } else {
        setVerificationError(data.error || "Une erreur est survenue lors de la validation.");
      }
    } catch (err) {
      setVerificationError("Impossible de contacter le serveur de validation.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Simulating Payment to Buy Code
  const handleStartPayment = () => {
    setIsPaymentOpen(true);
    setPaymentStep("intro");
    setPaymentFirstName("");
    setPaymentLastName("");
    setPaymentEmail("");
    setReferralCodeUsed("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setGeneratedCode("");
    setCopiedCode(false);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFirstName.trim() || !paymentLastName.trim() || !paymentEmail.trim()) return;

    setIsVerifying(true);
    try {
      const res = await fetch("/api/payments/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: paymentFirstName,
          lastName: paymentLastName,
          email: paymentEmail,
          referredBy: referralCodeUsed
        })
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setCustomAlert({
          title: "Échec de l'initialisation",
          message: data.error || "Impossible d'initier le paiement avec Moneroo. Veuillez réessayer."
        });
      }
    } catch (err) {
      setCustomAlert({
        title: "Erreur Réseau",
        message: "Une erreur réseau est survenue lors de l'initialisation de votre paiement."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) return;

    setIsVerifying(true);
    try {
      // Post to buy-code with registration data
      const res = await fetch("/api/buy-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: paymentFirstName,
          lastName: paymentLastName,
          email: paymentEmail,
          referredBy: referralCodeUsed
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCode(data.code);
        if (data.profile) {
          setUserProfile(data.profile);
        }
        setPaymentStep("success");
      } else {
        const data = await res.json();
        setCustomAlert({
          title: "Échec du paiement",
          message: data.error || "Erreur de paiement. Veuillez réessayer."
        });
      }
    } catch (err) {
      setCustomAlert({
        title: "Erreur Réseau",
        message: "Erreur réseau de traitement."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle USDT Withdrawal requests
  const handleRequestWithdrawal = async (e: React.FormEvent, customAmt?: number) => {
    if (e) e.preventDefault();
    
    const targetAddress = userProfile?.usdtAddress || withdrawalUsdtAddress;
    if (!targetAddress || !targetAddress.trim()) {
      setWithdrawalError("Une adresse USDT de retrait est obligatoire. Veuillez d'abord configurer votre adresse.");
      return;
    }

    const amount = customAmt !== undefined ? customAmt : Number(withdrawalAmount);
    if (isNaN(amount) || amount < 50) {
      setWithdrawalError("Le retrait minimum est de 50 USDT ($50).");
      return;
    }

    if (userProfile && amount > userProfile.referralBalance) {
      setWithdrawalError(`Solde insuffisant. Votre solde disponible est de $${userProfile.referralBalance}.`);
      return;
    }

    setIsRequestingWithdrawal(true);
    setWithdrawalError("");
    setWithdrawalSuccess("");

    try {
      const res = await fetch("/api/request-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: accessCode,
          deviceId,
          amount,
          usdtAddress: targetAddress
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWithdrawalSuccess(data.message);
        if (data.profile) {
          setUserProfile(data.profile);
        }
        setWithdrawalAmount("");
      } else {
        setWithdrawalError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setWithdrawalError("Erreur lors de la soumission de la demande de retrait.");
    } finally {
      setIsRequestingWithdrawal(false);
    }
  };

  // Save/configure student USDT Withdrawal address
  const handleSaveUsdtAddress = async (addressToSave: string) => {
    if (!addressToSave.trim()) {
      setUsdtAddressError("L'adresse de retrait USDT ne peut pas être vide.");
      return;
    }
    setIsSavingUsdtAddress(true);
    setUsdtAddressSuccess("");
    setUsdtAddressError("");
    try {
      const res = await fetch("/api/update-usdt-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: accessCode,
          deviceId,
          usdtAddress: addressToSave
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUsdtAddressSuccess(data.message);
        if (data.profile) {
          setUserProfile(data.profile);
        }
        setEditingUsdtAddress(false);
      } else {
        setUsdtAddressError(data.error || "Une erreur est survenue.");
      }
    } catch (e) {
      setUsdtAddressError("Erreur lors de la configuration de l'adresse USDT.");
    } finally {
      setIsSavingUsdtAddress(false);
    }
  };

  // Fetch Full Admin Data
  const fetchAdminData = async (password: string) => {
    setAdminError("");
    const trimmedPass = password.trim();
    try {
      const res = await fetch("/api/admin/data", {
        headers: { "x-admin-password": trimmedPass }
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Erreur de décodage JSON:", jsonErr);
      }

      if (res.ok) {
        setAllCodes(data.codes || []);
        setAdminSeasons(data.seasons || []);
        setAdminEpisodes(data.episodes || []);
        setPendingPayments(data.pendingPayments || []);

        if (data.monerooSecretKey) setMonerooSecretKey(data.monerooSecretKey);
        if (data.monerooPublicKey) setMonerooPublicKey(data.monerooPublicKey);
        if (data.paymentAmount !== undefined) setPaymentAmount(data.paymentAmount);
        if (data.paymentCurrency) setPaymentCurrency(data.paymentCurrency);
        if (data.telegramLink) setTelegramLink(data.telegramLink);
        if (data.whatsappLink) setWhatsappLink(data.whatsappLink);
        if (data.presentationVideoUrl) setPresentationVideoUrl(data.presentationVideoUrl);
        if (data.presentationVideoPath !== undefined) setPresentationVideoPath(data.presentationVideoPath);

        setIsAdminAuthenticated(true);
        localStorage.setItem("ai_web_academy_admin_pass", trimmedPass);
      } else {
        setAdminError(data.error || "Mot de passe administrateur incorrect.");
        localStorage.removeItem("ai_web_academy_admin_pass");
      }
    } catch (e) {
      setAdminError("Erreur de communication avec le serveur d'administration.");
    }
  };

  // Handle Admin Auth Submission
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData(adminPassword);
  };

  // Admin Logout
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPassword("");
    localStorage.removeItem("ai_web_academy_admin_pass");
    window.location.href = "/";
  };

  // Admin Actions: Code management
  const handleGenerateCode = async (isPaid: boolean) => {
    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    try {
      const res = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({ 
          isPaid,
          firstName: newCodeFirstName,
          lastName: newCodeLastName,
          email: newCodeEmail
        })
      });
      if (res.ok) {
        setNewCodeFirstName("");
        setNewCodeLastName("");
        setNewCodeEmail("");
        fetchAdminData(password);
        setCustomAlert({
          title: "Code Généré !",
          message: "Le code d'accès a été généré manuellement avec succès pour l'étudiant."
        });
      } else {
        const err = await res.json();
        setCustomAlert({
          title: "Erreur",
          message: err.error || "Impossible de générer le code d'accès."
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCode = (codeToDelete: string) => {
    setConfirmDialog({
      title: "Supprimer le code d'accès ?",
      message: `Êtes-vous sûr de vouloir supprimer définitivement le code "${codeToDelete}" ?`,
      onConfirm: async () => {
        const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
        try {
          const res = await fetch(`/api/admin/codes/${codeToDelete}`, {
            method: "DELETE",
            headers: { "x-admin-password": password }
          });
          if (res.ok) {
            fetchAdminData(password);
          }
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleResetDevice = async (codeToReset: string) => {
    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    try {
      const res = await fetch(`/api/admin/codes/${codeToReset}/reset`, {
        method: "POST",
        headers: { "x-admin-password": password }
      });
      if (res.ok) {
        fetchAdminData(password);
        setCustomAlert({
          title: "Appareil Délié",
          message: `L'appareil pour le code "${codeToReset}" a été libéré avec succès !`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectCodeForDetails = (codeObj: AccessCode) => {
    setSelectedAdminCode(codeObj);
    setEditFirstName(codeObj.firstName || "");
    setEditLastName(codeObj.lastName || "");
    setEditEmail(codeObj.email || "");
    setEditReferralCode(codeObj.referralCode || "");
    setEditReferralBalance(codeObj.referralBalance || 0);
    setEditUsdtAddress(codeObj.usdtAddress || "");
    setUpdateSuccessMsg("");
    setUpdateErrorMsg("");
  };

  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminCode) return;
    setUpdateSuccessMsg("");
    setUpdateErrorMsg("");
    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    try {
      const res = await fetch(`/api/admin/codes/${selectedAdminCode.code}/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          referralCode: editReferralCode,
          referralBalance: editReferralBalance,
          usdtAddress: editUsdtAddress
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateSuccessMsg("Le profil a été mis à jour avec succès !");
        setSelectedAdminCode(data.code);
        fetchAdminData(password);
      } else {
        setUpdateErrorMsg(data.error || "Erreur lors de la mise à jour.");
      }
    } catch (e) {
      setUpdateErrorMsg("Erreur de connexion au serveur.");
    }
  };

  const handleCompleteWithdrawal = async (withdrawalId: string, studentCode?: string) => {
    const targetCode = studentCode || (selectedAdminCode ? selectedAdminCode.code : null);
    if (!targetCode) return;
    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    try {
      const res = await fetch(`/api/admin/codes/${targetCode}/withdrawals/${withdrawalId}/complete`, {
        method: "POST",
        headers: { "x-admin-password": password }
      });
      if (res.ok) {
        fetchAdminData(password);
        const updatedCodesRes = await fetch("/api/admin/data", {
          headers: { "x-admin-password": password }
        });
        if (updatedCodesRes.ok) {
          const updatedData = await updatedCodesRes.json();
          const freshCodeObj = (updatedData.codes || []).find((c: any) => c.code === targetCode);
          if (freshCodeObj) {
            if (selectedAdminCode && selectedAdminCode.code === targetCode) {
              setSelectedAdminCode(freshCodeObj);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId: string, studentCode?: string) => {
    const targetCode = studentCode || (selectedAdminCode ? selectedAdminCode.code : null);
    if (!targetCode) return;
    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    try {
      const res = await fetch(`/api/admin/codes/${targetCode}/withdrawals/${withdrawalId}/cancel`, {
        method: "POST",
        headers: { "x-admin-password": password }
      });
      if (res.ok) {
        fetchAdminData(password);
        const updatedCodesRes = await fetch("/api/admin/data", {
          headers: { "x-admin-password": password }
        });
        if (updatedCodesRes.ok) {
          const updatedData = await updatedCodesRes.json();
          const freshCodeObj = (updatedData.codes || []).find((c: any) => c.code === targetCode);
          if (freshCodeObj) {
            if (selectedAdminCode && selectedAdminCode.code === targetCode) {
              setSelectedAdminCode(freshCodeObj);
              setEditReferralBalance(freshCodeObj.referralBalance || 0);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Actions: Season management
  const handleSaveSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeasonTitle.trim()) return;

    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    try {
      const res = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          id: editingSeasonId,
          title: newSeasonTitle,
          description: newSeasonDesc
        })
      });

      if (res.ok) {
        setNewSeasonTitle("");
        setNewSeasonDesc("");
        setEditingSeasonId(null);
        fetchAdminData(password);
        fetchPublicState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSeason = (seasonId: string) => {
    setConfirmDialog({
      title: "Supprimer la saison ?",
      message: "Voulez-vous vraiment supprimer cette saison et TOUS ses épisodes ? Cette action est définitive et irréversible !",
      onConfirm: async () => {
        const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
        try {
          const res = await fetch(`/api/admin/seasons/${seasonId}`, {
            method: "DELETE",
            headers: { "x-admin-password": password }
          });
          if (res.ok) {
            fetchAdminData(password);
            fetchPublicState();
          }
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog(null);
      }
    });
  };

  // Admin Actions: Episode upload and management
  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpisodeTitle.trim() || !selectedVideoFile) {
      setCustomAlert({
        title: "Champs Requis",
        message: "Le titre et le fichier vidéo de l'épisode sont indispensables."
      });
      return;
    }

    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    setIsUploading(true);
    setUploadProgress(10);

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append("seasonId", newEpisodeSeasonId);
      formData.append("title", newEpisodeTitle);
      formData.append("description", newEpisodeDesc);
      formData.append("duration", newEpisodeDuration);
      formData.append("videoFile", selectedVideoFile);

      const res = await fetch("/api/admin/episodes", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        setTimeout(() => {
          setNewEpisodeTitle("");
          setNewEpisodeDesc("");
          setNewEpisodeDuration("10:00");
          setSelectedVideoFile(null);
          setIsUploading(false);
          setUploadProgress(0);
          fetchAdminData(password);
          fetchPublicState();
        }, 800);
      } else {
        const err = await res.json();
        setCustomAlert({
          title: "Erreur de chargement",
          message: err.error || "Une erreur est survenue lors du chargement."
        });
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setCustomAlert({
        title: "Erreur réseau",
        message: "Impossible d'envoyer le fichier sur le serveur."
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteEpisode = (episodeId: string) => {
    setConfirmDialog({
      title: "Supprimer l'épisode ?",
      message: "Voulez-vous vraiment supprimer cet épisode ? Le fichier vidéo sera définitivement effacé du serveur.",
      onConfirm: async () => {
        const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
        try {
          const res = await fetch(`/api/admin/episodes/${episodeId}`, {
            method: "DELETE",
            headers: { "x-admin-password": password }
          });
          if (res.ok) {
            fetchAdminData(password);
            fetchPublicState();
            if (activeEpisode?.id === episodeId) {
              setActiveEpisode(null);
            }
          }
        } catch (err) {
          console.error(err);
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleUploadPresentationVideo = async () => {
    if (!selectedPresentationFile) return;
    const password = localStorage.getItem("ai_web_academy_admin_pass") || "";
    setIsUploadingPresentation(true);
    setPresentationUploadProgress(10);

    const progressInterval = setInterval(() => {
      setPresentationUploadProgress(prev => (prev >= 85 ? 85 : prev + 15));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("videoFile", selectedPresentationFile);

      const res = await fetch("/api/admin/presentation-video", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData
      });

      clearInterval(progressInterval);
      setPresentationUploadProgress(100);

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setPresentationVideoPath(data.presentationVideoPath);
          setSelectedPresentationFile(null);
          setIsUploadingPresentation(false);
          setPresentationUploadProgress(0);
          setMonerooSaveSuccess("Vidéo de présentation mise en ligne et configurée avec succès !");
          fetchAdminData(password);
          fetchPublicState();
        }, 800);
      } else {
        const err = await res.json();
        setMonerooSaveError(err.error || "Une erreur est survenue lors du chargement de la vidéo.");
        setIsUploadingPresentation(false);
        setPresentationUploadProgress(0);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setMonerooSaveError("Erreur de connexion lors de l'envoi.");
      setIsUploadingPresentation(false);
      setPresentationUploadProgress(0);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Log Out from User Portal
  const handleLogOutPortal = () => {
    setConfirmDialog({
      title: "Déconnexion de l'Académie ?",
      message: "Voulez-vous vous déconnecter ? Votre code d'accès sera requis à nouveau pour réaccéder aux cours, mais restera verrouillé en toute sécurité à cet appareil.",
      onConfirm: () => {
        localStorage.removeItem("ai_web_academy_access_code");
        setAccessCode("");
        setActiveEpisode(null);
        setConfirmDialog(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-950 relative overflow-hidden">
      {!accessCode && <EncryptionBackground />}
      
      {/* 1. Header Navigation Bar */}
      {!showAdminLogin && (
        <nav id="academy-navbar" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setShowAdminLogin(false); }}>
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-white border border-slate-200">
                <img
                  src={academyLogo1}
                  alt="AI Web Academy Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-display font-bold text-lg tracking-tight text-slate-900">
                  AI WEB ACADEMY
                </span>
                <span className="block text-[10px] text-indigo-600 font-mono tracking-wider font-semibold uppercase">
                  Formation Ultime
                </span>
              </div>
            </div>

            {/* Top Contact Email Badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/80 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-700 transition-all cursor-pointer" onClick={() => window.location.href = "mailto:contact@ai-academy.fit"}>
              <Mail className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span className="font-mono text-[11px]">contact@ai-academy.fit</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {accessCode ? (
                <>
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      refreshProfile();
                    }}
                    className="flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mon Profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReferralModal(true);
                      refreshProfile();
                    }}
                    className="flex items-center space-x-1.5 text-xs text-slate-700 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-200 transition-all font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>Parrainage</span>
                  </button>
                  <div className="flex items-center space-x-2 bg-slate-100/80 px-3 h-8.5 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Appareil : </span>
                    <span className="font-mono text-indigo-600 font-semibold">{deviceId}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-indigo-50 px-3 h-8.5 rounded-lg border border-indigo-100 text-xs text-indigo-700">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Code : </span>
                    <span className="font-mono font-bold tracking-wider text-indigo-900">{accessCode}</span>
                  </div>
                  <button 
                    onClick={handleLogOutPortal}
                    className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Quitter</span>
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Prêt pour l'apprentissage d'élite.
                </div>
              )}


            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 text-sm shadow-md"
            >
              {accessCode ? (
                <div className="space-y-2 pb-2 border-b border-slate-200">
                  <div className="grid grid-cols-2 gap-2 pb-1">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setIsMobileMenuOpen(false);
                        refreshProfile();
                      }}
                      className="flex items-center justify-center space-x-1.5 bg-slate-100 p-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mon Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowReferralModal(true);
                        setIsMobileMenuOpen(false);
                        refreshProfile();
                      }}
                      className="flex items-center justify-center space-x-1.5 bg-amber-50 p-2 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>Parrainage</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg text-xs">
                    <span className="text-slate-500">Appareil :</span>
                    <span className="font-mono text-indigo-600 font-semibold">{deviceId}</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg text-xs">
                    <span className="text-slate-500">Code actif :</span>
                    <span className="font-mono text-indigo-950 font-bold">{accessCode}</span>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogOutPortal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              ) : (
                <div className="text-slate-500 text-xs py-2 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Veuillez valider un code d'accès pour commencer à visionner.
                </div>
              )}

              {/* Assistance & Community Links */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold">Aide & Assistance 24/7</span>
                <div className="grid grid-cols-1 gap-2">
                  {whatsappLink && (
                    <a 
                      href={whatsappLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Support WhatsApp</span>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Direct</span>
                    </a>
                  )}
                  {telegramLink && (
                    <a 
                      href={telegramLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-sky-50 hover:bg-sky-100/80 border border-sky-100 text-sky-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4 text-sky-600" />
                        <span>Canal Telegram</span>
                      </div>
                      <span className="text-[9px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Rejoindre</span>
                    </a>
                  )}
                  <a 
                    href="mailto:contact@ai-academy.fit"
                    className="flex items-center justify-between bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span>Support Email</span>
                    </div>
                    <span className="text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Écrire</span>
                  </a>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      )}

      {/* 2. Admin Panel Overlay / View */}
      {showAdminLogin && (
        <div id="admin-management-container" className="bg-slate-100 border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 shadow-inner">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg border border-purple-200">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">
                    Interface d'Administration Professionnelle
                  </h2>
                  <p className="text-xs text-slate-500">
                    Gérez les saisons, déposez des vidéos sécurisées, et générez les codes d'accès uniques.
                  </p>
                </div>
              </div>
               <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 px-3 py-1 text-xs rounded-md border border-slate-200 shadow-sm"
              >
                Fermer l'Admin
              </button>
            </div>

            {!isAdminAuthenticated ? (
              /* Authenticate Panel */
              <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-slate-800">
                <div className="text-center mb-6">
                  <Lock className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">Connexion de sécurité</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Veuillez renseigner le mot de passe maître de l'académie pour déverrouiller.
                  </p>
                </div>

                <form onSubmit={handleAdminAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Mot de passe administrateur
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Entrez le mot de passe..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>

                  {adminError && (
                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-xs text-red-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
                  >
                    Déverrouiller l'Espace Admin
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Admin Workspace */
              <div className="space-y-8">
                
                {/* Admin Navbar Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-200/60 p-2 rounded-xl border border-slate-200">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setAdminTab("codes")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                        adminTab === "codes"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/15"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                    >
                      <Key className="w-3.5 h-3.5 inline mr-1.5" />
                      Codes d'Accès ({allCodes.length})
                    </button>
                    <button
                      onClick={() => setAdminTab("seasons")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                        adminTab === "seasons"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/15"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                      Saisons ({adminSeasons.length})
                    </button>
                    <button
                      onClick={() => setAdminTab("episodes")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                        adminTab === "episodes"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/15"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 inline mr-1.5" />
                      Vidéos & Épisodes ({adminEpisodes.length})
                    </button>
                    <button
                      onClick={() => setAdminTab("withdrawals")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                        adminTab === "withdrawals"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/15"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Retraits</span>
                      {allCodes.reduce((acc, c) => acc + (c.withdrawals || []).filter(w => w.status === "pending").length, 0) > 0 && (
                        <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                          {allCodes.reduce((acc, c) => acc + (c.withdrawals || []).filter(w => w.status === "pending").length, 0)}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setAdminTab("settings" as any)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                        adminTab === ("settings" as any)
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/15"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Config Paiement</span>
                    </button>
                    <button
                      onClick={() => setAdminTab("stats")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                        adminTab === "stats"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/15"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Statistiques & Ventes</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 font-medium">Authentifié : Formateur</span>
                    <button
                      onClick={handleAdminLogout}
                      className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                      Quitter la session
                    </button>
                  </div>
                </div>

                {/* Tab content: Codes */}
                {adminTab === "codes" && (
                  <div>
                    {selectedAdminCode ? (
                      /* Student Profile Detail View / Subpage */
                      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-8 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100">
                          <div className="flex items-center space-x-4">
                            <div className="bg-indigo-100 p-3 rounded-2xl border border-indigo-200 text-indigo-600">
                              <User className="w-8 h-8" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">Étudiant</span>
                                {selectedAdminCode.isPaid ? (
                                  <span className="text-xs bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Payé ($50)</span>
                                ) : (
                                  <span className="text-xs bg-purple-100 border border-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-semibold">Formateur</span>
                                )}
                              </div>
                              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                                {selectedAdminCode.firstName || selectedAdminCode.lastName
                                  ? `${selectedAdminCode.firstName || ""} ${selectedAdminCode.lastName || ""}`.trim()
                                  : "Étudiant non enregistré"
                                }
                              </h3>
                              <p className="text-sm text-slate-500 font-mono mt-0.5">Code d'accès : {selectedAdminCode.code}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setSelectedAdminCode(null)}
                            className="mt-4 sm:mt-0 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all border border-slate-200"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Retour à la liste</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          
                          {/* Left: Modify Profile / Referral Info */}
                          <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-slate-600" />
                                <span>Modifier les Informations du Profil</span>
                              </h4>
                              
                              <form onSubmit={handleSaveUserProfile} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Prénom</label>
                                    <input
                                      type="text"
                                      value={editFirstName}
                                      onChange={(e) => setEditFirstName(e.target.value)}
                                      placeholder="Ex: Jean"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nom</label>
                                    <input
                                      type="text"
                                      value={editLastName}
                                      onChange={(e) => setEditLastName(e.target.value)}
                                      placeholder="Ex: Dupont"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse Email</label>
                                  <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder="Ex: jean.dupont@email.com"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Code Parrainage</label>
                                    <input
                                      type="text"
                                      value={editReferralCode}
                                      onChange={(e) => setEditReferralCode(e.target.value.toUpperCase())}
                                      placeholder="Ex: REF-ABCDE"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Gain / Solde de Parrainage ($)</label>
                                    <input
                                      type="number"
                                      value={editReferralBalance}
                                      onChange={(e) => setEditReferralBalance(Number(e.target.value))}
                                      placeholder="Ex: 150"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse de retrait USDT (TRC-20)</label>
                                  <input
                                    type="text"
                                    value={editUsdtAddress}
                                    onChange={(e) => setEditUsdtAddress(e.target.value)}
                                    placeholder="Ex: TY123456789..."
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                  />
                                </div>

                                {updateSuccessMsg && (
                                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span>{updateSuccessMsg}</span>
                                  </div>
                                )}

                                {updateErrorMsg && (
                                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <span>{updateErrorMsg}</span>
                                  </div>
                                )}

                                <div className="flex justify-end pt-2">
                                  <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md flex items-center space-x-2"
                                  >
                                    <Save className="w-4 h-4" />
                                    <span>Enregistrer le Profil</span>
                                  </button>
                                </div>
                              </form>
                            </div>

                            {/* Withdrawals Management Section */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                                  <CreditCard className="w-4 h-4 text-slate-600" />
                                  <span>Historique & Demandes de Retrait</span>
                                </h4>
                                <span className="text-[10px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                                  {(selectedAdminCode.withdrawals || []).length} retrait(s)
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                                      <th className="py-2.5 px-3">Date</th>
                                      <th className="py-2.5 px-3">Montant</th>
                                      <th className="py-2.5 px-3">Adresse USDT</th>
                                      <th className="py-2.5 px-3">Statut</th>
                                      <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {!(selectedAdminCode.withdrawals && selectedAdminCode.withdrawals.length > 0) ? (
                                      <tr>
                                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                                          Aucune demande de retrait effectuée par cet élève.
                                        </td>
                                      </tr>
                                    ) : (
                                      selectedAdminCode.withdrawals.map((w) => (
                                        <tr key={w.id} className="hover:bg-slate-50">
                                          <td className="py-3 px-3 text-slate-500">
                                            {new Date(w.createdAt).toLocaleString("fr-FR")}
                                          </td>
                                          <td className="py-3 px-3 font-semibold text-slate-800">
                                            {w.amount} USDT
                                          </td>
                                          <td className="py-3 px-3 font-mono text-slate-600 max-w-[150px] truncate" title={w.usdtAddress}>
                                            {w.usdtAddress}
                                          </td>
                                          <td className="py-3 px-3">
                                            {w.status === "completed" ? (
                                              <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                                                Payé
                                              </span>
                                            ) : (
                                              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                                                En attente
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-3 px-3 text-right space-x-1">
                                            {w.status === "pending" && (
                                              <>
                                                <button
                                                  onClick={() => handleCompleteWithdrawal(w.id)}
                                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-1 rounded font-semibold transition-all shadow-sm"
                                                >
                                                  Valider / Payer
                                                </button>
                                                <button
                                                  onClick={() => handleCancelWithdrawal(w.id)}
                                                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[10px] px-2 py-1 rounded font-semibold transition-all"
                                                >
                                                  Annuler
                                                </button>
                                              </>
                                            )}
                                            {w.status === "completed" && (
                                              <span className="text-slate-400 italic text-[11px]">Aucune action</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                          </div>

                          {/* Right: Security, Device Link, Summary Info */}
                          <div className="space-y-6">
                            
                            {/* Device Lock Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                                <Monitor className="w-4 h-4 text-slate-600" />
                                <span>Sécurité & Liaison Matérielle</span>
                              </h4>

                              <div className="space-y-3">
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Identifiant Appareil unique</span>
                                  {selectedAdminCode.deviceLock ? (
                                    <div className="mt-1 flex items-center space-x-2 text-slate-800">
                                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded">
                                        {selectedAdminCode.deviceLock}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-amber-600 font-medium italic mt-1 block">Pas encore d'appareil lié</span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  L'appareil de cet étudiant est lié par empreinte matérielle stable à la première connexion. Pour libérer son accès (s'il change d'appareil), utilisez le bouton ci-dessous.
                                </p>

                                {selectedAdminCode.deviceLock && (
                                  <button
                                    onClick={() => {
                                      handleResetDevice(selectedAdminCode.code);
                                      setSelectedAdminCode({ ...selectedAdminCode, deviceLock: null });
                                    }}
                                    className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs py-2 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                                  >
                                    <Unlock className="w-4 h-4 text-amber-600" />
                                    <span>Délier l'appareil maintenant</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Referral Tree Info */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                                <Users className="w-4 h-4 text-slate-600" />
                                <span>Affiliation & Parrainage</span>
                              </h4>

                              <div className="space-y-2 text-xs text-slate-600">
                                <div className="flex justify-between py-1.5 border-b border-slate-100">
                                  <span>Code parrain lié :</span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {selectedAdminCode.referredBy || <span className="text-slate-400 italic font-normal">Aucun</span>}
                                  </span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-slate-100">
                                  <span>Code d'invitation :</span>
                                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                                    {selectedAdminCode.referralCode || "Non généré"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-slate-100">
                                  <span>Gain par parrainage :</span>
                                  <span className="font-bold text-slate-800">25 USDT par vente (50%)</span>
                                </div>
                                <div className="flex justify-between py-1.5">
                                  <span>Solde de gains :</span>
                                  <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                    {selectedAdminCode.referralBalance || 0} USDT
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quick stats / Summary */}
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-3">Statut de l'étudiant</h4>
                              <p className="text-xs text-indigo-100 leading-relaxed">
                                Ce compte a été créé le {new Date(selectedAdminCode.createdAt).toLocaleDateString("fr-FR")}. 
                                Le code d'accès est actif et sécurisé par le Module de Protection Matérielle Anti-Partage de compte.
                              </p>
                            </div>

                          </div>

                        </div>
                      </div>
                    ) : (
                      /* Normal grid content: Form on left, table on right */
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left: Code Generator Form */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                              Générateur de Code d'Accès
                            </h3>
                            <p className="text-xs text-slate-500">
                              Créez des codes uniques. Chaque code ne peut être activé que sur un seul appareil par l'étudiant.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Prénom de l'étudiant
                              </label>
                              <input
                                type="text"
                                value={newCodeFirstName}
                                onChange={(e) => setNewCodeFirstName(e.target.value)}
                                placeholder="Ex: Jean"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Nom de l'étudiant
                              </label>
                              <input
                                type="text"
                                value={newCodeLastName}
                                onChange={(e) => setNewCodeLastName(e.target.value)}
                                placeholder="Ex: Dupont"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Adresse Email / Gmail
                              </label>
                              <input
                                type="email"
                                value={newCodeEmail}
                                onChange={(e) => setNewCodeEmail(e.target.value)}
                                placeholder="Ex: jean.dupont@gmail.com"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <button
                              onClick={() => handleGenerateCode(false)}
                              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
                            >
                              <PlusCircle className="w-4 h-4 text-purple-600" />
                              <span>Générer un Code Manuel gratuit</span>
                            </button>

                            <button
                              onClick={() => handleGenerateCode(true)}
                              className="w-full bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-700 text-xs py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
                            >
                              <CreditCard className="w-4 h-4 text-indigo-600" />
                              <span>Générer un Code Affiliation (Payé)</span>
                            </button>
                          </div>

                          <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 mb-2">Politique Anti-Partage de Compte</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Dès qu'un élève entre le code pour la première fois, son adresse virtuelle d'appareil (Device ID) est soudée au code. S'il tente d'ouvrir le site sur sa tablette, son téléphone ou avec un ami, le serveur rejettera l'accès de sécurité. Vous pouvez réinitialiser l'appareil ci-contre si besoin.
                            </p>
                          </div>
                        </div>

                        {/* Right: Codes Table */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                              Liste des Codes & Étudiants Inscrits
                            </h3>
                            <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                              Total : {allCodes.length} codes
                            </span>
                          </div>

                          <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                                  <th className="py-2.5 px-3">Code / Date</th>
                                  <th className="py-2.5 px-3">Profil Étudiant</th>
                                  <th className="py-2.5 px-3">Type</th>
                                  <th className="py-2.5 px-3">Affiliation / Gains</th>
                                  <th className="py-2.5 px-3">Appareil</th>
                                  <th className="py-2.5 px-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {allCodes.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                                      Aucun code d'accès n'est encore enregistré.
                                    </td>
                                  </tr>
                                ) : (
                                  allCodes.map((c) => {
                                    const hasProfile = c.firstName || c.lastName || c.email;
                                    const fullName = `${c.firstName || ""} ${c.lastName || ""}`.trim();
                                    return (
                                      <tr key={c.code} className="hover:bg-slate-50">
                                        <td className="py-3 px-3">
                                          <div className="flex flex-col">
                                            <span className="font-mono font-bold text-slate-800 tracking-wider">
                                              {c.code}
                                            </span>
                                            <span className="text-[10px] text-slate-400 mt-0.5">
                                              {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-3">
                                          {hasProfile ? (
                                            <div className="flex flex-col">
                                              <span className="font-semibold text-slate-700">
                                                {fullName || "Sans nom"}
                                              </span>
                                              <span className="text-[10px] text-slate-400 truncate max-w-[150px]" title={c.email}>
                                                {c.email}
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 italic text-[11px]">Non renseigné</span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3">
                                          {c.isPaid ? (
                                            <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                                              Payé ($50)
                                            </span>
                                          ) : (
                                            <span className="text-[10px] bg-purple-50 border border-purple-200 text-purple-700 px-1.5 py-0.5 rounded">
                                              Formateur
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3">
                                          {c.referralCode ? (
                                            <div className="flex flex-col">
                                              <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded text-[10px] self-start">
                                                {c.referralCode}
                                              </span>
                                              <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                                Gains: {c.referralBalance || 0} USDT
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 italic text-[11px]">Pas d'affiliation</span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-600">
                                          {c.deviceLock ? (
                                            <div className="flex items-center space-x-1.5 text-emerald-600">
                                              <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                                              <span className="font-semibold text-xs truncate max-w-[80px]" title={c.deviceLock}>{c.deviceLock}</span>
                                            </div>
                                          ) : (
                                            <span className="text-amber-600 font-medium italic text-[10px]">En attente...</span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                                          <button
                                            onClick={() => selectCodeForDetails(c)}
                                            title="Voir Profil & Parrainage"
                                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 px-2.5 py-1 rounded text-[10px] transition-all font-semibold inline-flex items-center space-x-1 align-middle"
                                          >
                                            <User className="w-3 h-3" />
                                            <span>Profil</span>
                                          </button>
                                          
                                          {c.deviceLock && (
                                            <button
                                              onClick={() => handleResetDevice(c.code)}
                                              title="Délier l'appareil"
                                              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 hover:text-amber-700 px-2 py-1 rounded text-[10px] transition-all font-medium align-middle"
                                            >
                                              Délier
                                            </button>
                                          )}
                                          
                                          <button
                                            onClick={() => handleDeleteCode(c.code)}
                                            title="Supprimer"
                                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1 rounded hover:text-red-700 transition-all border border-red-100 inline-flex items-center justify-center align-middle"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {/* Tab content: Seasons */}
                {adminTab === "seasons" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Season Creation/Edit Form */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                        {editingSeasonId ? "Modifier la Saison" : "Créer une Nouvelle Saison"}
                      </h3>

                      <form onSubmit={handleSaveSeason} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Titre de la Saison</label>
                          <input
                            type="text"
                            value={newSeasonTitle}
                            onChange={(e) => setNewSeasonTitle(e.target.value)}
                            placeholder="Ex : Saison 5 : Automatisation Pro"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description de la Saison</label>
                          <textarea
                            value={newSeasonDesc}
                            onChange={(e) => setNewSeasonDesc(e.target.value)}
                            placeholder="De quoi traite cette saison..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl text-xs transition-all shadow-sm"
                          >
                            {editingSeasonId ? "Mettre à jour" : "Créer la Saison"}
                          </button>
                          {editingSeasonId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSeasonId(null);
                                setNewSeasonTitle("");
                                setNewSeasonDesc("");
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs border border-slate-200"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Right: Seasons List */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Saisons Disponibles</h3>
                      
                      <div className="space-y-3">
                        {adminSeasons.map((s) => (
                          <div key={s.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded font-semibold">ID: {s.id}</span>
                                <h4 className="font-bold text-slate-800 text-sm">{s.title}</h4>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{s.description || "Aucune description renseignée."}</p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingSeasonId(s.id);
                                  setNewSeasonTitle(s.title);
                                  setNewSeasonDesc(s.description);
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-700 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100/80 rounded border border-indigo-100 transition-all font-semibold"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteSeason(s.id)}
                                className="text-xs text-red-600 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* Tab content: Videos & Episodes */}
                {adminTab === "episodes" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Episode Creation & Upload */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                          Nouveau Cours (Vidéo Galerie)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Sélectionnez une vidéo MP4 depuis votre galerie. Elle sera déposée de façon sécurisée sans transiter par des hébergeurs publics.
                        </p>
                      </div>

                      <form onSubmit={handleSaveEpisode} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Associer à la Saison</label>
                          <select
                            value={newEpisodeSeasonId}
                            onChange={(e) => setNewEpisodeSeasonId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          >
                            {adminSeasons.map(s => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Titre de l'Épisode</label>
                          <input
                            type="text"
                            value={newEpisodeTitle}
                            onChange={(e) => setNewEpisodeTitle(e.target.value)}
                            placeholder="Ex : Comment configurer l'API de Gemini"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Description de l'Épisode</label>
                          <textarea
                            value={newEpisodeDesc}
                            onChange={(e) => setNewEpisodeDesc(e.target.value)}
                            placeholder="Sujets abordés dans ce cours..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Durée (Min:Sec)</label>
                            <input
                              type="text"
                              value={newEpisodeDuration}
                              onChange={(e) => setNewEpisodeDuration(e.target.value)}
                              placeholder="Ex: 14:35"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Sélection Fichier</label>
                            <label className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl cursor-pointer text-center py-2 text-xs text-indigo-600 transition-all font-semibold h-8 shadow-sm">
                              <span>Choisir Vidéo</span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setSelectedVideoFile(e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {selectedVideoFile && (
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] flex justify-between items-center text-slate-700">
                            <span className="truncate max-w-[180px]" title={selectedVideoFile.name}>{selectedVideoFile.name}</span>
                            <span className="font-mono text-slate-400 text-[10px]">({(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} Mo)</span>
                          </div>
                        )}

                        {isUploading ? (
                          <div className="pt-2 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                              <span>Envoi du fichier vidéo...</span>
                              <span className="font-mono">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ajouter à la Formation</span>
                          </button>
                        )}
                      </form>
                    </div>

                    {/* Right: Episodes List */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Épisodes Déposés</h3>

                      <div className="overflow-y-auto max-h-[400px] space-y-3 pr-2">
                        {adminEpisodes.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 italic text-xs">
                            Aucune vidéo n'a encore été téléversée dans la formation.
                          </div>
                        ) : (
                          adminEpisodes.map((ep) => {
                            const season = adminSeasons.find(s => s.id === ep.seasonId);
                            return (
                              <div key={ep.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                                      {season ? season.title.split(":")[0] : "Saison inconnue"}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {ep.duration}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-sm">{ep.title}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-1">{ep.description}</p>
                                  <p className="text-[10px] text-slate-400 font-mono italic">Fichier serveur : {ep.videoPath}</p>
                                </div>

                                <button
                                  onClick={() => handleDeleteEpisode(ep.id)}
                                  className="text-xs text-red-600 hover:text-red-700 p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* Tab content: Withdrawals across all codes */}
                {adminTab === "withdrawals" && (
                  <div className="space-y-6">
                    {/* Section Title */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Gestion Globale des Demandes de Retrait USDT (TRC-20)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Consultez, validez ou annulez les demandes de retraits de parrainage de tous les étudiants de la plateforme.
                      </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl">
                        <span className="block text-[10px] text-amber-800 uppercase font-bold tracking-wider mb-1">En Cours</span>
                        <span className="text-2xl font-black text-amber-900">
                          {allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status === "pending")).length} demandes
                        </span>
                        <span className="block text-[10px] text-amber-700 font-medium mt-1">
                          Total : ${allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status === "pending")).reduce((acc, w) => acc + w.amount, 0)} USDT
                        </span>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl">
                        <span className="block text-[10px] text-emerald-800 uppercase font-bold tracking-wider mb-1">Traitées avec Succès</span>
                        <span className="text-2xl font-black text-emerald-900">
                          {allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status !== "pending")).length} traitées
                        </span>
                        <span className="block text-[10px] text-emerald-700 font-medium mt-1">
                          Total : ${allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status !== "pending")).reduce((acc, w) => acc + w.amount, 0)} USDT
                        </span>
                      </div>
                      <div className="bg-indigo-50/50 border border-indigo-200/60 p-4 rounded-xl">
                        <span className="block text-[10px] text-indigo-800 uppercase font-bold tracking-wider mb-1">Délai de traitement</span>
                        <span className="text-2xl font-black text-indigo-900">1 à 72 heures</span>
                        <span className="block text-[10px] text-indigo-700 font-medium mt-1">Délai garanti annoncé aux étudiants</span>
                      </div>
                    </div>

                    {/* Pending Demands Block */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>Demandes de Retrait En Cours ({allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status === "pending")).length})</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                          En cours de traitement
                        </span>
                      </h4>

                      <div className="overflow-x-auto">
                        {allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status === "pending")).length === 0 ? (
                          <div className="text-center py-12 text-slate-400 italic text-xs">
                            Aucune demande de retrait en attente de traitement.
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                                <th className="pb-2">Étudiant / Code d'accès</th>
                                <th className="pb-2">Date de demande</th>
                                <th className="pb-2">Adresse de retrait USDT (TRC-20)</th>
                                <th className="pb-2">Montant</th>
                                <th className="pb-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {allCodes.flatMap(c => 
                                (c.withdrawals || []).filter(w => w.status === "pending").map(w => ({
                                  ...w,
                                  studentCode: c.code,
                                  studentName: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Étudiant non enregistré",
                                  studentEmail: c.email || ""
                                }))
                              ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((w) => (
                                <tr key={w.id} className="hover:bg-slate-50/50">
                                  <td className="py-3">
                                    <div className="font-bold text-slate-800">{w.studentName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{w.studentCode}</div>
                                    <div className="text-[10px] text-slate-500">{w.studentEmail}</div>
                                  </td>
                                  <td className="py-3 text-slate-600 font-mono">
                                    {new Date(w.createdAt).toLocaleString()}
                                  </td>
                                  <td className="py-3 font-mono select-all text-indigo-950 bg-indigo-50/50 px-2.5 py-1.5 rounded border border-indigo-100 break-all font-semibold" title={w.usdtAddress}>
                                    {w.usdtAddress}
                                  </td>
                                  <td className="py-3 font-bold text-slate-900">${w.amount}.00 USD</td>
                                  <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => {
                                          if (confirm("Valider et payer cette demande de retrait ? Le solde de l'étudiant sera définitivement déduit et la demande sera marquée comme traitée avec succès.")) {
                                            handleCompleteWithdrawal(w.id, w.studentCode);
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                      >
                                        Valider / Payer
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm("Annuler cette demande de retrait ? Les fonds seront recrédités sur le solde de parrainage de l'étudiant.")) {
                                            handleCancelWithdrawal(w.id, w.studentCode);
                                          }
                                        }}
                                        className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-all"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Completed Demands Block */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Historique des Retraits Traités ({allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status !== "pending")).length})
                      </h4>

                      <div className="overflow-x-auto">
                        {allCodes.flatMap(c => (c.withdrawals || []).filter(w => w.status !== "pending")).length === 0 ? (
                          <div className="text-center py-12 text-slate-400 italic text-xs">
                            Aucun retrait traité dans l'historique.
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse text-xs text-slate-600">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                                <th className="pb-2">Étudiant / Code d'accès</th>
                                <th className="pb-2">Date de traitement</th>
                                <th className="pb-2">Adresse USDT de retrait</th>
                                <th className="pb-2">Montant</th>
                                <th className="pb-2 text-right">Statut</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {allCodes.flatMap(c => 
                                (c.withdrawals || []).filter(w => w.status !== "pending").map(w => ({
                                  ...w,
                                  studentCode: c.code,
                                  studentName: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Étudiant non enregistré",
                                  studentEmail: c.email || ""
                                }))
                              ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((w) => (
                                <tr key={w.id} className="hover:bg-slate-50/50">
                                  <td className="py-3">
                                    <div className="font-semibold text-slate-700">{w.studentName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{w.studentCode}</div>
                                  </td>
                                  <td className="py-3 text-slate-500 font-mono">
                                    {new Date(w.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 font-mono truncate max-w-[150px]" title={w.usdtAddress}>
                                    {w.usdtAddress}
                                  </td>
                                  <td className="py-3 font-bold text-slate-800">${w.amount}.00 USD</td>
                                  <td className="py-3 text-right">
                                    {w.status === "completed" ? (
                                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                        Traité avec succès
                                      </span>
                                    ) : (
                                      <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                        Annulé
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {adminTab === ("settings" as any) && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Configuration de la Passerelle de Paiement Moneroo
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Saisissez les clés API de votre compte Moneroo pour activer automatiquement les paiements réels de 50.00 $ USD.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 max-w-2xl">
                      {monerooSaveSuccess && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>{monerooSaveSuccess}</span>
                        </div>
                      )}
                      {monerooSaveError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>{monerooSaveError}</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Clé Secrète Moneroo (Secret Key)
                          </label>
                          <input
                            type="password"
                            value={monerooSecretKey}
                            onChange={(e) => setMonerooSecretKey(e.target.value)}
                            placeholder="pvk_active_... ou sv4_active_..."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Commence par <code className="bg-slate-100 px-1 py-0.2 rounded">pvk_</code> ou <code className="bg-slate-100 px-1 py-0.2 rounded">sv4_</code> (ex: <code className="bg-slate-100 px-1 py-0.2 rounded">pvk_active_...</code> ou <code className="bg-slate-100 px-1 py-0.2 rounded">sv4_active_...</code>). 
                            <strong className="text-indigo-600 block mt-1">Note : Si vous n'avez reçu qu'une seule clé commençant par "PVK", veuillez coller cette clé ici car elle sert à authentifier toutes les transactions depuis le serveur.</strong>
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Clé Publique Moneroo (Public Key - Optionnelle)
                          </label>
                          <input
                            type="text"
                            value={monerooPublicKey}
                            onChange={(e) => setMonerooPublicKey(e.target.value)}
                            placeholder="pv4_active_..."
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Commence par <code className="bg-slate-100 px-1 py-0.2 rounded">pv4_</code> (ex: <code className="bg-slate-100 px-1 py-0.2 rounded">pv4_active_...</code>).
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Tarif de la Formation (Montant)
                            </label>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                              placeholder="50"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Par exemple, <code className="bg-slate-100 px-1 py-0.2 rounded">50</code> pour 50 $ ou <code className="bg-slate-100 px-1 py-0.2 rounded">25000</code> pour 25,000 CFA.
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Devise de Facturation (Currency)
                            </label>
                            <select
                              value={paymentCurrency}
                              onChange={(e) => setPaymentCurrency(e.target.value.toUpperCase())}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="XOF">XOF (Franc CFA BCEAO)</option>
                              <option value="XAF">XAF (Franc CFA BEAC)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="CAD">CAD ($)</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Choisissez la devise par défaut de votre compte marchand Moneroo.
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                            Liens des Réseaux Sociaux & Assistance
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Lien d'invitation Telegram
                              </label>
                              <input
                                type="text"
                                value={telegramLink}
                                onChange={(e) => setTelegramLink(e.target.value)}
                                placeholder="https://t.me/votre_canal"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Lien de contact WhatsApp
                              </label>
                              <input
                                type="text"
                                value={whatsappLink}
                                onChange={(e) => setWhatsappLink(e.target.value)}
                                placeholder="https://wa.me/votre_numero"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                              />
                            </div>
                            {/* Presentation Video Source Settings */}
                            <div className="border-t border-slate-100 pt-4 space-y-4">
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Vidéo de Présentation de la Page d'Accueil
                              </h4>
                              
                              {/* Current Status */}
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                                <span className="font-semibold block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Statut Actuel</span>
                                {presentationVideoPath ? (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-slate-700 font-mono">
                                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                      <span>Galerie local : {presentationVideoPath}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setPresentationVideoPath("")}
                                      className="text-red-500 hover:text-red-600 font-medium transition-all text-[11px]"
                                    >
                                      Utiliser YouTube à la place
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-slate-600">
                                    En attente d'une vidéo locale. Utilise actuellement YouTube : <span className="font-mono text-[11px] text-indigo-600 block mt-0.5">{presentationVideoUrl || "Aucune vidéo configurée"}</span>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Option 1: Select from existing gallery */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2">
                                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Sélectionner depuis la Galerie des Épisodes
                                  </label>
                                  <select
                                    value={presentationVideoPath}
                                    onChange={(e) => setPresentationVideoPath(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                                  >
                                    <option value="">-- Utiliser le lien YouTube --</option>
                                    {Array.from(new Set(adminEpisodes.map(ep => ep.videoPath))).map(vPath => {
                                      const episode = adminEpisodes.find(ep => ep.videoPath === vPath);
                                      return (
                                        <option key={vPath} value={vPath}>
                                          {episode ? `${episode.title} (${episode.originalName})` : vPath}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  <p className="text-[10px] text-slate-400">
                                    Sélectionnez l'une des vidéos déjà chargées pour l'un de vos épisodes.
                                  </p>
                                </div>

                                {/* Option 2: Upload new file */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-2">
                                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Mettre en ligne une nouvelle vidéo de présentation
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    <label className="flex-1 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl cursor-pointer py-1.5 text-xs text-indigo-600 transition-all font-semibold shadow-sm">
                                      <span>Choisir un Fichier</span>
                                      <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            setSelectedPresentationFile(e.target.files[0]);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                    {selectedPresentationFile && (
                                      <button
                                        type="button"
                                        onClick={handleUploadPresentationVideo}
                                        disabled={isUploadingPresentation}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center space-x-1"
                                      >
                                        {isUploadingPresentation ? "Envoi..." : "Envoyer"}
                                      </button>
                                    )}
                                  </div>
                                  
                                  {selectedPresentationFile && (
                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] flex justify-between items-center text-slate-700 font-mono mt-2">
                                      <span className="truncate max-w-[120px]" title={selectedPresentationFile.name}>{selectedPresentationFile.name}</span>
                                      <span className="text-slate-400">({(selectedPresentationFile.size / (1024 * 1024)).toFixed(1)} Mo)</span>
                                    </div>
                                  )}

                                  {isUploadingPresentation && (
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                                      <div
                                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${presentationUploadProgress}%` }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Backup Youtube URL */}
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                  Ou Lien YouTube de secours
                                </label>
                                <input
                                  type="text"
                                  value={presentationVideoUrl}
                                  onChange={(e) => setPresentationVideoUrl(e.target.value)}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Sera utilisé si aucune vidéo locale de la galerie n'est active.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleSaveMonerooSettings}
                          disabled={isSavingMoneroo}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center space-x-2"
                        >
                          {isSavingMoneroo ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Enregistrement...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Enregistrer la Configuration</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-800 leading-relaxed max-w-2xl space-y-2">
                      <p className="font-bold">💡 Comment ça fonctionne ?</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-indigo-700">
                        <li>Les étudiants remplissent leur prénom, nom et Gmail dans le formulaire d'abonnement.</li>
                        <li>Ils sont automatiquement redirigés vers votre page de paiement hébergée par Moneroo.</li>
                        <li><strong>Conversion Automatique :</strong> Le montant de $50 USD est converti en temps réel selon la devise de l'étudiant. Il peut payer par carte bancaire ou via Mobile Money (Orange Money, MTN, Moov, Wave, etc.) dans sa monnaie locale.</li>
                        <li>Dès que le paiement est complété, un code d'accès d'élite (ex: <code className="bg-indigo-100/80 px-1 py-0.2 rounded font-mono">IA-XXXX-XXXX</code>) est généré automatiquement et lié à son profil.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {adminTab === "stats" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Tableau de Bord des Statistiques & Ventes
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Suivez en temps réel l'activité de vos ventes, les activations de codes et les tentatives de paiement des étudiants.
                      </p>
                    </div>

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ventes (Payés)</span>
                          <span className="text-xl font-extrabold text-slate-800">
                            {allCodes.filter(c => c.isPaid).length} codes
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                          <PlusCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Générations Manuelles</span>
                          <span className="text-xl font-extrabold text-slate-800">
                            {allCodes.filter(c => !c.isPaid).length} codes
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                          <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Activations d'Appareil</span>
                          <span className="text-xl font-extrabold text-slate-800">
                            {allCodes.filter(c => c.deviceLock !== null).length} / {allCodes.length}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                          <RefreshCw className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tentatives de Paiement</span>
                          <span className="text-xl font-extrabold text-slate-800">
                            {pendingPayments.length} initiées
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Payments Attempt Tracker */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Historique des Tentatives d'Achat & Status
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Cette table répertorie toutes les tentatives de transaction Moneroo avec les coordonnées fournies par les clients.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                          Total historique : {pendingPayments.length} transactions
                        </span>
                      </div>

                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 bg-slate-100/60 font-semibold text-[11px]">
                              <th className="py-3 px-4">Date & Heure</th>
                              <th className="py-3 px-4">Informations Client</th>
                              <th className="py-3 px-4">Montant & Devise</th>
                              <th className="py-3 px-4">Code Généré</th>
                              <th className="py-3 px-4">Statut de la Transaction</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pendingPayments.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                  Aucune tentative de paiement enregistrée pour le moment.
                                </td>
                              </tr>
                            ) : (
                              [...pendingPayments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((p, idx) => {
                                const isSuccessful = p.status === "completed" || p.status === "approved" || p.status === "success" || p.status === "successful" || p.status === "paid";
                                const isPending = p.status === "pending" || p.status === "initiated";
                                return (
                                  <tr key={p.id || idx} className="hover:bg-slate-50 transition-all">
                                    <td className="py-3 px-4">
                                      <div className="font-mono text-slate-600">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleString("fr-FR") : "Date inconnue"}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-slate-800">
                                          {p.firstName || "Inconnu"} {p.lastName || ""}
                                        </span>
                                        <span className="text-[10px] text-indigo-600 font-mono select-all">
                                          {p.email || "Pas d'email"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-700">
                                      {p.amount || 50} {p.currency || "USD"}
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-indigo-900">
                                      {p.generatedCode ? (
                                        <span className="bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded tracking-wider">
                                          {p.generatedCode}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 font-normal italic">Aucun</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {isSuccessful ? (
                                        <span className="inline-flex items-center space-x-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                                          <span>Succès / Complété</span>
                                        </span>
                                      ) : isPending ? (
                                        <span className="inline-flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                          <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                                          <span>En cours / Initié</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center space-x-1 bg-red-50 border border-red-200 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                          <AlertCircle className="w-3 h-3 text-red-600" />
                                          <span>Échoué / Annulé ({p.status || "abandonné"})</span>
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Outer Hero Content / Client Experience App */}
      {!showAdminLogin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Check if user has entered an access code */}
        {!accessCode ? (
          
          /* UNVERIFIED LANDING PAGE (Landing page sans connexion / sans bouton inscription, avec collage de code + demande de code) */
          <div className="space-y-16">
            
            {/* Elegant Hero Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
              

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-slate-900 leading-tight">
                Apprenez à Bâtir des <br/>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Sites Web d'Élite avec l'IA
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
                Accédez à la formation la plus complète pour transformer des idées simples en plateformes modernes, ultra-rapides et entièrement monétisables en quelques minutes.
              </p>

              {/* High-Impact Mobile-friendly learning banner */}
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 max-w-2xl mx-auto flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 text-left shadow-xl border border-indigo-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="bg-gradient-to-tr from-indigo-500 to-indigo-600 p-3.5 rounded-2xl text-white shadow-lg flex-shrink-0">
                  <Smartphone className="w-6 h-6 animate-pulse text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-indigo-300 uppercase tracking-widest flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                    <span>100% SMARTPHONE & TABLETTE — AUCUN PC REQUIS !</span>
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Cette formation est conçue pour être suivie et mise en pratique <span className="font-bold text-white underline decoration-indigo-400 decoration-2">entièrement sur votre simple smartphone</span>. Vous apprendrez à concevoir, connecter des bases de données et héberger des sites professionnels directement depuis votre téléphone, tout comme un développeur traditionnel.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 max-w-xl mx-auto">
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-center shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all duration-300">
                  <span className="block text-lg font-bold text-slate-800">4</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Saisons</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-center shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all duration-300">
                  <span className="block text-lg font-bold text-slate-800 font-mono">0</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Lignes à coder</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-center shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all duration-300">
                  <span className="block text-lg font-bold text-slate-800">100%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Pratique</span>
                </div>
              </div>

            </div>

            {/* PRESENTATION VIDEO COMPONENT */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto my-12">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-extrabold text-white flex items-center space-x-2">
                      <span>Conférence de Présentation Officielle</span>
                      <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Formateur Francophone
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Découvrez comment bâtir un site d'exception à l'aide de l'IA (Voix réelle et démonstration de code)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50 text-[11px] font-mono text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Durée : ~15 min</span>
                </div>
              </div>

              {/* High-Fidelity Video Player (Local File or YouTube Embed) */}
              <div className="bg-black aspect-video relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
                {presentationVideoPath ? (
                  <video
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    src={presentationVideoPath.startsWith("http") ? presentationVideoPath : `/api/public-video/${presentationVideoPath}`}
                  />
                ) : (
                  <iframe
                    className="w-full h-full absolute inset-0 border-0"
                    src={getYoutubeEmbedUrl(presentationVideoUrl)}
                    title="Vidéo explicative du programme de formation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>

            {/* Split layout: Enter code vs Get Access Code */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Box 1: Enter code (Valider le Code d'accès) */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px]"></div>
                
                <div className="space-y-4">
                  <div className="bg-indigo-50 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-100">
                    <Key className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-800">Entrer dans la Formation</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Vous possédez déjà votre code d'accès ? Entrez-le ci-dessous pour accéder immédiatement à vos vidéos de formation.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-3 pt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Ex: IA-ABCD-1234"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase tracking-wider font-mono"
                        required
                      />
                      <div className="absolute right-3.5 top-3.5 text-slate-400">
                        <Monitor className="w-4 h-4 text-indigo-500" />
                      </div>
                    </div>

                    {verificationError && (
                      <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-600 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{verificationError}</span>
                      </div>
                    )}

                    {verificationSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-700 flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{verificationSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2"
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
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-start space-x-2.5 text-[11px] text-slate-500">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-slate-500">Protection Anti-Partage active :</span> Ce code sera lié de façon unique à cet appareil (<span className="font-mono text-indigo-600">{deviceId}</span>). Tout essai d'utiliser ce code sur un second support sera refusé pour protéger les droits de la formation.
                  </p>
                </div>

              </div>

              {/* Box 2: Get Access Code / Subscription ($50 USD Card) */}
              <div className="lg:col-span-6 bg-white border border-indigo-100 p-8 rounded-3xl flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[80px]"></div>
                
                <div className="space-y-4">
                  <div className="bg-indigo-50 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-100">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-800">S'inscrire à la Formation Ultime</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Bénéficiez d'un accès à vie à l'intégralité du cursus d'apprentissage IA. Obtenez instantanément votre clé unique d'activation.
                    </p>
                  </div>

                  {/* Criterias of subscription */}
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center space-x-2">
                      <div className="bg-indigo-50 p-0.5 rounded-full border border-indigo-100">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <span>Accès illimité aux 4 saisons de cours d'élite</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="bg-indigo-50 p-0.5 rounded-full border border-indigo-100">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <span>Intégrations concrètes : de l'idée au déploiement</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="bg-indigo-50 p-0.5 rounded-full border border-indigo-100">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <span>Support et mises à jour constantes</span>
                    </li>
                  </ul>

                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">Prix d'accès unique</span>
                      <span className="text-2xl font-bold font-display text-slate-900">50.00 $ USD</span>
                    </div>
                    <button
                      onClick={handleStartPayment}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center space-x-1.5"
                    >
                      <span>Obtenir mon Code</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-start space-x-2.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-semibold text-slate-500">Génération Automatique :</span> Après validation de votre transaction, votre clé personnelle unique s'affichera directement sur votre écran, prête à être copiée-collée.
                  </p>
                </div>

              </div>

            </div>

            {/* Social Links & Support Community Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-4xl mx-auto shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-3xl"></div>
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-wider font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Communauté & Support</span>
                <h4 className="font-display font-bold text-slate-800 text-lg">Rejoignez-nous sur nos canaux officiels</h4>
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                  Bénéficiez d'une assistance en direct, de conseils sur l'apprentissage et échangez avec l'équipe de l'Académie sur Telegram et WhatsApp.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3.5 flex-shrink-0 justify-center">
                {whatsappLink && (
                  <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/80 hover:scale-102 transition-all px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Officiel</span>
                  </a>
                )}
                {telegramLink && (
                  <a 
                    href={telegramLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100/80 hover:scale-102 transition-all px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
                  >
                    <Send className="w-4 h-4 text-sky-600" />
                    <span>Canal Telegram</span>
                  </a>
                )}
              </div>
            </div>

             {/* Visual breakdown of the syllabus */}
            <div className="space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-mono text-indigo-600 font-extrabold uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100/80 shadow-sm">
                  CURSUS ACADÉMIQUE PROFESSIONNEL 2026
                </span>
                <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                  Le Programme Complet des 4 Saisons
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                  Chaque saison a été pensée pour vous amener vers l'excellence technique sans écrire une seule ligne de code manuelle.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                
                {/* Season 1 Card */}
                <div className="bg-white border-2 border-slate-100 hover:border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 animate-fadeIn">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-3 py-1 rounded-full font-mono uppercase tracking-wider shadow-sm">
                        Saison 1 • Fondations IA
                      </span>
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded font-mono">100% Smartphone</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-xl group-hover:text-indigo-600 transition-colors leading-tight">
                      Coder entièrement avec l'Intelligence Artificielle
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Concevez de superbes applications web en ordonnant à l'IA d'écrire l'intégralité du code à votre place. Vous apprendrez également à réaliser des intégrations d'APIs complexes et à connecter des services de paiement sécurisés sans saisir de ligne de code manuelle.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés Maîtrisés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Gemini AI */}
                      <div className="flex items-center space-x-2 bg-indigo-50/50 border border-indigo-100/60 p-2 rounded-xl shadow-sm hover:bg-indigo-50 transition-all">
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C12 2 12.5 8.5 16 12C12.5 15.5 12 22 12 22C12 22 11.5 15.5 8 12C11.5 8.5 12 2 12 2Z" fill="url(#gemini-gradient-s1)" />
                          <path d="M17 6C17 6 17.25 9.25 19 11C17.25 12.75 17 16 17 16C17 16 16.75 12.75 15 11C16.75 9.25 17 6 17 6Z" fill="url(#gemini-gradient-s1-small)" />
                          <defs>
                            <linearGradient id="gemini-gradient-s1" x1="8" y1="2" x2="16" y2="22" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#3B82F6"/>
                              <stop offset="0.5" stopColor="#8B5CF6"/>
                              <stop offset="1" stopColor="#EC4899"/>
                            </linearGradient>
                            <linearGradient id="gemini-gradient-s1-small" x1="15" y1="6" x2="19" y2="16" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#F59E0B"/>
                              <stop offset="1" stopColor="#EF4444"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="text-[11px] font-bold text-slate-700">Gemini AI</span>
                      </div>

                      {/* Bolt.new */}
                      <div className="flex items-center space-x-2 bg-sky-50/50 border border-sky-100/60 p-2 rounded-xl shadow-sm hover:bg-sky-50 transition-all">
                        <svg className="w-4 h-5 text-sky-500 animate-pulse flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-[11px] font-bold text-slate-700">Bolt.new</span>
                      </div>

                      {/* Stripe Payments */}
                      <div className="flex items-center space-x-2 bg-violet-50/50 border border-violet-100/60 p-2 rounded-xl shadow-sm hover:bg-violet-50 transition-all">
                        <svg className="w-8 h-4 flex-shrink-0" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.666 5.86c0-1.2-.84-1.666-2.066-1.666-1.4 0-2.866.666-2.866.666l-.6-1.8c.866-.4 2.266-.8 3.733-.8 2.2 0 3.733 1 3.733 3.333V11.2a1.333 1.333 0 0 0 .533.733l.2.133-.333 1.2c-.2.067-.533.133-.8.133-1.333 0-1.666-.733-1.666-1.466V5.86zm-4.133 3.533c0-.533.4-.733 1-.733.667 0 1.267.2 1.267.2v1.467c0 .533-.4.733-1 .733-.667 0-1.267-.2-1.267-.2V9.393zM19.866 4.4l-1 4.8h-1l1-4.8h1zm-1.2-1.533c0-.4.333-.667.667-.667s.667.267.667.667c0 .4-.333.667-.667.667s-.667-.267-.667-.667zm4 4.067v3.2h-1V2.8h1l.133.867c.667-1.067 1.867-1.067 1.867-1.067 1.267 0 1.667.933 1.667 2v3.6h-1V5.001c0-.6-.2-1.067-.867-1.067-.733 0-1.067.667-1.067 1.533v1.467zM2.733 5.527c0-.667-.466-1-1.2-1-.6 0-1.2.2-1.533.4l-.2-1.2c.4-.267 1.133-.533 1.867-.533 1.467 0 2.4 1 2.4 2.133v4.467H3.4v-.8c-.4.533-.933.933-1.667.933-1 0-1.733-.733-1.733-1.733 0-1.133.867-1.667 2.333-1.667h1l-.066-.333s0-.533-.6-.533h-.6c-.4 0-.733.133-.733.133l-.2-1s.533-.2 1.067-.2c1.333 0 1.066.733 1.066.733v2.734c0 .533.267.733.533.733.133 0 .267 0 .333-.067l.2-.133-.2.8c-.133.067-.4.133-.6.133-1.333 0-1.666-.733-1.666-1.466V5.527z" fill="#635BFF" />
                        </svg>
                        <span className="text-[11px] font-bold text-slate-700">Stripe API</span>
                      </div>

                      {/* v0.dev */}
                      <div className="flex items-center space-x-2 bg-slate-900 text-white p-2 rounded-xl shadow-sm hover:bg-black transition-all">
                        <div className="w-5 h-5 flex-shrink-0 bg-white/15 rounded-lg flex items-center justify-center font-mono text-[9px] font-black">v0</div>
                        <span className="text-[11px] font-bold">v0.dev IA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season 2 Card */}
                <div className="bg-white border-2 border-slate-100 hover:border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 animate-fadeIn">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-mono uppercase tracking-wider shadow-sm">
                        Saison 2 • Git & Hosting
                      </span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded font-mono">Professionnel</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-xl group-hover:text-emerald-600 transition-colors leading-tight">
                      Pousser sur GitHub & Hébergement sans code
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Maîtrisez la mise en ligne et l'archivage sécurisé comme les vrais développeurs. Apprenez à pousser et versionner vos projets sur GitHub, à les héberger proprement en ligne, et à apporter des modifications en continu sans jamais toucher une ligne de code manuelle.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés Maîtrisés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* GitHub */}
                      <div className="flex items-center space-x-2 bg-slate-950 text-white p-2 rounded-xl shadow-sm hover:bg-black transition-all">
                        <svg className="w-5 h-5 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        <span className="text-[11px] font-bold">GitHub Portal</span>
                      </div>

                      {/* Git */}
                      <div className="flex items-center space-x-2 bg-orange-50/50 border border-orange-100/60 p-2 rounded-xl shadow-sm hover:bg-orange-50 transition-all">
                        <svg className="w-5 h-5 flex-shrink-0 text-[#F05032]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.612 11.388l-8-8c-.781-.781-2.047-.781-2.828 0l-1.37 1.37 2.74 2.74c.245-.067.514-.014.717.189.232.232.285.568.163.85l2.671 2.671c.282-.122.618-.069.85.163.312.312.312.819 0 1.131s-.819.312-1.131 0c-.23-.23-.284-.564-.165-.845L10.89 8.927c-.281.119-.615.065-.845-.165-.213-.213-.263-.5-.19-.748L7.152 5.31l-3.54 3.54c-.781.781-.781 2.047 0 2.828l8 8c.781.781 2.047.781 2.828 0l6.172-6.172c.781-.781.781-2.047 0-2.828zM9.5 15.5c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1z" />
                        </svg>
                        <span className="text-[11px] font-bold text-[#F05032]">Git Engine</span>
                      </div>

                      {/* Netlify */}
                      <div className="flex items-center space-x-2 bg-teal-50/60 border border-teal-100 p-2 rounded-xl shadow-sm hover:bg-teal-50 transition-all">
                        <div className="w-5 h-5 rounded-lg bg-teal-400 flex items-center justify-center text-white text-[10px] font-bold">N</div>
                        <span className="text-[11px] font-bold text-slate-700">Netlify CDN</span>
                      </div>

                      {/* Versioning */}
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl shadow-sm">
                        <span className="text-xs">🔄</span>
                        <span className="text-[11px] font-bold text-slate-700">Modifs Directes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season 3 Card */}
                <div className="bg-white border-2 border-slate-100 hover:border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 animate-fadeIn">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-mono uppercase tracking-wider shadow-sm">
                        Saison 3 • Bases de Données
                      </span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded font-mono">Dynamique</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-xl group-hover:text-emerald-600 transition-colors leading-tight">
                      Base de Données Neon & Création de Tables
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Liez votre interface utilisateur (front-end) à une base de données PostgreSQL robuste hébergée sur le cloud de Neon. Apprenez à concevoir vos schémas et créer des tables de données structurées sans aucune compétence technique préalable, via des invites simples et ultra-visuelles.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés Maîtrisés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Neon Database */}
                      <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100/80 p-2 rounded-xl shadow-sm hover:bg-emerald-100/50 transition-all">
                        <svg className="w-5 h-5 flex-shrink-0 text-[#00E599]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2L2 22h20L12 2z" strokeLinejoin="round" />
                          <path d="M12 8l-6 10h12l-6-10z" fill="currentColor" opacity="0.3" />
                        </svg>
                        <span className="text-[11px] font-bold text-slate-700">Neon Cloud</span>
                      </div>

                      {/* PostgreSQL */}
                      <div className="flex items-center space-x-2 bg-sky-50 border border-sky-100 p-2 rounded-xl shadow-sm hover:bg-sky-100/40 transition-all">
                        <div className="w-5 h-5 flex-shrink-0 bg-sky-600 text-white rounded-lg flex items-center justify-center font-mono text-[9px] font-black">SQL</div>
                        <span className="text-[11px] font-bold text-slate-700">PostgreSQL</span>
                      </div>

                      {/* Drizzle ORM */}
                      <div className="flex items-center space-x-2 bg-amber-50/70 border border-amber-100 p-2 rounded-xl shadow-sm hover:bg-amber-100/40 transition-all">
                        <span className="text-xs">💧</span>
                        <span className="text-[11px] font-bold text-slate-700">Drizzle Schema</span>
                      </div>

                      {/* No-Code SQL */}
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl shadow-sm">
                        <span className="text-xs">📊</span>
                        <span className="text-[11px] font-bold text-slate-700">Tables No-Code</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season 4 Card */}
                <div className="bg-white border-2 border-slate-100 hover:border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 animate-fadeIn">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full font-mono uppercase tracking-wider shadow-sm">
                        Saison 4 • Déploiement
                      </span>
                      <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded font-mono">Déploiement</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-xl group-hover:text-purple-600 transition-colors leading-tight">
                      Déploiement Professionnel sur Vercel
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Mettez votre plateforme en ligne de façon définitive sur Vercel, l'infrastructure cloud la plus rapide au monde. Profitez d'une vitesse de chargement instantanée et apprenez à lier des noms de domaine personnalisés pour donner une image d'élite à vos créations.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés Maîtrisés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Vercel */}
                      <div className="flex items-center space-x-2 bg-slate-950 text-white p-2 rounded-xl shadow-sm hover:bg-black transition-all">
                        <svg className="w-5 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 22h20L12 2z" />
                        </svg>
                        <span className="text-[11px] font-bold">Vercel Cloud</span>
                      </div>

                      {/* Production HTTPS */}
                      <div className="flex items-center space-x-2 bg-violet-50/50 border border-violet-100 p-2 rounded-xl shadow-sm hover:bg-violet-50 transition-all">
                        <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping"></span>
                        <span className="text-[11px] font-bold text-slate-700">HTTPS SSL Sec</span>
                      </div>

                      {/* Domain Liaison */}
                      <div className="flex items-center space-x-2 bg-purple-50 border border-purple-100 p-2 rounded-xl shadow-sm hover:bg-purple-100/50 transition-all">
                        <span className="text-xs">🌐</span>
                        <span className="text-[11px] font-bold text-slate-700">Noms Domaine</span>
                      </div>

                      {/* Fast Ingress */}
                      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-xl shadow-sm">
                        <span className="text-xs">⚡</span>
                        <span className="text-[11px] font-bold text-slate-700">Vitesse Élite</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Gallery of Professional Showcase Images */}
            <div className="space-y-8 pt-4">
              <div className="text-center">
                <h3 className="text-xl font-display font-bold text-slate-800">
                  Votre Futur Environnement de Production
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Découvrez comment nous connectons l'intelligence artificielle au développement web moderne.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image 1 Card */}
                <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-video w-full overflow-hidden relative bg-slate-50 border-b border-slate-100">
                    <img
                      src={trainingWorkspaceImg}
                      alt="Espace de Travail IA"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white font-mono text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow">
                      Environnement d'Élite
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <h4 className="font-display font-extrabold text-slate-900 text-base flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                      <span>Interface de Développement 100% Mobile</span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Suivez vos cours, codez via l'intelligence artificielle, pilotez vos projets et concevez de superbes applications d'élite directement depuis l'écran de votre smartphone ou de votre tablette.
                    </p>
                  </div>
                </div>

                {/* Image 2 Card */}
                <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-video w-full overflow-hidden relative bg-slate-50 border-b border-slate-100">
                    <img
                      src={trainingFullstackImg}
                      alt="Flux de Développement Full-Stack"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white font-mono text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow">
                      Architecture Moderne
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <h4 className="font-display font-extrabold text-slate-900 text-base flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>Pipeline de Liaison Universelle No-Code</span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Liez de façon intuitive vos formulaires mobiles à la base PostgreSQL de Neon cloud, déployez instantanément en production HTTPS sécurisée sur Vercel sans aucune barrière.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrolling Testimonials Marquee Section */}
            <div className="space-y-6 pt-6 overflow-hidden">
              <div className="text-center">
                <h3 className="text-xl font-display font-bold text-slate-800">
                  Ce que disent nos Étudiants Émérites
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Rejoignez des centaines de professionnels ayant propulsé leur carrière d'ingénierie web.
                </p>
              </div>

              {/* Infinite Horizontal Scroll Marquee */}
              <div className="relative w-full overflow-hidden py-4 bg-slate-50 border-y border-slate-200/80">
                {/* Fade overlays for soft edges */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

                <div className="flex w-max space-x-6 animate-marquee hover:[animation-play-state:paused] cursor-grab">
                  {/* We put the list twice for seamless loop */}
                  {[...testimonials, ...testimonials].map((t, idx) => (
                    <div 
                      key={idx} 
                      className="w-[320px] sm:w-[380px] bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 flex-shrink-0"
                    >
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        "{t.text}"
                      </p>
                      <div className="flex items-center space-x-3 pt-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                          {t.avatar}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                          <p className="text-[10px] text-slate-400 font-medium">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        ) : (
          
          /* VERIFIED PORTAL VIEW (L'INTERFACE DE LA FORMATION) */
          <div className="space-y-8">
            
            {/* Upper Dashboard Banner */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase">
                    Espace Étudiant Actif
                  </span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs text-slate-500 font-medium">Appareil lié : <span className="font-mono text-indigo-600 font-bold">{deviceId}</span></span>
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
                  Bienvenue à l'Académie de Création Web IA
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  Parcourez les 4 saisons ci-dessous, lancez les épisodes et construisez vos applications sans barrière technique.
                </p>
              </div>

              <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 flex items-center space-x-4 self-stretch md:self-auto justify-between shadow-sm">
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono">Clé de session</span>
                  <span className="text-xs font-mono font-bold text-indigo-600 tracking-wider">{accessCode}</span>
                </div>
                <button
                  onClick={handleLogOutPortal}
                  className="bg-white hover:bg-slate-100 text-slate-500 hover:text-red-600 p-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
                  title="Fermer la session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split layout: Player (left) and Navigation Courses (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Video Player */}
              <div className="lg:col-span-8 space-y-4">
                
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg relative aspect-video flex flex-col justify-center items-center bg-radial from-slate-900 to-slate-950">
                  {activeEpisode ? (
                    <video
                      key={activeEpisode.id}
                      ref={videoPlayerRef}
                      src={activeEpisode.videoPath.startsWith("http")
                        ? `/api/videos/proxy?url=${encodeURIComponent(activeEpisode.videoPath)}&code=${accessCode}&deviceId=${deviceId}`
                        : `/api/videos/${activeEpisode.videoPath}?code=${accessCode}&deviceId=${deviceId}`}
                      controls
                      autoPlay
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    /* Default state before play */
                    <div className="text-center p-8 space-y-4">
                      <div className="bg-indigo-950/40 w-16 h-16 rounded-2xl flex items-center justify-center border border-indigo-800/30 mx-auto text-indigo-400 animate-pulse">
                        <Tv className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Sélectionnez un épisode pour commencer</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                          Choisissez une saison dans la colonne de droite, puis cliquez sur le bouton de lecture de l'épisode désiré.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Episode detail below player */}
                {activeEpisode && (
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-mono uppercase">
                        Saison {seasons.findIndex(s => s.id === activeEpisode.seasonId) + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-mono flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Durée : {activeEpisode.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-slate-800">{activeEpisode.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{activeEpisode.description || "Aucune description pour cet épisode."}</p>
                  </div>
                )}

              </div>

              {/* Right Column: Seasons & Episodes Navigation */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Season tabs selector */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider px-2 py-1">Saisons</span>
                  {seasons.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSeasonId(s.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                        activeSeasonId === s.id
                          ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent"
                      }`}
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <span className="block text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-600">Saison {idx + 1}</span>
                        <h4 className={`text-xs font-bold truncate ${activeSeasonId === s.id ? "text-indigo-900" : "text-slate-800"}`}>{s.title.replace(/Saison \d+\s*:\s*/, "")}</h4>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Episodes within active season */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Épisodes disponibles
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-semibold">
                      Saison {seasons.findIndex(s => s.id === activeSeasonId) + 1}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {episodes.filter(ep => ep.seasonId === activeSeasonId).length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs italic">
                        Les cours de cette saison seront bientôt disponibles.
                      </div>
                    ) : (
                      episodes
                        .filter(ep => ep.seasonId === activeSeasonId)
                        .map((ep, idx) => (
                          <button
                            key={ep.id}
                            onClick={() => setActiveEpisode(ep)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              activeEpisode?.id === ep.id
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-700"
                            }`}
                          >
                            <div className="space-y-1 truncate">
                              <span className={`block text-[9px] font-mono ${activeEpisode?.id === ep.id ? "text-indigo-200" : "text-indigo-600"}`}>
                                Épisode {idx + 1}
                              </span>
                              <h4 className="font-bold text-xs truncate">{ep.title}</h4>
                              <p className={`text-[10px] truncate ${activeEpisode?.id === ep.id ? "text-indigo-100/80" : "text-slate-500"}`}>
                                {ep.description}
                              </p>
                            </div>
                            
                            <div className={`p-2 rounded-lg flex-shrink-0 ${activeEpisode?.id === ep.id ? "bg-white/20 text-white" : "bg-white text-indigo-600 border border-slate-200 shadow-sm"}`}>
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Program Information inside Student Portal - Hidden from active student dashboard as requested */}
            <div className="hidden pt-12 border-t border-slate-200 space-y-12">
              
              {/* Reminder Mobile-friendly banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 text-left shadow-lg border border-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="bg-indigo-600 p-3.5 rounded-2xl text-white shadow-md flex-shrink-0">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-indigo-300 uppercase tracking-widest">
                    📱 RAPPEL EXCLUSIF : ACADÉMIE 100% SMARTPHONE & TABLETTE
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Cette formation d'élite n'exige <span className="font-bold text-white underline decoration-indigo-400 decoration-2">aucun ordinateur</span>. Vous pouvez suivre l'intégralité des cours, concevoir les interfaces, structurer vos bases de données PostgreSQL Neon, intégrer les paiements Stripe et déployer sur Vercel directement depuis votre smartphone ou tablette de n'importe où !
                  </p>
                </div>
              </div>

              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[10px] font-mono text-indigo-600 font-extrabold uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  PROGRAMME DES 4 SAISONS
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                  Vue d'ensemble de votre cursus
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Consultez le cursus académique complet et les technologies professionnelles abordées à chaque saison.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                
                {/* Season 1 Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-mono uppercase tracking-wider">
                        Saison 1 • Fondations IA
                      </span>
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded font-mono">100% Mobile</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl">
                      Coder entièrement avec l'Intelligence Artificielle
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Concevez de superbes applications web en ordonnant à l'IA d'écrire l'intégralité du code à votre place. Vous apprendrez également à réaliser des intégrations d'APIs complexes et à connecter des services de paiement sécurisés sans saisir de ligne de code manuelle.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Gemini AI */}
                      <div className="flex items-center space-x-1.5 bg-indigo-50/50 border border-indigo-100/60 p-2 rounded-xl">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C12 2 12.5 8.5 16 12C12.5 15.5 12 22 12 22C12 22 11.5 15.5 8 12C11.5 8.5 12 2 12 2Z" fill="url(#gemini-gradient-p1)" />
                          <path d="M17 6C17 6 17.25 9.25 19 11C17.25 12.75 17 16 17 16C17 16 16.75 12.75 15 11C16.75 9.25 17 6 17 6Z" fill="url(#gemini-gradient-p1-small)" />
                          <defs>
                            <linearGradient id="gemini-gradient-p1" x1="8" y1="2" x2="16" y2="22" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#3B82F6"/>
                              <stop offset="0.5" stopColor="#8B5CF6"/>
                              <stop offset="1" stopColor="#EC4899"/>
                            </linearGradient>
                            <linearGradient id="gemini-gradient-p1-small" x1="15" y1="6" x2="19" y2="16" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#F59E0B"/>
                              <stop offset="1" stopColor="#EF4444"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="text-[10px] font-bold text-slate-700">Gemini AI</span>
                      </div>

                      {/* Bolt.new */}
                      <div className="flex items-center space-x-1.5 bg-sky-50/50 border border-sky-100/60 p-2 rounded-xl">
                        <svg className="w-3.5 h-4 text-sky-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-[10px] font-bold text-slate-700">Bolt.new</span>
                      </div>

                      {/* Stripe */}
                      <div className="flex items-center space-x-1.5 bg-violet-50/50 border border-violet-100/60 p-2 rounded-xl">
                        <svg className="w-8 h-4 flex-shrink-0" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.666 5.86c0-1.2-.84-1.666-2.066-1.666-1.4 0-2.866.666-2.866.666l-.6-1.8c.866-.4 2.266-.8 3.733-.8 2.2 0 3.733 1 3.733 3.333V11.2a1.333 1.333 0 0 0 .533.733l.2.133-.333 1.2c-.2.067-.533.133-.8.133-1.333 0-1.666-.733-1.666-1.466V5.86zm-4.133 3.533c0-.533.4-.733 1-.733.667 0 1.267.2 1.267.2v1.467c0 .533-.4.733-1 .733-.667 0-1.267-.2-1.267-.2V9.393zM19.866 4.4l-1 4.8h-1l1-4.8h1zm-1.2-1.533c0-.4.333-.667.667-.667s.667.267.667.667c0 .4-.333.667-.667.667s-.667-.267-.667-.667zm4 4.067v3.2h-1V2.8h1l.133.867c.667-1.067 1.867-1.067 1.867-1.067 1.267 0 1.667.933 1.667 2v3.6h-1V5.001c0-.6-.2-1.067-.867-1.067-.733 0-1.067.667-1.067 1.533v1.467zM2.733 5.527c0-.667-.466-1-1.2-1-.6 0-1.2.2-1.533.4l-.2-1.2c.4-.267 1.133-.533 1.867-.533 1.467 0 2.4 1 2.4 2.133v4.467H3.4v-.8c-.4.533-.933.933-1.667.933-1 0-1.733-.733-1.733-1.733 0-1.133.867-1.667 2.333-1.667h1l-.066-.333s0-.533-.6-.533h-.6c-.4 0-.733.133-.733.133l-.2-1s.533-.2 1.067-.2c1.333 0 1.066.733 1.066.733v2.734c0 .533.267.733.533.733.133 0 .267 0 .333-.067l.2-.133-.2.8c-.133.067-.4.133-.6.133-1.333 0-1.666-.733-1.666-1.466V5.527z" fill="#635BFF" />
                        </svg>
                        <span className="text-[10px] font-bold text-slate-700">Stripe API</span>
                      </div>

                      {/* v0.dev */}
                      <div className="flex items-center space-x-1.5 bg-slate-900 text-white p-2 rounded-xl">
                        <div className="w-4 h-4 flex-shrink-0 bg-white/10 rounded flex items-center justify-center font-mono text-[8px] font-black">v0</div>
                        <span className="text-[10px] font-bold">v0.dev IA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season 2 Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-mono uppercase tracking-wider">
                        Saison 2 • Git & Hosting
                      </span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded font-mono">Pro</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl">
                      Pousser sur GitHub & Hébergement sans code
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Maîtrisez la mise en ligne et l'archivage sécurisé comme les vrais développeurs. Apprenez à pousser et versionner vos projets sur GitHub, à les héberger proprement en ligne, et à apporter des modifications en continu sans jamais toucher une ligne de code manuelle.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* GitHub */}
                      <div className="flex items-center space-x-1.5 bg-slate-950 text-white p-2 rounded-xl">
                        <svg className="w-4 h-4 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                        </svg>
                        <span className="text-[10px] font-bold">GitHub</span>
                      </div>

                      {/* Git */}
                      <div className="flex items-center space-x-1.5 bg-orange-50/50 border border-orange-100/60 p-2 rounded-xl">
                        <svg className="w-4 h-4 flex-shrink-0 text-[#F05032]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.612 11.388l-8-8c-.781-.781-2.047-.781-2.828 0l-1.37 1.37 2.74 2.74c.245-.067.514-.014.717.189.232.232.285.568.163.85l2.671 2.671c.282-.122.618-.069.85.163.312.312.312.819 0 1.131s-.819.312-1.131 0c-.23-.23-.284-.564-.165-.845L10.89 8.927c-.281.119-.615.065-.845-.165-.213-.213-.263-.5-.19-.748L7.152 5.31l-3.54 3.54c-.781.781-.781 2.047 0 2.828l8 8c.781.781 2.047.781 2.828 0l6.172-6.172c.781-.781.781-2.047 0-2.828zM9.5 15.5c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1z" />
                        </svg>
                        <span className="text-[10px] font-bold text-[#F05032]">Git Engine</span>
                      </div>

                      {/* Netlify */}
                      <div className="flex items-center space-x-1.5 bg-teal-50/60 border border-teal-100 p-2 rounded-xl">
                        <div className="w-4 h-4 rounded bg-teal-400 flex items-center justify-center text-white text-[8px] font-bold">N</div>
                        <span className="text-[10px] font-bold text-slate-700">Netlify CDN</span>
                      </div>

                      {/* Modifs */}
                      <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                        <span className="text-xs">🔄</span>
                        <span className="text-[10px] font-bold text-slate-700">Modifs Directes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season 3 Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/5 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-mono uppercase tracking-wider">
                        Saison 3 • Bases de Données
                      </span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded font-mono">Dynamique</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl">
                      Base de Données Neon & Création de Tables
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Liez votre interface utilisateur (front-end) à une base de données PostgreSQL robuste hébergée sur le cloud de Neon. Apprenez à concevoir vos schémas et créer des tables de données structurées sans aucune compétence technique préalable, via des invites simples et ultra-visuelles.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Neon Database */}
                      <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100/80 p-2 rounded-xl">
                        <svg className="w-4 h-4 flex-shrink-0 text-[#00E599]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2L2 22h20L12 2z" strokeLinejoin="round" />
                          <path d="M12 8l-6 10h12l-6-10z" fill="currentColor" opacity="0.3" />
                        </svg>
                        <span className="text-[10px] font-bold text-slate-700">Neon Cloud</span>
                      </div>

                      {/* PostgreSQL */}
                      <div className="flex items-center space-x-1.5 bg-sky-50 border border-sky-100 p-2 rounded-xl">
                        <div className="w-4 h-4 flex-shrink-0 bg-sky-600 text-white rounded flex items-center justify-center font-mono text-[8px] font-black">SQL</div>
                        <span className="text-[10px] font-bold text-slate-700">PostgreSQL</span>
                      </div>

                      {/* Drizzle ORM */}
                      <div className="flex items-center space-x-1.5 bg-amber-50/70 border border-amber-100 p-2 rounded-xl">
                        <span className="text-xs">💧</span>
                        <span className="text-[10px] font-bold text-slate-700">Drizzle Schema</span>
                      </div>

                      {/* No-Code SQL */}
                      <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                        <span className="text-xs">📊</span>
                        <span className="text-[10px] font-bold text-slate-700">Tables No-Code</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Season 4 Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full font-mono uppercase tracking-wider">
                        Saison 4 • Déploiement
                      </span>
                      <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded font-mono">Cloud</span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl">
                      Déploiement Professionnel sur Vercel
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Mettez votre plateforme en ligne de façon définitive sur Vercel, l'infrastructure cloud la plus rapide au monde. Profitez d'une vitesse de chargement instantanée et apprenez à l'associer à des noms de domaine personnalisés.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Outils & APIs Clés :
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Vercel */}
                      <div className="flex items-center space-x-1.5 bg-slate-950 text-white p-2 rounded-xl">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 22h20L12 2z" />
                        </svg>
                        <span className="text-[10px] font-bold">Vercel Cloud</span>
                      </div>

                      {/* Production HTTPS */}
                      <div className="flex items-center space-x-1.5 bg-violet-50/50 border border-violet-100 p-2 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping"></span>
                        <span className="text-[10px] font-bold text-slate-700">HTTPS SSL Sec</span>
                      </div>

                      {/* Domains */}
                      <div className="flex items-center space-x-1.5 bg-purple-50 border border-purple-100 p-2 rounded-xl">
                        <span className="text-xs">🌐</span>
                        <span className="text-[10px] font-bold text-slate-700">Noms Domaine</span>
                      </div>

                      {/* Ingress speed */}
                      <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                        <span className="text-xs">⚡</span>
                        <span className="text-[10px] font-bold text-slate-700">Vitesse Élite</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        )}

      </div>
      )}

      {/* 4. Payment Simulation Modal */}
      {isPaymentOpen && (
        <div id="payment-simulation-modal" className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl relative space-y-6 overflow-hidden">
            
            <button
              onClick={() => setIsPaymentOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentStep === "intro" && (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-md border border-slate-100 overflow-hidden bg-white">
                    <img
                      src={academyLogo2}
                      alt="AI Web Academy Logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-display">Abonnement - Formation Ultime IA</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulateur de commande de formation professionnelle.
                  </p>
                </div>

                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-700">
                  <span className="font-bold">Tarif d'accès : {publicPaymentAmount.toLocaleString("fr-FR")} {publicPaymentCurrency === "USD" ? "$" : ""} {publicPaymentCurrency}</span> (Frais de service et hébergement privé inclus). Accès définitif sur 1 appareil.
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Votre Prénom</label>
                      <input
                        type="text"
                        value={paymentFirstName}
                        onChange={(e) => setPaymentFirstName(e.target.value)}
                        placeholder="Jean"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Votre Nom</label>
                      <input
                        type="text"
                        value={paymentLastName}
                        onChange={(e) => setPaymentLastName(e.target.value)}
                        placeholder="Dupont"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Votre Adresse Email</label>
                    <input
                      type="email"
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                      placeholder="jean.dupont@email.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-1.5"
                >
                  <span>Procéder au Paiement (Fictif)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {paymentStep === "card" && (
              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-800 font-display">Informations de Paiement</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Entrez vos coordonnées bancaires fictives pour finaliser la souscription.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Numéro de Carte Fictif</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono tracking-widest"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Expiration (MM/AA)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-normal">
                  Note : Il s'agit d'une démonstration sécurisée. Vos données de carte ne sont pas traitées par un véritable terminal bancaire pour le moment.
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-1.5"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Confirmer le Paiement (50 $)</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {paymentStep === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Paiement Accepté !</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Merci <span className="font-semibold text-slate-700">{paymentFirstName} {paymentLastName}</span> pour votre achat. Voici votre code d'accès personnel unique :
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-emerald-600 tracking-wider">
                    {generatedCode}
                  </code>
                  <button
                    onClick={() => handleCopy(generatedCode)}
                    className="bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 p-2 rounded-xl border border-slate-200 transition-all text-xs flex items-center space-x-1 shadow-sm"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? "Copié !" : "Copier"}</span>
                  </button>
                </div>

                <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-left text-[11px] text-indigo-950 leading-relaxed space-y-1">
                  <span className="font-bold text-indigo-700">Instructions importantes :</span>
                  <p>1. Copiez ce code et collez-le dans le champ "Entrer dans la Formation" de l'accueil.</p>
                  <p>2. Il est maintenant prêt à être lié à cet appareil (<span className="font-mono text-indigo-600">{deviceId}</span>). Gardez-le précieusement !</p>
                </div>

                <button
                  onClick={() => {
                    setIsPaymentOpen(false);
                    setInputCode(generatedCode);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl text-xs transition-all shadow-sm"
                >
                  Fermer & Retourner à l'accueil
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Custom alert and confirm modals */}
      <AnimatePresence>
        {customAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
              <div className="flex items-start space-x-3 mt-2">
                <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-display font-bold text-slate-800 text-base">{customAlert.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{customAlert.message}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCustomAlert(null)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-5 rounded-xl text-xs transition-all shadow-sm"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
              <div className="flex items-start space-x-3 mt-2">
                <div className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-display font-bold text-slate-800 text-base">{confirmDialog.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{confirmDialog.message}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-medium py-2 px-4 rounded-xl text-xs transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-5 rounded-xl text-xs transition-all shadow-sm"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <User className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg">Mon Profil Étudiant</h3>
                <p className="text-xs text-slate-400">Vos informations d'inscription et de connexion</p>
              </div>

              <div className="space-y-4 text-xs">
                {userProfile ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Prénom</span>
                        <span className="font-semibold text-slate-800 text-sm">{userProfile.firstName}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Nom</span>
                        <span className="font-semibold text-slate-800 text-sm">{userProfile.lastName}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Adresse Email</span>
                      <span className="font-semibold text-slate-800 text-sm">{userProfile.email}</span>
                    </div>

                    <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 space-y-2">
                      <span className="block text-[10px] text-indigo-600 uppercase tracking-wider font-bold">Code de Formation Actif</span>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-indigo-100 shadow-sm">
                        <code className="font-mono font-bold text-indigo-900 tracking-wider text-sm">{userProfile.code}</code>
                        <button
                          onClick={() => handleCopy(userProfile.code)}
                          className="p-1.5 hover:bg-slate-50 rounded border border-slate-100 text-slate-500 hover:text-indigo-600 transition-all flex items-center space-x-1"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 leading-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Monitor className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Soudé de façon unique à cet appareil (<span className="font-mono text-indigo-600 font-semibold">{deviceId}</span>)</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Chargement de votre profil étudiant...</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl text-xs transition-all border border-slate-200"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showReferralModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
              <button
                onClick={() => {
                  setShowReferralModal(false);
                  setWithdrawalError("");
                  setWithdrawalSuccess("");
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1 mb-4 flex-shrink-0">
                <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-800 text-lg">Système de Parrainage Élève</h3>
                <p className="text-xs text-slate-400">Faites grandir la communauté et gagnez des USDT à vie</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl leading-normal space-y-2">
                  <span className="font-bold text-slate-700">Comment ça marche ?</span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Partagez votre code de parrainage unique ci-dessous. Chaque personne s'inscrivant avec votre code vous rapporte instantanément <span className="font-bold text-indigo-600">5 $ USD</span>. Dès que vous atteignez <span className="font-bold text-emerald-600">50 $ USD</span>, vous pouvez demander un retrait vers votre portefeuille crypto USDT.
                  </p>
                </div>

                {userProfile ? (
                  <>
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-3">
                      <div>
                        <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold">Votre Code de Parrainage unique</span>
                        <p className="text-[10px] text-slate-400">Partagez ce code avec d'autres étudiants pour gagner vos bonus.</p>
                      </div>
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200 shadow-sm">
                        <code className="font-mono font-black text-amber-900 tracking-wider text-sm">{userProfile.referralCode}</code>
                        <button
                          onClick={() => handleCopy(userProfile.referralCode)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 transition-all text-[11px] font-semibold flex items-center space-x-1"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? "Copié !" : "Copier"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50/40 border border-emerald-100/80 p-4 rounded-2xl text-center space-y-1">
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Solde Disponible</span>
                        <div className="flex items-center justify-center space-x-1">
                          <Wallet className="w-4 h-4 text-emerald-500" />
                          <span className="text-2xl font-bold font-display text-emerald-700">{userProfile.referralBalance}.00 $</span>
                        </div>
                      </div>
                      <div className="bg-indigo-50/40 border border-indigo-100/80 p-4 rounded-2xl text-center space-y-1">
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Personnes Parrainées</span>
                        <div className="flex items-center justify-center space-x-1.5">
                          <User className="w-4 h-4 text-indigo-500" />
                          <span className="text-2xl font-bold font-display text-indigo-700">{userProfile.referredCount ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* USDT Address Configuration Section */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm flex items-center justify-between">
                        <span>Configuration du Retrait USDT</span>
                        <span className="text-[10px] text-slate-400 font-normal font-mono bg-slate-100 px-1.5 py-0.5 rounded">TRC-20</span>
                      </h4>

                      {(!userProfile.usdtAddress || editingUsdtAddress) ? (
                        <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Votre unique adresse USDT (TRC-20)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={withdrawalUsdtAddress}
                                onChange={(e) => setWithdrawalUsdtAddress(e.target.value)}
                                placeholder="TY123456789..."
                                className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveUsdtAddress(withdrawalUsdtAddress)}
                                disabled={isSavingUsdtAddress}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 rounded-xl transition-all shadow-sm flex items-center justify-center min-w-[90px]"
                              >
                                {isSavingUsdtAddress ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Enregistrer"}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Configurez cette adresse avec soin. Tous vos retraits seront envoyés vers celle-ci.</p>
                          </div>

                          {usdtAddressError && (
                            <div className="bg-red-50 border border-red-100 p-2 rounded-lg text-[10px] text-red-600 flex items-center space-x-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                              <span>{usdtAddressError}</span>
                            </div>
                          )}
                          {usdtAddressSuccess && (
                            <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-[10px] text-emerald-700 flex items-center space-x-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span>{usdtAddressSuccess}</span>
                            </div>
                          )}

                          {userProfile.usdtAddress && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUsdtAddress(false);
                                setUsdtAddressError("");
                                setUsdtAddressSuccess("");
                              }}
                              className="text-slate-500 hover:text-slate-700 text-[10px] underline font-medium"
                            >
                              Annuler la modification
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-emerald-50/40 border border-emerald-100/80 p-4 rounded-2xl flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] text-emerald-800 uppercase tracking-wider font-bold">Adresse USDT configurée</span>
                            <span className="font-mono text-xs font-semibold text-emerald-950 block select-all break-all">{userProfile.usdtAddress}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setWithdrawalUsdtAddress(userProfile.usdtAddress || "");
                              setEditingUsdtAddress(true);
                              setUsdtAddressError("");
                              setUsdtAddressSuccess("");
                            }}
                            className="bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition-all flex-shrink-0"
                          >
                            Modifier
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <h4 className="font-semibold text-slate-800 text-sm">Demander un Retrait</h4>

                      {userProfile.referralBalance < 50 ? (
                        <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl text-amber-800 flex items-start space-x-2 text-[11px] leading-normal">
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>
                            Vous devez accumuler un solde de minimum <span className="font-bold">50.00 $ USD</span> pour effectuer une demande. Il vous manque encore <span className="font-bold">{(50 - userProfile.referralBalance).toFixed(2)} $ USD</span>.
                          </span>
                        </div>
                      ) : (
                        <div>
                          {!userProfile.usdtAddress ? (
                            <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl text-amber-800 flex items-start space-x-2 text-[11px] leading-normal">
                              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>
                                Veuillez d'abord <span className="font-bold">configurer votre adresse de retrait USDT</span> ci-dessus pour pouvoir soumettre une demande.
                              </span>
                            </div>
                          ) : (
                            <form onSubmit={(e) => handleRequestWithdrawal(e, userProfile.referralBalance)} className="space-y-3 bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Montant à retirer</span>
                                  <span className="text-xl font-black text-slate-800">{userProfile.referralBalance}.00 USDT</span>
                                </div>
                                <button
                                  type="submit"
                                  disabled={isRequestingWithdrawal}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 h-[38px]"
                                >
                                  {isRequestingWithdrawal ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <DollarSign className="w-4 h-4" />
                                      <span>Retirer tout mon solde</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <p className="text-[10px] text-slate-400">
                                ℹ️ La demande sera envoyée pour <span className="font-bold">{userProfile.referralBalance}.00 USDT</span> vers l'adresse <span className="font-mono font-bold">{userProfile.usdtAddress}</span>.
                              </p>

                              {withdrawalError && (
                                <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl text-[11px] text-red-600 flex items-center space-x-1.5">
                                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  <span>{withdrawalError}</span>
                                </div>
                              )}

                              {withdrawalSuccess && (
                                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[11px] text-emerald-700 flex items-center space-x-1.5">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <span>{withdrawalSuccess}</span>
                                </div>
                              )}
                            </form>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Historique de vos Retraits</h4>
                      
                      <div className="overflow-x-auto max-h-[140px] overflow-y-auto">
                        {userProfile.withdrawals && userProfile.withdrawals.length > 0 ? (
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400">
                                <th className="pb-1 font-semibold">Date</th>
                                <th className="pb-1 font-semibold">Montant</th>
                                <th className="pb-1 font-semibold">Adresse</th>
                                <th className="pb-1 font-semibold text-right">Statut</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-600">
                              {userProfile.withdrawals.map((w, index) => (
                                <tr key={index}>
                                  <td className="py-2 font-mono">{new Date(w.createdAt).toLocaleDateString()}</td>
                                  <td className="py-2 font-bold text-slate-800">${w.amount} USD</td>
                                  <td className="py-2 font-mono truncate max-w-[120px]" title={w.usdtAddress}>{w.usdtAddress}</td>
                                  <td className="py-2 text-right">
                                    {w.status === "pending" ? (
                                      <div className="flex flex-col items-end">
                                        <span className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">En cours</span>
                                        <span className="text-[8px] text-amber-600 mt-0.5 font-medium leading-tight text-right">Traité sous 1 à 72h</span>
                                      </div>
                                    ) : (
                                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">Traité avec succès</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-slate-400 italic text-[11px] py-2">Aucun retrait n'a été demandé pour l'instant.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Chargement de votre solde de parrainage...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex-shrink-0 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowReferralModal(false);
                    setWithdrawalError("");
                    setWithdrawalSuccess("");
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-xl text-xs transition-all border border-slate-200"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      {!accessCode && !showAdminLogin && (
        <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-white">
          <p>© 2026 AI Web Academy. Tous droits réservés.</p>
          <p className="mt-2 text-indigo-600 font-mono text-xs">
            <a href="mailto:contact@ai-academy.fit" className="hover:underline">contact@ai-academy.fit</a>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Hébergement Privé Sécurisé • Module de Verrouillage Matériel</p>
        </footer>
      )}

      {/* Floating Help & Contact Assistance Button */}
      {!showAdminLogin && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center">
          <div className="relative flex items-center">
            {/* The Main Help Toggle Button */}
            <button
              onClick={() => setShowHelpMenu(!showHelpMenu)}
              className="flex items-center space-x-2.5 bg-slate-900 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl border border-slate-800 transition-all duration-300 hover:bg-slate-800 active:scale-95 group z-20"
              title="Aide & Assistance"
              id="help-toggle-btn"
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                {showHelpMenu ? (
                  <X className="w-5 h-5 text-indigo-400 relative z-10 transition-transform duration-300 rotate-90" />
                ) : (
                  <>
                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75 animate-ping" />
                    <HelpCircle className="w-5 h-5 text-indigo-400 relative z-10" />
                  </>
                )}
              </div>
              <span className="text-xs font-bold tracking-wider uppercase font-sans">
                {showHelpMenu ? "Fermer" : "Aide"}
              </span>
            </button>

            {/* Staggered Detached Social Buttons */}
            <AnimatePresence>
              {showHelpMenu && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute left-full ml-3 flex items-center space-x-2.5 bg-slate-950/90 text-white px-3.5 py-2 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md z-10"
                >
                  <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 mr-1 border-r border-slate-800 pr-2">
                    Contact :
                  </span>
                  {whatsappLink && (
                    <motion.a 
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.05, type: "spring" }}
                      href={whatsappLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 hover:scale-110 flex items-center justify-center transition-all shadow-md group relative"
                      title="Contacter sur WhatsApp"
                      id="help-whatsapp-link"
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                    </motion.a>
                  )}
                  {telegramLink && (
                    <motion.a 
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      href={telegramLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-400 hover:scale-110 flex items-center justify-center transition-all shadow-md group relative"
                      title="Rejoindre sur Telegram"
                      id="help-telegram-link"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </motion.a>
                  )}
                  <motion.a 
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.15, type: "spring" }}
                    href="mailto:contact@ai-academy.fit"
                    className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-400 hover:scale-110 flex items-center justify-center transition-all shadow-md group relative"
                    title="Envoyer un Email"
                    id="help-mail-link"
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

    </div>
  );
}
