import {
  createPeriod,
  getPeriodsByYear,
  getPeriodsGroupedByYear,
} from "@/controllers/periods";
import {
  createStudentDocuments,
  deleteDocument,
  getStudentDocs,
} from "@/controllers/student-documents";

import express from "express";
const stdDocRouter = express.Router();

stdDocRouter.post("/student-docs", createStudentDocuments);
stdDocRouter.get("/student-docs/:studentId", getStudentDocs);
stdDocRouter.delete("/student-docs/:id", deleteDocument);

export default stdDocRouter;
