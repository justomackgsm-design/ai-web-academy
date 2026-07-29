import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import dotenv from "dotenv";
import { Pool } from "pg";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import nodemailer from "nodemailer";

dotenv.config();

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure directories exist safely (avoiding read-only filesystem crashes on Vercel)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  // Ignore filesystem creation errors on read-only serverless platforms
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
  comingSoonEnabled?: boolean;
  comingSoonDate?: string;
  comingSoonMessage?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  originalPrice?: number;
  promoPrice?: number;
  isPromoActive?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  senderName?: string;
  senderEmail?: string;
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

// ---------------------------------------------------------------------------
// Configuration sensible : UNIQUEMENT via les variables d'environnement.
// Aucun mot de passe, clé d'API, code d'accès ou URL de base de données
// ne doit être écrit en dur dans ce fichier (le code est public sur GitHub).
// Variables attendues (Vercel > Settings > Environment Variables) :
//   DATABASE_URL, ADMIN_PASSWORD, MASTER_ACCESS_CODE,
//   MONEROO_SECRET_KEY, EXCHANGE_RATE_API_KEY,
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// ---------------------------------------------------------------------------
const ENV_ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();
const ENV_MASTER_ACCESS_CODE = (process.env.MASTER_ACCESS_CODE || "").trim();
const ENV_MONEROO_SECRET_KEY = (process.env.MONEROO_SECRET_KEY || "").trim();
const ENV_EXCHANGE_RATE_API_KEY = (process.env.EXCHANGE_RATE_API_KEY || "").trim();

if (!ENV_ADMIN_PASSWORD) {
  console.warn("[config] ADMIN_PASSWORD n'est pas defini. Le mot de passe stocke en base de donnees sera utilise.");
}

const DEFAULT_DB: DBState = {
  seasons: DEFAULT_SEASONS,
  episodes: [],
  codes: ENV_MASTER_ACCESS_CODE ? [
    {
      code: ENV_MASTER_ACCESS_CODE,
      referralCode: "REF-1999-MASTER",
      deviceLock: null,
      isPaid: true,
      createdAt: new Date().toISOString(),
      firstName: "Admin",
      lastName: "Master",
      email: "admin@aiwebacademy.com",
      referralBalance: 0,
      withdrawals: []
    },
    {
      code: "PRO-DEMO-99",
      referralCode: "REF-PRO-DEMO",
      deviceLock: null,
      isPaid: true,
      createdAt: new Date().toISOString(),
      firstName: "Démo",
      lastName: "Étudiant",
      email: "demo@aiwebacademy.com",
      referralBalance: 0,
      withdrawals: []
    }
  ] : [],
  adminPassword: ENV_ADMIN_PASSWORD,
  monerooSecretKey: ENV_MONEROO_SECRET_KEY,
  monerooPublicKey: "",
  exchangeRateApiKey: ENV_EXCHANGE_RATE_API_KEY,
  telegramLink: "https://t.me/ai_academy_fit",
  whatsappLink: "https://wa.me/33600000000",
  presentationVideoUrl: "https://www.youtube.com/embed/8m9g_b95Eto",
  pendingPayments: []
};

// PostgreSQL Integration Pool Setup
// L'URL de la base de donnees vient exclusivement de l'environnement.
const dbUrl = (process.env.DATABASE_URL || "").trim();
let pool: Pool | null = null;
let dbCache: DBState | null = null;
let dbCacheTime: number = 0;
const DB_CACHE_TTL_MS = 30000; // 30 seconds — allows changes to propagate across serverless instances
let postgresInitialized = false;
let initPromise: Promise<void> | null = null;

if (dbUrl) {
  console.log("Connecting to PostgreSQL (Neon) Database...");
  // Use WHATWG URL API to strip sslmode param before passing to pg,
  // which prevents pg-connection-string from emitting SSL deprecation warnings.
  // SSL is handled explicitly via the ssl option below.
  const pgUrl = new URL(dbUrl);
  pgUrl.searchParams.delete("sslmode");
  pool = new Pool({
    connectionString: pgUrl.toString(),
    ssl: { rejectUnauthorized: false }
  });
}

