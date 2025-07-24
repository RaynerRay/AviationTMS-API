
import { createUserLog, getLogsBySchoolId } from "@/controllers/user-logs";
import express from "express";
const userLogRouter = express.Router();

userLogRouter.post("/logs", createUserLog);
userLogRouter.get("/logs/school/:schoolId", getLogsBySchoolId);

export default userLogRouter;
