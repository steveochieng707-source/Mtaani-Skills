import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import fundisRouter from "./fundis";
import jobsRouter from "./jobs";
import paymentsRouter from "./payments";
import reviewsRouter from "./reviews";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(fundisRouter);
router.use(jobsRouter);
router.use(paymentsRouter);
router.use(reviewsRouter);
router.use(dashboardRouter);

export default router;
