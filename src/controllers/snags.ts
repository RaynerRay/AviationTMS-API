import { db } from "@/db/db";
import { Request, Response } from "express";
import { CreateSnag } from "@/types/types";

// Create a new snag (requires schoolId)
export async function createSnag(req: Request, res: Response) {
  const {
    reportedBy,
    equipmentName,
    description,
    severity,
    schoolId,
  }: CreateSnag & { schoolId: string } = req.body;

  if (!schoolId) {
    return res.status(400).json({ error: "schoolId is required" });
  }

  try {
    const newSnag = await db.snag.create({
      data: {
        reportedBy,
        equipmentName,
        description,
        severity,
        status: "OPEN",
        schoolId,
      },
    });

    return res.status(201).json({ data: newSnag, error: null });
  } catch (error) {
    console.error("Error creating snag:", error);
    return res.status(500).json({ data: null, error: "Failed to create snag." });
  }
}

// Get all snags for a school (with optional filters)
export async function getSnags(req: Request, res: Response) {
  const { schoolId, severity, status, reportedBy, equipmentName } = req.query;

  if (!schoolId || typeof schoolId !== "string") {
    return res.status(400).json({ error: "schoolId is required" });
  }

  try {
    const snags = await db.snag.findMany({
      where: {
        schoolId,
        ...(severity && { severity: severity as any }),
        ...(status && { status: status as any }),
        ...(reportedBy && { reportedBy: reportedBy as string }),
        ...(equipmentName && { equipmentName: equipmentName as string }),
      },
      orderBy: { reportedAt: "desc" },
    });

    return res.status(200).json(snags);
  } catch (error) {
    console.error("Error fetching snags:", error);
    return res.status(500).json({ error: "Failed to fetch snags." });
  }
}

// Get single snag (verify school if needed)
export async function getSnagById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const snag = await db.snag.findUnique({ where: { id } });
    if (!snag) return res.status(404).json({ error: "Snag not found" });
    return res.status(200).json(snag);
  } catch (error) {
    console.error("Error fetching snag:", error);
    return res.status(500).json({ error: "Failed to fetch snag." });
  }
}

// Update snag
export async function updateSnag(req: Request, res: Response) {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await db.snag.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error("Error updating snag:", error);
    return res.status(500).json({ error: "Failed to update snag." });
  }
}
export async function getSnagsBySchoolId(req: Request, res: Response) {
  const { schoolId } = req.params;

  try {
    const snags = await db.snag.findMany({
      where: { schoolId },
      orderBy: { reportedAt: "desc" },
    });

    return res.status(200).json(snags);
  } catch (error) {
    console.error("Error fetching snags by school:", error);
    return res.status(500).json({ error: "Failed to fetch snags." });
  }
}


// Delete snag
export async function deleteSnag(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await db.snag.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting snag:", error);
    return res.status(500).json({ error: "Failed to delete snag." });
  }
}