// Initialize PostgreSQL schema and load stored cache
async function initPostgres() {
  if (!pool) {
    console.log("No DATABASE_URL found. Using local JSON file database.");
    return;
  }
  try {
    // 1. Create all relational tables in Neon PostgreSQL
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS episodes (
        id VARCHAR(255) PRIMARY KEY,
        season_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        video_path TEXT NOT NULL,
        original_name TEXT,
        duration VARCHAR(100),
        created_at VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS access_codes (
        code VARCHAR(255) PRIMARY KEY,
        referral_code VARCHAR(255),
        device_lock VARCHAR(255),
        is_paid BOOLEAN DEFAULT TRUE,
        created_at VARCHAR(100),
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        referral_balance NUMERIC(12, 2) DEFAULT 0,
        referred_by TEXT,
        usdt_address TEXT
      );

      CREATE TABLE IF NOT EXISTS withdrawals (
        id VARCHAR(255) PRIMARY KEY,
        code VARCHAR(255) REFERENCES access_codes(code) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        usdt_address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS pending_payments (
        id VARCHAR(255) PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        referred_by TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at VARCHAR(100),
        moneroo_id TEXT,
        generated_code TEXT
      );

      CREATE TABLE IF NOT EXISTS admin_settings (
        id INT PRIMARY KEY DEFAULT 1,
        admin_password TEXT,
        moneroo_secret_key TEXT,
        moneroo_public_key TEXT,
        exchange_rate_api_key TEXT,
        telegram_link TEXT,
        whatsapp_link TEXT,
        presentation_video_url TEXT,
        presentation_video_path TEXT,
        payment_amount NUMERIC(12, 2) DEFAULT 50,
        payment_currency VARCHAR(10) DEFAULT 'USD',
        original_price NUMERIC(12, 2) DEFAULT 100,
        promo_price NUMERIC(12, 2) DEFAULT 50,
        is_promo_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS app_state (
        id INT PRIMARY KEY DEFAULT 1,
        data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Ensure payment columns exist in admin_settings for existing DBs
    await pool.query(`
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(12, 2) DEFAULT 50;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10) DEFAULT 'USD';
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS original_price NUMERIC(12, 2) DEFAULT 100;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS promo_price NUMERIC(12, 2) DEFAULT 50;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS is_promo_active BOOLEAN DEFAULT TRUE;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS smtp_host TEXT;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS smtp_port INT DEFAULT 587;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT FALSE;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS smtp_user TEXT;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS smtp_password TEXT;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS sender_name TEXT;
      ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS sender_email TEXT;
    `);
    console.log("All Neon PostgreSQL database tables verified/created successfully.");

    // Check if app_state or access_codes already has data
    const res = await pool.query(`SELECT data FROM app_state WHERE id = 1 LIMIT 1`);
    if (res.rows.length > 0) {
      console.log("Successfully connected and loaded state from Neon PostgreSQL.");
      dbCache = JSON.parse(res.rows[0].data);
      dbCacheTime = Date.now();
    } else {
      console.log("Initializing empty Neon PostgreSQL database with seed state...");
      dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
      const initialJson = JSON.stringify(DEFAULT_DB);
      await pool.query(`
        INSERT INTO app_state (id, data) VALUES (1, $1)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
      `, [initialJson]);
      syncToRelationalTables(dbCache).catch(e => console.error("Initial sync error:", e));
    }

  } catch (err) {
    console.error("PostgreSQL connection/init error:", err);
  }
}

// Helper to sync state to all individual relational tables
async function syncToRelationalTables(state: DBState) {
  if (!pool) return;
  try {
    // 1. Admin Settings
    await pool.query(`
      INSERT INTO admin_settings (id, admin_password, moneroo_secret_key, moneroo_public_key, exchange_rate_api_key, telegram_link, whatsapp_link, presentation_video_url, presentation_video_path, payment_amount, payment_currency, original_price, promo_price, is_promo_active, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, sender_name, sender_email)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        admin_password = EXCLUDED.admin_password,
        moneroo_secret_key = EXCLUDED.moneroo_secret_key,
        moneroo_public_key = EXCLUDED.moneroo_public_key,
        exchange_rate_api_key = EXCLUDED.exchange_rate_api_key,
        telegram_link = EXCLUDED.telegram_link,
        whatsapp_link = EXCLUDED.whatsapp_link,
        presentation_video_url = EXCLUDED.presentation_video_url,
        presentation_video_path = EXCLUDED.presentation_video_path,
        payment_amount = EXCLUDED.payment_amount,
        payment_currency = EXCLUDED.payment_currency,
        original_price = EXCLUDED.original_price,
        promo_price = EXCLUDED.promo_price,
        is_promo_active = EXCLUDED.is_promo_active,
        smtp_host = EXCLUDED.smtp_host,
        smtp_port = EXCLUDED.smtp_port,
        smtp_secure = EXCLUDED.smtp_secure,
        smtp_user = EXCLUDED.smtp_user,
        smtp_password = EXCLUDED.smtp_password,
        sender_name = EXCLUDED.sender_name,
        sender_email = EXCLUDED.sender_email;
    `, [
      state.adminPassword || ENV_ADMIN_PASSWORD,
      state.monerooSecretKey || "",
      state.monerooPublicKey || "",
      state.exchangeRateApiKey || "",
      state.telegramLink || "",
      state.whatsappLink || "",
      state.presentationVideoUrl || "",
      state.presentationVideoPath || "",
      state.paymentAmount ?? 50,
      state.paymentCurrency || "USD",
      state.originalPrice ?? 100,
      state.promoPrice ?? 50,
      state.isPromoActive ?? true,
      state.smtpHost || "",
      state.smtpPort ?? 587,
      state.smtpSecure ?? false,
      state.smtpUser || "",
      state.smtpPassword || "",
      state.senderName || "",
      state.senderEmail || ""
    ]);

    // 2. Seasons
    for (const season of state.seasons || []) {
      await pool.query(`
        INSERT INTO seasons (id, title, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description;
      `, [season.id, season.title, season.description]);
    }

    // 3. Episodes
    for (const ep of state.episodes || []) {
      await pool.query(`
        INSERT INTO episodes (id, season_id, title, description, video_path, original_name, duration, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          season_id = EXCLUDED.season_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          video_path = EXCLUDED.video_path,
          original_name = EXCLUDED.original_name,
          duration = EXCLUDED.duration,
          created_at = EXCLUDED.created_at;
      `, [ep.id, ep.seasonId, ep.title, ep.description || "", ep.videoPath, ep.originalName || "", ep.duration || "", ep.createdAt || new Date().toISOString()]);
    }

    // 4. Access Codes & Withdrawals
    for (const codeObj of state.codes || []) {
      await pool.query(`
        INSERT INTO access_codes (code, referral_code, device_lock, is_paid, created_at, first_name, last_name, email, referral_balance, referred_by, usdt_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (code) DO UPDATE SET
          referral_code = EXCLUDED.referral_code,
          device_lock = EXCLUDED.device_lock,
          is_paid = EXCLUDED.is_paid,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          referral_balance = EXCLUDED.referral_balance,
          referred_by = EXCLUDED.referred_by,
          usdt_address = EXCLUDED.usdt_address;
      `, [
        codeObj.code,
        codeObj.referralCode || "",
        codeObj.deviceLock || null,
        codeObj.isPaid ?? true,
        codeObj.createdAt || new Date().toISOString(),
        codeObj.firstName || "",
        codeObj.lastName || "",
        codeObj.email || "",
        codeObj.referralBalance || 0,
        codeObj.referredBy || null,
        codeObj.usdtAddress || ""
      ]);

      if (codeObj.withdrawals && Array.isArray(codeObj.withdrawals)) {
        for (const w of codeObj.withdrawals) {
          await pool.query(`
            INSERT INTO withdrawals (id, code, amount, usdt_address, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              amount = EXCLUDED.amount,
              usdt_address = EXCLUDED.usdt_address,
              status = EXCLUDED.status;
          `, [w.id, codeObj.code, w.amount, w.usdtAddress, w.status, w.createdAt || new Date().toISOString()]);
        }
      }
    }

    // 5. Pending Payments
    for (const p of state.pendingPayments || []) {
      await pool.query(`
        INSERT INTO pending_payments (id, first_name, last_name, email, referred_by, status, created_at, moneroo_id, generated_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          moneroo_id = EXCLUDED.moneroo_id,
          generated_code = EXCLUDED.generated_code;
      `, [
        p.id,
        p.firstName,
        p.lastName,
        p.email,
        p.referredBy || null,
        p.status,
        p.createdAt || new Date().toISOString(),
        p.monerooId || "",
        p.generatedCode || ""
      ]);
    }
  } catch (err) {
    console.error("Error syncing to relational tables:", err);
  }
}

async function getDB(): Promise<DBState> {
  if (dbCache && (Date.now() - dbCacheTime) < DB_CACHE_TTL_MS) {
    return dbCache;
  }
  if (pool) {
    await ensurePostgresInit();
    try {
      // 1. Try quick load from app_state first
      const appStateRes = await pool.query(`SELECT data FROM app_state WHERE id = 1 LIMIT 1`);
      if (appStateRes.rows.length > 0) {
        const parsed: DBState = JSON.parse(appStateRes.rows[0].data);
        if (!parsed.monerooSecretKey) parsed.monerooSecretKey = ENV_MONEROO_SECRET_KEY;
        if (!parsed.exchangeRateApiKey) parsed.exchangeRateApiKey = ENV_EXCHANGE_RATE_API_KEY;
        if (!parsed.adminPassword) parsed.adminPassword = ENV_ADMIN_PASSWORD;
        if (parsed.paymentAmount === undefined) parsed.paymentAmount = 50;
        if (!parsed.paymentCurrency) parsed.paymentCurrency = "USD";
        dbCache = parsed;
        return dbCache!;
      }

      // 2. Fallback to relational tables
      const settingsRes = await pool.query(`SELECT * FROM admin_settings WHERE id = 1 LIMIT 1`);
      let adminPassword = ENV_ADMIN_PASSWORD;
      let monerooSecretKey = ENV_MONEROO_SECRET_KEY;
      let monerooPublicKey = "";
      let exchangeRateApiKey = ENV_EXCHANGE_RATE_API_KEY;
      let telegramLink = "https://t.me/ai_academy_fit";
      let whatsappLink = "https://wa.me/33600000000";
      let presentationVideoUrl = "https://www.youtube.com/embed/8m9g_b95Eto";
      let presentationVideoPath = "";
      let paymentAmount = 50;
      let paymentCurrency = "USD";
      let originalPrice = 100;
      let promoPrice = 50;
      let isPromoActive = true;
      let smtpHost = "";
      let smtpPort = 587;
      let smtpSecure = false;
      let smtpUser = "";
      let smtpPassword = "";
      let senderName = "";
      let senderEmail = "";

      if (settingsRes.rows.length > 0) {
        const s = settingsRes.rows[0];
        if (s.admin_password) adminPassword = s.admin_password;
        if (s.moneroo_secret_key) monerooSecretKey = s.moneroo_secret_key;
        if (s.moneroo_public_key !== undefined) monerooPublicKey = s.moneroo_public_key || "";
        if (s.exchange_rate_api_key) exchangeRateApiKey = s.exchange_rate_api_key;
        if (s.telegram_link) telegramLink = s.telegram_link;
        if (s.whatsapp_link) whatsappLink = s.whatsapp_link;
        if (s.presentation_video_url) presentationVideoUrl = s.presentation_video_url;
        if (s.presentation_video_path !== undefined) presentationVideoPath = s.presentation_video_path || "";
        if (s.payment_amount) paymentAmount = Number(s.payment_amount);
        if (s.payment_currency) paymentCurrency = s.payment_currency;
        if (s.original_price) originalPrice = Number(s.original_price);
        if (s.promo_price) promoPrice = Number(s.promo_price);
        if (s.is_promo_active !== undefined && s.is_promo_active !== null) isPromoActive = Boolean(s.is_promo_active);
        if (s.smtp_host) smtpHost = s.smtp_host;
        if (s.smtp_port) smtpPort = Number(s.smtp_port);
        if (s.smtp_secure !== undefined && s.smtp_secure !== null) smtpSecure = Boolean(s.smtp_secure);
        if (s.smtp_user) smtpUser = s.smtp_user;
        if (s.smtp_password) smtpPassword = s.smtp_password;
        if (s.sender_name) senderName = s.sender_name;
        if (s.sender_email) senderEmail = s.sender_email;
      }

      const seasonsRes = await pool.query(`SELECT * FROM seasons ORDER BY id ASC`);
      const seasons = seasonsRes.rows.length > 0
        ? seasonsRes.rows.map(r => ({ id: String(r.id), title: r.title, description: r.description }))
        : DEFAULT_SEASONS;

      const episodesRes = await pool.query(`SELECT * FROM episodes ORDER BY created_at ASC`);
      const episodes = episodesRes.rows.map(r => ({
        id: String(r.id),
        seasonId: String(r.season_id),
        title: r.title,
        description: r.description || "",
        videoPath: r.video_path,
        originalName: r.original_name || "",
        duration: r.duration || "",
        createdAt: r.created_at || new Date().toISOString()
      }));

      const codesRes = await pool.query(`SELECT * FROM access_codes ORDER BY created_at DESC`);
      const wdrRes = await pool.query(`SELECT * FROM withdrawals ORDER BY created_at DESC`);
      const wdrMap: Record<string, any[]> = {};
      for (const w of wdrRes.rows) {
        if (!wdrMap[w.code]) wdrMap[w.code] = [];
        wdrMap[w.code].push({
          id: String(w.id),
          amount: Number(w.amount),
          usdtAddress: w.usdt_address || "",
          status: w.status || "pending",
          createdAt: w.created_at || new Date().toISOString()
        });
      }

      const codes = codesRes.rows.map(c => ({
        code: String(c.code),
        referralCode: c.referral_code || "",
        deviceLock: c.device_lock || null,
        isPaid: c.is_paid ?? true,
        createdAt: c.created_at || new Date().toISOString(),
        firstName: c.first_name || "",
        lastName: c.last_name || "",
        email: c.email || "",
        referralBalance: c.referral_balance ? Number(c.referral_balance) : 0,
        referredBy: c.referred_by || null,
        usdtAddress: c.usdt_address || "",
        withdrawals: wdrMap[c.code] || []
      }));

      const pendingRes = await pool.query(`SELECT * FROM pending_payments ORDER BY created_at DESC`);
      const pendingPayments = pendingRes.rows.map(p => ({
        id: String(p.id),
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        referredBy: p.referred_by || undefined,
        status: p.status,
        createdAt: p.created_at || new Date().toISOString(),
        monerooId: p.moneroo_id || "",
        generatedCode: p.generated_code || undefined
      }));

      dbCache = {
        codes: codes.length > 0 ? codes : DEFAULT_DB.codes,
        seasons,
        episodes,
        promoPrice,
        telegramLink,
        whatsappLink,
        adminPassword,
        isPromoActive,
        originalPrice,
        paymentAmount,
        paymentCurrency,
        pendingPayments,
        monerooPublicKey,
        monerooSecretKey,
        exchangeRateApiKey,
        presentationVideoUrl,
        presentationVideoPath,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        senderName,
        senderEmail
      };

      return dbCache;
    } catch (err) {
      console.error("Error loading relational state from Neon Postgres in getDB():", err);
    }
  }
  return readDB();
}

function readDB(): DBState {
  const defaultMonerooKey = ENV_MONEROO_SECRET_KEY;
  const defaultExchangeRateKey = ENV_EXCHANGE_RATE_API_KEY;

  if (dbCache) {
    if (!dbCache.seasons || dbCache.seasons.length === 0) {
      dbCache.seasons = DEFAULT_SEASONS;
    }
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
    let modified = false;
    if (!fs.existsSync(DB_FILE)) {
      db = JSON.parse(JSON.stringify(DEFAULT_DB));
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      } catch (e) {}
    } else {
      const data = fs.readFileSync(DB_FILE, "utf8");
      db = JSON.parse(data);
    }
    
    if (!db.seasons || db.seasons.length === 0) {
      db.seasons = DEFAULT_SEASONS;
    }
    if ((!db.adminPassword || db.adminPassword === "admin") && ENV_ADMIN_PASSWORD) {
      db.adminPassword = ENV_ADMIN_PASSWORD;
      modified = true;
    }
    if (!db.monerooSecretKey) {
      db.monerooSecretKey = defaultMonerooKey;
    }
    if (!db.exchangeRateApiKey) {
      db.exchangeRateApiKey = defaultExchangeRateKey;
    }

    if (!db.codes || !Array.isArray(db.codes)) {
      db.codes = [];
      modified = true;
    }

    const hasMasterCode = !ENV_MASTER_ACCESS_CODE || db.codes.some(c => c.code && c.code.trim().toUpperCase() === ENV_MASTER_ACCESS_CODE.toUpperCase());
    if (!hasMasterCode) {
      db.codes.unshift({
        code: ENV_MASTER_ACCESS_CODE,
        referralCode: "REF-1999-MASTER",
        deviceLock: null,
        isPaid: true,
        createdAt: new Date().toISOString(),
        firstName: "Admin",
        lastName: "Master",
        email: "admin@aiwebacademy.com",
        referralBalance: 0,
        withdrawals: []
      });
      modified = true;
    }

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
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
      } catch (e) {}
    }
    
    dbCache = db;
    return db;
  } catch (err) {
    console.error("Error reading database:", err);
    return DEFAULT_DB;
  }
}

async function writeDB(state: DBState): Promise<void> {
  dbCache = state;
  dbCacheTime = Date.now();
  try {
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Error writing to local database file (ignoring on read-only serverless):", err);
  }

  // Synchronize state to Neon Postgres (both app_state table and individual relational tables)
  if (pool) {
    const jsonStr = JSON.stringify(state);
    try {
      await pool.query(`
        INSERT INTO app_state (id, data, updated_at) VALUES (1, $1, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
      `, [jsonStr]);
      syncToRelationalTables(state).catch(err => {
        console.error("Async syncToRelationalTables error:", err);
      });
      console.log("Successfully persisted state to Neon PostgreSQL app_state.");
    } catch (err) {
      console.error("Failed to sync state to Neon PostgreSQL:", err);
    }
  }
}

// Upload video to Cloudinary
async function uploadToBlobIfNeeded(file: Express.Multer.File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary non configuré. Ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d'environnement Vercel."
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "ai-academy-courses",
      use_filename: true,
      unique_filename: true,
    });
    console.log("Uploaded to Cloudinary:", result.secure_url);
    try { fs.unlinkSync(file.path); } catch (e) {}
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw new Error("L'upload vers Cloudinary a échoué. Vérifiez vos identifiants Cloudinary dans les variables d'environnement.");
  }
}


