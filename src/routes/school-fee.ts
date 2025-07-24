import {
  createSchoolFee,
  getSchoolFees,
  getSchoolFeesByClass,
} from "@/controllers/schoolFees";
import express from "express";
const schoolFeeRouter = express.Router();

schoolFeeRouter.post("/school-fees", createSchoolFee);
schoolFeeRouter.get("/school-fees/:schoolId", getSchoolFees);
schoolFeeRouter.get("/school-fees/class/:schoolId", getSchoolFeesByClass);
// schoolFeeRouter.get("/customers/:id", getCustomerById);
// schoolFeeRouter.get("/api/v2/customers", getV2Customers);

export default schoolFeeRouter;
