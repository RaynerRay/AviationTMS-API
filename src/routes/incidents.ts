import express, { Request, Response } from "express";
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getIncidentsBySchoolId,
} from "@/controllers/incidents";

const incidentsRouter = express.Router();

incidentsRouter.post("/incidents", createIncident as (req: Request, res: Response) => void);
incidentsRouter.get("/incidents", getIncidents as (req: Request, res: Response) => void);
incidentsRouter.get("/incidents/school/:schoolId", getIncidentsBySchoolId as (req: Request, res: Response) => void);
incidentsRouter.get("/incidents/:id", getIncidentById as (req: Request, res: Response) => void);
incidentsRouter.put("/incidents/:id", updateIncident as (req: Request, res: Response) => void);
incidentsRouter.delete("/incidents/:id", deleteIncident as (req: Request, res: Response) => void);

export default incidentsRouter;
