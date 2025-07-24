import { Request, Response } from "express";
import express from "express";
import { createSimulator, getSimulatorById, getSimulatorsBySchoolId } from "@/controllers/simulators";

const simulatorsRouter = express.Router();


simulatorsRouter.post("/simulators", createSimulator as (req: Request, res: Response) => void);
simulatorsRouter.get("/simulators/school/:schoolId", getSimulatorsBySchoolId as (req: Request, res: Response) => void);
simulatorsRouter.get("/simulators/:id", getSimulatorById as (req: Request, res: Response) => void);

export default simulatorsRouter;