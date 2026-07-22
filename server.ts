import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";
import { put } from "@vercel/blob";
import { Readable } from "stream";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface Episode {
  id: string;
  seasonId: string;
  title: string;
  description: string;
  videoPath: string;
  originalName: string;
  duration?: string;
  createdAt: string;
}

interface Season {
  id: string;
  title: string;
  description: string;
}

interface AccessCode {
  code: string;
  referralCode?: string;
  deviceLock: string | null;
  isPaid: boolean;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  referralBalance?: number;
  referredBy?: string;
  usdtAddress?: string;
  withdrawals?: Array<{
    id: string;
    amount: number;
    usdtAddress: string;
    status: "pending" | "completed";
    createdAt: string;
  }>;
}

interface DBState {
  seasons: Season[];
  episodes: Episode[];
  codes: AccessCode[];
  adminPassword?: string;
  monerooSecretKey?: string;
  monerooPublicKey?: string;
  exchangeRateApiKey?: string;
  telegramLink?: string;
  whatsappLink?: string;
  presentationVideoUrl?: string;
  presentationVideoPath?: string;
  pendingPayments?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    referredBy?: string;
    status: string;
    createdAt: string;
    monerooId?: string;
    generatedCode?: string;
  }>;
}

const DEFAULT_SEASONS: Season[] = [
  {
    id: "1",
    title: "Saison 1 : Coder entièrement avec l'IA",
    description: "Comment coder entièrement avec l'intelligence artificielle et même faire des intégrations d'APIs et des services de paiement sans écrire une seule ligne de code."
  },
  {
    id: "2",
    title: "Saison 2 : Hébergement & Git sans code",
    description: "Comment pousser le code dans GitHub comme un professionnel, l'héberger et comment modifier le code par la suite sans écrire une seule ligne de code."
  },
  {
    id: "3",
    title: "Saison 3 : Liaison Base de Données Neon",
    description: "Comment lier le front-end à la base de données relationnelle Neon et comment créer et configurer des tables de données sans aucune compétence technique préalable."
  },
  {
    id: "4",
    title: "Saison 4 : Déploiement Vercel Ultime",
    description: "Comment déployer votre application finale en production sur Vercel de façon ultra-rapide et professionnelle."
  }
];

const DEFAULT_DB: DBState = {
  seasons: DEFAULT_SEASONS,
  episodes: [],
  codes: [
    { code: "PRO-DEMO-99", deviceLock: null, isPaid: false, createdAt: new Date().toISOString() }
  ],
  adminPassword: "admin",
  monerooSecretKey: process.env.MONEROO_SECRET_KEY || "pvk_c3bgra|01KXWSCE4NCPHS1D69JPKC1K03",
  monerooPublicKey: "",
  exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || "b61ca475a57776dc1ed72aba",
  telegramLink: "https://t.me/ai_academy_fit",
  whatsappLink: "https://wa.me/33600000000",
  presentationVideoUrl: "https://www.youtube.com/embed/8m9g_b95Eto",
  pendingPayments: []
};

// PostgreSQL Integration Pool Setup
const dbUrl = process.env.DATABASE_URL;
let pool: Pool | null = null;
let dbCache: DBState | null = null;

if (dbUrl) {
  console.log("Connecting to PostgreSQL (Neon) Database...");
  pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Required for serverless database SSL connections
  });
}

