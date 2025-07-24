import { createFeePayment, getPaymentsByYear } from "@/controllers/payments";
import {
  createPeriod,
  getPeriodsByYear,
  getPeriodsGroupedByYear,
} from "@/controllers/periods";
import express from "express";
const paymentRouter = express.Router();

paymentRouter.post("/payments", createFeePayment);
paymentRouter.get("/payments/:schoolId", getPaymentsByYear);
paymentRouter.get("/periods/grouped/:schoolId", getPeriodsGroupedByYear);

export default paymentRouter;
