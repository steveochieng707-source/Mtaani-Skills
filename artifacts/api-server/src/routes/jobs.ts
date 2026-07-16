import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, jobsTable, usersTable, paymentsTable } from "@workspace/db";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  UpdateJobParams,
  UpdateJobBody,
  ReleaseJobPaymentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichJob(job: typeof jobsTable.$inferSelect) {
  const [customer] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.customerId));
  const [fundiUser] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.fundiId));
  return {
    ...job,
    customerName: customer?.name ?? null,
    fundiName: fundiUser?.name ?? null,
    completedAt: job.completedAt ? job.completedAt.toISOString() : null,
  };
}

router.get("/jobs", async (req, res): Promise<void> => {
  const params = ListJobsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.customerId !== undefined) conditions.push(eq(jobsTable.customerId, params.data.customerId));
  if (params.data.fundiId !== undefined) conditions.push(eq(jobsTable.fundiId, params.data.fundiId));
  if (params.data.status) conditions.push(eq(jobsTable.status, params.data.status));

  const rows = await db
    .select()
    .from(jobsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(jobsTable.createdAt));

  const enriched = await Promise.all(rows.map(enrichJob));
  res.json(enriched);
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const commission = parsed.data.agreedPrice * 0.1;
  const [job] = await db.insert(jobsTable).values({ ...parsed.data, commissionAmount: commission }).returning();
  res.status(201).json(await enrichJob(job));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(await enrichJob(job));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateJobBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...body.data };
  if (body.data.status === "completed") {
    updateData.completedAt = new Date();
  }

  const [job] = await db
    .update(jobsTable)
    .set(updateData)
    .where(eq(jobsTable.id, params.data.id))
    .returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(await enrichJob(job));
});

router.post("/jobs/:id/release-payment", async (req, res): Promise<void> => {
  const params = ReleaseJobPaymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (job.status !== "completed") {
    res.status(400).json({ error: "Job must be completed before releasing payment" });
    return;
  }

  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(and(eq(paymentsTable.jobId, params.data.id), eq(paymentsTable.status, "escrow")));
  if (!payment) {
    res.status(400).json({ error: "No escrow payment found for this job" });
    return;
  }

  const commission = payment.amount * 0.1;
  const fundiAmount = payment.amount - commission;

  const [released] = await db
    .update(paymentsTable)
    .set({ status: "released", commissionAmount: commission, fundiAmount })
    .where(eq(paymentsTable.id, payment.id))
    .returning();

  res.json(released);
});

export default router;
