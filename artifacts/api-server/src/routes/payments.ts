import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable } from "@workspace/db";
import {
  ListPaymentsQueryParams,
  CreatePaymentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/payments", async (req, res): Promise<void> => {
  const params = ListPaymentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = params.data.jobId
    ? await db.select().from(paymentsTable).where(eq(paymentsTable.jobId, params.data.jobId))
    : await db.select().from(paymentsTable);
  res.json(rows);
});

router.post("/payments", async (req, res): Promise<void> => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [payment] = await db.insert(paymentsTable).values(parsed.data).returning();
  res.status(201).json(payment);
});

export default router;
