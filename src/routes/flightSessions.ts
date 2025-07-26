import { Request, Response } from "express";
import {
  createFlightSession,
  getFlightSessions,
  getFlightSessionById,
  updateFlightSession,
  deleteFlightSession,
  getFlightSessionsByTeacherId,
  getFlightSessionsByStudentId,
  batchUpdateFlightSessions,
} from "@/controllers/flightsessions";
import express from "express";

const flightSessionsRouter = express.Router();

// CREATE a new flight session
flightSessionsRouter.post(
  "/flight-sessions",
  createFlightSession as (req: Request, res: Response) => void
);
// GET sessions by studentId
flightSessionsRouter.get(
    "/flight-sessions/student/:studentId",
    getFlightSessionsByStudentId as (req: Request, res: Response) => void
  );
  
  // GET sessions by instructorId
  flightSessionsRouter.get(
    "/flight-sessions/instructor/:instructorId",
    getFlightSessionsByTeacherId as (req: Request, res: Response) => void
  );
  

// GET all flight sessions (optional filters can be applied in the controller)
flightSessionsRouter.get(
  "/flight-sessions",
  getFlightSessions as (req: Request, res: Response) => void
);
// Batch updates
flightSessionsRouter.put(
  "/flight-sessions",
   
  batchUpdateFlightSessions as (req: Request, res: Response) => void
);

// GET flight session by ID
flightSessionsRouter.get(
  "/flight-sessions/:id",
  getFlightSessionById as (req: Request, res: Response) => void
);

// UPDATE flight session
flightSessionsRouter.put(
  "/flight-sessions/:id",
  updateFlightSession as (req: Request, res: Response) => void
);

// DELETE flight session
flightSessionsRouter.delete(
  "/flight-sessions/:id",
  deleteFlightSession as (req: Request, res: Response) => void
);

export default flightSessionsRouter;
