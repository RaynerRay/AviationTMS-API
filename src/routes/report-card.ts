import { createExam, getExamsByAcademicYear } from "@/controllers/exams";
import { getReportCards } from "@/controllers/report-cards";

import express from "express";
const reportCardRouter = express.Router();

reportCardRouter.get("/reports/:classId", getReportCards);

export default reportCardRouter;
