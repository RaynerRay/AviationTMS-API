import { createExam, getExamsByAcademicYear } from "@/controllers/exams";

import express from "express";
const examRouter = express.Router();

examRouter.post("/exams", createExam);
examRouter.get("/exams/:schoolId", getExamsByAcademicYear);

export default examRouter;
