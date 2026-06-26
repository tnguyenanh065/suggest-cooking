import { Router } from "express";
import { db, dishesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListDishesResponse,
  CreateDishBody,
  CreateDishResponse,
  UpdateDishBody,
  UpdateDishResponse,
  SyncDishesResponse,
} from "@workspace/api-zod";

const router = Router();

const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1tA0aowjseNHY2HhgPED7xTjemnqWA9R1wj4E-c3rv_8/export?format=csv&gid=0";

function parseBoolean(val: string): boolean {
  return val.trim().toUpperCase() === "TRUE";
}

async function fetchDishesFromSheets() {
  const res = await fetch(SHEETS_CSV_URL);
  if (!res.ok) throw new Error("Failed to fetch Google Sheets CSV");
  const text = await res.text();
  const lines = text.split("\n");

  const parsed: Array<{
    stt: number;
    ten: string;
    thit: string;
    canTrung: boolean;
    canRauCu: boolean;
    canBot: boolean;
    canSua: boolean;
    canGiVi: boolean;
    thoiGian: string;
    khongNenAn: string;
  }> = [];

  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(",");
    const stt = parseInt(cols[1]?.trim(), 10);
    if (isNaN(stt)) continue;
    parsed.push({
      stt,
      ten: cols[2]?.trim() || "",
      thit: cols[3]?.trim() || "",
      canTrung: parseBoolean(cols[4] || ""),
      canRauCu: parseBoolean(cols[5] || ""),
      canBot: parseBoolean(cols[6] || ""),
      canSua: parseBoolean(cols[7] || ""),
      canGiVi: parseBoolean(cols[8] || ""),
      thoiGian: cols[9]?.trim() || "",
      khongNenAn: cols[10]?.trim() || "",
    });
  }
  return parsed;
}

router.get("/dishes", async (req, res) => {
  const dishes = await db.select().from(dishesTable).orderBy(dishesTable.stt);
  const parsed = ListDishesResponse.parse(
    dishes.map((d) => ({ ...d, createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString() }))
  );
  res.json(parsed);
});

router.post("/dishes/sync", async (req, res) => {
  const sheetDishes = await fetchDishesFromSheets();

  await db.delete(dishesTable);
  if (sheetDishes.length > 0) {
    await db.insert(dishesTable).values(sheetDishes);
  }

  const result = SyncDishesResponse.parse({
    synced: sheetDishes.length,
    message: `Đã đồng bộ ${sheetDishes.length} món từ Google Sheets`,
  });
  res.json(result);
});

router.post("/dishes", async (req, res) => {
  const body = CreateDishBody.parse(req.body);
  const [created] = await db.insert(dishesTable).values(body).returning();
  const result = CreateDishResponse.parse({
    ...created,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  });
  res.status(201).json(result);
});

router.put("/dishes/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = UpdateDishBody.parse(req.body);
  const [updated] = await db.update(dishesTable).set(body).where(eq(dishesTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Không tìm thấy món ăn" });
    return;
  }
  const result = UpdateDishResponse.parse({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
  res.json(result);
});

router.delete("/dishes/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(dishesTable).where(eq(dishesTable.id, id));
  res.status(204).send();
});

export default router;
