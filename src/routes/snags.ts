import express, { Request, Response } from "express";
import {
  createSnag,
  getSnags,
  getSnagById,
  updateSnag,
  deleteSnag,
  getSnagsBySchoolId, // <-- Add this
} from "@/controllers/snags";

const snagsRouter = express.Router();

snagsRouter.post("/snags", createSnag as (req: Request, res: Response) => void);
snagsRouter.get("/snags", getSnags as (req: Request, res: Response) => void);
snagsRouter.get("/snags/school/:schoolId", getSnagsBySchoolId as (req: Request, res: Response) => void); // <-- New
snagsRouter.get("/snags/:id", getSnagById as (req: Request, res: Response) => void);
snagsRouter.put("/snags/:id", updateSnag as (req: Request, res: Response) => void);
snagsRouter.delete("/snags/:id", deleteSnag as (req: Request, res: Response) => void);

export default snagsRouter;
