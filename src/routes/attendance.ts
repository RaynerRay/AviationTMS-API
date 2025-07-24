import {
  createAttendance,
  getAttendanceByStreamId,
  getStudentAttendanceByDate,
} from "@/controllers/attendances";
import {
  createSubject,
  deleteSubject,
  getBriefSubjects,
  getSubjects,
  getSubjectsBySchoolId,
} from "@/controllers/subjects";
import express from "express";
const attendanceRouter = express.Router();

attendanceRouter.post("/attendance", createAttendance);
attendanceRouter.get("/attendance/:streamId", getAttendanceByStreamId);
attendanceRouter.get(
  "/attendance/student/:studentId",
  getStudentAttendanceByDate
);

export default attendanceRouter;
