

import { createMaintenanceLog, getMaintenanceLogById, getMaintenanceLogsByAircraft } from "@/controllers/maintenance";
import { Request, Response } from "express";
import express from "express";

const maintenanceRouter = express.Router();


maintenanceRouter.post("/maintenance-logs", createMaintenanceLog as (req: Request, res: Response) => void);
maintenanceRouter.get("/maintenance-logs/aircraft/:aircraftId", getMaintenanceLogsByAircraft  as (req: Request, res: Response) => void);
maintenanceRouter.get("/maintenance-logs/:id", getMaintenanceLogById as (req: Request, res: Response) => void);

export default maintenanceRouter;