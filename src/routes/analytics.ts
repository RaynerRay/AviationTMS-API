import { createContact, getContacts } from "@/controllers/admin";
import {
  getAnalyticsBySchoolId,
  getPublicStats,
  getTeachersAnalytics,
} from "@/controllers/analytics";
import { createSchool, getSchools } from "@/controllers/schools";
import express from "express";
const analyticsRouter = express.Router();

// analyticsRouter.post("/contacts", createContact);
analyticsRouter.get("/analytics/:schoolId", getAnalyticsBySchoolId);
analyticsRouter.get("/analytics/teachers/:schoolId", getTeachersAnalytics);
analyticsRouter.get("/analytics/public", getPublicStats);
// analyticsRouter.get("/customers/:id", getCustomerById);
// analyticsRouter.get("/api/v2/customers", getV2Customers);

export default analyticsRouter;
