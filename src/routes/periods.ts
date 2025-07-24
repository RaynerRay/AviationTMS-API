import {
  createPeriod,
  getPeriodsByYear,
  getPeriodsGroupedByYear,
  updatePeriodById,
} from "@/controllers/periods";
import express from "express";
const periodRouter = express.Router();

periodRouter.post("/periods", createPeriod);
periodRouter.patch("/periods/:id", updatePeriodById);
periodRouter.get("/periods/:schoolId", getPeriodsByYear);
periodRouter.get("/periods/grouped/:schoolId", getPeriodsGroupedByYear);

export default periodRouter;
