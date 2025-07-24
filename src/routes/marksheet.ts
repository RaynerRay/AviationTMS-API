import { createExam, getExamsByAcademicYear } from "@/controllers/exams";
import {
  createMarkSheet,
  getSubjectMarkSheet,
  updateMarkSheetWithMarks,
} from "@/controllers/mark-sheet";

import express from "express";
const markSheetRouter = express.Router();

markSheetRouter.post("/mark-sheet", createMarkSheet);
markSheetRouter.put("/mark-sheet/:markSheetId", updateMarkSheetWithMarks);
markSheetRouter.get("/mark-sheet/subject/:subjectId", getSubjectMarkSheet);

export default markSheetRouter;