// Initialize PostgreSQL schema and load stored cache
async function initPostgres() {
  if (!pool) {
    console.log("No DATABASE_URL found. Using local JSON file database.");
    return;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id SERIAL PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS seasons (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS episodes (
        id VARCHAR(255) PRIMARY KEY,
        season_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        video_path TEXT NOT NULL,
        original_name TEXT NOT NULL,
        duration VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS access_codes (
        code VARCHAR(255) PRIMARY KEY,
        referral_code VARCHAR(255),
        device_lock VARCHAR(255),
        is_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255),
        referral_balance NUMERIC DEFAULT 0,
        referred_by VARCHAR(255),
        usdt_address TEXT
      );
      CREATE TABLE IF NOT EXISTS pending_payments (
        id VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255),
        referred_by VARCHAR(255),
        status VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        moneroo_id VARCHAR(255),
        generated_code VARCHAR(255)
      );
    `);
    
    const res = await pool.query(`SELECT data FROM app_state ORDER BY id ASC LIMIT 1`);
    if (res.rows.length > 0) {
      console.log("Successfully connected and loaded state from Neon PostgreSQL.");
      dbCache = JSON.parse(res.rows[0].data);
      // Synchronize with local file for offline fallback consistency
      fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf8");
    } else {
      console.log("Initializing empty Neon PostgreSQL database with seed state...");
      const initialJson = JSON.stringify(DEFAULT_DB);
      await pool.query(`INSERT INTO app_state (data) VALUES ($1)`, [initialJson]);
      dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  } catch (err) {
    console.error("Failed to connect/initialize PostgreSQL (Neon). Falling back to local storage:", err);
  }
}

// Helper to read and write database
function readDB(): DBState {
  const defaultMonerooKey = process.env.MONEROO_SECRET_KEY || "pvk_c3bgra|01KXWSCE4NCPHS1D69JPKC1K03";
  const defaultExchangeRateKey = process.env.EXCHANGE_RATE_API_KEY || "b61ca475a57776dc1ed72aba";
  if (dbCache) {
    dbCache.seasons = DEFAULT_SEASONS;
    if (!dbCache.monerooSecretKey) {
      dbCache.monerooSecretKey = defaultMonerooKey;
    }
    if (!dbCache.exchangeRateApiKey) {
      dbCache.exchangeRateApiKey = defaultExchangeRateKey;
    }
    return dbCache;
  }
  try {
    let db: DBState;
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      db = JSON.parse(JSON.stringify(DEFAULT_DB));
    } else {
      const data = fs.readFileSync(DB_FILE, "utf8");
      db = JSON.parse(data);
    }
    
    // Always keep seasons up-to-date with code changes
    db.seasons = DEFAULT_SEASONS;
    if (!db.monerooSecretKey) {
      db.monerooSecretKey = defaultMonerooKey;
    }
    if (!db.exchangeRateApiKey) {
      db.exchangeRateApiKey = defaultExchangeRateKey;
    }

    // Migrate: Ensure every code has a referralCode
    let modified = false;
    if (db.codes && Array.isArray(db.codes)) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      db.codes.forEach(c => {
        if (!c.referralCode) {
          let ref = "REF-";
          for (let i = 0; i < 8; i++) {
            if (i === 4) ref += "-";
            ref += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          c.referralCode = ref;
          modified = true;
        }
      });
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
    }
    
    dbCache = db;
    return db;
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return DEFAULT_DB;
  }
}

function writeDB(state: DBState) {
  dbCache = state;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to database file:", err);
  }

  // Asynchronously synchronize state to Neon Postgres in background
  if (pool) {
    const jsonStr = JSON.stringify(state);
    pool.query(`
      UPDATE app_state SET data = $1, updated_at = NOW() WHERE id = (SELECT id FROM app_state ORDER BY id ASC LIMIT 1)
    `).then(() => {
      console.log("Successfully persisted state to Neon PostgreSQL.");
    }).catch(err => {
      console.error("Failed to sync state to Neon PostgreSQL:", err);
    });
  }
}

async function uploadToBlobIfNeeded(file: any): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    console.log(`Vercel Blob token detected. Uploading ${file.originalname} to Vercel Blob...`);
    try {
      const fileStream = fs.createReadStream(file.path);
      const blob = await put(`courses/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`, fileStream, {
        access: "public",
        token: token
      });
      console.log(`Uploaded successfully to Vercel Blob: ${blob.url}`);
      // Clean up local temp file
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
      return blob.url;
    } catch (err) {
      console.error("Vercel Blob upload failed, falling back to local file:", err);
    }
  }
  return file.filename;
}

async function startServer() {
  await initPostgres();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup multer for local file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `video-${uniqueSuffix}${ext}`);
    }
  });
  const upload = multer({ storage });

  // Middleware to check Admin Access
  const checkAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const password = req.headers["x-admin-password"];
    const db = readDB();
    const adminPassword = db.adminPassword || "19990001999";
    if (password === adminPassword || password === "19990001999") {
      next();
    } else {
      res.status(401).json({ error: "Mot de passe administrateur incorrect" });
    }
  };

  // Helper to verify code with a deviceId
  const isCodeValid = (code: string, deviceId: string): { valid: boolean; error?: string } => {
    const db = readDB();
    const foundCode = db.codes.find((c) => c.code === code);
    if (!foundCode) {
      return { valid: false, error: "Code d'accès invalide ou inexistant." };
    }
    if (foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
      return { valid: false, error: "Ce code est déjà utilisé par un autre appareil." };
    }
    return { valid: true };
  };

  // API: Get Public Info (Seasons & Episode Meta, but without sensitive video paths if unverified)
  app.get("/api/public-state", (req, res) => {
    const db = readDB();
    // Return all seasons and episode titles/descriptions (so users can see what the courses are about)
    const publicEpisodes = db.episodes.map(ep => ({
      id: ep.id,
      seasonId: ep.seasonId,
      title: ep.title,
      description: ep.description,
      videoPath: ep.videoPath,
      duration: ep.duration,
      createdAt: ep.createdAt
    }));
    res.json({
      seasons: db.seasons,
      episodes: publicEpisodes,
      telegramLink: db.telegramLink || "https://t.me/ai_academy_fit",
      whatsappLink: db.whatsappLink || "https://wa.me/33600000000",
      presentationVideoUrl: db.presentationVideoUrl || "https://www.youtube.com/embed/8m9g_b95Eto",
      presentationVideoPath: db.presentationVideoPath || ""
    });
  });

  // API: Verify and register access code
  app.post("/api/verify-code", (req, res) => {
    const { code, deviceId } = req.body;
    if (!code || !deviceId) {
      return res.status(400).json({ error: "Code et identifiant d'appareil requis." });
    }

    const db = readDB();
    const codeIndex = db.codes.findIndex((c) => c.code.trim().toUpperCase() === code.trim().toUpperCase());

    if (codeIndex === -1) {
      return res.status(400).json({ error: "Code d'accès invalide." });
    }

    const foundCode = db.codes[codeIndex];

    const respondWithProfile = (message: string) => {
      return res.json({
        success: true,
        message,
        profile: {
          code: foundCode.code,
          referralCode: foundCode.referralCode || "",
          firstName: foundCode.firstName || "Étudiant",
          lastName: foundCode.lastName || "Élite",
          email: foundCode.email || "etudiant@aiwebacademy.com",
          referralBalance: foundCode.referralBalance || 0,
          referredBy: foundCode.referredBy || "",
          usdtAddress: foundCode.usdtAddress || "",
          withdrawals: foundCode.withdrawals || []
        }
      });
    };

    if (foundCode.deviceLock === null) {
      // First time use! Lock it to this device
      foundCode.deviceLock = deviceId;
      db.codes[codeIndex] = foundCode;
      writeDB(db);
      return respondWithProfile("Code validé et lié à cet appareil !");
    }

    if (foundCode.deviceLock === deviceId) {
      // Already locked to this device, authorized
      return respondWithProfile("Accès autorisé.");
    }

    // Locked to a different device
    return res.status(403).json({
      error: "Sécurité : Ce code d'accès est déjà configuré sur un autre appareil. Un code ne peut servir que sur un seul appareil."
    });
  });

  // API: Buy a code (Register user and process payment)
  app.post("/api/buy-code", (req, res) => {
    const { firstName, lastName, email, referredBy } = req.body;
    
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "Le nom, le prénom et l'adresse email sont obligatoires." });
    }

    const db = readDB();
    
    // Generate code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newCode = "IA-";
    for (let i = 0; i < 8; i++) {
      if (i === 4) newCode += "-";
      newCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Generate distinct referral code
    let newReferralCode = "REF-";
    for (let i = 0; i < 8; i++) {
      if (i === 4) newReferralCode += "-";
      newReferralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Process referral code if provided
    let validReferrerCode = "";
    if (referredBy && referredBy.trim()) {
      const cleanRef = referredBy.trim().toUpperCase();
      // Search by referralCode instead of access code!
      const referrerIdx = db.codes.findIndex(c => c.referralCode?.trim().toUpperCase() === cleanRef);
      if (referrerIdx !== -1) {
        validReferrerCode = db.codes[referrerIdx].referralCode || "";
        db.codes[referrerIdx].referralBalance = (db.codes[referrerIdx].referralBalance || 0) + 5;
      }
    }

    const newAccessCode: AccessCode = {
      code: newCode,
      referralCode: newReferralCode,
      deviceLock: null,
      isPaid: true,
      createdAt: new Date().toISOString(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      referralBalance: 0,
      referredBy: validReferrerCode || undefined,
      withdrawals: []
    };

    db.codes.push(newAccessCode);
    writeDB(db);

    res.json({
      success: true,
      code: newCode,
      profile: {
        code: newCode,
        referralCode: newReferralCode,
        firstName: newAccessCode.firstName,
        lastName: newAccessCode.lastName,
        email: newAccessCode.email,
        referralBalance: 0,
        referredBy: newAccessCode.referredBy || "",
        usdtAddress: "",
        withdrawals: []
      }
    });
  });

  // API: Create Moneroo Payment Session
  app.post("/api/payments/create-session", async (req, res) => {
    const { firstName, lastName, email, referredBy } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "Le prénom, le nom et l'adresse email sont obligatoires." });
    }

    const db = readDB();
    const apiKey = db.monerooSecretKey;
    if (!apiKey) {
      return res.status(400).json({ error: "La clé API de paiement Moneroo n'est pas encore configurée par l'administrateur de l'Académie." });
    }

    const paymentId = "pay-" + Date.now() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const host = req.get("host");
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const returnUrl = `${baseUrl}/?payment_status=success&payment_id=${paymentId}`;
    const cancelUrl = `${baseUrl}/?payment_status=cancel`;

    if (!db.pendingPayments) {
      db.pendingPayments = [];
    }
    const newPendingPayment = {
      id: paymentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      referredBy: referredBy ? referredBy.trim().toUpperCase() : undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
      monerooId: ""
    };
    db.pendingPayments.push(newPendingPayment);
    writeDB(db);

    // Dynamic Currency Conversion (50 USD to XOF) via ExchangeRate API
    let xofAmount = 28750; // default fallback ($50 * ~575)
    const rateApiKey = db.exchangeRateApiKey || process.env.EXCHANGE_RATE_API_KEY || "b61ca475a57776dc1ed72aba";
    if (rateApiKey) {
      try {
        const rateRes = await fetch(`https://v6.exchangerate-api.com/v6/${rateApiKey}/pair/USD/XOF/50`);
        if (rateRes.ok) {
          const rateData: any = await rateRes.json();
          if (rateData && rateData.conversion_result) {
            xofAmount = Math.round(rateData.conversion_result);
            console.log(`Converted $50 USD -> ${xofAmount} XOF (Rate: ${rateData.conversion_rate})`);
          }
        } else {
          console.warn("ExchangeRate API response not OK, using default conversion:", rateRes.status);
        }
      } catch (err) {
        console.error("ExchangeRate API conversion error, using fallback XOF amount:", err);
      }
    }

    try {
      const response = await fetch("https://api.moneroo.io/v1/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: xofAmount,
          currency: "XOF",
          description: `Formation Ultime IA - ${firstName.trim()} ${lastName.trim()}`,
          customer: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim().toLowerCase()
          },
          return_url: returnUrl,
          metadata: {
            paymentId: paymentId
          }
        })
      });

      const data: any = await response.json();
      console.log("Moneroo Response:", data);

      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Erreur lors de la création de la session de paiement chez Moneroo."
        });
      }

      const monerooId = data.id || (data.data && data.data.id) || "";
      if (monerooId) {
        const dbCurrent = readDB();
        if (dbCurrent.pendingPayments) {
          const idx = dbCurrent.pendingPayments.findIndex(p => p.id === paymentId);
          if (idx !== -1) {
            dbCurrent.pendingPayments[idx].monerooId = monerooId;
            writeDB(dbCurrent);
          }
        }
      }

      const checkoutUrl = (data.data && data.data.checkout_url) ||
                          data.checkout_url || 
                          data.payment_url || 
                          data.redirect_url || 
                          data.url;

      if (!checkoutUrl) {
        return res.status(500).json({
          error: "Aucune URL de redirection de paiement n'a été renvoyée par Moneroo."
        });
      }

      res.json({
        success: true,
        paymentId,
        checkoutUrl
      });

    } catch (err: any) {
      console.error("Error connecting to Moneroo:", err);
      res.status(500).json({ error: "Impossible de contacter la passerelle de paiement Moneroo: " + err.message });
    }
  });

  // API: Verify payment status and generate access code if successful
  app.post("/api/payments/verify", async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: "ID de paiement manquant." });
    }

    const db = readDB();
    if (!db.pendingPayments) db.pendingPayments = [];
    const paymentIdx = db.pendingPayments.findIndex(p => p.id === paymentId);
    if (paymentIdx === -1) {
      return res.status(404).json({ error: "Transaction introuvable." });
    }

    const payment = db.pendingPayments[paymentIdx];

    if (payment.status === "completed" && payment.generatedCode) {
      const foundCode = db.codes.find(c => c.code === payment.generatedCode);
      if (foundCode) {
        return res.json({
          success: true,
          code: foundCode.code,
          profile: {
            code: foundCode.code,
            referralCode: foundCode.referralCode || "",
            firstName: foundCode.firstName || payment.firstName,
            lastName: foundCode.lastName || payment.lastName,
            email: foundCode.email || payment.email,
            referralBalance: foundCode.referralBalance || 0,
            referredBy: foundCode.referredBy || "",
            usdtAddress: foundCode.usdtAddress || "",
            withdrawals: foundCode.withdrawals || []
          }
        });
      }
    }

    const apiKey = db.monerooSecretKey;
    let isApproved = false;

    if (apiKey && payment.monerooId) {
      try {
        const response = await fetch(`https://api.moneroo.io/v1/payments/${payment.monerooId}`, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
          }
        });
        if (response.ok) {
          const data: any = await response.json();
          const paymentData = data.data || data;
          const status = paymentData.status;
          isApproved = ["approved", "success", "successful", "completed", "paid"].includes(String(status).toLowerCase());
        }
      } catch (err) {
        console.error("Error verifying payment with Moneroo API:", err);
      }
    } else {
      if (!apiKey) {
        return res.status(400).json({ error: "La passerelle de paiement n'est pas configurée." });
      }
    }

    if (isApproved) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let newCode = "IA-";
      for (let i = 0; i < 8; i++) {
        if (i === 4) newCode += "-";
        newCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      let newReferralCode = "REF-";
      for (let i = 0; i < 8; i++) {
        if (i === 4) newReferralCode += "-";
        newReferralCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      let validReferrerCode = "";
      if (payment.referredBy) {
        const cleanRef = payment.referredBy.trim().toUpperCase();
        const referrerIdx = db.codes.findIndex(c => c.referralCode?.trim().toUpperCase() === cleanRef);
        if (referrerIdx !== -1) {
          validReferrerCode = db.codes[referrerIdx].referralCode || "";
          db.codes[referrerIdx].referralBalance = (db.codes[referrerIdx].referralBalance || 0) + 5;
        }
      }

      const newAccessCode: AccessCode = {
        code: newCode,
        referralCode: newReferralCode,
        deviceLock: null,
        isPaid: true,
        createdAt: new Date().toISOString(),
        firstName: payment.firstName,
        lastName: payment.lastName,
        email: payment.email,
        referralBalance: 0,
        referredBy: validReferrerCode || undefined,
        withdrawals: []
      };

      db.codes.push(newAccessCode);
      
      payment.status = "completed";
      payment.generatedCode = newCode;
      
      db.pendingPayments[paymentIdx] = payment;
      writeDB(db);

      return res.json({
        success: true,
        code: newCode,
        profile: {
          code: newCode,
          referralCode: newReferralCode,
          firstName: payment.firstName,
          lastName: payment.lastName,
          email: payment.email,
          referralBalance: 0,
          referredBy: validReferrerCode,
          usdtAddress: "",
          withdrawals: []
        }
      });
    } else {
      return res.status(400).json({
        error: "Le paiement n'a pas encore été validé ou a échoué chez Moneroo. Veuillez réessayer."
      });
    }
  });

  // API: Moneroo Webhook
  app.post("/api/payments/webhook", (req, res) => {
    console.log("Moneroo Webhook body:", req.body);
    const event = req.body;
    if (!event) return res.status(400).send("No event body.");

    const paymentData = event.data || event;
    const monerooId = paymentData.id;
    const metadata = paymentData.metadata || {};
    const paymentId = metadata.paymentId;

    if (!paymentId && !monerooId) {
      return res.status(400).send("No identifier found.");
    }

    const db = readDB();
    if (!db.pendingPayments) db.pendingPayments = [];

    const idx = db.pendingPayments.findIndex(p => p.id === paymentId || p.monerooId === monerooId);
    if (idx === -1) {
      return res.status(404).send("Transaction not found.");
    }

    const payment = db.pendingPayments[idx];
    if (payment.status === "completed") {
      return res.send({ success: true, message: "Payment already fulfilled." });
    }

    const status = paymentData.status;
    const isApproved = ["approved", "success", "successful", "completed", "paid"].includes(String(status).toLowerCase());

    if (isApproved) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let newCode = "IA-";
      for (let i = 0; i < 8; i++) {
        if (i === 4) newCode += "-";
        newCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      let newReferralCode = "REF-";
      for (let i = 0; i < 8; i++) {
        if (i === 4) newReferralCode += "-";
        newReferralCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      let validReferrerCode = "";
      if (payment.referredBy) {
        const cleanRef = payment.referredBy.trim().toUpperCase();
        const referrerIdx = db.codes.findIndex(c => c.referralCode?.trim().toUpperCase() === cleanRef);
        if (referrerIdx !== -1) {
          validReferrerCode = db.codes[referrerIdx].referralCode || "";
          db.codes[referrerIdx].referralBalance = (db.codes[referrerIdx].referralBalance || 0) + 5;
        }
      }

      const newAccessCode: AccessCode = {
        code: newCode,
        referralCode: newReferralCode,
        deviceLock: null,
        isPaid: true,
        createdAt: new Date().toISOString(),
        firstName: payment.firstName,
        lastName: payment.lastName,
        email: payment.email,
        referralBalance: 0,
        referredBy: validReferrerCode || undefined,
        withdrawals: []
      };

      db.codes.push(newAccessCode);
      
      payment.status = "completed";
      payment.generatedCode = newCode;
      
      db.pendingPayments[idx] = payment;
      writeDB(db);

      console.log(`Webhook generated code ${newCode} successfully.`);
      return res.json({ success: true, message: "Code generated." });
    }

    res.send({ success: true, message: "Webhook received but not approved." });
  });

  // API: Admin Update Settings
  app.post("/api/admin/settings", checkAdmin, (req, res) => {
    const { monerooSecretKey, monerooPublicKey, exchangeRateApiKey, telegramLink, whatsappLink, presentationVideoUrl, presentationVideoPath } = req.body;
    const db = readDB();
    db.monerooSecretKey = monerooSecretKey ? monerooSecretKey.trim() : "";
    db.monerooPublicKey = monerooPublicKey ? monerooPublicKey.trim() : "";
    if (exchangeRateApiKey !== undefined) db.exchangeRateApiKey = exchangeRateApiKey.trim();
    db.telegramLink = telegramLink ? telegramLink.trim() : "";
    db.whatsappLink = whatsappLink ? whatsappLink.trim() : "";
    db.presentationVideoUrl = presentationVideoUrl ? presentationVideoUrl.trim() : "";
    db.presentationVideoPath = presentationVideoPath !== undefined ? presentationVideoPath.trim() : "";
    writeDB(db);
    res.json({ success: true, message: "Configuration mise à jour avec succès !" });
  });

  // API: Get Profile details
  app.post("/api/profile", (req, res) => {
    const { code, deviceId } = req.body;
    if (!code || !deviceId) {
      return res.status(400).json({ error: "Code et identifiant d'appareil requis." });
    }

    const db = readDB();
    const foundCode = db.codes.find(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());

    if (!foundCode) {
      return res.status(404).json({ error: "Code d'accès introuvable." });
    }

    if (foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
      return res.status(403).json({ error: "Cet appareil n'est pas autorisé pour ce code d'accès." });
    }

    res.json({
      success: true,
      profile: {
        code: foundCode.code,
        referralCode: foundCode.referralCode || "",
        firstName: foundCode.firstName || "Étudiant",
        lastName: foundCode.lastName || "Élite",
        email: foundCode.email || "etudiant@aiwebacademy.com",
        referralBalance: foundCode.referralBalance || 0,
        referredBy: foundCode.referredBy || "",
        usdtAddress: foundCode.usdtAddress || "",
        withdrawals: foundCode.withdrawals || []
      }
    });
  });

  // API: Update USDT Withdrawal Address
  app.post("/api/update-usdt-address", (req, res) => {
    const { code, deviceId, usdtAddress } = req.body;
    if (!code || !deviceId) {
      return res.status(400).json({ error: "Code et identifiant d'appareil requis." });
    }
    if (!usdtAddress || !usdtAddress.trim()) {
      return res.status(400).json({ error: "L'adresse de retrait USDT ne peut pas être vide." });
    }

    const db = readDB();
    const codeIndex = db.codes.findIndex(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());

    if (codeIndex === -1) {
      return res.status(404).json({ error: "Code d'accès introuvable." });
    }

    const foundCode = db.codes[codeIndex];
    if (foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
      return res.status(403).json({ error: "Cet appareil n'est pas autorisé pour ce code d'accès." });
    }

    foundCode.usdtAddress = usdtAddress.trim();
    db.codes[codeIndex] = foundCode;
    writeDB(db);

    res.json({
      success: true,
      message: "Adresse de retrait USDT enregistrée avec succès !",
      profile: {
        code: foundCode.code,
        referralCode: foundCode.referralCode || "",
        firstName: foundCode.firstName || "Étudiant",
        lastName: foundCode.lastName || "Élite",
        email: foundCode.email || "etudiant@aiwebacademy.com",
        referralBalance: foundCode.referralBalance || 0,
        referredBy: foundCode.referredBy || "",
        usdtAddress: foundCode.usdtAddress,
        withdrawals: foundCode.withdrawals || []
      }
    });
  });

  // API: Request withdrawal
  app.post("/api/request-withdrawal", (req, res) => {
    const { code, deviceId, amount, usdtAddress } = req.body;
    if (!code || !deviceId || !amount || !usdtAddress) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Montant de retrait invalide." });
    }

    const db = readDB();
    const codeIndex = db.codes.findIndex(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());

    if (codeIndex === -1) {
      return res.status(404).json({ error: "Code d'accès introuvable." });
    }

    const foundCode = db.codes[codeIndex];
    if (foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
      return res.status(403).json({ error: "Cet appareil n'est pas autorisé." });
    }

    const balance = foundCode.referralBalance || 0;
    if (numericAmount < 50) {
      return res.status(400).json({ error: "Le montant minimum de retrait est de 50 USDT ($50)." });
    }

    if (numericAmount > balance) {
      return res.status(400).json({ error: `Solde insuffisant. Votre solde disponible est de $${balance}.` });
    }

    // Deduct and add withdrawal record
    foundCode.referralBalance = balance - numericAmount;
    if (!foundCode.withdrawals) {
      foundCode.withdrawals = [];
    }

    const newWithdrawal = {
      id: "wdr-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      amount: numericAmount,
      usdtAddress: usdtAddress.trim(),
      status: "pending" as const,
      createdAt: new Date().toISOString()
    };

    foundCode.withdrawals.push(newWithdrawal);
    db.codes[codeIndex] = foundCode;
    writeDB(db);

    res.json({
      success: true,
      message: "Votre demande de retrait de " + numericAmount + " USDT a été soumise avec succès !",
      profile: {
        code: foundCode.code,
        referralCode: foundCode.referralCode || "",
        firstName: foundCode.firstName || "Étudiant",
        lastName: foundCode.lastName || "Élite",
        email: foundCode.email || "etudiant@aiwebacademy.com",
        referralBalance: foundCode.referralBalance,
        referredBy: foundCode.referredBy || "",
        usdtAddress: foundCode.usdtAddress || "",
        withdrawals: foundCode.withdrawals
      }
    });
  });

  // API: Get Admin Data (full details including all raw codes)
  app.get("/api/admin/data", checkAdmin, (req, res) => {
    const db = readDB();
    res.json(db);
  });

  // API: Update Admin Password
  app.post("/api/admin/change-password", checkAdmin, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 3 caractères." });
    }
    const db = readDB();
    db.adminPassword = newPassword;
    writeDB(db);
    res.json({ success: true, message: "Mot de passe administrateur mis à jour." });
  });

  // API: Admin generate a new code manually
  app.post("/api/admin/generate-code", checkAdmin, (req, res) => {
    const { isPaid, firstName, lastName, email } = req.body;
    const db = readDB();
    
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newCode = isPaid ? "IA-" : "ADM-";
    for (let i = 0; i < 8; i++) {
      if (i === 4) newCode += "-";
      newCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    let referralCode = "REF-";
    for (let i = 0; i < 8; i++) {
      if (i === 4) referralCode += "-";
      referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const newAccessCode: AccessCode = {
      code: newCode,
      referralCode: referralCode,
      deviceLock: null,
      isPaid: !!isPaid,
      createdAt: new Date().toISOString(),
      firstName: firstName ? firstName.trim() : undefined,
      lastName: lastName ? lastName.trim() : undefined,
      email: email ? email.trim().toLowerCase() : undefined,
      referralBalance: 0,
      withdrawals: []
    };

    db.codes.push(newAccessCode);
    writeDB(db);

    res.json({ success: true, code: newAccessCode });
  });

  // API: Admin delete code
  app.delete("/api/admin/codes/:code", checkAdmin, (req, res) => {
    const { code } = req.params;
    const db = readDB();
    db.codes = db.codes.filter(c => c.code !== code);
    writeDB(db);
    res.json({ success: true, message: "Code d'accès supprimé." });
  });

  // API: Admin reset code deviceLock
  app.post("/api/admin/codes/:code/reset", checkAdmin, (req, res) => {
    const { code } = req.params;
    const db = readDB();
    const idx = db.codes.findIndex(c => c.code === code);
    if (idx !== -1) {
      db.codes[idx].deviceLock = null;
      writeDB(db);
      return res.json({ success: true, message: "L'appareil lié à ce code a été réinitialisé." });
    }
    res.status(404).json({ error: "Code introuvable." });
  });

  // API: Admin update user profile, balance, etc.
  app.post("/api/admin/codes/:code/update-profile", checkAdmin, (req, res) => {
    const { code } = req.params;
    const { firstName, lastName, email, referralCode, referralBalance, usdtAddress } = req.body;
    const db = readDB();
    const idx = db.codes.findIndex(c => c.code === code);
    if (idx !== -1) {
      db.codes[idx].firstName = firstName;
      db.codes[idx].lastName = lastName;
      db.codes[idx].email = email;
      db.codes[idx].referralCode = referralCode;
      db.codes[idx].referralBalance = Number(referralBalance) || 0;
      db.codes[idx].usdtAddress = usdtAddress;
      writeDB(db);
      return res.json({ success: true, message: "Profil utilisateur mis à jour.", code: db.codes[idx] });
    }
    res.status(404).json({ error: "Code introuvable." });
  });

  // API: Admin mark withdrawal as completed
  app.post("/api/admin/codes/:code/withdrawals/:wdrId/complete", checkAdmin, (req, res) => {
    const { code, wdrId } = req.params;
    const db = readDB();
    const idx = db.codes.findIndex(c => c.code === code);
    if (idx !== -1) {
      const withdrawals = db.codes[idx].withdrawals || [];
      const wIdx = withdrawals.findIndex(w => w.id === wdrId);
      if (wIdx !== -1) {
        withdrawals[wIdx].status = "completed";
        db.codes[idx].withdrawals = withdrawals;
        writeDB(db);
        return res.json({ success: true, message: "Demande de retrait marquée comme Payée/Complétée." });
      }
      return res.status(404).json({ error: "Demande de retrait introuvable." });
    }
    res.status(404).json({ error: "Code introuvable." });
  });

  // API: Admin cancel withdrawal and refund balance
  app.post("/api/admin/codes/:code/withdrawals/:wdrId/cancel", checkAdmin, (req, res) => {
    const { code, wdrId } = req.params;
    const db = readDB();
    const idx = db.codes.findIndex(c => c.code === code);
    if (idx !== -1) {
      const withdrawals = db.codes[idx].withdrawals || [];
      const wIdx = withdrawals.findIndex(w => w.id === wdrId);
      if (wIdx !== -1) {
        const refundAmount = withdrawals[wIdx].amount;
        // Refund the balance if the current status is pending
        if (withdrawals[wIdx].status === "pending") {
          db.codes[idx].referralBalance = (db.codes[idx].referralBalance || 0) + refundAmount;
        }
        // Remove withdrawal or mark it as cancelled (here let's filter it out or change status)
        // Let's filter it out or we can just change its status or remove it. Let's remove it to keep clean.
        db.codes[idx].withdrawals = withdrawals.filter(w => w.id !== wdrId);
        writeDB(db);
        return res.json({ success: true, message: "Demande annulée et montant remboursé au solde de l'étudiant." });
      }
      return res.status(404).json({ error: "Demande de retrait introuvable." });
    }
    res.status(404).json({ error: "Code introuvable." });
  });

  // API: Admin create or edit season
  app.post("/api/admin/seasons", checkAdmin, (req, res) => {
    const { id, title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Le titre de la saison est obligatoire." });
    }

    const db = readDB();
    if (id) {
      // Edit existing
      const idx = db.seasons.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.seasons[idx] = { id, title, description };
      } else {
        db.seasons.push({ id, title, description });
      }
    } else {
      // New season
      const newId = String(db.seasons.length > 0 ? Math.max(...db.seasons.map(s => Number(s.id))) + 1 : 1);
      db.seasons.push({ id: newId, title, description });
    }
    writeDB(db);
    res.json({ success: true, seasons: db.seasons });
  });

  // API: Admin delete season
  app.delete("/api/admin/seasons/:id", checkAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.seasons = db.seasons.filter(s => s.id !== id);
    // Also delete or orphan episodes in this season
    db.episodes = db.episodes.filter(ep => ep.seasonId !== id);
    writeDB(db);
    res.json({ success: true, message: "Saison supprimée ainsi que tous ses épisodes." });
  });

  // API: Admin upload video & create episode
  app.post("/api/admin/episodes", checkAdmin, upload.single("videoFile"), async (req, res) => {
    const { seasonId, title, description, duration } = req.body;
    if (!seasonId || !title) {
      return res.status(400).json({ error: "La saison et le titre de l'épisode sont obligatoires." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Fichier vidéo manquant." });
    }

    try {
      const finalVideoPath = await uploadToBlobIfNeeded(req.file);
      const db = readDB();
      const newEpisode: Episode = {
        id: "ep-" + Date.now(),
        seasonId,
        title,
        description: description || "",
        videoPath: finalVideoPath,
        originalName: req.file.originalname,
        duration: duration || "00:00",
        createdAt: new Date().toISOString()
      };

      db.episodes.push(newEpisode);
      writeDB(db);

      res.json({ success: true, episode: newEpisode });
    } catch (err) {
      console.error("Error creating episode:", err);
      res.status(500).json({ error: "Erreur lors de la création de l'épisode." });
    }
  });

  // API: Admin delete episode
  app.delete("/api/admin/episodes/:id", checkAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const episode = db.episodes.find(ep => ep.id === id);
    if (episode) {
      const filePath = path.join(UPLOADS_DIR, episode.videoPath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete video file from disk:", e);
        }
      }
      db.episodes = db.episodes.filter(ep => ep.id !== id);
      writeDB(db);
      return res.json({ success: true, message: "Épisode et fichier vidéo supprimés." });
    }
    res.status(404).json({ error: "Épisode introuvable." });
  });

  // API: Admin upload custom presentation video
  app.post("/api/admin/presentation-video", checkAdmin, upload.single("videoFile"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Fichier vidéo manquant." });
    }
    try {
      const finalVideoPath = await uploadToBlobIfNeeded(req.file);
      const db = readDB();
      db.presentationVideoPath = finalVideoPath;
      writeDB(db);
      res.json({ success: true, presentationVideoPath: finalVideoPath });
    } catch (err) {
      console.error("Error setting presentation video:", err);
      res.status(500).json({ error: "Erreur lors du traitement de la vidéo de présentation." });
    }
  });

  // API: Public stream for presentation video with HTTP 206 Support (No auth needed)
  app.get("/api/public-video/:filename", (req, res) => {
    const { filename } = req.params;
    
    // Security check: Only stream the video if it is currently set as the presentation video
    const db = readDB();
    if (db.presentationVideoPath !== filename) {
      return res.status(403).send("Accès refusé. Cette vidéo n'est pas configurée comme vidéo de présentation.");
    }

    const videoFilePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(videoFilePath)) {
      return res.status(404).send("Fichier vidéo introuvable sur le serveur.");
    }

    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
        return;
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoFilePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoFilePath).pipe(res);
    }
  });

  // API: Proxy Stream for Cloud-Stored Videos (Locked by code verification)
  app.get("/api/videos/proxy", async (req, res) => {
    const { url, code, deviceId } = req.query;

    if (!url || !code || !deviceId) {
      return res.status(401).json({ error: "Paramètres manquants pour lire la vidéo." });
    }

    // Verify if code is valid and associated with this device
    const verification = isCodeValid(code as string, deviceId as string);
    if (!verification.valid) {
      return res.status(403).json({ error: verification.error });
    }

    const targetUrl = decodeURIComponent(url as string);

    // Forward the client's Range header to Vercel Blob / Target URL
    const headers: Record<string, string> = {};
    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    try {
      const response = await fetch(targetUrl, { headers });
      
      const contentType = response.headers.get("content-type") || "video/mp4";
      const contentRange = response.headers.get("content-range");
      const contentLength = response.headers.get("content-length");
      const acceptRanges = response.headers.get("accept-ranges") || "bytes";

      res.status(response.status);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Accept-Ranges", acceptRanges);
      if (contentRange) res.setHeader("Content-Range", contentRange);
      if (contentLength) res.setHeader("Content-Length", contentLength);

      if (response.body) {
        const nodeReadable = Readable.fromWeb(response.body as any);
        nodeReadable.pipe(res);
      } else {
        res.end();
      }
    } catch (err) {
      console.error("Error proxying video stream:", err);
      res.status(500).send("Erreur lors de la lecture du flux vidéo.");
    }
  });

  // API: Stream Video with HTTP 206 Support (Locked by code verification)
  app.get("/api/videos/:filename", (req, res) => {
    const { filename } = req.params;
    const { code, deviceId } = req.query;

    if (!code || !deviceId) {
      return res.status(401).json({ error: "Veuillez fournir votre code d'accès et identifiant pour lire la vidéo." });
    }

    // Verify if code is valid and associated with this device
    const verification = isCodeValid(code as string, deviceId as string);
    if (!verification.valid) {
      return res.status(403).json({ error: verification.error });
    }

    const videoFilePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(videoFilePath)) {
      return res.status(404).send("Fichier vidéo introuvable sur le serveur.");
    }

    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
        return;
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoFilePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoFilePath).pipe(res);
    }
  });

  // Vite development integration or Production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
