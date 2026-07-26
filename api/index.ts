import type { Request, Response } from "express";
import app from "./_server.js";

export default function handler(req: Request, res: Response) {
  return app(req as any, res as any);
}