function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

async function ensurePostgresInit() {
  if (!pool || postgresInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await initPostgres();
        postgresInitialized = true;
      } catch (e) {
        console.error("Error in ensurePostgresInit:", e);
      } finally {
        initPromise = null;
      }
    })();
  }
  await initPromise;
}

// Create Express app and apply body-parsing middleware
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Ensure Neon PostgreSQL is loaded on serverless cold start
app.use(async (req, res, next) => {
  if (pool && !postgresInitialized) {
    await ensurePostgresInit();
  }
  next();
});

// Setup multer for local file uploads
const TMP_UPLOADS_DIR = "/tmp/uploads";
try {
  if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
} catch (e) {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // On serverless (Vercel) the project filesystem is read-only: only /tmp is writable.
    let target = TMP_UPLOADS_DIR;
    try {
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    } catch (e) {
      target = UPLOADS_DIR;
    }
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Middleware to check Admin Access
const checkAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const rawHeader = req.headers["x-admin-password"];
    const password = (Array.isArray(rawHeader) ? rawHeader[0] : rawHeader || "").toString().trim();
    
    if (!password) {
      return res.status(401).json({ error: "Mot de passe administrateur manquant." });
    }

    let dbAdminPass = "";
    try {
      const db = await getDB();
      if (db && db.adminPassword) {
        dbAdminPass = db.adminPassword.toString().trim();
      }
    } catch (dbErr) {
      console.error("Error getting db in checkAdmin:", dbErr);
    }

    const allowed = new Set([dbAdminPass, ENV_ADMIN_PASSWORD].filter(Boolean));

    if (allowed.size === 0) {
      return res.status(503).json({ error: "Aucun mot de passe administrateur n'est configure. Definissez ADMIN_PASSWORD dans les variables d'environnement." });
    }

    if (allowed.has(password)) {
      return next();
    } else {
      return res.status(401).json({ error: "Mot de passe administrateur incorrect" });
    }
  } catch (err) {
    console.error("Error in checkAdmin middleware:", err);
    return res.status(401).json({ error: "Mot de passe administrateur incorrect" });
  }
};

