import {
  createSubject,
  deleteSubject,
  getBriefSubjects,
  getSubjects,
  getSubjectsBySchoolId,
} from "@/controllers/subjects";
import express from "express";
const subjectRouter = express.Router();

subjectRouter.post("/subjects", createSubject);
subjectRouter.get("/subjects", getSubjects);
subjectRouter.get("/subjects/school/:schoolId", getSubjectsBySchoolId);
subjectRouter.delete("/subjects/:id", deleteSubject);
subjectRouter.get("/subjects/brief/:schoolId", getBriefSubjects);
// subjectRouter.get("/customers/:id", getCustomerById);
// subjectRouter.get("/api/v2/customers", getV2Customers);

export default subjectRouter;
