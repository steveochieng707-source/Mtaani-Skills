import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, reviewsTable, usersTable } from "@workspace/db";
import {
  ListReviewsQueryParams,
  CreateReviewBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichReview(review: typeof reviewsTable.$inferSelect) {
  const [customer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, review.customerId));
  return { ...review, customerName: customer?.name ?? null };
}

router.get("/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.fundiId !== undefined) conditions.push(eq(reviewsTable.fundiId, params.data.fundiId));
  if (params.data.jobId !== undefined) conditions.push(eq(reviewsTable.jobId, params.data.jobId));

  const rows = await db
    .select()
    .from(reviewsTable)
    .where(conditions.length ? and(...conditions) : undefined);

  const enriched = await Promise.all(rows.map(enrichReview));
  res.json(enriched);
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [review] = await db.insert(reviewsTable).values(parsed.data).returning();
  res.status(201).json(await enrichReview(review));
});

export default router;