// Helper to verify code with a deviceId
const isCodeValid = async (code: string, deviceId: string): Promise<{ valid: boolean; error?: string }> => {
  const db = await getDB();
  const foundCode = db.codes.find((c) => c.code === code);
  if (!foundCode) {
    return { valid: false, error: "Code d'accès invalide ou inexistant." };
  }
  if (foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
    return { valid: false, error: "Ce code est déjà utilisé par un autre appareil." };
  }
  return { valid: true };
};

// Create Express Router for all API endpoints
const apiRouter = express.Router();

// GET Public Info

// ═══════════════════════════════════════════════════════════════
//  MESSAGERIE PROFESSIONNELLE — envoi automatique des emails
// ═══════════════════════════════════════════════════════════════

const escapeHtml = (value: string): string =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildWelcomeEmail = (params: {
  firstName: string;
  accessCode: string;
  referralCode: string;
  siteUrl: string;
}) => {
  const firstName = escapeHtml(params.firstName) || "Cher étudiant";
  const accessCode = escapeHtml(params.accessCode);
  const referralCode = escapeHtml(params.referralCode);
  const siteUrl = escapeHtml(params.siteUrl);

  const text = [
    `Félicitations ${firstName} !`,
    "",
    "Votre paiement a bien été confirmé et votre accès à vie à AI WEB ACADEMY est désormais actif.",
    "",
    `VOTRE CODE DE SUIVI DE FORMATION : ${params.accessCode}`,
    "",
    "IMPORTANT — Protection anti-partage :",
    "Ce code se verrouille automatiquement sur le premier appareil utilisé pour l'activer",
    "(téléphone ou ordinateur). Il ne pourra plus être utilisé ailleurs.",
    "Ne le partagez avec personne : tout partage entraîne la perte de votre accès.",
    "",
    `VOTRE CODE DE PARRAINAGE : ${params.referralCode}`,
    "Chaque inscription réalisée avec votre code de parrainage vous rapporte 5 $ USDT,",
    "retirables directement depuis votre espace étudiant.",
    "",
    `Accéder à la formation : ${params.siteUrl}`,
    "",
    "À très vite,",
    "L'équipe AI WEB ACADEMY"
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:20px;padding:28px;color:#ffffff;">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.85;">AI Web Academy</p>
      <h1 style="margin:8px 0 0;font-size:24px;">Félicitations ${firstName} !</h1>
      <p style="margin:10px 0 0;font-size:14px;line-height:1.6;opacity:.95;">
        Votre paiement a été confirmé. Votre accès à vie à l'intégralité du cursus est désormais actif.
      </p>
    </div>

    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-top:16px;">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;font-weight:bold;">Votre code de suivi de formation</p>
      <p style="margin:0;font-size:22px;font-weight:bold;letter-spacing:2px;color:#4f46e5;font-family:monospace;">${accessCode}</p>

      <div style="margin-top:20px;background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:16px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#9a3412;">Protection anti-partage</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#7c2d12;">
          Ce code se verrouille <strong>automatiquement</strong> sur le premier appareil utilisé pour l'activer
          (téléphone ou ordinateur) et ne fonctionnera sur aucun autre appareil.
          <strong>Ne le partagez avec personne</strong> : tout partage entraîne la perte définitive de votre accès.
        </p>
      </div>

      <div style="margin-top:16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px;padding:16px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#065f46;">Gagnez 5 $ par parrainage</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#047857;">
          Votre code de parrainage : <strong style="font-family:monospace;">${referralCode}</strong><br />
          Chaque inscription réalisée avec ce code vous rapporte <strong>5 $ USDT</strong>, retirables
          depuis votre espace étudiant.
        </p>
      </div>

      <p style="margin:22px 0 0;text-align:center;">
        <a href="${siteUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 26px;border-radius:12px;">Accéder à ma formation</a>
      </p>
    </div>

    <p style="margin:18px 0 0;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6;">
      Vous recevez cet email suite à votre inscription à AI Web Academy.<br />Merci de conserver ce message en lieu sûr.
    </p>
  </div>
</body></html>`;

  return { text, html };
};

// Envoie un email via la configuration SMTP définie dans l'interface administrateur.
// Ne bloque jamais le flux de paiement : toute erreur est simplement journalisée.
async function sendMail(db: DBState, to: string, subject: string, html: string, text: string): Promise<boolean> {
  const host = (db.smtpHost || process.env.SMTP_HOST || "").trim();
  const user = (db.smtpUser || process.env.SMTP_USER || "").trim();
  const pass = (db.smtpPassword || process.env.SMTP_PASSWORD || "").trim();
  const fromEmail = (db.senderEmail || process.env.SMTP_FROM_EMAIL || user).trim();
  const fromName = (db.senderName || process.env.SMTP_FROM_NAME || "AI Web Academy").trim();
  const port = Number(db.smtpPort || process.env.SMTP_PORT || 587);
  const secure = db.smtpSecure !== undefined ? Boolean(db.smtpSecure) : port === 465;

  if (!host || !user || !pass || !fromEmail || !to) {
    console.warn("Email non envoyé : configuration de la messagerie incomplète.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`Email envoyé avec succès à ${to}`);
    return true;
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email:", err);
    return false;
  }
}

async function sendWelcomeEmail(db: DBState, params: { to: string; firstName: string; accessCode: string; referralCode: string }) {
  if (!params.to) return false;
  const siteUrl = (process.env.APP_URL || "https://ai-web-academy.vercel.app").trim();
  const { html, text } = buildWelcomeEmail({
    firstName: params.firstName,
    accessCode: params.accessCode,
    referralCode: params.referralCode,
    siteUrl
  });
  return sendMail(db, params.to, "Félicitations — voici votre code de suivi de formation", html, text);
}

apiRouter.get("/public-state", async (req, res) => {
  const db = await getDB();
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
    presentationVideoPath: db.presentationVideoPath || "",
    comingSoonEnabled: db.comingSoonEnabled === true,
    comingSoonDate: db.comingSoonDate || "",
    comingSoonMessage: db.comingSoonMessage || "",
    paymentAmount: db.paymentAmount ?? 50,
    paymentCurrency: db.paymentCurrency || "USD",
    originalPrice: db.originalPrice ?? 100,
    promoPrice: db.promoPrice ?? 50,
    isPromoActive: db.isPromoActive ?? true
  });
});

// Verify and register access code
apiRouter.post("/verify-code", async (req, res) => {
  const { code, deviceId } = req.body;
  if (!code || !deviceId) {
    return res.status(400).json({ error: "Code et identifiant d'appareil requis." });
  }

  const db = await getDB();
  const trimmedCode = code.toString().trim().toUpperCase();

  const isMaster = [ENV_MASTER_ACCESS_CODE.toUpperCase(), (db.adminPassword || "").toUpperCase(), ENV_ADMIN_PASSWORD.toUpperCase()].filter(c => c && c !== "ADMIN").includes(trimmedCode);

  let codeIndex = db.codes.findIndex((c) => c.code && c.code.toString().trim().toUpperCase() === trimmedCode);

  if (codeIndex === -1 && isMaster) {
    const newMasterObj = {
      code: code.toString().trim(),
      referralCode: "REF-1999-MASTER",
      deviceLock: null,
      isPaid: true,
      createdAt: new Date().toISOString(),
      firstName: "Admin",
      lastName: "Master",
      email: "admin@aiwebacademy.com",
      referralBalance: 0,
      withdrawals: []
    };
    db.codes.unshift(newMasterObj);
    await writeDB(db);
    codeIndex = 0;
  }

  if (codeIndex === -1) {
    return res.status(400).json({ error: "Code d'accès invalide. Veuillez vérifier votre code." });
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

  if (isMaster) {
    return respondWithProfile("Accès Administrateur / VIP autorisé.");
  }

  if (foundCode.deviceLock === null) {
    foundCode.deviceLock = deviceId;
    db.codes[codeIndex] = foundCode;
    await writeDB(db);
    return respondWithProfile("Code validé et lié à cet appareil !");
  }

  if (foundCode.deviceLock === deviceId) {
    return respondWithProfile("Accès autorisé.");
  }

  return res.status(403).json({
    error: "Sécurité : Ce code d'accès est déjà configuré sur un autre appareil. Un code ne peut servir que sur un seul appareil."
  });
});

// Buy a code (Register user and process payment)
apiRouter.post("/buy-code", async (req, res) => {
  const { firstName, lastName, email, referredBy } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "Le nom, le prénom et l'adresse email sont obligatoires." });
  }

  const db = await getDB();
  
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
  if (referredBy && referredBy.trim()) {
    const cleanRef = referredBy.trim().toUpperCase();
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
  await writeDB(db);

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

// Create Moneroo Payment Session
apiRouter.post("/payments/create-session", async (req, res) => {
  const { firstName, lastName, email, referredBy } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "Le prénom, le nom et l'adresse email sont obligatoires." });
  }

  const db = await getDB();
  const apiKey = db.monerooSecretKey || ENV_MONEROO_SECRET_KEY;
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
  await writeDB(db);

  // Dynamic Currency Conversion (USD to XOF) via ExchangeRate API (with 2.5s timeout)
  const usdAmount = Number(db.paymentAmount) > 0 ? Number(db.paymentAmount) : 50;
  let xofAmount = Math.round(usdAmount * 575); // default fallback (~575 XOF per USD)
  const rateApiKey = db.exchangeRateApiKey || ENV_EXCHANGE_RATE_API_KEY;
  if (rateApiKey) {
    try {
      const rateController = new AbortController();
      const rateTimer = setTimeout(() => rateController.abort(), 2500);
      const rateRes = await fetch(`https://v6.exchangerate-api.com/v6/${rateApiKey}/pair/USD/XOF/${usdAmount}`, {
        signal: rateController.signal
      });
      clearTimeout(rateTimer);
      if (rateRes.ok) {
        const rateData: any = await rateRes.json();
        if (rateData && rateData.conversion_result) {
          xofAmount = Math.round(rateData.conversion_result);
          console.log(`Converted ${usdAmount} USD -> ${xofAmount} XOF (Rate: ${rateData.conversion_rate})`);
        }
      } else {
        console.warn("ExchangeRate API response not OK, using default conversion:", rateRes.status);
      }
    } catch (err) {
      console.warn("ExchangeRate API conversion timeout or error, using fallback XOF amount:", err);
    }
  }

  try {
    const monerooController = new AbortController();
    const monerooTimer = setTimeout(() => monerooController.abort(), 8000);
    const response = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      signal: monerooController.signal,
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
        cancel_url: cancelUrl,
        metadata: {
          paymentId: paymentId
        }
      })
    });
    clearTimeout(monerooTimer);

    const data: any = await response.json();
    console.log("Moneroo Response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Erreur lors de la création de la session de paiement chez Moneroo."
      });
    }

    const monerooId = data.id || (data.data && data.data.id) || "";
    if (monerooId) {
      const dbCurrent = await getDB();
      if (dbCurrent.pendingPayments) {
        const idx = dbCurrent.pendingPayments.findIndex(p => p.id === paymentId);
        if (idx !== -1) {
          dbCurrent.pendingPayments[idx].monerooId = monerooId;
          await writeDB(dbCurrent);
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

// Verify payment status and generate access code if successful
apiRouter.post("/payments/verify", async (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ error: "ID de paiement manquant." });
  }

  const db = await getDB();
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

  const apiKey = db.monerooSecretKey || ENV_MONEROO_SECRET_KEY;
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
    await writeDB(db);

    // Email de félicitations automatique (n'interrompt jamais le paiement)
    await sendWelcomeEmail(db, {
      to: payment.email,
      firstName: payment.firstName,
      accessCode: newCode,
      referralCode: newReferralCode
    });

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

// Moneroo Webhook
apiRouter.post("/payments/webhook", async (req, res) => {
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

  const db = await getDB();
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
    await writeDB(db);

    // Email de félicitations automatique (n'interrompt jamais le webhook)
    await sendWelcomeEmail(db, {
      to: payment.email,
      firstName: payment.firstName,
      accessCode: newCode,
      referralCode: newReferralCode
    });

    console.log(`Webhook generated code ${newCode} successfully.`);
    return res.json({ success: true, message: "Code generated." });
  }

  res.send({ success: true, message: "Webhook received but not approved." });
});

// Admin Update Settings
apiRouter.post("/admin/settings", checkAdmin, async (req, res) => {
  const { monerooSecretKey, monerooPublicKey, exchangeRateApiKey, telegramLink, whatsappLink, presentationVideoUrl, presentationVideoPath, comingSoonEnabled, comingSoonDate, comingSoonMessage, paymentAmount, paymentCurrency, originalPrice, promoPrice, isPromoActive, smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, senderName, senderEmail } = req.body;
  const db = await getDB();
  db.monerooSecretKey = monerooSecretKey ? monerooSecretKey.trim() : "";
  db.monerooPublicKey = monerooPublicKey ? monerooPublicKey.trim() : "";
  if (exchangeRateApiKey !== undefined && exchangeRateApiKey.trim()) db.exchangeRateApiKey = exchangeRateApiKey.trim();
  db.telegramLink = telegramLink ? telegramLink.trim() : "";
  db.whatsappLink = whatsappLink ? whatsappLink.trim() : "";
  db.presentationVideoUrl = presentationVideoUrl ? presentationVideoUrl.trim() : "";
  db.presentationVideoPath = presentationVideoPath !== undefined ? presentationVideoPath.trim() : "";
  if (comingSoonEnabled !== undefined) db.comingSoonEnabled = comingSoonEnabled === true || comingSoonEnabled === "true";
  if (comingSoonDate !== undefined) db.comingSoonDate = String(comingSoonDate || "").trim();
  if (comingSoonMessage !== undefined) db.comingSoonMessage = String(comingSoonMessage || "").trim();
  if (paymentAmount !== undefined && paymentAmount !== "") {
    const parsedAmount = Number(paymentAmount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) db.paymentAmount = parsedAmount;
  }
  if (paymentCurrency !== undefined && paymentCurrency !== "") {
    db.paymentCurrency = String(paymentCurrency).trim().toUpperCase();
  }
  if (originalPrice !== undefined && originalPrice !== "") {
    const parsedOriginal = Number(originalPrice);
    if (!isNaN(parsedOriginal) && parsedOriginal >= 0) db.originalPrice = parsedOriginal;
  }
  if (promoPrice !== undefined && promoPrice !== "") {
    const parsedPromo = Number(promoPrice);
    if (!isNaN(parsedPromo) && parsedPromo >= 0) db.promoPrice = parsedPromo;
  }
  if (isPromoActive !== undefined) {
    db.isPromoActive = isPromoActive === true || isPromoActive === "true";
  }
  // Configuration de la messagerie professionnelle (envoi automatique des emails)
  if (smtpHost !== undefined) db.smtpHost = String(smtpHost || "").trim();
  if (smtpPort !== undefined && smtpPort !== "") {
    const parsedPort = Number(smtpPort);
    if (!isNaN(parsedPort) && parsedPort > 0) db.smtpPort = parsedPort;
  }
  if (smtpSecure !== undefined) db.smtpSecure = smtpSecure === true || smtpSecure === "true";
  if (smtpUser !== undefined) db.smtpUser = String(smtpUser || "").trim();
  if (smtpPassword !== undefined && String(smtpPassword).trim() !== "") db.smtpPassword = String(smtpPassword).trim();
  if (senderName !== undefined) db.senderName = String(senderName || "").trim();
  if (senderEmail !== undefined) db.senderEmail = String(senderEmail || "").trim();
  await writeDB(db);
  res.json({ success: true, message: "Configuration mise à jour avec succès !" });
});

// Get Profile details
apiRouter.post("/profile", async (req, res) => {
  const { code, deviceId } = req.body;
  if (!code || !deviceId) {
    return res.status(400).json({ error: "Code et identifiant d'appareil requis." });
  }

  const db = await getDB();
  const trimmedCode = code.toString().trim().toUpperCase();
  const isMaster = [ENV_MASTER_ACCESS_CODE.toUpperCase(), (db.adminPassword || "").toUpperCase(), ENV_ADMIN_PASSWORD.toUpperCase()].filter(c => c && c !== "ADMIN").includes(trimmedCode);

  let foundCode = db.codes.find(c => c.code && c.code.toString().trim().toUpperCase() === trimmedCode);

  if (!foundCode && isMaster) {
    foundCode = {
      code: code.toString().trim(),
      referralCode: "REF-1999-MASTER",
      deviceLock: null,
      isPaid: true,
      createdAt: new Date().toISOString(),
      firstName: "Admin",
      lastName: "Master",
      email: "admin@aiwebacademy.com",
      referralBalance: 0,
      withdrawals: []
    };
    db.codes.unshift(foundCode);
    await writeDB(db);
  }

  if (!foundCode) {
    return res.status(404).json({ error: "Code d'accès introuvable." });
  }

  if (!isMaster && foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
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

// Student update USDT payout address
apiRouter.post("/update-usdt-address", async (req, res) => {
  const { code, deviceId, usdtAddress } = req.body;
  if (!code || !deviceId || !usdtAddress) {
    return res.status(400).json({ error: "Code, identifiant d'appareil et adresse USDT requis." });
  }

  const db = await getDB();
  const codeIndex = db.codes.findIndex(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());

  if (codeIndex === -1) {
    return res.status(404).json({ error: "Code d'accès introuvable." });
  }

  const foundCode = db.codes[codeIndex];
  if (foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
    return res.status(403).json({ error: "Appareil non autorisé pour modifier cette adresse." });
  }

  foundCode.usdtAddress = usdtAddress.trim();
  db.codes[codeIndex] = foundCode;
  await writeDB(db);

  res.json({
    success: true,
    message: "Adresse USDT enregistrée avec succès !",
    usdtAddress: foundCode.usdtAddress
  });
});

// Student Request USDT Withdrawal
apiRouter.post("/request-withdrawal", async (req, res) => {
  const { code, deviceId, amount } = req.body;
  if (!code || !deviceId || !amount) {
    return res.status(400).json({ error: "Tous les champs sont requis pour la demande de retrait." });
  }

  const db = await getDB();
  const codeIndex = db.codes.findIndex(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());

  if (codeIndex === -1) {
    return res.status(404).json({ error: "Code d'accès introuvable." });
  }

  const foundCode = db.codes[codeIndex];
  if (foundCode.deviceLock && foundCode.deviceLock !== deviceId) {
    return res.status(403).json({ error: "Appareil non autorisé." });
  }

  const withdrawAmount = Number(amount);
  if (isNaN(withdrawAmount) || withdrawAmount < 10) {
    return res.status(400).json({ error: "Le montant minimum de retrait est de $10 USDT." });
  }

  const currentBalance = foundCode.referralBalance || 0;
  if (withdrawAmount > currentBalance) {
    return res.status(400).json({ error: `Solde insuffisant. Votre solde disponible est de $${currentBalance} USDT.` });
  }

  if (!foundCode.usdtAddress || !foundCode.usdtAddress.trim()) {
    return res.status(400).json({ error: "Veuillez d'abord renseigner votre adresse de portefeuille USDT TRC20/BEP20." });
  }

  // Deduct balance and record withdrawal request
  foundCode.referralBalance = currentBalance - withdrawAmount;
  
  if (!foundCode.withdrawals) foundCode.withdrawals = [];
  const newWithdrawal = {
    id: "wdr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
    amount: withdrawAmount,
    usdtAddress: foundCode.usdtAddress,
    status: "pending" as const,
    createdAt: new Date().toISOString()
  };

  foundCode.withdrawals.push(newWithdrawal);
  db.codes[codeIndex] = foundCode;
  await writeDB(db);

  res.json({
    success: true,
    message: "Demande de retrait soumise avec succès ! Elle sera traitée sous 24h à 48h.",
    referralBalance: foundCode.referralBalance,
    withdrawals: foundCode.withdrawals
  });
});

// Admin Data
apiRouter.get("/admin/data", checkAdmin, async (req, res) => {
  const db = await getDB();
  res.json({
    codes: db.codes,
    seasons: db.seasons,
    episodes: db.episodes,
    monerooSecretKey: db.monerooSecretKey || "",
    monerooPublicKey: db.monerooPublicKey || "",
    exchangeRateApiKey: db.exchangeRateApiKey || "",
    telegramLink: db.telegramLink || "https://t.me/ai_academy_fit",
    whatsappLink: db.whatsappLink || "https://wa.me/33600000000",
    presentationVideoUrl: db.presentationVideoUrl || "https://www.youtube.com/embed/8m9g_b95Eto",
    presentationVideoPath: db.presentationVideoPath || "",
    comingSoonEnabled: db.comingSoonEnabled === true,
    comingSoonDate: db.comingSoonDate || "",
    comingSoonMessage: db.comingSoonMessage || "",
    paymentAmount: db.paymentAmount || 50,
    paymentCurrency: db.paymentCurrency || "USD",
    originalPrice: db.originalPrice ?? 100,
    promoPrice: db.promoPrice ?? 50,
    isPromoActive: db.isPromoActive ?? true,
    smtpHost: db.smtpHost || "",
    smtpPort: db.smtpPort ?? 587,
    smtpSecure: db.smtpSecure ?? false,
    smtpUser: db.smtpUser || "",
    smtpPassword: db.smtpPassword || "",
    senderName: db.senderName || "",
    senderEmail: db.senderEmail || "",
    pendingPayments: db.pendingPayments || []
  });
});

// Admin — envoi d'un email de test pour valider la configuration de la messagerie
apiRouter.post("/admin/test-email", checkAdmin, async (req, res) => {
  const { to } = req.body;
  const target = String(to || "").trim();
  if (!target || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)) {
    return res.status(400).json({ error: "Veuillez indiquer une adresse email valide." });
  }
  const db = await getDB();
  const { html, text } = buildWelcomeEmail({
    firstName: "Test",
    accessCode: "IA-TEST-0000",
    referralCode: "REF-TEST-0000",
    siteUrl: (process.env.APP_URL || "https://ai-web-academy.vercel.app").trim()
  });
  const sent = await sendMail(db, target, "[Test] Configuration de la messagerie AI Web Academy", html, text);
  if (!sent) {
    return res.status(500).json({ error: "Envoi impossible. Vérifiez le serveur SMTP, l'identifiant et le mot de passe d'application." });
  }
  res.json({ success: true, message: `Email de test envoyé à ${target}.` });
});

// Admin Change Password
apiRouter.post("/admin/change-password", checkAdmin, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 4 caractères." });
  }
  const db = await getDB();
  db.adminPassword = newPassword;
  await writeDB(db);
  res.json({ success: true, message: "Mot de passe administrateur mis à jour." });
});

// Admin Generate Access Code
apiRouter.post("/admin/generate-code", checkAdmin, async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const db = await getDB();

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let newAccessCode = "IA-";
  for (let i = 0; i < 8; i++) {
    if (i === 4) newAccessCode += "-";
    newAccessCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  let newReferralCode = "REF-";
  for (let i = 0; i < 8; i++) {
    if (i === 4) newReferralCode += "-";
    newReferralCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const newCode: AccessCode = {
    code: newAccessCode,
    referralCode: newReferralCode,
    deviceLock: null,
    isPaid: true,
    createdAt: new Date().toISOString(),
    firstName: firstName ? firstName.trim() : "Étudiant",
    lastName: lastName ? lastName.trim() : "Manuel",
    email: email ? email.trim().toLowerCase() : "manuel@aiwebacademy.com",
    referralBalance: 0,
    withdrawals: []
  };

  db.codes.push(newCode);
  await writeDB(db);

  res.json({ success: true, code: newCode });
});

// Admin Delete Code
apiRouter.delete("/admin/codes/:code", checkAdmin, async (req, res) => {
  const { code } = req.params;
  const db = await getDB();
  db.codes = db.codes.filter(c => c.code !== code);
  await writeDB(db);
  res.json({ success: true, message: "Code d'accès supprimé." });
});

// Admin Reset Device Lock
apiRouter.post("/admin/codes/:code/reset", checkAdmin, async (req, res) => {
  const { code } = req.params;
  const db = await getDB();
  const idx = db.codes.findIndex(c => c.code === code);
  if (idx !== -1) {
    db.codes[idx].deviceLock = null;
    await writeDB(db);
    return res.json({ success: true, message: "L'appareil lié à ce code a été réinitialisé." });
  }
  res.status(404).json({ error: "Code introuvable." });
});

// Admin Update User Profile & Referral Balance
apiRouter.post("/admin/codes/:code/update-profile", checkAdmin, async (req, res) => {
  const { code } = req.params;
  const { firstName, lastName, email, referralBalance, usdtAddress } = req.body;
  const db = await getDB();
  const idx = db.codes.findIndex(c => c.code === code);
  if (idx !== -1) {
    db.codes[idx].firstName = firstName;
    db.codes[idx].lastName = lastName;
    db.codes[idx].email = email;
    db.codes[idx].referralBalance = Number(referralBalance) || 0;
    db.codes[idx].usdtAddress = usdtAddress;
    await writeDB(db);
    return res.json({ success: true, message: "Profil utilisateur mis à jour.", code: db.codes[idx] });
  }
  res.status(404).json({ error: "Code introuvable." });
});

// Admin Mark Withdrawal Completed
apiRouter.post("/admin/codes/:code/withdrawals/:wdrId/complete", checkAdmin, async (req, res) => {
  const { code, wdrId } = req.params;
  const db = await getDB();
  const idx = db.codes.findIndex(c => c.code === code);
  if (idx !== -1) {
    const withdrawals = db.codes[idx].withdrawals || [];
    const wIdx = withdrawals.findIndex(w => w.id === wdrId);
    if (wIdx !== -1) {
      withdrawals[wIdx].status = "completed";
      db.codes[idx].withdrawals = withdrawals;
      await writeDB(db);
      return res.json({ success: true, message: "Demande de retrait marquée comme Payée/Complétée." });
    }
  }
  res.status(404).json({ error: "Demande de retrait introuvable." });
});

// Admin Cancel Withdrawal and Refund Balance
apiRouter.post("/admin/codes/:code/withdrawals/:wdrId/cancel", checkAdmin, async (req, res) => {
  const { code, wdrId } = req.params;
  const db = await getDB();
  const idx = db.codes.findIndex(c => c.code === code);
  if (idx !== -1) {
    const withdrawals = db.codes[idx].withdrawals || [];
    const wObj = withdrawals.find(w => w.id === wdrId);
    if (wObj && wObj.status === "pending") {
      // Refund amount
      db.codes[idx].referralBalance = (db.codes[idx].referralBalance || 0) + wObj.amount;
      db.codes[idx].withdrawals = withdrawals.filter(w => w.id !== wdrId);
      await writeDB(db);
      return res.json({ success: true, message: "Demande annulée et montant remboursé au solde de l'étudiant." });
    }
  }
  res.status(404).json({ error: "Demande introuvable ou déjà traitée." });
});

// Admin Create/Update Season
apiRouter.post("/admin/seasons", checkAdmin, async (req, res) => {
  const { id, title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Titre et description requis." });
  }
  const db = await getDB();
  if (id) {
    const idx = db.seasons.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.seasons[idx] = { id, title, description };
    } else {
      db.seasons.push({ id, title, description });
    }
  } else {
    const newId = String(Date.now());
    db.seasons.push({ id: newId, title, description });
  }
  await writeDB(db);
  res.json({ success: true, seasons: db.seasons });
});

// Admin Delete Season
apiRouter.delete("/admin/seasons/:id", checkAdmin, async (req, res) => {
  const { id } = req.params;
  const db = await getDB();
  db.seasons = db.seasons.filter(s => s.id !== id);
  db.episodes = db.episodes.filter(ep => ep.seasonId !== id);
  await writeDB(db);
  res.json({ success: true, message: "Saison supprimée ainsi que tous ses épisodes." });
});

// Admin: signature for direct browser -> Cloudinary upload.
// Serverless functions cap request bodies at ~4.5 MB, so course videos must NEVER
// transit through this API. The browser uploads straight to Cloudinary with this signature.
apiRouter.post("/admin/cloudinary-signature", checkAdmin, async (req, res) => {
  const config = getCloudinaryConfig();
  if (!config) {
    return res.status(400).json({
      error: "Cloudinary n'est pas configuré. Ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d'environnement Vercel, puis redéployez."
    });
  }

  try {
    const folder = (req.body && req.body.folder) === "presentation"
      ? "ai-academy-presentation"
      : "ai-academy-courses";
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      config.apiSecret
    );

    res.json({
      success: true,
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      timestamp,
      folder,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/video/upload`
    });
  } catch (err: any) {
    console.error("Cloudinary signature error:", err);
    res.status(500).json({ error: "Impossible de générer la signature Cloudinary: " + (err.message || "") });
  }
});

// Admin Create Episode (Cloudinary URL, or small file fallback)
apiRouter.post("/admin/episodes", checkAdmin, upload.single("videoFile"), async (req, res) => {
  try {
  const { seasonId, title, description, videoUrl, duration } = req.body;
  
  if (!seasonId || !title) {
    return res.status(400).json({ error: "Saison et titre sont obligatoires." });
  }

  let finalVideoPath = "";
  let originalName = "";

  if (videoUrl && String(videoUrl).trim()) {
    finalVideoPath = String(videoUrl).trim();
    originalName = (req.body.originalName && String(req.body.originalName).trim()) || "Vidéo Cloudinary";
  } else if (req.file) {
    originalName = req.file.originalname;
    finalVideoPath = await uploadToBlobIfNeeded(req.file);
  } else {
    return res.status(400).json({ error: "Veuillez uploader un fichier vidéo ou fournir une URL." });
  }

  const db = await getDB();
  const newEpisode: Episode = {
    id: String(Date.now()),
    seasonId,
    title: title.trim(),
    description: description ? description.trim() : "",
    videoPath: finalVideoPath,
    originalName,
    duration: duration ? duration.trim() : undefined,
    createdAt: new Date().toISOString()
  };

  db.episodes.push(newEpisode);
  await writeDB(db);

  res.json({ success: true, episode: newEpisode });
  } catch (err: any) {
    console.error("Create episode failed:", err);
    res.status(500).json({ error: err?.message || "Erreur lors de l'enregistrement de l'épisode." });
  }
});

// Admin Delete Episode
apiRouter.delete("/admin/episodes/:id", checkAdmin, async (req, res) => {
  const { id } = req.params;
  const db = await getDB();
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
    await writeDB(db);
    return res.json({ success: true, message: "Épisode et fichier vidéo supprimés." });
  }
  res.status(404).json({ error: "Épisode introuvable." });
});

// Admin upload custom presentation video
apiRouter.post("/admin/presentation-video", checkAdmin, upload.single("videoFile"), async (req, res) => {
  const providedUrl = req.body && req.body.videoUrl ? String(req.body.videoUrl).trim() : "";
  if (!req.file && !providedUrl) {
    return res.status(400).json({ error: "Fichier vidéo manquant." });
  }
  try {
    const finalVideoPath = providedUrl || await uploadToBlobIfNeeded(req.file as Express.Multer.File);
    const db = await getDB();
    db.presentationVideoPath = finalVideoPath;
    await writeDB(db);
    res.json({ success: true, presentationVideoPath: finalVideoPath });
  } catch (err) {
    console.error("Error setting presentation video:", err);
    res.status(500).json({ error: (err as any)?.message || "Erreur lors du traitement de la vidéo de présentation." });
  }
});

// Public stream for presentation video
apiRouter.get("/public-video/:filename", async (req, res) => {
  const { filename } = req.params;
  
  const db = await getDB();
  const currentPath = db.presentationVideoPath || "";
  const isMatch = currentPath === filename || path.basename(currentPath) === filename || currentPath.includes(filename);

  if (!isMatch) {
    return res.status(403).send("Accès refusé. Cette vidéo n'est pas configurée comme vidéo de présentation.");
  }

    // If stored as a Vercel Blob URL, redirect directly
  if (currentPath.startsWith("https://")) {
    return res.redirect(302, currentPath);
  }

  const targetFilename = path.basename(currentPath) || filename;
  const videoFilePath = path.join(UPLOADS_DIR, targetFilename);
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

// Proxy Stream for Cloud-Stored Videos
apiRouter.get("/videos/proxy", async (req, res) => {
  const { url, code, deviceId } = req.query;

  if (!url || !code || !deviceId) {
    return res.status(401).json({ error: "Paramètres manquants pour lire la vidéo." });
  }

  const verification = await isCodeValid(code as string, deviceId as string);
  if (!verification.valid) {
    return res.status(403).json({ error: verification.error });
  }

  const targetUrl = decodeURIComponent(url as string);

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

// Stream Local Video
apiRouter.get("/videos/:filename", async (req, res) => {
  const { filename } = req.params;
  const { code, deviceId } = req.query;

  if (!code || !deviceId) {
    return res.status(401).json({ error: "Veuillez fournir votre code d'accès et identifiant pour lire la vidéo." });
  }

  const verification = await isCodeValid(code as string, deviceId as string);
  if (!verification.valid) {
    return res.status(403).json({ error: verification.error });
  }

  // If stored as a Vercel Blob URL, proxy or redirect
  if (filename.startsWith("http")) {
    const decodedUrl = decodeURIComponent(filename);
    return res.redirect(302, decodedUrl);
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

const serveStaticImage = (req: express.Request, res: express.Response) => {
  const rawFilename = path.basename(req.params.filename);
  // Clean filename by removing hash if present (e.g., logo-qHwtCQbA.jpg -> logo.jpg)
  const unhashedFilename = rawFilename.replace(/-[a-zA-Z0-9_-]{8,}\./, ".");

  const filenamesToTry = [rawFilename, unhashedFilename];
  const possibleDirs = [
    path.join(process.cwd(), "dist", "assets", "images"),
    path.join(process.cwd(), "dist", "assets"),
    path.join(process.cwd(), "public", "assets", "images"),
    path.join(process.cwd(), "public", "assets"),
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), "src", "assets", "images"),
    path.join(process.cwd(), "src", "assets")
  ];

  for (const fname of filenamesToTry) {
    for (const dirPath of possibleDirs) {
      const filePath = path.join(dirPath, fname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(fname).toLowerCase();
        let contentType = "image/jpeg";
        if (ext === ".png") contentType = "image/png";
        if (ext === ".svg") contentType = "image/svg+xml";
        if (ext === ".ico") contentType = "image/x-icon";
        if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        if (ext === ".webp") contentType = "image/webp";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.sendFile(filePath);
      }
    }
  }
  return res.status(404).send("Image introuvable.");
};

apiRouter.get("/assets/images/:filename", serveStaticImage);
apiRouter.get("/assets/:filename", serveStaticImage);
apiRouter.get("/public/assets/images/:filename", serveStaticImage);
apiRouter.get("/assets/*", (req: any, res: any) => {
  req.params.filename = path.basename(req.path);
  return serveStaticImage(req, res);
});

// Static assets mounts (order matters: dist/assets first for built bundles)
app.use("/assets", express.static(path.join(process.cwd(), "dist", "assets")));
app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));
app.use("/assets", express.static(path.join(process.cwd(), "src", "assets")));
app.use("/uploads", express.static(UPLOADS_DIR));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "dist")));

app.get("/assets/*", (req: any, res: any) => {
  req.params.filename = path.basename(req.path);
  return serveStaticImage(req, res);
});
app.get("/uploads/*", (req, res) => {
  const filename = path.basename(req.path);
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).send("Upload introuvable.");
});

// Mount apiRouter on both /api and / to handle Vercel rewrites seamlessly
app.use("/api", apiRouter);
app.use("/", apiRouter);

async function startServer() {
  const isServerless = !!(process.env.VERCEL || process.env.LAMBDA_RUNTIME_API);
  if (isServerless) return;
  await initPostgres();
  const PORT = 3000;

  // Vite development integration or Production static server
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

  if (process.env.NODE_ENV !== "production" || process.env.RUN_SERVER) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
