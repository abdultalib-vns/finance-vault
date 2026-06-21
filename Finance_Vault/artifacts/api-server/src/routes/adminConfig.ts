import { Router } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const router = Router();

// Store config next to the built output so it survives restarts
const CONFIG_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "admin-config.json",
);

interface AdminConfig {
  cardTemplates: unknown[];
  popupAds: unknown[];
  themeSettings: Record<string, unknown> | null;
}

function readConfig(): AdminConfig {
  try {
    if (!existsSync(CONFIG_PATH)) {
      return { cardTemplates: [], popupAds: [], themeSettings: null };
    }
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as AdminConfig;
  } catch {
    return { cardTemplates: [], popupAds: [], themeSettings: null };
  }
}

function writeConfig(cfg: AdminConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
}

// GET /api/admin/config — fetch all shared admin config
router.get("/admin/config", (_req, res) => {
  res.json(readConfig());
});

// POST /api/admin/config — update one or more sections
router.post("/admin/config", (req, res) => {
  const body = req.body as Partial<AdminConfig>;
  const current = readConfig();

  if (Array.isArray(body.cardTemplates)) current.cardTemplates = body.cardTemplates;
  if (Array.isArray(body.popupAds))      current.popupAds      = body.popupAds;
  if (body.themeSettings != null)        current.themeSettings  = body.themeSettings as Record<string, unknown>;

  writeConfig(current);
  res.json({ ok: true });
});

export default router;
