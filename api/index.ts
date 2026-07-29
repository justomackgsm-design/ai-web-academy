import type { Request, Response } from "express";
// Import TypeScript source directly — Vercel compiles it natively, no esbuild cache
import app from "../server.js";

export default function handler(req: Request, res: Response) {
  return (app as any)(req, res);
}
