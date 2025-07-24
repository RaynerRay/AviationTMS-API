import {
  assignClassTeacher,
  createClass,
  createStream,
  getBriefClasses,
  getClasses,
  getClassesBySchoolId,
  getStreams,
} from "@/controllers/classes";
import { createSchool, getSchools } from "@/controllers/schools";
import express from "express";
const classRouter = express.Router();

classRouter.post("/classes", createClass);
classRouter.get("/classes", getClasses);
classRouter.get("/classes/school/:schoolId", getClassesBySchoolId);
classRouter.put("/classes/teacher/:classId", assignClassTeacher);
classRouter.get("/classes/brief/:schoolId", getBriefClasses);
classRouter.post("/streams", createStream);
classRouter.get("/streams", getStreams);
// classRouter.get("/customers/:id", getCustomerById);
// classRouter.get("/api/v2/customers", getV2Customers);

export default classRouter;
