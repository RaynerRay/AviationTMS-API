import {
  createGuardian,
  // createMarkSheetAndFetchStudents,
  createStudent,
  getBriefStudentsBySchoolId,
  getNextStudentSequence,
  getStudentById,
  getStudentByUserId,
  getStudents,
  getStudentsByClass,
  getStudentsByParentId,
  getStudentsBySchoolId,
  updateGuardian,
} from "@/controllers/students";
import express from "express";
const studentRouter = express.Router();

studentRouter.post("/guardians", createGuardian);
studentRouter.post("/students", createStudent);
studentRouter.get("/students", getStudents);
studentRouter.get("/students/school/:schoolId", getStudentsBySchoolId);
studentRouter.get(
  "/students/school/brief/:schoolId",
  getBriefStudentsBySchoolId
);

// studentRouter.post("/students/class", createMarkSheetAndFetchStudents);

studentRouter.get("/students-by-class/school/:schoolId", getStudentsByClass);
studentRouter.get("/students/parent/:parentId", getStudentsByParentId);
studentRouter.get("/students/seq/:schoolId", getNextStudentSequence);
studentRouter.get("/students/:id", getStudentById);
studentRouter.get("/students/user/:userId", getStudentByUserId);
studentRouter.put("/guardians/:id", updateGuardian);
// studentRouter.get("/api/v2/customers", getV2Customers);

export default studentRouter;
