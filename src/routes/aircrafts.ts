import { Request, Response } from "express";
import { createAircraft, getAircraftById, getAircraftsBySchoolId } from "@/controllers/aircrafts";
import express from "express";

const aircraftsRouter = express.Router();

// Temporarily cast to Request, Response to satisfy TypeScript if it's being overly strict
aircraftsRouter.post("/aircrafts", createAircraft as (req: Request, res: Response) => void);
aircraftsRouter.get("/aircrafts/school/:schoolId", getAircraftsBySchoolId as (req: Request, res: Response) => void);
aircraftsRouter.get("/aircrafts/:id", getAircraftById as (req: Request, res: Response) => void);

export default aircraftsRouter;