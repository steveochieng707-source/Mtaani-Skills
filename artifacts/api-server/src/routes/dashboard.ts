import { Router, type IRouter } from "express";
import { eq, count, sum, desc } from "drizzle-orm";
import { db, usersTable, fundisTable, jobsTable, paymentsTable } from "@workspace/db";
import { GetRecentJobsQueryParams, GetTopFundisQueryParams } from "@workspace/api-zod";
import { avg } from "drizzle-orm";
import { reviewsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [totalFundisRow] = await db.select({ c: count() }).from(fundisTable);
  const [verifiedFundisRow] = await db.select({ c: count() }).from(fundisTable).where(eq(fundisTable.verified, true));
  const [pendingRow] = await db.select({ c: count() }).from(fundisTable).where(eq(fundisTable.verified, false));
  const [totalJobsRow] = await db.select({ c: count() }).from(jobsTable);
  const [activeJobsRow] = await db.select({ c: count() }).from(jobsTable).where(eq(jobsTable.status, "in_progress"));
  const [completedJobsRow] = await db.select({ c: count() }).from(jobsTable).where(eq(jobsTable.status, "completed"));
  const [revenueRow] = await db.select({ s: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "released"));
  const [commissionRow] = await db.select({ s: sum(paymentsTable.commissionAmount) }).from(paymentsTable).where(eq(paymentsTable.status, "released"));
  const [totalCustomersRow] = await db.select({ c: count() }).from(usersTable).where(eq(usersTable.role, "customer"));

  res.json({
    totalFundis: Number(totalFundisRow?.c ?? 0),
    verifiedFundis: Number(verifiedFundisRow?.c ?? 0),
    pendingVerifications: Number(pendingRow?.c ?? 0),
    totalJobs: Number(totalJobsRow?.c ?? 0),
    activeJobs: Number(activeJobsRow?.c ?? 0),
    completedJobs: Number(completedJobsRow?.c ?? 0),
    totalRevenue: Number(revenueRow?.s ?? 0),
    commissionEarned: Number(commissionRow?.s ?? 0),
    totalCustomers: Number(totalCustomersRow?.c ?? 0),
  });
});

router.get("/dashboard/recent-jobs", async (req, res): Promise<void> => {
  const params = GetRecentJobsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const limit = params.data.limit ?? 10;
  const rows = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(limit);

  const enriched = await Promise.all(
    rows.map(async (job) => {
      const [customer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.customerId));
      const [fundiUser] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.fundiId));
      return {
        ...job,
        customerName: customer?.name ?? null,
        fundiName: fundiUser?.name ?? null,
        completedAt: job.completedAt ? job.completedAt.toISOString() : null,
      };
    })
  );
  res.json(enriched);
});

router.get("/dashboard/top-fundis", async (req, res): Promise<void> => {
  const params = GetTopFundisQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const limit = params.data.limit ?? 6;
  const rows = await db.select().from(fundisTable).where(eq(fundisTable.verified, true)).limit(50);

  const enriched = await Promise.all(
    rows.map(async (fundi) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, fundi.userId));
      const [ratingRow] = await db
        .select({ avg: avg(reviewsTable.rating), total: count(reviewsTable.id) })
        .from(reviewsTable)
        .where(eq(reviewsTable.fundiId, fundi.id));
      const [jobsRow] = await db
        .select({ completed: count(jobsTable.id) })
        .from(jobsTable)
        .where(eq(jobsTable.fundiId, fundi.id));
      return {
        ...fundi,
        userName: user?.name ?? null,
        userPhone: user?.phone ?? null,
        averageRating: ratingRow?.avg ? Number(ratingRow.avg) : null,
        totalReviews: Number(ratingRow?.total ?? 0),
        completedJobs: Number(jobsRow?.completed ?? 0),
      };
    })
  );

  // Sort by rating desc, slice to limit
  enriched.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
  res.json(enriched.slice(0, limit));
});

router.get("/dashboard/pending-verifications", async (_req, res): Promise<void> => {
  const rows = await db.select().from(fundisTable).where(eq(fundisTable.verified, false));
  const enriched = await Promise.all(
    rows.map(async (fundi) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, fundi.userId));
      const [ratingRow] = await db
        .select({ avg: avg(reviewsTable.rating), total: count(reviewsTable.id) })
        .from(reviewsTable)
        .where(eq(reviewsTable.fundiId, fundi.id));
      const [jobsRow] = await db
        .select({ completed: count(jobsTable.id) })
        .from(jobsTable)
        .where(eq(jobsTable.fundiId, fundi.id));
      return {
        ...fundi,
        userName: user?.name ?? null,
        userPhone: user?.phone ?? null,
        averageRating: ratingRow?.avg ? Number(ratingRow.avg) : null,
        totalReviews: Number(ratingRow?.total ?? 0),
        completedJobs: Number(jobsRow?.completed ?? 0),
      };
    })
  );
  res.json(enriched);
});

export default router;
