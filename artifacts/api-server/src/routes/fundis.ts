import { Router, type IRouter } from "express";
import { eq, avg, count, and, sql } from "drizzle-orm";
import { db, fundisTable, usersTable, reviewsTable, jobsTable } from "@workspace/db";
import {
  ListFundisQueryParams,
  CreateFundiBody,
  GetFundiParams,
  UpdateFundiParams,
  UpdateFundiBody,
  VerifyFundiParams,
  VerifyFundiBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Helper: enrich fundi with user name, avg rating, totals
async function enrichFundi(fundi: typeof fundisTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, fundi.userId));
  const [ratingRow] = await db
    .select({ avg: avg(reviewsTable.rating), total: count(reviewsTable.id) })
    .from(reviewsTable)
    .where(eq(reviewsTable.fundiId, fundi.id));
  const [jobsRow] = await db
    .select({ completed: count(jobsTable.id) })
    .from(jobsTable)
    .where(and(eq(jobsTable.fundiId, fundi.id), eq(jobsTable.status, "completed")));
  return {
    ...fundi,
    userName: user?.name ?? null,
    userPhone: user?.phone ?? null,
    averageRating: ratingRow?.avg ? Number(ratingRow.avg) : null,
    totalReviews: Number(ratingRow?.total ?? 0),
    completedJobs: Number(jobsRow?.completed ?? 0),
  };
}

router.get("/fundis", async (req, res): Promise<void> => {
  const params = ListFundisQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.verified !== undefined) {
    conditions.push(eq(fundisTable.verified, params.data.verified));
  }
  if (params.data.available !== undefined) {
    conditions.push(eq(fundisTable.available, params.data.available));
  }

  let rows = await db
    .select()
    .from(fundisTable)
    .where(conditions.length ? and(...conditions) : undefined);

  // Filter by skill (array contains)
  if (params.data.skill) {
    const skillLower = params.data.skill.toLowerCase();
    rows = rows.filter((f) => f.skills.some((s) => s.toLowerCase().includes(skillLower)));
  }
  // Filter by location
  if (params.data.location) {
    const locLower = params.data.location.toLowerCase();
    rows = rows.filter((f) => f.location.toLowerCase().includes(locLower));
  }

  const enriched = await Promise.all(rows.map(enrichFundi));
  res.json(enriched);
});

router.post("/fundis", async (req, res): Promise<void> => {
  const parsed = CreateFundiBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [fundi] = await db.insert(fundisTable).values(parsed.data).returning();
  res.status(201).json(await enrichFundi(fundi));
});

router.get("/fundis/:id", async (req, res): Promise<void> => {
  const params = GetFundiParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [fundi] = await db.select().from(fundisTable).where(eq(fundisTable.id, params.data.id));
  if (!fundi) {
    res.status(404).json({ error: "Fundi not found" });
    return;
  }
  res.json(await enrichFundi(fundi));
});

router.patch("/fundis/:id", async (req, res): Promise<void> => {
  const params = UpdateFundiParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateFundiBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [fundi] = await db
    .update(fundisTable)
    .set(body.data)
    .where(eq(fundisTable.id, params.data.id))
    .returning();
  if (!fundi) {
    res.status(404).json({ error: "Fundi not found" });
    return;
  }
  res.json(await enrichFundi(fundi));
});

router.patch("/fundis/:id/verify", async (req, res): Promise<void> => {
  const params = VerifyFundiParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = VerifyFundiBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [fundi] = await db
    .update(fundisTable)
    .set({ verified: body.data.verified })
    .where(eq(fundisTable.id, params.data.id))
    .returning();
  if (!fundi) {
    res.status(404).json({ error: "Fundi not found" });
    return;
  }
  res.json(await enrichFundi(fundi));
});

export default router;
